'use strict';

const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

// Lazy-loaded vector store (JSON with { id, text, url, title, embedding })
let vectorStore = null;

async function loadVectorStore() {
  if (vectorStore) return vectorStore;
  const candidatePaths = [
    path.join(__dirname, '..', '..', 'chatbot', 'vectorstore.json'),
    path.join(__dirname, 'data', 'vectorstore.json'),
    path.join(process.cwd(), 'chatbot', 'vectorstore.json'),
  ];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        vectorStore = JSON.parse(raw);
        break;
      }
    } catch (_) {}
  }
  if (!vectorStore) vectorStore = { embeddings: [] };
  return vectorStore;
}

function loadFallbackFromSources() {
  const candidatePaths = [
    path.join(__dirname, '..', '..', 'chatbot', 'sources.json'),
    path.join(process.cwd(), 'chatbot', 'sources.json'),
  ];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const json = JSON.parse(raw);
        const texts = Array.isArray(json.texts) ? json.texts : [];
        const embeddings = texts.map((t, idx) => ({
          id: `fallback-${idx}`,
          title: t.title || 'Untitled',
          url: t.url || null,
          text: t.text || '',
          embedding: cheapTextEmbedding(t.text || ''),
        }));
        return { companyName: json.companyName, texts, embeddings };
      }
    } catch (_) {}
  }
  return { texts: [], embeddings: [] };
}

// Simple cosine similarity
function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Very small on-the-fly text embedder using a hashed bag-of-words fallback
// This avoids needing an external embeddings service. For better quality, run the ingest script.
function cheapTextEmbedding(text, dims = 512) {
  const vec = new Float32Array(dims);
  const tokens = String(text).toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
  for (const t of tokens) {
    let h = 2166136261;
    for (let i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    const idx = Math.abs(h) % dims;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0));
  if (norm > 0) {
    for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  }
  return Array.from(vec);
}

async function retrieveRelevantChunks(query, k = 12) {
  let store = await loadVectorStore();
  if (!store.embeddings || store.embeddings.length === 0) {
    // fall back to sources.json so the bot can still answer
    store = loadFallbackFromSources();
  }
  const qvec = cheapTextEmbedding(query);
  const scored = (store.embeddings || []).map((e) => ({
    score: cosineSimilarity(qvec, e.embedding || cheapTextEmbedding(e.text)),
    item: e,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.item);
}

function buildSystemPrompt(companyName) {
  return [
    `You are an AI assistant for ${companyName}.`,
    'Only answer questions strictly using the provided context snippets.',
    'If a question is outside company context (e.g., unrelated general knowledge), politely refuse and explain you only answer company-related questions.',
    'Speak as the company representative: use first-person plural ("we", "our") and a warm, professional tone that fits a modern tech consultancy website.',
    'If specific details are missing, map the request to the closest documented offering (e.g., "web designer" → web development and UI/UX design under software development) and provide a helpful, affirmative answer. Avoid saying "we do not have information"; instead, describe the most relevant capabilities we offer.',
  ].filter(Boolean).join('\n');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { messages } = JSON.parse(event.body || '{}');
    const safeMessages = Array.isArray(messages) ? messages : [];
    const latestUser = safeMessages.filter((m) => m.role === 'user').slice(-1)[0];
    const userQuestion = latestUser?.content || '';

    // Retrieve context
    const companyName = process.env.COMPANY_NAME || 'Our Company';
    const appointmentUrl = process.env.COMPANY_APPOINTMENT_URL || 'https://calendly.com/srilekha-resonira/30min';
    const topChunks = userQuestion ? await retrieveRelevantChunks(userQuestion, 12) : [];
    const fallback = loadFallbackFromSources();
    const importantTitles = new Set(['Tagline & Intro','Services','Mission & Vision','Values','Contact']);
    const baseBlocks = (fallback.texts || [])
      .filter((t) => importantTitles.has(t.title))
      .map((t) => `Title: ${t.title}\nContent: ${t.text}`);
    const chunkBlocks = topChunks.map((c) => `Title: ${c.title || 'Untitled'}\nURL: ${c.url || 'local'}\nContent: ${c.text}`);
    // Simple intent hints to steer answers toward closest offering
    let intentHints = [];
    const q = (userQuestion || '').toLowerCase();
    if (/\b(web\s*design|web\s*designer|ui\/ux|ui|ux|website|landing\s*page)\b/.test(q)) {
      intentHints.push('User intent: Web design / UI/UX / Website. Relevant offering: Software Development → Web & Mobile App Development; UI/UX within product development.');
    }
    if (/\b(mobile|ios|android|react\s*native|flutter)\b/.test(q)) {
      intentHints.push('User intent: Mobile app. Relevant offering: Software Development → Web & Mobile App Development.');
    }
    if (/\b(ai|ml|machine\s*learning|automation|llm|chatbot|rag)\b/.test(q)) {
      intentHints.push('User intent: AI/ML/Automation. Relevant offering: Data & AI Solutions → AI-Powered Automation, Machine Learning Applications.');
    }
    if (/\b(cloud|aws|azure|gcp|devops|kubernetes|docker|terraform)\b/.test(q)) {
      intentHints.push('User intent: Cloud/DevOps. Relevant offering: Cloud & Infrastructure → Migration, DevOps & Automation, Cybersecurity.');
    }
    const hintBlocks = intentHints.length ? [`Title: Intent Hints\nContent: ${intentHints.join(' ')}`] : [];

    const allBlocks = [...baseBlocks, ...hintBlocks, ...chunkBlocks];
    const contextText = allBlocks.map((c, i) => `[[${i + 1}]] ${c}`).join('\n\n');

    const systemPrompt = buildSystemPrompt(companyName);
    // Intent-sensitive hints (controls booking link and portfolio brevity)
    const qGuard = (userQuestion || '').toLowerCase();
    const guardHints = [];
    if (/\b(book|schedule|appointment|call|meeting)\b/.test(qGuard)) {
      guardHints.push(`If the user asks to book or schedule, provide the appointment link: ${appointmentUrl}.`);
    } else {
      guardHints.push('Do NOT offer to book a call unless the user explicitly asks to book/schedule or requests next steps.');
    }
    if (/\bportfolio|case\s*stud(y|ies)|work\s*examples|past\s*work\b/.test(qGuard)) {
      guardHints.push('For portfolio questions, give a brief, high-level summary (<= 3 bullets or 2 short sentences) and share the portfolio page URL if available.');
    }

    const guardPrompt = [
      'Context snippets (use these only; do not invent facts):',
      contextText || '(no context available yet)',
      '',
      'Instructions:',
      '- Answer using ONLY context above. If not present, say you do not have that information.',
      '- Keep answers brief (<= 80 words) or up to 5 hyphen-bullets; avoid long paragraphs.',
      '- Always respond in the voice of the company using "we" and "our"; avoid saying "the company" or "they".',
      '- Format bullets using hyphens ("- ") not asterisks, no markdown tables.',
      '- Do NOT include citations or sources in replies.',
      '- Avoid filler like "we do not have information"; map to closest offering when reasonable.',
      ...guardHints,
    ].join('\n');

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: guardPrompt },
        ...safeMessages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const answer = completion.choices?.[0]?.message?.content || 'Sorry, I could not generate an answer.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    };
  } catch (err) {
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};


