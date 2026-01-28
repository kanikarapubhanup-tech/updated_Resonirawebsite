import { useState, useCallback, useRef, useEffect } from 'react';
import { getAccessTokenFromBackend, tokenCache } from '../utils/googleAuth';

// GLOBAL AUDIO REGISTRY - tracks ALL audio instances across all hook instances
const globalAudioRegistry = new Set();
let globalAudioContext = null;

// GLOBAL STOP FUNCTION - stops ALL audio immediately
const stopAllAudio = () => {
  console.log('🛑 GLOBAL STOP: Stopping ALL audio instances...');
  
  // Stop all registered audio elements
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
  
  // Close global AudioContext to stop ALL audio
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
  
  // Stop ALL audio elements in DOM (nuclear option)
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
    console.log(`🛑 Stopped ${allAudio.length} DOM audio element(s)`);
  } catch (e) {
    // Ignore
  }
  
  // Stop Web Speech API
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
  }
  
  console.log('✅ GLOBAL STOP: All audio stopped');
};

const useTextToSpeech = (authMode = 'backend', apiKey = null) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const audioInstanceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const speakPromiseRef = useRef(null);
  const audioContextRef = useRef(null); // Local audio context for control
  const isStoppedRef = useRef(false); // Flag to track if stop was called

  // Get authentication header
  const getAuthHeader = useCallback(async () => {
    if (authMode === 'apikey' && apiKey) {
      return null; // Will use API key in URL
    }

    // Use service account via backend (Netlify function)
    let accessToken = tokenCache.get('google-tts');

    if (!accessToken) {
      accessToken = await getAccessTokenFromBackend('/.netlify/functions/google-token');
      tokenCache.set('google-tts', accessToken);
    }

    return {
      'Authorization': `Bearer ${accessToken}`
    };
  }, [authMode, apiKey]);

  // Properly destroy audio instance
  const destroyAudio = useCallback(() => {
    if (audioInstanceRef.current) {
      const audio = audioInstanceRef.current;
      try {
        // Remove all event listeners
        const clone = audio.cloneNode(false);
        audio.replaceWith(clone);
        audio.remove();
      } catch (e) {
        // If replaceWith doesn't work, try direct removal
        try {
          audio.pause();
          audio.src = '';
          audio.load();
        } catch (e2) {
          // Ignore errors
        }
      }
      audioInstanceRef.current = null;
    }
  }, []);

  // Stop current speech - PROPER IMPLEMENTATION WITH GLOBAL REGISTRY
  const stop = useCallback(() => {
    console.log('🔇 Stopping TTS - using global registry...');
    
    // Set stop flag immediately
    isStoppedRef.current = true;
    
    // Cancel any ongoing fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Remove from global registry and stop
    if (audioInstanceRef.current) {
      globalAudioRegistry.delete(audioInstanceRef.current);
      try {
        const audio = audioInstanceRef.current;
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        audio.muted = true;
        audio.src = '';
        audio.load();
      } catch (e) {
        // Ignore
      }
      audioInstanceRef.current = null;
    }

    // Use GLOBAL STOP to stop ALL audio
    stopAllAudio();

    // Reject any pending promise IMMEDIATELY
    if (speakPromiseRef.current) {
      try {
        speakPromiseRef.current.reject(new Error('Speech stopped by user'));
      } catch (e) {
        // Promise might already be resolved/rejected, ignore
      }
      speakPromiseRef.current = null;
    }

    setIsSpeaking(false);
    console.log('✅ TTS stopped completely');
  }, []);

  // Convert text to speech using Google Cloud TTS
  const speak = useCallback(async (text) => {
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for speech synthesis');
    }

    // Reset stop flag for new speech
    isStoppedRef.current = false;

    // Stop any existing speech first
    stop();
    
    // Reset stop flag after stopping previous (since stop() sets it to true)
    isStoppedRef.current = false;

    setIsSpeaking(true);
    setError(null);

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Create promise that can be rejected if stopped
    let promiseResolve, promiseReject;
    const promise = new Promise((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;
    });
    speakPromiseRef.current = { resolve: promiseResolve, reject: promiseReject };

    try {
      // Get authentication
      const authHeaders = await getAuthHeader();

      // Check if stopped/aborted
      if (isStoppedRef.current || abortController.signal.aborted) {
        setIsSpeaking(false);
        throw new Error('Speech stopped');
      }

      // Build URL and headers
      let url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
      let headers = {
        'Content-Type': 'application/json',
      };

      if (authHeaders) {
        headers = { ...headers, ...authHeaders };
      } else if (apiKey) {
        url += `?key=${apiKey}`;
      } else {
        throw new Error('No authentication method configured for text-to-speech');
      }

      // Make API request with abort signal
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          input: { text: text.trim() },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Wavenet-D',
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 1.15,
            volumeGainDb: 0,
            effectsProfileId: ['headphone-class-device']
          }
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Text-to-Speech API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      if (!data.audioContent) {
        throw new Error('No audio content received from TTS API');
      }

      // Check if stopped/aborted after API call
      if (isStoppedRef.current || abortController.signal.aborted) {
        setIsSpeaking(false);
        throw new Error('Speech stopped');
      }

      // Create new audio element and add to DOM (hidden) so we can find it
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audioInstanceRef.current = audio;
      
      // Add to DOM (hidden) so querySelector can find it
      audio.style.display = 'none';
      audio.style.position = 'absolute';
      audio.style.left = '-9999px';
      document.body.appendChild(audio);
      
      // Register in global registry
      globalAudioRegistry.add(audio);
      
      // Create or get global audio context for control
      if (!globalAudioContext || globalAudioContext.state === 'closed') {
        try {
          globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          console.warn('Could not create global AudioContext:', e);
        }
      }
      
      // Also keep local reference
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = globalAudioContext;
      }

      // Track when audio actually starts playing (for subtitle sync)
      let audioStarted = false;
      const audioStartPromise = new Promise((resolve) => {
        const onCanPlay = () => {
          if (!audioStarted) {
            audioStarted = true;
            resolve();
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('playing', onPlaying);
          }
        };
        const onPlaying = () => {
          if (!audioStarted) {
            audioStarted = true;
            resolve();
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('playing', onPlaying);
          }
        };
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('playing', onPlaying);
      });

      // Set up event handlers - all check stop flag
      audio.onended = () => {
        // Remove from registry
        globalAudioRegistry.delete(audio);
        
        // Remove from DOM
        try {
          if (audio.parentNode) {
            audio.parentNode.removeChild(audio);
          }
        } catch (e) {
          // Ignore
        }
        
        if (isStoppedRef.current || abortController.signal.aborted) {
          setIsSpeaking(false);
          audioInstanceRef.current = null;
          abortControllerRef.current = null;
          return;
        }
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

      audio.onerror = (event) => {
        setIsSpeaking(false);
        audioInstanceRef.current = null;
        abortControllerRef.current = null;
        if (speakPromiseRef.current && !isStoppedRef.current && !abortController.signal.aborted) {
          speakPromiseRef.current.reject(new Error('Audio playback failed'));
          speakPromiseRef.current = null;
        }
      };

      audio.onpause = () => {
        // If paused and stopped/aborted, we're stopping
        if (isStoppedRef.current || abortController.signal.aborted) {
          setIsSpeaking(false);
          audioInstanceRef.current = null;
          abortControllerRef.current = null;
          // Reject promise if stopped
          if (speakPromiseRef.current) {
            speakPromiseRef.current.reject(new Error('Speech stopped by user'));
            speakPromiseRef.current = null;
          }
        }
      };

      // Add onplay handler to immediately stop if stopped
      audio.onplay = () => {
        if (isStoppedRef.current || abortController.signal.aborted) {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0;
          setIsSpeaking(false);
          audioInstanceRef.current = null;
          abortControllerRef.current = null;
          // Reject promise immediately
          if (speakPromiseRef.current) {
            speakPromiseRef.current.reject(new Error('Speech stopped by user'));
            speakPromiseRef.current = null;
          }
        }
      };
      
      // Add onplaying handler to continuously check and stop
      audio.onplaying = () => {
        if (isStoppedRef.current || abortController.signal.aborted) {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0;
          setIsSpeaking(false);
          audioInstanceRef.current = null;
          abortControllerRef.current = null;
          // Reject promise immediately
          if (speakPromiseRef.current) {
            speakPromiseRef.current.reject(new Error('Speech stopped by user'));
            speakPromiseRef.current = null;
          }
        }
      };

      // Check if stopped/aborted before playing
      if (isStoppedRef.current || abortController.signal.aborted) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        setIsSpeaking(false);
        audioInstanceRef.current = null;
        abortControllerRef.current = null;
        throw new Error('Speech stopped');
      }

      // Play audio and check immediately after
      try {
        await audio.play();
        
        // Wait for audio to actually start playing (for subtitle sync)
        await audioStartPromise;
        console.log('🎵 Audio started playing');
        
        // Double-check after play starts - if stopped, stop immediately
        if (isStoppedRef.current || abortController.signal.aborted) {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0;
          audio.muted = true;
          setIsSpeaking(false);
          audioInstanceRef.current = null;
          abortControllerRef.current = null;
          throw new Error('Speech stopped');
        }
        
        // Set up interval to continuously check if stopped while playing
        const stopCheckInterval = setInterval(() => {
          if (isStoppedRef.current || abortController.signal.aborted) {
            clearInterval(stopCheckInterval);
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0;
            audio.muted = true;
            setIsSpeaking(false);
            audioInstanceRef.current = null;
            abortControllerRef.current = null;
            // Reject the promise immediately when stopped
            if (speakPromiseRef.current) {
              speakPromiseRef.current.reject(new Error('Speech stopped by user'));
              speakPromiseRef.current = null;
            }
          }
        }, 30); // Check every 30ms for faster response
        
        // Clear interval when audio ends
        audio.addEventListener('ended', () => clearInterval(stopCheckInterval), { once: true });
        audio.addEventListener('pause', () => {
          clearInterval(stopCheckInterval);
          // If paused due to stop, reject promise
          if (isStoppedRef.current || abortController.signal.aborted) {
            if (speakPromiseRef.current) {
              speakPromiseRef.current.reject(new Error('Speech stopped by user'));
              speakPromiseRef.current = null;
            }
          }
        }, { once: true });
        
      } catch (playError) {
        // If play fails and we're stopped, don't throw error
        if (isStoppedRef.current || abortController.signal.aborted) {
          setIsSpeaking(false);
          audioInstanceRef.current = null;
          abortControllerRef.current = null;
          return; // Silent return if stopped
        }
        throw playError;
      }

      // Wait for audio to finish or be stopped
      return promise;

    } catch (err) {
      setIsSpeaking(false);
      audioInstanceRef.current = null;
      abortControllerRef.current = null;
      
      if (speakPromiseRef.current) {
        speakPromiseRef.current = null;
      }

      if (err.name === 'AbortError' || err.message === 'Speech stopped') {
        console.log('⚠️ TTS was stopped');
        return; // Don't throw error if stopped intentionally
      }

      console.error('Text-to-Speech error:', err);
      setError(err.message);
      throw err;
    }
  }, [authMode, apiKey, getAuthHeader, stop]);

  // Alternative TTS using Web Speech API (fallback)
  const speakWithWebSpeech = useCallback((text) => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice =>
        voice.lang.startsWith('en') &&
        (voice.name.includes('Female') || voice.name.includes('female') || voice.gender === 'female')
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        reject(new Error(`Web Speech API error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop(); // Ensure all audio is stopped when component unmounts
      // Remove from registry
      if (audioInstanceRef.current) {
        globalAudioRegistry.delete(audioInstanceRef.current);
        try {
          if (audioInstanceRef.current.parentNode) {
            audioInstanceRef.current.parentNode.removeChild(audioInstanceRef.current);
          }
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [stop]);

  // Check if speech synthesis is available
  const isSupported = useCallback(() => {
    return 'speechSynthesis' in window || !!apiKey;
  }, [apiKey]);

  return {
    speak,
    speakWithWebSpeech,
    stop,
    isSupported,
    isSpeaking,
    error
  };
};

export default useTextToSpeech;
