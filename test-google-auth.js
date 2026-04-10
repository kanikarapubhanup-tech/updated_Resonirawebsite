/**
 * Test script to validate Google service account credentials
 * Run this locally to test your credentials before deploying
 * 
 * Usage:
 *   node test-google-auth.js
 * 
 * Make sure GOOGLE_SERVICE_ACCOUNT_JSON is set in your environment
 */

const { google } = require('googleapis');

async function testGoogleAuth() {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJson) {
      console.error('❌ GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set');
      console.log('\nTo test locally, set the environment variable:');
      console.log('export GOOGLE_SERVICE_ACCOUNT_JSON=\'{"type":"service_account",...}\'');
      process.exit(1);
    }

    console.log('✅ Environment variable found');
    console.log('📋 Parsing JSON...');

    // Parse JSON
    let credentials;
    try {
      credentials = typeof serviceAccountJson === 'string' 
        ? JSON.parse(serviceAccountJson) 
        : serviceAccountJson;
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError.message);
      process.exit(1);
    }

    // Validate required fields
    console.log('🔍 Validating credentials...');
    if (!credentials.client_email) {
      console.error('❌ Missing client_email');
      process.exit(1);
    }
    if (!credentials.private_key) {
      console.error('❌ Missing private_key');
      process.exit(1);
    }
    console.log('✅ Required fields present');
    console.log('📧 Service account email:', credentials.client_email);

    // Process private key
    let privateKey = credentials.private_key;
    const originalLength = privateKey.length;
    
    // Replace escaped newlines - handle both \\n and \n
    if (privateKey.includes('\\n')) {
      console.log('🔄 Converting \\n escape sequences to actual newlines...');
      privateKey = privateKey.replace(/\\n/g, '\n');
    } else if (!privateKey.includes('\n') && privateKey.length < 2000) {
      // If no newlines and key seems short, it might be that newlines were stripped
      console.log('⚠️  Warning: Private key appears to have no newlines');
      console.log('   This might cause authentication to fail');
    }
    
    const newLength = privateKey.length;
    const newlineCount = (privateKey.match(/\n/g) || []).length;
    console.log('📏 Private key length:', originalLength, '→', newLength);
    console.log('📏 Newline count:', newlineCount);
    console.log('🔑 Private key starts with:', privateKey.substring(0, 40) + '...');
    
    // Validate private key format
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      console.error('❌ Private key missing BEGIN PRIVATE KEY marker');
      process.exit(1);
    }
    if (!privateKey.includes('END PRIVATE KEY')) {
      console.error('❌ Private key missing END PRIVATE KEY marker');
      process.exit(1);
    }
    console.log('✅ Private key format looks valid');

    // Create JWT client
    console.log('🔐 Creating JWT client...');
    const jwtClient = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/speech',
        'https://www.googleapis.com/auth/texttospeech'
      ],
      projectId: credentials.project_id
    });

    // Test token generation
    console.log('🎫 Attempting to get access token...');
    const tokenResponse = await jwtClient.getAccessToken();
    const accessToken = tokenResponse.token || tokenResponse;
    
    if (!accessToken) {
      console.error('❌ Access token is null or undefined');
      process.exit(1);
    }

    console.log('✅ Successfully obtained access token!');
    console.log('🎉 Token length:', accessToken.length);
    console.log('🎉 Token preview:', accessToken.substring(0, 20) + '...');
    console.log('\n✅ All tests passed! Your credentials are valid.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('📚 Error details:', {
      code: error.code,
      message: error.message,
      response: error.response?.data || error.response || 'No response data'
    });
    
    if (error.message.includes('private key')) {
      console.error('\n💡 Tip: Make sure the private_key has proper newlines.');
      console.error('   In the JSON, newlines should be represented as \\n');
    } else if (error.message.includes('credentials')) {
      console.error('\n💡 Tip: Verify that your service account JSON is complete and valid.');
    } else if (error.message.includes('Could not refresh')) {
      console.error('\n💡 Possible issues:');
      console.error('   1. Private key format is incorrect (newlines not preserved)');
      console.error('   2. Service account is disabled or deleted');
      console.error('   3. Required APIs are not enabled for the project');
      console.error('   4. Service account lacks required permissions');
      console.error('   5. Project ID is incorrect');
      console.error('\n🔧 To fix:');
      console.error('   1. Go to: https://console.cloud.google.com/apis/library');
      console.error('   2. Enable these APIs for project "plexiform-shine-471813-e5":');
      console.error('      - Cloud Speech-to-Text API');
      console.error('      - Cloud Text-to-Speech API');
      console.error('      - Cloud Platform API (usually enabled by default)');
      console.error('   3. Verify service account exists:');
      console.error('      https://console.cloud.google.com/iam-admin/serviceaccounts');
      console.error('   4. Check service account has "Service Account Token Creator" role');
    }
    
    process.exit(1);
  }
}

// Run the test
testGoogleAuth();

