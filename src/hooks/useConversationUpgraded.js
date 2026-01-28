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

  /**
   * Handle speech detection with streaming
   */
  const handleSpeechDetected = useCallback(async (audioBlob) => {
    console.log('🎤 handleSpeechDetected called', {
      hasBlob: !!audioBlob,
      blobSize: audioBlob?.size,
      isProcessing: isProcessingRef.current,
      isActive: isConversationActiveRef.current
    });

    if (isProcessingRef.current) {
      console.log('⚠️ Already processing, skipping...');
      return;
    }

    if (!isConversationActiveRef.current) {
      console.log('⚠️ Conversation not active, skipping...');
      return;
    }

    // If no blob provided, it means we're using streaming transcript
    // Check blob size only if blob is provided
    if (audioBlob) {
      const MIN_BLOB_BYTES = 5000; // Reduced from 15000 for better sensitivity
      if (audioBlob.size < MIN_BLOB_BYTES) {
        console.log('⚠️ Ignoring tiny audio blob:', audioBlob.size, 'bytes (min:', MIN_BLOB_BYTES, ')');
        // Resume listening after a short delay
        setTimeout(() => {
          if (isConversationActiveRef.current && !isProcessingRef.current && resumeListeningRef.current) {
            resumeListeningRef.current();
          }
        }, 500);
        return;
      }
      console.log('✅ Audio blob size OK:', audioBlob.size, 'bytes');
    } else {
      console.log('📝 No blob provided, using streaming transcript');
    }

    console.log('✅ Starting speech processing...');
    isProcessingRef.current = true;
    // Don't set state to PROCESSING - go straight to showing transcript
    // setConversationState('PROCESSING');
    
    // Don't show "Processing..." - just wait for transcript
    // setCurrentDisplayText('Processing your speech...');

    try {
      const config = configRef.current;
      console.log('📋 Config loaded:', !!config);

      // Use concurrent pipeline for faster processing
      console.log('🔄 Calling pipeline.processWithPipeline...');
      let aiResponseDisplayed = false; // Track if we've already displayed the AI response
      const result = await pipeline.processWithPipeline(audioBlob, (progress) => {
        if (progress.stage === 'stt' && progress.text) {
          console.log('📝 Transcribed:', progress.text);
          // Show user transcript immediately (only if AI response not yet displayed)
          if (!aiResponseDisplayed) {
            setCurrentDisplayText(`You: ${progress.text}`);
          }
        }
        if (progress.stage === 'ai' && progress.response && !aiResponseDisplayed) {
          console.log('🤖 AI Response (from progress):', progress.response);
          aiResponseDisplayed = true; // Mark as displayed immediately
          
          // Show AI response immediately when available - no "Thinking..." phase
          setConversationState('SPEAKING');
          
          // Clear any previous typing animation
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          
          // Start typing effect immediately - set first character right away
          const chars = Array.from(progress.response);
          let idx = 1; // Start at 1 since we set first char immediately
          const baseMsPerChar = 60;
          
          // Set first character immediately to avoid empty state
          setCurrentDisplayText(chars[0] || '');
          
          // Start typing effect for remaining characters
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
      console.log('⚡ Pipeline latency:', {
        stt: `${latency.stt.toFixed(0)}ms`,
        ai: `${latency.ai.toFixed(0)}ms`,
        tts: `${latency.tts.toFixed(0)}ms`,
        total: `${latency.total.toFixed(0)}ms`
      });

      console.log('📝 User text:', userText);
      console.log('🤖 AI response:', aiResponse);
      console.log('🔊 Audio enabled:', audioEnabled);
      
      // Show final user transcript only if AI response wasn't already displayed
      if (userText && userText.trim().length > 0 && !aiResponseDisplayed) {
        setCurrentDisplayText(`You: ${userText}`);
      }

      // Display the response if it wasn't already displayed in progress callback
      if (aiResponse && aiResponse.trim().length > 0) {
        if (!aiResponseDisplayed) {
          console.log('✅ Displaying AI response (from pipeline result)...');
          setConversationState('SPEAKING');
          setCurrentDisplayText(aiResponse);
          
          // Clear any previous typing animation
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          
          // Start typing animation - set first character immediately
          const chars = Array.from(aiResponse);
          let idx = 1; // Start at 1 since we set first char immediately
          const baseMsPerChar = 60;
          
          // Set first character immediately to avoid empty state
          setCurrentDisplayText(chars[0] || '');
          
          // Start typing effect for remaining characters
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

        // TTS is handled by the pipeline - it waits for audio to start playing
        // This ensures subtitles are synced with audio
        console.log('🔊 TTS started playing (subtitles synced)...');
        
        // Resume listening after TTS completes
        // Since TTS is now blocking until it starts, we wait for it to finish
        setTimeout(() => {
          if (isConversationActiveRef.current && !isProcessingRef.current && resumeListeningRef.current) {
            console.log('🔄 Resuming listening after TTS...');
            resumeListeningRef.current();
          }
        }, audioEnabled ? 500 : 1000); // Wait for TTS to complete
      } else {
        console.warn('⚠️ No AI response received');
        setCurrentDisplayText('Sorry, I didn\'t get a response. Please try again.');
        // Resume listening even on error
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
      
      // Resume listening after error
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
      
      // Vary the welcome message to avoid repetition
      const welcomeMessages = [
        `Hey there! How can I help you today?`,
        `Hi! What can I do for you?`,
        `Hello! How can I assist you?`,
        `Hey! What would you like to know?`
      ];
      
      // Pick a random welcome message
      const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
      const welcomeMsg = welcomeMessages[randomIndex];
      
      // Display welcome message text
      setCurrentDisplayText(welcomeMsg);
      
      if (audioEnabled) {
        setConversationState('SPEAKING');
        await tts.speak(welcomeMsg);
      }

      // Start VAD with enhanced settings
      // Keep the welcome message displayed until user speaks
      setConversationState('LISTENING');
      
      // If streaming enabled, try streaming STT, fallback to VAD if it fails
      if (config?.features?.enableStreaming) {
        try {
          console.log('🔄 Starting streaming STT...');
          await streamingSTT.startStreaming(
            // Final transcript
            async (finalText) => {
              if (!finalText || finalText.trim().length === 0) return;
              console.log('📝 Streaming transcript received:', finalText);
              await handleSpeechDetected(null); // Will use streaming transcript
            },
            // Partial transcript
            (partialText) => {
              // Show partial transcript in UI
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
    console.log('🔄 resumeListening called', {
      isActive: isConversationActiveRef.current,
      isProcessing: isProcessingRef.current
    });
    
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
                  await handleSpeechDetected(null);
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

