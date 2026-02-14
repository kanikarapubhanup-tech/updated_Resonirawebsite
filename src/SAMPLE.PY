import os
import json
import logging
import time
import requests
from datetime import datetime, timedelta
from config import *
from instagram_api import InstagramAPI, create_instagram_caption, post_video_public_url
from video_creator import VideoCreator
from google_drive_utils import (
    setup_google_drive,
    upload_to_drive,
    list_drive_music_files,
    download_drive_file,
    delete_drive_file
)
from google_sheets_utils import (
    list_available_sheets,
    get_quotes_from_sheet,
    mark_quote_as_used,
    delete_quote_from_sheet
)
from cloudinary_utils import (
    setup_cloudinary,
    upload_to_cloudinary,
    list_cloudinary_music_files,
    download_cloudinary_file,
    delete_cloudinary_file
)
import pandas as pd
import gspread

# Configure MoviePy to use a different text rendering method
try:
    from moviepy.config import change_settings
    change_settings({"IMAGEMAGICK_BINARY": "magick"})
except:
    pass

# Setup logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler('instagram_agent.log'),
        logging.StreamHandler()
    ]
)

# --- GOOGLE SHEETS CONFIG ---
# (Removed: SHEET_NAME, SHEET_WORKSHEET_INDEX, MANAGE_QUOTES_IN_SHEET)

