# Chatbot

This folder contains data and scripts for the company-only chatbot.

Contents:
- `ingest.js`: Build a small local vector store from your content.
- `vectorstore.json`: Generated embeddings and text chunks.

Usage:
1. Put company info into `chatbot/sources.json` (URLs, socials, or raw text blocks). Optionally provide your public site URL to crawl.
2. Run `npm run chatbot:ingest` to build `vectorstore.json`.
3. Deploy with `GROQ_API_KEY` and `COMPANY_NAME` set in Netlify.

Notes:
- The Netlify function uses Groq for LLM responses and a lightweight retrieval layer to keep answers in-context.
- If no vector store exists, it still works with a fallback embedding but answers may be limited.

