/**
 * Concurrent Processing Pipeline
 * Processes STT → Groq → TTS asynchronously for sub-second latency
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import configLoader from '../utils/configLoader';
import useStreamingSTT from './useStreamingSTT';
import useGroqChat from './useGroqChat';
import useTextToSpeech from './useTextToSpeech';

const useConcurrentPipeline = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState('idle');
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState({ stt: 0, ai: 0, tts: 0, total: 0 });

  const configRef = useRef(null);
  const streamingSTT = useStreamingSTT();
  const groqChat = useGroqChat();
  const tts = useTextToSpeech();

  // Initialize config
  useEffect(() => {
    configRef.current = configLoader.getConfig();
  }, []);

  /**
   * Process with concurrent pipeline
   */
  const processWithPipeline = useCallback(async (audioBlob, onProgress) => {
    const startTime = performance.now();
    setIsProcessing(true);
    setError(null);
    setCurrentStage('stt');

    try {
      const config = configRef.current;
      const speechConfig = config?.speech || {};
      const aiConfig = config?.ai || {};

      // Stage 1: STT (Speech-to-Text)
      const sttStart = performance.now();
      let userText = '';

      console.log('🎤 Starting STT transcription...', {
        isStreaming: config?.features?.enableStreaming && streamingSTT.isStreaming,
        blobSize: audioBlob?.size
      });

      if (config?.features?.enableStreaming && streamingSTT.isStreaming && (!audioBlob || audioBlob.size === 0)) {
        // Use streaming transcript if available and no blob provided
        userText = streamingSTT.finalTranscript || streamingSTT.partialTranscript;
        console.log('📝 Using streaming transcript:', userText);
      } else if (audioBlob) {
        // Fallback to blob-based transcription
        console.log('📝 Using blob-based transcription...');
        try {
          const transcription = await streamingSTT.transcribeBlob(audioBlob);
          userText = transcription.text;
          console.log('✅ Transcription result:', userText);
        } catch (err) {
          console.error('❌ Transcription error:', err);
          throw new Error(`Transcription failed: ${err.message}`);
        }
      } else {
        // Try to get streaming transcript as fallback
        userText = streamingSTT.finalTranscript || streamingSTT.partialTranscript;
        console.log('📝 Using streaming transcript (fallback):', userText);
      }

      if (!userText || userText.trim().length === 0) {
        console.error('❌ No speech detected in transcription');
        throw new Error('No speech detected');
      }

      const sttLatency = performance.now() - sttStart;
      setLatency(prev => ({ ...prev, stt: sttLatency }));
      // Call progress callback immediately when transcript is ready
      if (onProgress && userText) {
        onProgress({ stage: 'stt', text: userText, latency: sttLatency });
      }

      // Stage 2: AI Response (start as soon as we have text)
      setCurrentStage('ai');
      const aiStart = performance.now();
      
      console.log('🤖 Getting AI response for:', userText);
      
      // Start AI generation immediately (don't wait for full transcription if streaming)
      let aiResponse = '';
      try {
        aiResponse = await groqChat.getResponse(userText);
        console.log('✅ AI response received:', aiResponse?.substring(0, 50) + '...');
      } catch (err) {
        console.error('❌ AI response error:', err);
        throw new Error(`AI response failed: ${err.message}`);
      }
      
      const aiLatency = performance.now() - aiStart;
      setLatency(prev => ({ ...prev, ai: aiLatency }));
      if (onProgress) onProgress({ stage: 'ai', response: aiResponse, latency: aiLatency });

      // Stage 4: TTS (Text-to-Speech) - Blocking for subtitle sync
      setCurrentStage('tts');
      const ttsStart = performance.now();

      // Start TTS and wait for it to start playing (not complete)
      // This ensures subtitles are synced with audio
      console.log('🔊 Starting TTS for AI response...');
      try {
        // Start TTS - it will wait for audio to actually start playing
        // The speak() function now waits for audio to begin before resolving
        await tts.speak(aiResponse);
        console.log('✅ TTS started playing (subtitles synced)');
      } catch (ttsError) {
        // Only log if it's not a "stopped" error
        if (!ttsError.message || !ttsError.message.includes('stopped')) {
          console.error('❌ TTS error:', ttsError);
        } else {
          console.log('⚠️ TTS was stopped by user');
        }
      }
      
      // Calculate actual TTS latency (time to start playing)
      const ttsLatency = performance.now() - ttsStart;

      const totalLatency = performance.now() - startTime;
      
      setLatency(prev => ({
        ...prev,
        tts: ttsLatency,
        total: totalLatency
      }));

      if (onProgress) {
        onProgress({
          stage: 'complete',
          latency: {
            stt: sttLatency,
            ai: aiLatency,
            tts: ttsLatency,
            total: totalLatency
          }
        });
      }

      console.log('⚡ Pipeline complete:', {
        stt: `${sttLatency.toFixed(0)}ms`,
        ai: `${aiLatency.toFixed(0)}ms`,
        tts: `${ttsLatency.toFixed(0)}ms`,
        total: `${totalLatency.toFixed(0)}ms`
      });

      return {
        userText,
        aiResponse,
        latency: {
          stt: sttLatency,
          ai: aiLatency,
          tts: ttsLatency,
          total: totalLatency
        }
      };

    } catch (err) {
      console.error('Pipeline error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
      setCurrentStage('idle');
    }
  }, [streamingSTT, groqChat, tts]);

  /**
   * Process with streaming (real-time)
   */
  const processWithStreaming = useCallback(async (onPartialTranscript, onResponse) => {
    setIsProcessing(true);
    setError(null);

    try {
      const config = configRef.current;

      // Start streaming STT
      await streamingSTT.startStreaming(
        // Final transcript callback
        async (finalText) => {
          if (!finalText || finalText.trim().length === 0) return;

          setCurrentStage('ai');
          
          // Get AI response
          const aiResponse = await groqChat.getResponse(finalText);
          
          if (onResponse) onResponse(aiResponse);
          
          // Start TTS
          setCurrentStage('tts');
          await tts.speak(aiResponse);
          
          setCurrentStage('idle');
        },
        // Partial transcript callback
        (partialText) => {
          if (onPartialTranscript) onPartialTranscript(partialText);
        }
      );

    } catch (err) {
      console.error('Streaming pipeline error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [streamingSTT, groqChat, tts]);

  return {
    processWithPipeline,
    processWithStreaming,
    isProcessing,
    currentStage,
    error,
    latency,
    stop: () => {
      streamingSTT.stopStreaming();
      setIsProcessing(false);
      setCurrentStage('idle');
    }
  };
};

export default useConcurrentPipeline;

