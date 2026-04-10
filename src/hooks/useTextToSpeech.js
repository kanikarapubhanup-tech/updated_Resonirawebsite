import { useState, useCallback, useRef, useEffect } from 'react';
import configLoader from '../utils/configLoader';

// GLOBAL AUDIO REGISTRY - tracks ALL audio instances
const globalAudioRegistry = new Set();
let globalAudioContext = null;

// GLOBAL STOP FUNCTION
const stopAllAudio = () => {
  console.log('🛑 GLOBAL STOP: Stopping ALL audio instances...');

  globalAudioRegistry.forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.muted = true;
      audio.src = '';
      audio.load();
    } catch (e) {
      // Ignore errors
    }
  });
  globalAudioRegistry.clear();

  if (globalAudioContext) {
    try {
      if (globalAudioContext.state !== 'closed') {
        globalAudioContext.close();
      }
    } catch (e) {
      // Ignore
    }
    globalAudioContext = null;
  }

  try {
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        audio.muted = true;
        audio.src = '';
        audio.load();
      } catch (e) {
        // Ignore
      }
    });
  } catch (e) {
    // Ignore
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
  }
};

const useTextToSpeech = (authMode = 'backend', apiKey = null) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const audioInstanceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const speakPromiseRef = useRef(null);
  const audioContextRef = useRef(null);
  const isStoppedRef = useRef(false);

  // Stop current speech
  const stop = useCallback(() => {
    isStoppedRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (audioInstanceRef.current) {
      globalAudioRegistry.delete(audioInstanceRef.current);
      try {
        const audio = audioInstanceRef.current;
        audio.pause();
        audio.src = '';
        audio.load();
      } catch (e) {
        // Ignore
      }
      audioInstanceRef.current = null;
    }

    stopAllAudio();

    if (speakPromiseRef.current) {
      try {
        speakPromiseRef.current.reject(new Error('Speech stopped by user'));
      } catch (e) { }
      speakPromiseRef.current = null;
    }

    setIsSpeaking(false);
  }, []);

  // Fallback: Web Speech API
  const speakWithWebSpeech = useCallback((text) => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onstart = () => setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Convert text to speech using Sarvam AI
  const speak = useCallback(async (text) => {
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided');
    }

    isStoppedRef.current = false;
    stop();
    isStoppedRef.current = false;

    setIsSpeaking(true);
    setError(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let promiseResolve, promiseReject;
    const promise = new Promise((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;
    });
    speakPromiseRef.current = { resolve: promiseResolve, reject: promiseReject };

    try {
      const config = configLoader.getConfig();
      // Use provided key or load from config
      const sarvamKey = apiKey || config.apiKeys.sarvam;

      if (!sarvamKey) {
        throw new Error('Sarvam API Key is missing');
      }

      if (isStoppedRef.current || abortController.signal.aborted) {
        throw new Error('Speech stopped');
      }

      // [PLACEHOLDER] Sarvam TTS REST API Endpoint
      const url = 'https://api.sarvam.ai/v1/text-to-speech';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sarvamKey
        },
        body: JSON.stringify({
          text: text.trim(),
          language_code: config.voice.languageCode || 'en-IN',
          speaker_id: config.voice.voiceName || 'sarvam:en:female', // Placeholder voice ID
          pitch: config.voice.pitch || 0,
          speaking_rate: config.voice.speakingRate || 1.0
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Sarvam TTS API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      // [PLACEHOLDER] Response parsing
      // Assuming Sarvam returns base64 audio in 'audio_content' or similar
      if (!data.audio_content) {
        throw new Error('No audio content received from Sarvam API');
      }

      if (isStoppedRef.current || abortController.signal.aborted) {
        throw new Error('Speech stopped');
      }

      const audio = new Audio(`data:audio/mp3;base64,${data.audio_content}`);
      audioInstanceRef.current = audio;

      audio.style.display = 'none';
      document.body.appendChild(audio);
      globalAudioRegistry.add(audio);

      // Audio event handling
      audio.onended = () => {
        globalAudioRegistry.delete(audio);
        try { audio.parentNode?.removeChild(audio); } catch (e) { }

        if (audioInstanceRef.current === audio) {
          setIsSpeaking(false);
          audioInstanceRef.current = null;
          abortControllerRef.current = null;
          if (speakPromiseRef.current) {
            speakPromiseRef.current.resolve();
            speakPromiseRef.current = null;
          }
        }
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        if (speakPromiseRef.current) {
          speakPromiseRef.current.reject(new Error('Audio playback failed'));
          speakPromiseRef.current = null;
        }
      };

      await audio.play();
      return promise;

    } catch (err) {
      setIsSpeaking(false);
      audioInstanceRef.current = null;
      abortControllerRef.current = null;

      if (err.name === 'AbortError' || err.message === 'Speech stopped') {
        return;
      }

      console.error('Sarvam TTS error:', err);
      // Fallback to Web Speech API automatically
      console.warn('Falling back to Web Speech API...');

      // Clear the Sarvam promise ref so stop() doesn't reject an abandoned promise
      speakPromiseRef.current = null;

      return speakWithWebSpeech(text);
    }
  }, [stop, apiKey, speakWithWebSpeech]);



  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    speak,
    speakWithWebSpeech,
    stop,
    isSpeaking,
    error
  };
};

export default useTextToSpeech;
