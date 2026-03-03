// Cloudflare Pages Function to proxy Groq API calls
// Route: /api/groq (matches the fallback in useGroqChat.js)

export async function onRequestPost(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        const requestBody = await context.request.json();

        // Get API key from environment variable
        const apiKey = context.env.GROQ_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: { message: 'Groq API key not configured' } }),
                { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
        }

        // Forward request to Groq API
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        const data = await groqResponse.json();

        return new Response(JSON.stringify(data), {
            status: groqResponse.status,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: { message: error.message || 'Internal server error' } }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
