'use strict';

const { google } = require('googleapis');

/**
 * Netlify Function to generate Google OAuth token from service account
 * This securely handles Google Cloud authentication server-side
 */
exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Get service account credentials from environment variable
    // Store the entire JSON as a string in NETLIFY env var: GOOGLE_SERVICE_ACCOUNT_JSON
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJson) {
      console.error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Google service account credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_JSON in Netlify environment variables.' 
        })
      };
    }

    // Parse the JSON string
    let credentials;
    try {
      credentials = typeof serviceAccountJson === 'string' 
        ? JSON.parse(serviceAccountJson) 
        : serviceAccountJson;
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', parseError);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Invalid service account JSON format',
          parseError: parseError.message
        })
      };
    }

    // Validate required fields
    if (!credentials.client_email || !credentials.private_key) {
      console.error('Missing required credentials fields');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Service account JSON missing required fields (client_email or private_key)'
        })
      };
    }

    // Ensure private key has proper newlines (handle escaped \n)
    let privateKey = credentials.private_key;
    
    // Handle different newline formats
    if (typeof privateKey === 'string') {
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // Validate private key format
      if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
        console.error('Invalid private key format - missing BEGIN/END markers');
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Invalid private key format - must include BEGIN PRIVATE KEY and END PRIVATE KEY markers'
          })
        };
      }
    }

    // Log for debugging (only in dev, don't log the actual key)
    if (process.env.NETLIFY_DEV) {
      console.log('Using service account:', credentials.client_email);
      console.log('Private key length:', privateKey.length);
      console.log('Private key starts with:', privateKey.substring(0, 30));
    }

    // Create JWT client directly - this is more reliable
    // Using only cloud-platform scope as it provides access to all Google Cloud APIs
    // This avoids issues with specific API scopes that might not be properly configured
    const jwtClient = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform' // This scope covers all Google Cloud APIs including Speech and TTS
      ],
      projectId: credentials.project_id
    });

    // Get access token with explicit error handling
    let accessToken;
    try {
      const tokenResponse = await jwtClient.getAccessToken();
      accessToken = tokenResponse.token || tokenResponse;
      
      if (!accessToken) {
        throw new Error('Access token is null or undefined');
      }
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      
      // Provide more specific error messages
      if (tokenError.message && tokenError.message.includes('private key')) {
        throw new Error('Invalid private key format. Please check that newlines are preserved correctly.');
      } else if (tokenError.message && tokenError.message.includes('credentials')) {
        throw new Error('Invalid service account credentials. Please verify the JSON is correct.');
      } else {
        throw new Error(`Token generation failed: ${tokenError.message || 'Unknown error'}`);
      }
    }

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow CORS for frontend
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        access_token: accessToken,
        expires_in: 3600, // Google tokens typically expire in 1 hour
        token_type: 'Bearer',
        expires_at: Date.now() + (3600 * 1000) // Unix timestamp for expiration
      })
    };

  } catch (error) {
    console.error('Error generating Google token:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // More detailed error for debugging
    const errorDetails = {
      error: error.message || 'Failed to generate access token',
      code: error.code || 'UNKNOWN_ERROR'
    };
    
    // Only include stack trace in development
    if (process.env.NETLIFY_DEV || process.env.NODE_ENV === 'development') {
      errorDetails.stack = error.stack;
      errorDetails.details = error.toString();
    }
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorDetails)
    };
  }
};

