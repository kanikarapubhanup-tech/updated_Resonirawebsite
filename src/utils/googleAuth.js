// Google Cloud Authentication Utils
// Note: Service account authentication must be handled server-side for security

/**
 * Generate OAuth 2.0 access token using service account (server-side only)
 * This function is implemented on the backend server for security
 * Do not attempt to use service account private keys in the browser!
 */
export const generateAccessToken = async (serviceAccountJson) => {
  throw new Error('Service account authentication must be handled server-side. Use getAccessTokenFromBackend() instead.');
};

/**
 * Get access token from your backend endpoint
 * This is the secure way to handle authentication in the browser
 */
export const getAccessTokenFromBackend = async (endpoint = '/.netlify/functions/google-token') => {
  try {
    // Use Netlify function endpoint (works in both dev and production)
    // In development with netlify dev, it will proxy to local function
    // In production, it will use the deployed function
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${window.location.origin}${endpoint}`;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Send empty JSON object to satisfy Fastify
      credentials: 'same-origin' // Include cookies for authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('No access token received from backend');
    }

    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

/**
 * Cache access tokens to avoid frequent requests
 */
class TokenCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, token, expiresIn = 3600) {
    const expiryTime = Date.now() + (expiresIn - 300) * 1000; // 5 min buffer
    this.cache.set(key, {
      token,
      expiryTime
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() >= cached.expiryTime) {
      this.cache.delete(key);
      return null;
    }

    return cached.token;
  }

  clear() {
    this.cache.clear();
  }
}

export const tokenCache = new TokenCache();

