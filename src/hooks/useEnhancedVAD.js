/**
 * Enhanced Voice Activity Detection with Adaptive Thresholds
 * Includes noise calibration and mobile detection
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import configLoader from '../utils/configLoader';

const useEnhancedVAD = () => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);

  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastSpeechTimeRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isListeningRef = useRef(false);
  const speechStartTimeRef = useRef(null);
  const shouldProcessAudioRef = useRef(false);
  const configRef = useRef(null);
  const mediaStreamRef = useRef(null); // Store stream in ref for immediate access

  // Adaptive thresholds
  const adaptiveThresholdsRef = useRef({
    energyThreshold: 0.05,
    speechFrequencyThreshold: 0.15,
    silenceThreshold: 800, // 0.8 seconds - very fast response
    minSpeechDuration: 600 // Reduced for better responsiveness
  });

  // Noise calibration data
  const noiseCalibrationRef = useRef({
    ambientNoise: 0,
    backgroundEnergy: [],
    calibrated: false
  });

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Initialize config
  useEffect(() => {
    configRef.current = configLoader.getConfig();
    const vadConfig = configRef.current?.vad || {};
    
    // Set initial thresholds
    adaptiveThresholdsRef.current = {
      energyThreshold: vadConfig.energyThreshold || (isMobile ? 0.03 : 0.05),
      speechFrequencyThreshold: vadConfig.speechFrequencyThreshold || 0.15,
      silenceThreshold: vadConfig.silenceThreshold || (isMobile ? 1200 : 800), // 0.8 seconds
      minSpeechDuration: vadConfig.minSpeechDuration || 600 // Reduced for better responsiveness
    };
  }, [isMobile]);

  /**
   * Calibrate ambient noise
   */
  const calibrateNoise = useCallback(async (duration = 1000) => {
    setIsCalibrating(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      const context = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const energySamples = [];
      const speechEnergySamples = [];

      const binWidth = 16000 / 2048;
      const speechStartBin = Math.floor(300 / binWidth);
      const speechEndBin = Math.floor(3400 / binWidth);

      const startTime = Date.now();
      
      const measureNoise = () => {
        if (Date.now() - startTime >= duration) {
          // Calculate average ambient noise
          const avgEnergy = energySamples.reduce((a, b) => a + b, 0) / energySamples.length;
          const avgSpeechEnergy = speechEnergySamples.reduce((a, b) => a + b, 0) / speechEnergySamples.length;

          noiseCalibrationRef.current = {
            ambientNoise: avgEnergy,
            backgroundEnergy: energySamples,
            calibrated: true
          };

          // Adjust thresholds based on ambient noise
          if (avgEnergy > 0.02) {
            // High background noise
            adaptiveThresholdsRef.current.energyThreshold = Math.max(0.03, avgEnergy * 1.5);
            adaptiveThresholdsRef.current.speechFrequencyThreshold = Math.max(0.12, avgSpeechEnergy * 1.3);
          } else {
            // Low background noise
            adaptiveThresholdsRef.current.energyThreshold = 0.05;
            adaptiveThresholdsRef.current.speechFrequencyThreshold = 0.15;
          }

          stream.getTracks().forEach(track => track.stop());
          context.close();
          setIsCalibrating(false);
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        const energy = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength / 255;
        energySamples.push(energy);

        let speechEnergy = 0;
        for (let i = speechStartBin; i < speechEndBin && i < bufferLength; i++) {
          speechEnergy += dataArray[i];
        }
        speechEnergy = speechEnergy / (speechEndBin - speechStartBin) / 255;
        speechEnergySamples.push(speechEnergy);

        requestAnimationFrame(measureNoise);
      };

      measureNoise();

    } catch (error) {
      console.error('Noise calibration error:', error);
      setIsCalibrating(false);
    }
  }, []);

  /**
   * Initialize audio context and media stream
   */
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      const context = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      setMediaStream(stream);
      setAudioContext(context);
      analyserRef.current = analyser;
      mediaStreamRef.current = stream; // Store in ref for immediate access

      return { stream, context, analyser };
    } catch (error) {
      console.error('Error initializing audio:', error);
      throw error;
    }
  }, []);

  /**
   * Start voice activity detection
   */
  const startVAD = useCallback(async (onSpeechDetected, options = {}) => {
    console.log('🎙️ Starting Enhanced VAD...');

    // If VAD is already running, stop it first
    // But we need to process any audio that was captured
    if (isListeningRef.current && mediaRecorderRef.current?.state === 'recording') {
      console.log('⚠️ VAD already running, stopping previous instance...');
      // Keep shouldProcess as true so any captured audio gets processed
      // The onstop handler will process it before we start the new instance
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      // Wait for the previous recorder to stop and process
      await new Promise(resolve => setTimeout(resolve, 200));
      // Clear chunks after processing
      audioChunksRef.current = [];
    }

    // Calibrate noise if not already done and adaptive thresholds enabled
    const config = configRef.current?.vad || {};
    if (config.adaptiveThresholds && !noiseCalibrationRef.current.calibrated) {
      await calibrateNoise(config.noiseCalibrationDuration || 1000);
    }

    // Use ref for immediate access, fallback to state
    let currentStream = mediaStreamRef.current || mediaStream;
    
    if (!analyserRef.current || !currentStream) {
      const audioInit = await initializeAudio();
      currentStream = audioInit.stream; // Use the stream directly from initializeAudio
      mediaStreamRef.current = currentStream; // Update ref immediately
      
      // Initialize MediaRecorder with the stream we just got
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        try {
          mediaRecorderRef.current = new MediaRecorder(currentStream, {
            mimeType: 'audio/webm;codecs=opus'
          });
          console.log('✅ MediaRecorder created successfully');
        } catch (error) {
          console.error('❌ MediaRecorder creation error:', error);
          console.error('Stream type:', typeof currentStream);
          console.error('Stream instanceof MediaStream:', currentStream instanceof MediaStream);
          throw error;
        }

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const shouldProcess = shouldProcessAudioRef.current;
          const chunksSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
          
          console.log('🛑 MediaRecorder stopped (new instance)', {
            shouldProcess,
            chunksCount: audioChunksRef.current.length,
            totalSize: chunksSize
          });
          
          if (!shouldProcess) {
            console.log('🚫 Audio capture stopped manually, not processing blob');
            audioChunksRef.current = [];
            return;
          }

          if (audioChunksRef.current.length > 0 && chunksSize > 0) {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: 'audio/webm;codecs=opus'
            });
            console.log('🎵 Audio blob created, calling speech handler...', audioBlob.size);
            // Reset shouldProcess BEFORE calling handler to prevent double-processing
            shouldProcessAudioRef.current = false;
            onSpeechDetected(audioBlob);
            audioChunksRef.current = [];
          } else {
            console.log('⚠️ No audio chunks to process');
            shouldProcessAudioRef.current = false;
          }
        };
      }
    } else {
      // MediaRecorder already exists, just make sure it's set up
      if (mediaRecorderRef.current && !mediaRecorderRef.current.ondataavailable) {
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const shouldProcess = shouldProcessAudioRef.current;
          const chunksSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
          
          console.log('🛑 MediaRecorder stopped (existing instance)', {
            shouldProcess,
            chunksCount: audioChunksRef.current.length,
            totalSize: chunksSize
          });
          
          if (!shouldProcess) {
            console.log('🚫 Audio capture stopped manually, not processing blob');
            audioChunksRef.current = [];
            return;
          }

          if (audioChunksRef.current.length > 0 && chunksSize > 0) {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: 'audio/webm;codecs=opus'
            });
            console.log('🎵 Audio blob created, calling speech handler...', audioBlob.size);
            shouldProcessAudioRef.current = false;
            onSpeechDetected(audioBlob);
            audioChunksRef.current = [];
          } else {
            console.log('⚠️ No audio chunks to process');
            shouldProcessAudioRef.current = false;
          }
        };
      }
    }

    setIsListening(true);
    isListeningRef.current = true;
    isSpeakingRef.current = false;
    lastSpeechTimeRef.current = null;
    shouldProcessAudioRef.current = true;

    // Merge config with options
    const cfg = { ...adaptiveThresholdsRef.current, ...options };

    // Start recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start();
    }

    // Start monitoring audio
    const monitorAudio = () => {
      if (!isListeningRef.current || !analyserRef.current) {
        return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate audio energy
      const energy = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength / 255;
      setAudioLevel(energy);

      // Calculate speech frequency energy (300Hz - 3400Hz)
      const binWidth = 16000 / 2048;
      const speechStartBin = Math.floor(300 / binWidth);
      const speechEndBin = Math.floor(3400 / binWidth);

      let speechEnergy = 0;
      for (let i = speechStartBin; i < speechEndBin && i < bufferLength; i++) {
        speechEnergy += dataArray[i];
      }
      speechEnergy = speechEnergy / (speechEndBin - speechStartBin) / 255;

      // Detect speech using both thresholds
      const isSpeechDetected = energy > cfg.energyThreshold && speechEnergy > cfg.speechFrequencyThreshold;

      if (isSpeechDetected) {
        if (!isSpeakingRef.current) {
          isSpeakingRef.current = true;
          speechStartTimeRef.current = Date.now();
          console.log('🗣️ Speech detected - started speaking!', {
            energy: energy.toFixed(4),
            speechEnergy: speechEnergy.toFixed(4)
          });
        }
        // Reset silence timer when speech is detected (handles natural pauses)
        lastSpeechTimeRef.current = Date.now();
      } else if (isSpeakingRef.current && lastSpeechTimeRef.current) {
        const silenceDuration = Date.now() - lastSpeechTimeRef.current;
        const speechDuration = speechStartTimeRef.current ? Date.now() - speechStartTimeRef.current : 0;

        // Only stop if silence is long enough AND we have valid speech
        // This allows for natural pauses in speech without cutting off
        if (silenceDuration >= cfg.silenceThreshold) {
          if (speechDuration >= cfg.minSpeechDuration) {
            console.log('🤫 Valid speech completed - processing.', {
              speechDuration: `${speechDuration}ms`,
              silence: `${silenceDuration}ms`
            });
            stopVAD();
            return;
          } else {
            console.log('⚡ Ignoring short audio burst.', {
              duration: `${speechDuration}ms`,
              minimum: `${cfg.minSpeechDuration}ms`
            });
            isSpeakingRef.current = false;
            speechStartTimeRef.current = null;
            lastSpeechTimeRef.current = null;
          }
        }
        // If silence is less than threshold, continue listening (allows natural pauses)
      }

      // Check max speech duration
      if (isSpeakingRef.current && speechStartTimeRef.current) {
        const speechDuration = Date.now() - speechStartTimeRef.current;
        if (speechDuration >= 30000) {
          console.log('⏱️ Max speech duration reached - stopping');
          stopVAD();
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(monitorAudio);
    };

    monitorAudio();
  }, [mediaStream, initializeAudio, calibrateNoise]);

  /**
   * Stop voice activity detection
   */
  const stopVAD = useCallback((shouldProcess = true) => {
    console.log('🛑 Stopping Enhanced VAD', { shouldProcess, isRecording: mediaRecorderRef.current?.state });
    setIsListening(false);
    isListeningRef.current = false;
    setAudioLevel(0);
    
    // Only set shouldProcess if we're actually stopping (not during cleanup)
    // If recording, we want to process the audio
    if (mediaRecorderRef.current?.state === 'recording') {
      shouldProcessAudioRef.current = shouldProcess;
    } else {
      shouldProcessAudioRef.current = shouldProcess;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('🛑 Stopping MediaRecorder, shouldProcess:', shouldProcess);
      mediaRecorderRef.current.stop();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    isSpeakingRef.current = false;
    lastSpeechTimeRef.current = null;
  }, []);

  /**
   * Cleanup
   */
  const cleanup = useCallback(() => {
    console.log('🧹 VAD cleanup called', {
      isRecording: mediaRecorderRef.current?.state,
      isListening: isListeningRef.current
    });
    
    // Only cleanup if component is unmounting, not during normal operation
    // If recording, let it finish processing first
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('⏳ MediaRecorder is recording, ensuring it processes before cleanup');
      shouldProcessAudioRef.current = true; // Ensure it processes
      // Don't call stopVAD here - let it finish naturally
      // The onstop handler will process the audio
    } else {
      // Not recording, safe to cleanup
      stopVAD(false);
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      setAudioContext(null);
    }

    analyserRef.current = null;
    // Don't null mediaRecorderRef here - let onstop handler finish first
    // mediaRecorderRef.current = null;
  }, [stopVAD, mediaStream, audioContext]);

  useEffect(() => {
    return () => {
      // Only cleanup on unmount, not on every render
      console.log('🧹 Component unmounting, cleaning up VAD...');
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount/unmount

  return {
    isListening,
    audioLevel,
    isCalibrating,
    startVAD,
    stopVAD,
    cleanup,
    calibrateNoise,
    isAudioInitialized: !!mediaStream,
    adaptiveThresholds: adaptiveThresholdsRef.current
  };
};

export default useEnhancedVAD;