class InstagramAIAgent:
    def __init__(self):
        self.progress_data = self.load_progress()
        self.cloudinary_config = None
        self.drive_service = None
        self.drive_folder_id = None
        self.instagram_api = None
        self.video_creator = VideoCreator()
        
        # Setup Cloudinary for video uploads
        if USE_CLOUDINARY:
            self.cloudinary_config = setup_cloudinary()
            print(f"[Config] Cloudinary enabled: {self.cloudinary_config is not None}")

        if USE_GOOGLE_DRIVE:
            self.drive_service, self.drive_folder_id = setup_google_drive()
        
        if ENABLE_INSTAGRAM_POSTING:
            self.setup_instagram_api()
    
    def load_progress(self):
        """Load progress data to track which quote/music pair to use next."""
        if os.path.exists(PROGRESS_FILE):
            try:
                with open(PROGRESS_FILE, 'r') as f:
                    data = json.load(f)
                    if 'effect_index' not in data:
                        data['effect_index'] = 0
                    # Remove last_reset if present
                    data.pop('last_reset', None)
                    logging.info(f"Loaded progress: Quote {data.get('quote_index', 0)}, Music {data.get('music_index', 0)}, Effect {data.get('effect_index', 0)}")
                    return data
            except Exception as e:
                logging.error(f"Error loading progress: {e}")
        
        # Initialize with first items (no last_reset)
        return {'quote_index': 0, 'music_index': 0, 'effect_index': 0}
    
    def save_progress(self):
        """Save current progress."""
        try:
            # Remove last_reset if present
            self.progress_data.pop('last_reset', None)
            with open(PROGRESS_FILE, 'w') as f:
                json.dump(self.progress_data, f, indent=2)
            logging.info(f"Saved progress: Quote {self.progress_data['quote_index']}, Music {self.progress_data['music_index']}, Effect {self.progress_data.get('effect_index', 0)}")
        except Exception as e:
            logging.error(f"Error saving progress: {e}")
    
    def upload_to_cloudinary(self, file_path, filename):
        """Upload file to Cloudinary (wrapper for Instagram API)."""
        if not self.cloudinary_config:
            logging.warning("Cloudinary not configured for upload")
            return None
        
        try:
            from cloudinary_utils import upload_to_cloudinary
            result = upload_to_cloudinary(self.cloudinary_config, file_path, filename)
            if result:
                public_id, public_url = result
                logging.info(f"Uploaded to Cloudinary via Instagram API: {filename}")
                return public_url
            return None
        except Exception as e:
            logging.error(f"Error uploading to Cloudinary via Instagram API: {e}")
            return None
            
    def setup_instagram_api(self):
        """Setup Instagram API for posting."""
        try:
            upload_func = self.upload_to_cloudinary if self.cloudinary_config else None

            self.instagram_api = InstagramAPI(
                INSTAGRAM_ACCESS_TOKEN,
                INSTAGRAM_USER_ID,
                upload_to_cloudinary=upload_func,
                cloudinary_config=self.cloudinary_config
            )
            if self.instagram_api:
                logging.info("Instagram API setup complete")
            else:
                logging.warning("Instagram API setup failed - posting will be disabled")
        except Exception as e:
            logging.error(f"Error setting up Instagram API: {e}")
            self.instagram_api = None
    
    def get_sequential_quote(self, quotes_df):
        """Get the next unused quote from the sheet (where 'Used' is not set). Returns (quote, author, index)."""
        if quotes_df is None or quotes_df.empty:
            logging.warning("No quotes found in Google Sheets. Fetching from Groq...")
            quote, author = fetch_quote_from_groq()
            if quote:
                return quote, author, None
            return None, None, None
        # Only consider quotes where 'Used' is not set/empty/false
        unused_mask = ~quotes_df.get('Used', '').astype(str).str.lower().isin(['yes', 'true', '1'])
        unused_quotes = quotes_df[unused_mask]
        if unused_quotes.empty:
            logging.info("All quotes have been used. Resetting 'Used' column for all quotes.")
            # Reset all 'Used' values to blank
            from google_sheets_utils import get_quotes_from_sheet
            import gspread
            google_creds_json = os.getenv('GOOGLE_CREDENTIALS')
            if google_creds_json:
                import tempfile
                with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                    f.write(google_creds_json)
                    temp_creds_path = f.name
                gc = gspread.service_account(filename=temp_creds_path)
                os.unlink(temp_creds_path)
            else:
                from config import GOOGLE_CREDENTIALS_PATH
                gc = gspread.service_account(filename=GOOGLE_CREDENTIALS_PATH)
            from config import SHEET_NAME, SHEET_WORKSHEET_INDEX
            worksheet = gc.open(SHEET_NAME).get_worksheet(SHEET_WORKSHEET_INDEX)
            # Set all 'Used' cells to blank
            records = worksheet.get_all_records()
            df = pd.DataFrame(records)
            if 'Used' in df.columns:
                used_col = df.columns.get_loc('Used') + 1
                for i in range(2, len(df) + 2):
                    worksheet.update_cell(i, used_col, '')
            # Re-fetch quotes
            quotes_df = get_quotes_from_sheet()
            unused_mask = ~quotes_df.get('Used', '').astype(str).str.lower().isin(['yes', 'true', '1'])
            unused_quotes = quotes_df[unused_mask]
            if unused_quotes.empty:
                logging.error("No quotes available after reset.")
                return None, None, None
        # Get the first unused quote
        first_unused = unused_quotes.iloc[0]
        quote = first_unused['Quote']
        author = first_unused['Author']
        index = first_unused.name  # This is the DataFrame index, matches row in sheet minus header
        return quote, author, index
    
    def get_sequential_music(self):
        """Get the next music file from Google Drive."""
        try:
            music_files = list_drive_music_files(self.drive_service)
            if not music_files:
                logging.error("No .mp3 files found in the Drive music folder.")
                return None

            music_files.sort(key=lambda x: x['name'])  # Consistent order
            music_index = self.progress_data['music_index']

            if music_index >= len(music_files):
                music_index = 0
                self.progress_data['music_index'] = 0

            selected_file = music_files[music_index]
            temp_path = f"temp_{selected_file['name']}"
            download_drive_file(self.drive_service, selected_file['id'], temp_path)

            # Move to next music
            self.progress_data['music_index'] = (music_index + 1) % len(music_files)

            logging.info(f"Selected Music: {temp_path}")
            return temp_path
        except Exception as e:
            logging.error(f"Error selecting music: {e}")
            return None
            
    
    def create_video(self):
        """Main function to create a video."""
        logging.info("Starting Instagram AI Agent...")
        # Get quotes
        quotes_df = get_quotes_from_sheet()
        if quotes_df is None or quotes_df.empty:
            logging.error("Could not fetch quotes. Exiting.")
            return False
        # Get next unused quote and music
        quote, author, quote_index = self.get_sequential_quote(quotes_df)
        if not quote or not author:
            logging.error("Could not get quote. Exiting.")
            return False
        music_file = self.get_sequential_music()
        if not music_file:
            logging.error("Could not get music file. Exiting.")
            return False
        logging.info(f"Selected Quote: '{quote}' by {author}")
        # --- Effect cycling logic ---
        from config import AVAILABLE_EFFECTS
        effect_index = self.progress_data.get('effect_index', 0)
        effect = AVAILABLE_EFFECTS[effect_index % len(AVAILABLE_EFFECTS)]
        self.progress_data['effect_index'] = (effect_index + 1) % len(AVAILABLE_EFFECTS)
        # --- Video creation with keyframe logic ---
        logging.info(f"Creating video with effect: {effect}")
        video_filename = self.video_creator.create_video_with_pil_text_and_blur_keyframe(
            quote, author, music_file, effect
        )
        if not video_filename:
            logging.error("Video creation failed.")
            return False
        logging.info(f"Video created successfully: {video_filename}")
        logging.info(f"Quote: '{quote}' by {author}")
        # Upload to Google Drive if enabled
         # Upload to Cloudinary if enabled
        cloudinary_public_id = None
        drive_id = None
        public_url = None
        if UPLOAD_TO_CLOUDINARY:
            result = upload_to_cloudinary(self.cloudinary_config, video_filename, video_filename)
            if result:
                cloudinary_public_id, public_url = result
                logging.info(f"Video uploaded to Cloudinary with Public ID: {cloudinary_public_id}")
                print("Public video URL:", public_url)

        if UPLOAD_TO_DRIVE:
            drive_id = upload_to_drive(self.drive_service, video_filename, video_filename)
            if drive_id:
                logging.info(f"Video uploaded to Google Drive with ID: {drive_id}")
                public_url = f"https://drive.google.com/uc?id={drive_id}&export=download"
                print("Public video URL:", public_url)
        # Use test1.py style Instagram posting with the generated public_url
        if public_url:
            IG_USER_ID = INSTAGRAM_USER_ID
            ACCESS_TOKEN = INSTAGRAM_ACCESS_TOKEN
            VIDEO_URL = public_url
            CAPTION = create_instagram_caption(quote, author)
            # 1. Create media container
            media_container_url = f'https://graph.facebook.com/v19.0/{IG_USER_ID}/media'
            media_container_payload = {
                'media_type': 'REELS',
                'video_url': VIDEO_URL,
                'caption': CAPTION,
                'access_token': ACCESS_TOKEN
            }
            media_container_resp = requests.post(media_container_url, data=media_container_payload)
            print('Media container response:', media_container_resp.json())
            container_id = media_container_resp.json().get('id')
            print('Container ID:', container_id)
            # 2. Poll for status
            status_url = f'https://graph.facebook.com/v19.0/{container_id}?fields=status_code&access_token={ACCESS_TOKEN}'
            while True:
                status_resp = requests.get(status_url)
                status = status_resp.json().get('status_code')
                print('Status:', status)
                if status == 'FINISHED':
                    break
                elif status == 'ERROR':
                    print('Error:', status_resp.json())
                    return False
                time.sleep(5)
            # 3. Publish media
            publish_url = f'https://graph.facebook.com/v19.0/{IG_USER_ID}/media_publish'
            publish_payload = {
                'creation_id': container_id,
                'access_token': ACCESS_TOKEN
            }
            publish_resp = requests.post(publish_url, data=publish_payload)
            print('Publish response:', publish_resp.json())
            # Delete the video from Google Drive after successful Instagram post
            if publish_resp.json().get('id') and cloudinary_public_id:
                delete_cloudinary_file(self.cloudinary_config, cloudinary_public_id)
                print(f"[Cloudinary] Deleted video from Cloudinary: {cloudinary_public_id}")
                logging.info(f"Deleted video from Cloudinary: {cloudinary_public_id}")
            elif publish_resp.json().get('id') and drive_id:
                delete_drive_file(self.drive_service, drive_id)
                print(f"[Drive] Deleted video from Google Drive: {drive_id}")
                logging.info(f"Deleted video from Google Drive: {drive_id}")
            # Delete the used quote from Google Sheets after successful Instagram post
            if publish_resp.json().get('id') and MANAGE_QUOTES_IN_SHEET:
                # Get the current quote index before it gets incremented
                current_quote_index = self.progress_data['quote_index'] - 1
                if current_quote_index < 0:
                    current_quote_index = len(quotes_df) - 1  # Wrap around to last quote
                delete_quote_from_sheet(current_quote_index)
            elif publish_resp.json().get('id'):
                print("[Sheets] Quote management disabled - quotes will be reused")
        
        # Save progress
        self.save_progress()
        
        # Clean up the downloaded temp music file
        if music_file and music_file.startswith("temp_") and os.path.exists(music_file):
            os.remove(music_file)
            logging.info(f"Deleted temporary music file: {music_file}")
        
        return True
        
