/**
 * Real-Time Streaming Speech-to-Text Hook
 * Uses Google Cloud Streaming Recognition API via WebSocket
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import configLoader from '../utils/configLoader';

const useStreamingSTT = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const websocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const configRef = useRef(null);
  const abortControllerRef = useRef(null); // For cancelling LongRunningRecognize

  // Initialize config
  useEffect(() => {
    configRef.current = configLoader.getConfig();
  }, []);

  /**
   * Convert audio blob to base64
   */
  const blobToBase64 = useCallback((blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(btoa(binary));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }, []);

  /**
   * Get Google OAuth token from backend
   */
  const getAccessToken = useCallback(async () => {
    try {
      // Use Netlify function endpoint
      const fullUrl = `${window.location.origin}/.netlify/functions/google-token`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get token: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token received from backend');
      }
      
      return data.access_token;
    } catch (error) {
      console.error('Token fetch error:', error);
      throw error;
    }
  }, []);

  /**
   * Start streaming recognition
   */
  const startStreaming = useCallback(async (onTranscript, onPartialTranscript) => {
    try {
      setIsStreaming(true);
      setError(null);
      setPartialTranscript('');
      setFinalTranscript('');

      const config = configRef.current;
      const speechConfig = config?.speech || {};

      // Get access token
      const accessToken = await getAccessToken();

      // Initialize audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      audioContextRef.current = audioContext;

      // Create MediaRecorder for chunking
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      // Setup WebSocket connection to backend streaming endpoint
      // Backend will handle Google Streaming API
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/stream-stt`;
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = async () => {
        console.log('📡 Streaming STT WebSocket connected');

        // Send initial config
        ws.send(JSON.stringify({
          type: 'config',
          config: {
            encoding: 'WEBM_OPUS',
            // Omit sampleRateHertz - Google auto-detects from WEBM_OPUS container
            languageCode: speechConfig.languageCode || 'en-US',
            enableAutomaticPunctuation: true,
            model: speechConfig.model || 'latest_long',
            useEnhanced: speechConfig.useEnhanced !== false,
            enableInterimResults: true
          },
          token: accessToken
        }));

        // Start recording and streaming
        mediaRecorder.start(100); // 100ms chunks

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            const base64Audio = await blobToBase64(event.data);
            ws.send(JSON.stringify({
              type: 'audio',
              audio: base64Audio
            }));
          }
        };
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'partial') {
            const text = data.transcript;
            setPartialTranscript(text);
            if (onPartialTranscript) onPartialTranscript(text);
          } else if (data.type === 'final') {
            const text = data.transcript;
            setFinalTranscript(text);
            setPartialTranscript('');
            if (onTranscript) onTranscript(text);
          } else if (data.type === 'error') {
            throw new Error(data.error);
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Streaming connection error');
        stopStreaming();
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsStreaming(false);
      };

    } catch (err) {
      console.error('Streaming STT error:', err);
      setError(err.message);
      setIsStreaming(false);
      // Fallback to blob-based STT
      throw err;
    }
  }, [getAccessToken, blobToBase64]);

  /**
   * Stop streaming recognition
   */
  const stopStreaming = useCallback(() => {
    // Cancel any ongoing LongRunningRecognize operations
    if (abortControllerRef.current) {
      console.log('🛑 Cancelling LongRunningRecognize operation...');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsStreaming(false);
    setPartialTranscript('');
    setIsTranscribing(false);
  }, []);

  /**
   * Estimate audio duration from blob size (rough estimate)
   */
  const estimateAudioDuration = useCallback((blobSize, sampleRate = 16000, channels = 1, bitDepth = 16) => {
    // For WebM Opus, this is a rough estimate
    // WebM Opus typically has ~32kbps bitrate
    const estimatedBitrate = 32000; // bits per second
    const estimatedDurationSeconds = (blobSize * 8) / estimatedBitrate;
    return estimatedDurationSeconds;
  }, []);

  /**
   * Internal helper: LongRunningRecognize implementation
   * Now with cancellation support and faster polling
   */
  const transcribeWithLongRunning = useCallback(async (base64Audio, accessToken, speechConfig) => {
    console.log('⏳ Using LongRunningRecognize for long audio...');
    
    // Create abort controller for this operation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Step 1: Start long-running recognition
      const startResponse = await fetch('https://speech.googleapis.com/v1/speech:longrunningrecognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            // Omit sampleRateHertz - Google auto-detects from WEBM_OPUS container
            languageCode: speechConfig.languageCode || 'en-US',
            enableAutomaticPunctuation: true,
            model: speechConfig.model || 'latest_long',
            useEnhanced: speechConfig.useEnhanced !== false
          },
          audio: { content: base64Audio }
        }),
        signal: abortController.signal
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(`STT API error: ${errorData.error?.message || startResponse.statusText}`);
      }

      const operationData = await startResponse.json();
      const operationName = operationData.name;

      if (!operationName) {
        throw new Error('No operation name returned from LongRunningRecognize');
      }

      // Step 2: Poll for results with faster polling and cancellation
      console.log('🔄 Polling for transcription results...');
      const maxAttempts = 90; // 3 minutes max wait (2s * 90)
      let attempts = 0;

      while (attempts < maxAttempts) {
        // Check if cancelled
        if (abortController.signal.aborted) {
          console.log('⚠️ LongRunningRecognize cancelled by user');
          throw new Error('Transcription cancelled');
        }

        // Wait 2 seconds (faster polling)
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, 2000);
          abortController.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('Transcription cancelled'));
          });
        });

        // Check again after wait
        if (abortController.signal.aborted) {
          throw new Error('Transcription cancelled');
        }

        const pollResponse = await fetch(
          `https://speech.googleapis.com/v1/operations/${operationName}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            signal: abortController.signal
          }
        );

        if (!pollResponse.ok) {
          // If cancelled, don't throw error
          if (abortController.signal.aborted) {
            throw new Error('Transcription cancelled');
          }
          throw new Error(`Failed to poll operation: ${pollResponse.statusText}`);
        }

        const pollData = await pollResponse.json();

        if (pollData.done) {
          if (pollData.error) {
            throw new Error(`LongRunningRecognize error: ${pollData.error.message}`);
          }

          if (!pollData.response?.results || pollData.response.results.length === 0) {
            return { text: '', confidence: 0 };
          }

          // Combine all results
          const fullTranscript = pollData.response.results
            .map(result => result.alternatives[0]?.transcript || '')
            .join(' ')
            .trim();

          const avgConfidence = pollData.response.results
            .map(result => result.alternatives[0]?.confidence || 0)
            .reduce((sum, conf) => sum + conf, 0) / pollData.response.results.length;

          console.log('✅ LongRunningRecognize completed');
          return {
            text: fullTranscript,
            confidence: avgConfidence
          };
        }

        attempts++;
        if (attempts % 5 === 0) { // Log every 10 seconds
          console.log(`⏳ Still processing... (attempt ${attempts}/${maxAttempts})`);
        }
      }

      throw new Error('LongRunningRecognize timeout - operation took too long');
    } catch (err) {
      if (err.name === 'AbortError' || err.message.includes('cancelled')) {
        console.log('⚠️ LongRunningRecognize was cancelled');
        throw new Error('Transcription cancelled');
      }
      throw err;
    } finally {
      // Clear abort controller reference
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  /**
   * Fallback: Blob-based transcription with proper handling for long audio
   * Uses LongRunningRecognize for audio > 1 minute, sync recognize for shorter
   */
  const transcribeBlob = useCallback(async (audioBlob) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const config = configRef.current;
      const speechConfig = config?.speech || {};
      
      const base64Audio = await blobToBase64(audioBlob);
      const accessToken = await getAccessToken();

      // Estimate audio duration
      const estimatedDuration = estimateAudioDuration(audioBlob.size);
      console.log(`📊 Estimated audio duration: ${estimatedDuration.toFixed(2)}s`);

      // Use LongRunningRecognize for audio > 50 seconds (to be safe)
      // Sync recognize has 1-minute limit, but we use 50s threshold for safety
      if (estimatedDuration > 50) {
        return await transcribeWithLongRunning(base64Audio, accessToken, speechConfig);
      } else {
        // Use sync recognize for shorter audio
        console.log('⚡ Using sync recognize for short audio...');
        
        const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              // Omit sampleRateHertz - Google auto-detects from WEBM_OPUS container
              languageCode: speechConfig.languageCode || 'en-US',
              enableAutomaticPunctuation: true,
              model: speechConfig.model || 'latest_long',
              useEnhanced: speechConfig.useEnhanced !== false
            },
            audio: { content: base64Audio }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error?.message || response.statusText;
          
          // If sync API fails due to length, retry with LongRunningRecognize
          if (errorMessage.includes('too long') || errorMessage.includes('Sync input')) {
            console.log('⚠️ Sync API failed due to length, retrying with LongRunningRecognize...');
            return await transcribeWithLongRunning(base64Audio, accessToken, speechConfig);
          }
          
          throw new Error(`STT API error: ${errorMessage}`);
        }

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
          return { text: '', confidence: 0 };
        }

        const transcription = data.results[0].alternatives[0];
        return {
          text: transcription.transcript.trim(),
          confidence: transcription.confidence || 0
        };
      }

    } catch (err) {
      console.error('Blob transcription error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  }, [getAccessToken, blobToBase64, estimateAudioDuration, transcribeWithLongRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    // Streaming methods
    startStreaming,
    stopStreaming,
    isStreaming,
    partialTranscript,
    finalTranscript,
    
    // Fallback methods
    transcribeBlob,
    isTranscribing,
    
    // State
    error
  };
};

export default useStreamingSTT;

