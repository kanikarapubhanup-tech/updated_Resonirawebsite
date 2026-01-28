/**
 * Multi-Company Configuration Loader
 * Loads and manages company-specific configurations
 */

class ConfigLoader {
  constructor() {
    this.currentConfig = null;
    this.configCache = new Map();
  }

  /**
   * Load company configuration
   * @param {string} companyId - Company identifier
   * @returns {Promise<Object>} Company configuration
   */
  async loadConfig(companyId = 'default') {
    // Check cache first
    if (this.configCache.has(companyId)) {
      this.currentConfig = this.configCache.get(companyId);
      return this.currentConfig;
    }

    try {
      // Try to load from API endpoint (backend)
      const response = await fetch(`/api/config/${companyId}`);
      if (response.ok) {
        const config = await response.json();
        this.configCache.set(companyId, config);
        this.currentConfig = config;
        return config;
      }
    } catch (error) {
      console.warn('Failed to load config from API, using default:', error);
    }

    // Fallback to default config
    const defaultConfig = this.getDefaultConfig();
    this.configCache.set(companyId, defaultConfig);
    this.currentConfig = defaultConfig;
    return defaultConfig;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      companyId: 'default',
      name: 'Resonira Technologies',
      description: 'IT consulting, AI solutions, software development, cloud services, and helping businesses transform through innovative technology',
      ai: {
        provider: 'groq',
        fallbackProviders: ['openai'],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        maxTokens: 80,
        systemPrompt: null, // Will use default from useGroqChat with strict domain restrictions
        personality: {
          name: 'Jessi',
          tone: 'friendly',
          style: 'professional'
        }
      },
      voice: {
        provider: 'google',
        fallbackProviders: ['webspeech'],
        languageCode: 'en-US',
        voiceName: 'en-US-Neural2-F',
        ssmlGender: 'FEMALE',
        speakingRate: 1.15,
        pitch: 0
      },
      speech: {
        provider: 'google',
        fallbackProviders: ['webspeech'],
        languageCode: 'en-US',
        model: 'latest_long',
        useEnhanced: true
      },
      vad: {
        silenceThreshold: 800, // 0.8 seconds - very fast response
        minSpeechDuration: 600, // Reduced to catch shorter valid speech
        energyThreshold: 0.05,
        speechFrequencyThreshold: 0.15,
        adaptiveThresholds: true,
        noiseCalibrationDuration: 1000
      },
      features: {
        showCalendar: true,
        showWhatsApp: true,
        showChatHistory: true,
        enableBargeIn: true,
        enableStreaming: false  // Disabled by default - use VAD instead
      },
      knowledgeBase: {
        enabled: true,
        dataPath: '/data/default/knowledge.json', // Use public folder path
        topK: 3,
        similarityThreshold: 0.7
      },
      apiKeys: {
        // Will be loaded from environment or config file
        // Check both REACT_APP_ prefix (for client-side) and direct name (for Netlify)
        groq: process.env.GROQ_API_KEY || '',
        google: process.env.REACT_APP_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || ''
      }
    };
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return this.currentConfig || this.getDefaultConfig();
  }

  /**
   * Update configuration dynamically
   */
  updateConfig(updates) {
    if (this.currentConfig) {
      this.currentConfig = { ...this.currentConfig, ...updates };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.configCache.clear();
  }
}

// Singleton instance
export const configLoader = new ConfigLoader();
export default configLoader;

