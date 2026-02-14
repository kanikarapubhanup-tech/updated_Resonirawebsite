import React from 'react';
import configLoader from '../utils/configLoader';

const CurrentResponse = ({ messages = [], conversationState, currentText }) => {
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Get company info from config
  const config = configLoader.getConfig();
  const companyName = config?.name || 'Resonira Technologies';
  const assistantName = config?.ai?.personality?.name || 'Jessi';

  let text = '';
  // ALWAYS prioritize currentText if it exists (shows transcripts and responses)
  // This ensures user transcripts and AI responses are always visible
  // Never show latestMessage if currentText exists - this prevents duplicate display
  if (currentText && currentText.trim().length > 0) {
    text = currentText;
  } else if (conversationState === 'IDLE') {
    text = `How can I help you today?`;
  } else if (conversationState === 'LISTENING' || conversationState === 'WAITING') {
    text = 'Listening...';
  } else if (conversationState === 'PROCESSING') {
    // Don't show "Thinking..." - show nothing
    text = '';
  } else if (conversationState === 'SPEAKING' && latestMessage && latestMessage.role === 'assistant') {
    // Only show latest message if we're in SPEAKING state and no currentText
    // This is a fallback if currentText wasn't set for some reason
    text = latestMessage.content;
  } else {
    text = 'Conversation active...';
  }

  return (
    <div className="va-bottom-text" aria-live="polite">
      {text}
    </div>
  );
};

export default CurrentResponse;

