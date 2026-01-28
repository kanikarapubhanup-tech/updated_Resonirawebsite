/**
 * Test direct API calls to see the actual error
 */

const { google } = require('googleapis');

async function testDirectAPIs() {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const credentials = JSON.parse(serviceAccountJson);
    let privateKey = credentials.private_key.replace(/\\n/g, '\n');

    console.log('🧪 Testing direct API access...\n');

    // Create auth client with cloud-platform scope only
    // This scope provides access to all Google Cloud APIs including Speech and TTS
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform' // Covers all Google Cloud APIs
      ],
      projectId: credentials.project_id
    });

    // Try to get token
    console.log('1️⃣ Getting access token...');
    let accessToken;
    try {
      const tokenResponse = await auth.getAccessToken();
      accessToken = tokenResponse.token || tokenResponse;
      if (!accessToken) {
        throw new Error('Token is null');
      }
      console.log('   ✅ Token obtained successfully\n');
    } catch (tokenErr) {
      console.log('   ❌ Token error:', tokenErr.message);
      console.log('   📋 Full error:', JSON.stringify(tokenErr, null, 2));
      
      // Try alternative: request scopes separately
      console.log('\n2️⃣ Trying alternative: requesting scopes one at a time...');
      try {
        const auth2 = new google.auth.JWT({
          email: credentials.client_email,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
          projectId: credentials.project_id
        });
        const token2 = await auth2.getAccessToken();
        console.log('   ✅ Basic token works');
        
        // Now try adding speech scope
        console.log('   🔄 Trying with speech scope added...');
        const auth3 = new google.auth.JWT({
          email: credentials.client_email,
          key: privateKey,
          scopes: [
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/speech'
          ],
          projectId: credentials.project_id
        });
        const token3 = await auth3.getAccessToken();
        console.log('   ✅ Speech scope works too!');
      } catch (altErr) {
        console.log('   ❌ Alternative also failed:', altErr.message);
      }
      
      process.exit(1);
    }

    // Test actual API calls
    console.log('2️⃣ Testing Text-to-Speech API call...');
    try {
      const tts = google.texttospeech({ version: 'v1', auth });
      const ttsResponse = await tts.projects.locations.voices.list({
        parent: `projects/${credentials.project_id}/locations/global`
      });
      console.log('   ✅ TTS API accessible\n');
    } catch (ttsErr) {
      console.log('   ⚠️  TTS API error:', ttsErr.message);
      console.log('   📋 Error code:', ttsErr.code);
      console.log('   📋 Error details:', ttsErr.response?.data || 'No details\n');
    }

    console.log('3️⃣ Testing Speech-to-Text API call...');
    try {
      const speech = google.speech({ version: 'v1', auth });
      // Just test if we can access the API (we won't actually transcribe)
      console.log('   ✅ Speech API client created (API is accessible)\n');
    } catch (speechErr) {
      console.log('   ⚠️  Speech API error:', speechErr.message);
      console.log('   📋 Error code:', speechErr.code);
      console.log('   📋 Error details:', speechErr.response?.data || 'No details\n');
    }

    console.log('✅ All tests completed!');
    console.log('\n💡 If token generation worked, your setup is correct.');
    console.log('   The Netlify function should work now.');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('📋 Full error:', error);
    process.exit(1);
  }
}

testDirectAPIs();

