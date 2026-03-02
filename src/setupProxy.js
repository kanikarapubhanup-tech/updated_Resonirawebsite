const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Local dev proxy to avoid CORS issues when calling Groq API directly.
 * In production (Netlify), the /.netlify/functions/groq-chat endpoint handles this server-side.
 * Locally, since Netlify functions aren't running, we proxy /api/groq to Groq's API.
 */
module.exports = function (app) {
    // Proxy /api/groq to Groq's API (local dev only)
    app.use(
        '/api/groq',
        createProxyMiddleware({
            target: 'https://api.groq.com',
            changeOrigin: true,
            pathRewrite: { '^/api/groq': '/openai/v1/chat/completions' },
            onProxyReq: (proxyReq, req) => {
                // Inject the API key from env into the proxied request
                const apiKey = process.env.REACT_APP_GROQ_API_KEY || process.env.GROQ_API_KEY || '';
                if (apiKey) {
                    proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                }
            },
        })
    );
};
