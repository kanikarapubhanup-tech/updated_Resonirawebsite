/**
 * Upgraded Conversation Hook
 * Uses streaming STT, enhanced VAD, concurrent pipeline, and knowledge base
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import useEnhancedVAD from './useEnhancedVAD';
import useStreamingSTT from './useStreamingSTT';
import useConcurrentPipeline from './useConcurrentPipeline';
import useGroqChat from './useGroqChat';
import useTextToSpeech from './useTextToSpeech';
import configLoader from '../utils/configLoader';
import knowledgeBase from '../utils/knowledgeBase';

const useConversationUpgraded = () => {
  const [conversationState, setConversationState] = useState('IDLE');
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [currentDisplayText, setCurrentDisplayText] = useState('');

  const isProcessingRef = useRef(false);
  const isConversationActiveRef = useRef(false);
  const typingIntervalRef = useRef(null);
  const configRef = useRef(null);
  const companyIdRef = useRef('default');
  const resumeListeningRef = useRef(null);

  // Initialize hooks
  const vad = useEnhancedVAD();
  const streamingSTT = useStreamingSTT();
  const pipeline = useConcurrentPipeline();
  const groq = useGroqChat();
  const tts = useTextToSpeech();

  // Initialize config and knowledge base
  useEffect(() => {
    const init = async () => {
      // Get company ID from URL or default
      const urlParams = new URLSearchParams(window.location.search);
      const companyId = urlParams.get('company') || 'default';
      companyIdRef.current = companyId;

      // Load config
      await configLoader.loadConfig(companyId);
      configRef.current = configLoader.getConfig();

      // Initialize knowledge base
      if (configRef.current?.knowledgeBase?.enabled) {
        await knowledgeBase.initialize(companyId);
      }
    };
    init();
  }, []);


  const handleSpeechDetected = useCallback(async (audioInput) => {
    /*
    console.log('🎤 handleSpeechDetected called', {
      inputType: typeof audioInput,
      isProcessing: isProcessingRef.current,
      isActive: isConversationActiveRef.current
    });
    */

    if (isProcessingRef.current) {
      console.log('⚠️ Already processing, skipping...');
      return;
    }

    if (!isConversationActiveRef.current) {
      console.log('⚠️ Conversation not active, skipping...');
      return;
    }

    // Check blob size only if blob is provided (and not string)
    if (audioInput && typeof audioInput !== 'string') {
      const MIN_BLOB_BYTES = 5000;
      if (audioInput.size < MIN_BLOB_BYTES) {
        console.log('⚠️ Ignoring tiny audio blob:', audioInput.size, 'bytes');
        setTimeout(() => {
          if (isConversationActiveRef.current && !isProcessingRef.current && resumeListeningRef.current) {
            resumeListeningRef.current();
          }
        }, 500);
        return;
      }
      console.log('✅ Audio blob size OK:', audioInput.size, 'bytes');
    } else if (typeof audioInput === 'string') {
      console.log('📝 Direct text input provided:', audioInput);
    } else {
      console.log('📝 No input provided, checking fallback');
    }

    console.log('✅ Starting speech processing...');
    isProcessingRef.current = true;

    try {
      const config = configRef.current;
      console.log('📋 Config loaded:', !!config);

      // Use concurrent pipeline for faster processing
      console.log('🔄 Calling pipeline.processWithPipeline...');
      let aiResponseDisplayed = false;
      // Pass audioInput (blob or text) directly to pipeline
      const result = await pipeline.processWithPipeline(audioInput, (progress) => {
        if (progress.stage === 'stt' && progress.text) {
          console.log('📝 Transcribed:', progress.text);
          if (!aiResponseDisplayed) {
            setCurrentDisplayText(`You: ${progress.text}`);
          }
        }
        if (progress.stage === 'ai' && progress.response && !aiResponseDisplayed) {
          console.log('🤖 AI Response (from progress):', progress.response);
          aiResponseDisplayed = true;

          setConversationState('SPEAKING');

          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }

          const chars = Array.from(progress.response);
          let idx = 1;
          const baseMsPerChar = 60;

          setCurrentDisplayText(chars[0] || '');

          typingIntervalRef.current = setInterval(() => {
            if (idx < chars.length) {
              setCurrentDisplayText(chars.slice(0, idx + 1).join(''));
              idx += 1;
            }
            if (idx >= chars.length) {
              clearInterval(typingIntervalRef.current);
              typingIntervalRef.current = null;
              console.log('✅ Typing effect completed (from progress)');
            }
          }, baseMsPerChar);
        }
      });
      console.log('✅ Pipeline completed:', !!result);

      const { userText, aiResponse, latency } = result;

      // Log performance
      /*
      console.log('⚡ Pipeline latency:', {
        stt: `${latency.stt.toFixed(0)}ms`,
        ai: `${latency.ai.toFixed(0)}ms`,
        tts: `${latency.tts.toFixed(0)}ms`,
        total: `${latency.total.toFixed(0)}ms`
      });
      */

      console.log('📝 User text:', userText);
      console.log('🤖 AI response:', aiResponse);
      console.log('🔊 Audio enabled:', audioEnabled);

      if (userText && userText.trim().length > 0 && !aiResponseDisplayed) {
        setCurrentDisplayText(`You: ${userText}`);
      }

      if (aiResponse && aiResponse.trim().length > 0) {
        if (!aiResponseDisplayed) {
          console.log('✅ Displaying AI response (from pipeline result)...');
          setConversationState('SPEAKING');
          setCurrentDisplayText(aiResponse);

          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }

          const chars = Array.from(aiResponse);
          let idx = 1;
          const baseMsPerChar = 60;

          setCurrentDisplayText(chars[0] || '');

          typingIntervalRef.current = setInterval(() => {
            if (idx < chars.length) {
              setCurrentDisplayText(chars.slice(0, idx + 1).join(''));
              idx += 1;
            }
            if (idx >= chars.length) {
              clearInterval(typingIntervalRef.current);
              typingIntervalRef.current = null;
              console.log('✅ Typing effect completed, text is set');
            }
          }, baseMsPerChar);
        } else {
          console.log('✅ AI response already displayed in progress callback, skipping duplicate display');
        }

        console.log('🔊 TTS started playing (subtitles synced)...');

        setTimeout(() => {
          if (isConversationActiveRef.current && !isProcessingRef.current && resumeListeningRef.current) {
            console.log('🔄 Resuming listening after TTS...');
            resumeListeningRef.current();
          }
        }, audioEnabled ? 500 : 1000);
      } else {
        console.warn('⚠️ No AI response received');
        setCurrentDisplayText('Sorry, I didn\'t get a response. Please try again.');
        setTimeout(() => {
          if (isConversationActiveRef.current && !isProcessingRef.current && resumeListeningRef.current) {
            resumeListeningRef.current();
          }
        }, 1000);
      }

    } catch (err) {
      console.error('❌ Error processing speech:', err);
      console.error('Error stack:', err.stack);
      setError(err.message);
      setCurrentDisplayText(`Error: ${err.message}. Please try again.`);
      setConversationState('LISTENING');

      setTimeout(() => {
        if (isConversationActiveRef.current && !isProcessingRef.current && resumeListeningRef.current) {
          resumeListeningRef.current();
        }
      }, 2000);
    } finally {
      isProcessingRef.current = false;
      console.log('🏁 Speech processing finished');
    }
  }, [isConversationActive, audioEnabled, pipeline, tts]);

  /**
   * Start conversation with streaming
   */
  const startConversation = useCallback(async () => {
    try {
      setError(null);
      setIsConversationActive(true);
      isConversationActiveRef.current = true;
      setConversationState('LISTENING');
      isProcessingRef.current = false;

      const config = configRef.current;

      // Play welcome message - more natural and varied
      const companyName = config?.name || 'Resonira Technologies';
      const assistantName = config?.ai?.personality?.name || 'Jessi';

      const welcomeMessages = [
        `Hey there! How can I help you today?`,
        `Hi! What can I do for you?`,
        `Hello! How can I assist you?`,
        `Hey! What would you like to know?`
      ];

      const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
      const welcomeMsg = welcomeMessages[randomIndex];

      setCurrentDisplayText(welcomeMsg);

      if (audioEnabled) {
        setConversationState('SPEAKING');
        await tts.speak(welcomeMsg);
      }

      setConversationState('LISTENING');

      if (config?.features?.enableStreaming) {
        try {
          console.log('🔄 Starting streaming STT...');
          await streamingSTT.startStreaming(
            // Final transcript
            async (finalText) => {
              if (!finalText || finalText.trim().length === 0) return;
              console.log('📝 Streaming transcript received:', finalText);
              await handleSpeechDetected(finalText); // Pass transcript directly!
            },
            // Partial transcript
            (partialText) => {
              setCurrentDisplayText(`You: ${partialText}`);
            }
          );
          console.log('✅ Streaming STT started');
        } catch (err) {
          console.error('❌ Streaming STT failed, falling back to VAD:', err);
          // Fallback to VAD if streaming fails
          await vad.startVAD(handleSpeechDetected);
        }
      } else {
        // Use enhanced VAD
        console.log('🎤 Starting enhanced VAD...');
        await vad.startVAD(handleSpeechDetected);
      }

    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(err.message);
      setConversationState('IDLE');
      setIsConversationActive(false);
      isConversationActiveRef.current = false;
    }
  }, [audioEnabled, vad, streamingSTT, tts, handleSpeechDetected]);

  /**
   * Resume listening after AI speaks
   */
  const resumeListening = useCallback(() => {
    /*
    console.log('🔄 resumeListening called', {
      isActive: isConversationActiveRef.current,
      isProcessing: isProcessingRef.current
    });
    */

    if (!isConversationActiveRef.current) {
      console.log('⚠️ Conversation not active, not resuming');
      return;
    }

    setConversationState('WAITING');

    setTimeout(() => {
      if (isConversationActiveRef.current && !isProcessingRef.current) {
        const config = configRef.current;
        console.log('🔄 Resuming listening, streaming enabled:', config?.features?.enableStreaming);

        if (config?.features?.enableStreaming) {
          // Resume streaming
          try {
            streamingSTT.startStreaming(
              async (finalText) => {
                if (finalText) {
                  console.log('📝 Streaming final text:', finalText);
                  await handleSpeechDetected(finalText);
                }
              },
              (partialText) => {
                setCurrentDisplayText(`You: ${partialText}`);
              }
            );
          } catch (err) {
            console.error('❌ Failed to resume streaming, using VAD:', err);
            setConversationState('LISTENING');
            vad.startVAD(handleSpeechDetected);
          }
        } else {
          setConversationState('LISTENING');
          console.log('🎤 Starting VAD...');
          vad.startVAD(handleSpeechDetected);
        }
      }
    }, 200);
  }, [vad, streamingSTT, handleSpeechDetected]);

  // Store resumeListening in ref so it can be called from handleSpeechDetected
  useEffect(() => {
    resumeListeningRef.current = resumeListening;
  }, [resumeListening]);

  /**
   * Stop conversation
   */
  const stopConversation = useCallback(() => {
    console.log('🛑 Stopping conversation...', { state: conversationState });

    // Stop TTS first (proper implementation handles everything)
    tts.stop();

    // Stop pipeline processing
    pipeline.stop();

    setIsConversationActive(false);
    isConversationActiveRef.current = false;
    setConversationState('IDLE');
    isProcessingRef.current = false;

    // Stop all audio-related processes
    vad.cleanup();
    streamingSTT.stopStreaming(); // This will also cancel LongRunningRecognize

    // Clear typing animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setCurrentDisplayText('');
    console.log('✅ Conversation stopped completely');
  }, [vad, streamingSTT, tts, pipeline, conversationState]);

  /**
   * Toggle audio
   */
  const toggleAudio = useCallback(() => {
    // Stop audio immediately when toggling
    tts.stop();
    setAudioEnabled(prev => !prev);
  }, [tts]);

  return {
    // State
    conversationState,
    isConversationActive,
    audioEnabled,
    audioLevel: vad.audioLevel,
    error: error || streamingSTT.error || groq.error || tts.error,
    currentDisplayText,

    // Actions
    startConversation,
    stopConversation,
    toggleAudio,

    // Data
    conversationHistory: groq.getDisplayHistory(),

    // Status
    isListening: vad.isListening || streamingSTT.isStreaming,
    isTranscribing: streamingSTT.isTranscribing,
    isProcessingAI: groq.isProcessing,
    isSpeaking: tts.isSpeaking,
    isAudioInitialized: vad.isAudioInitialized
  };
};

export default useConversationUpgraded;

