const fetch = require('node-fetch');
require('dotenv').config();

async function testGroq() {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY || process.env.GROQ_API_KEY;
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  
  const body = {
    messages: [{ role: 'user', content: 'hi' }],
    model: 'llama3-8b-8192',
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testGroq();
