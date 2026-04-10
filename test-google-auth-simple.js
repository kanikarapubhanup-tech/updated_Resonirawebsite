/**
 * Simplified test to check if the issue is with specific APIs or credentials
 * This tests with minimal scopes first
 */

const { google } = require('googleapis');

async function testSimple() {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJson) {
      console.error('❌ GOOGLE_SERVICE_ACCOUNT_JSON not set');
      process.exit(1);
    }

    const credentials = JSON.parse(serviceAccountJson);
    let privateKey = credentials.private_key.replace(/\\n/g, '\n');

    console.log('🧪 Testing with minimal scope (cloud-platform only)...\n');

    // Test 1: Minimal scope
    const jwtClient1 = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: credentials.project_id
    });

    try {
      const token1 = await jwtClient1.getAccessToken();
      console.log('✅ SUCCESS with cloud-platform scope!');
      console.log('   Token obtained:', token1.token ? 'Yes' : 'No');
      console.log('   This means your credentials are VALID\n');
      
      // Now test with the full scopes
      console.log('🧪 Testing with full scopes (speech + tts)...\n');
      
      const jwtClient2 = new google.auth.JWT({
        email: credentials.client_email,
        key: privateKey,
        scopes: [
          'https://www.googleapis.com/auth/cloud-platform',
          'https://www.googleapis.com/auth/speech',
          'https://www.googleapis.com/auth/texttospeech'
        ],
        projectId: credentials.project_id
      });

      try {
        const token2 = await jwtClient2.getAccessToken();
        console.log('✅ SUCCESS with all scopes!');
        console.log('   All APIs are enabled and working.\n');
      } catch (err2) {
        console.log('❌ FAILED with full scopes');
        console.log('   Error:', err2.message);
        console.log('\n💡 This suggests specific APIs are not enabled:');
        console.log('   - Cloud Speech-to-Text API');
        console.log('   - Cloud Text-to-Speech API');
        console.log('\n🔧 Enable them at:');
        console.log('   https://console.cloud.google.com/apis/library?project=plexiform-shine-471813-e5');
      }

    } catch (err1) {
      console.log('❌ FAILED even with minimal scope');
      console.log('   Error:', err1.message);
      console.log('\n💡 This suggests a fundamental credentials issue:');
      console.log('   1. Service account might be disabled');
      console.log('   2. Private key might be incorrect');
      console.log('   3. Project ID might be wrong');
      console.log('\n🔧 Check service account at:');
      console.log('   https://console.cloud.google.com/iam-admin/serviceaccounts?project=plexiform-shine-471813-e5');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

testSimple();

