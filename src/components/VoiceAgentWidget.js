import React from 'react';
import VoiceInterface from './VoiceInterface';
import CurrentResponse from './CurrentResponse';
import ChatHistorySidebar from './ChatHistorySidebar';
import CalendarBooking from './CalendarBooking';
import WhatsAppButton from './WhatsAppButton';
import useConversationUpgraded from '../hooks/useConversationUpgraded';
import '../styles/voiceAgent.css';

const VoiceAgentWidget = ({
  googleApiKey,
  groqApiKey,
  authMode = 'backend', // 'backend' or 'apikey'
  whatsappNumber = '+1234567890',
  whatsappMessage = 'Hi! I would like to know more about SyncAi Technologies.',
  showCalendar = true,
  showWhatsApp = true
}) => {
  // Initialize conversation management (upgraded with streaming STT)
  const conversation = useConversationUpgraded();

  // Error handling - show error message if APIs not configured
  // Note: API keys are now loaded from config, so errors will show in conversation.error

  return (
    <div className="voice-agent-widget">
      <div className="va-container">
        {/* Left Panel - Voice Interface */}
        <div className="va-left-panel">
          <VoiceInterface
            conversationState={conversation.conversationState}
            onStartConversation={conversation.startConversation}
            onStopConversation={conversation.stopConversation}
            audioEnabled={conversation.audioEnabled}
            onToggleAudio={conversation.toggleAudio}
            audioLevel={conversation.audioLevel}
          />

          {/* Current Response Display */}
          <CurrentResponse
            messages={conversation.conversationHistory}
            conversationState={conversation.conversationState}
            currentText={conversation.currentDisplayText}
          />
        </div>

        {/* Right Panel - Calendar Booking */}
        {showCalendar && (
          <div className="va-right-panel">
            <CalendarBooking />
          </div>
        )}

        {/* Chat History Sidebar */}
        <ChatHistorySidebar messages={conversation.conversationHistory} />

        {/* WhatsApp Button */}
        {showWhatsApp && (
          <WhatsAppButton
            phoneNumber={whatsappNumber}
            message={whatsappMessage}
          />
        )}

        {/* Error Display */}
        {conversation.error && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            zIndex: 1000,
            maxWidth: '80%',
            textAlign: 'center'
          }}>
            {conversation.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAgentWidget;