def fetch_quote_from_groq():
    """
    Fetch a motivational quote from Groq API when Google Sheets is empty.
    Returns (quote, author).
    """
    import requests
    try:
        GROQ_API_KEY = GROQ_API_KEY_CONFIG
        if not GROQ_API_KEY:
            raise ValueError("Missing GROQ_API_KEY in environment variables")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        # Prompt to Groq model
        payload = {
            "model": "gemma2-9b-it",   # You can change to another Groq model if needed
            "messages": [
                {
                    "role": "system",
                    "content": "You are an assistant that only provides motivational quotes."
                },
                {
                    "role": "user",
                    "content": "Give me one short trending motivational quote for Instagram. Reply in the format: 'Quote - Author'"
                }
            ],
            "temperature": 0.7,
            "max_tokens": 50
        }

        resp = requests.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

        content = data["choices"][0]["message"]["content"].strip()
        # Parse "Quote - Author"
        if " - " in content:
            quote, author = content.split(" - ", 1)
        else:
            quote = content
            author = "Unknown"

        return quote.strip(), author.strip()
    except Exception as e:
        logging.error(f"Error fetching quote from Groq: {e}")
        return None, None


def main():
    """Main execution function."""
    agent = InstagramAIAgent()
    
    # First, let's see what sheets are available
    logging.info("Checking available Google Sheets...")
    list_available_sheets()
    
    # Then try to create the video
    return agent.create_video()

if __name__ == "__main__":
    main() 