import React, { useMemo } from 'react';
import { Mic, Volume2, VolumeX, Square } from 'lucide-react';

const VoiceInterface = ({
  conversationState,
  onStartConversation,
  onStopConversation,
  audioEnabled,
  onToggleAudio,
  audioLevel = 0
}) => {
  const isActive = conversationState !== 'IDLE';

  const stateClass =
    conversationState === 'LISTENING'
      ? 'va-state-listening'
      : conversationState === 'PROCESSING'
      ? 'va-state-processing'
      : conversationState === 'SPEAKING'
      ? 'va-state-speaking'
      : conversationState === 'WAITING'
      ? 'va-state-waiting'
      : '';

  const renderButtonContent = () => {
    switch (conversationState) {
      case 'IDLE':
        return (
          <>
            <Mic size={48} />
            <span className="va-button-text">Begin here</span>
          </>
        );
      case 'LISTENING':
        return (
          <>
            <Square size={48} />
            <span className="va-button-text">Stop Conversation</span>
          </>
        );
      case 'PROCESSING':
        return (
          <>
            <Mic size={48} />
            <span className="va-button-text">Thinking...</span>
          </>
        );
      case 'SPEAKING':
        return (
          <>
            <Square size={48} />
            <span className="va-button-text">Stop Speaking</span>
          </>
        );
      case 'WAITING':
        return (
          <>
            <Mic size={48} />
            <span className="va-button-text">Listening...</span>
          </>
        );
      default:
  return (
          <>
          <Mic size={48} />
          <span className="va-button-text">Start Conversation</span>
          </>
        );
    }
  };

  const handleMainClick = () => {
    if (isActive) {
      onStopConversation();
    } else {
      onStartConversation();
    }
  };

  // Build 36 visualizer bars positioned in a ring
  const bars = useMemo(() => {
    const total = 36;
    const angleStep = (2 * Math.PI) / total;
    const normalized = Math.max(0, Math.min(1, audioLevel || 0));
    const base = 16; // px
    const range = 44; // px
    return new Array(total).fill(0).map((_, i) => {
      const angle = i * angleStep;
      // Slight variability per bar for a lively look
      const variance = (Math.sin(i * 2.3) + 1) / 2 * 0.25; // 0..0.25
      const level = normalized * (0.75 + variance);
      const height = Math.round(base + level * range);
      const rotateDeg = (angle * 180) / Math.PI;
      // Position outward from center
      const radius = 180; // matches CSS speaker-button offset
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return { height, rotateDeg, x, y };
    });
  }, [audioLevel]);

  return (
    <div className="va-voice-interface" style={{ position: 'relative' }}>
      {/* Visualizer removed per request */}
        <button
        className={`va-voice-button ${stateClass}`}
        onClick={handleMainClick}
        >
        {renderButtonContent()}
        </button>

      {/* Speaker/Volume toggle near main button */}
      <button
        className={`va-speaker-button ${audioEnabled ? '' : 'muted'}`}
        onClick={onToggleAudio}
        title={audioEnabled ? 'Mute Audio' : 'Enable Audio'}
        aria-label={audioEnabled ? 'Mute audio' : 'Enable audio'}
      >
        {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </div>
  );
};

export default VoiceInterface;

