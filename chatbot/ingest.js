/*
  Simple ingestion script to build a local vector store from your content.
  - Reads chatbot/sources.json for URLs, socials, and raw text entries
  - Optionally crawls provided URLs (best if your site has a sitemap or static pages)
  - Splits text into chunks and creates cheap embeddings
*/

const fs = require('fs');
const path = require('path');
const https = require('https');

function readJSON(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (_) {
    return fallback;
  }
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function cleanText(htmlOrText) {
  const text = String(htmlOrText)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text;
}

function chunkText(text, chunkSize = 700, overlap = 120) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.length > 60) chunks.push(chunk);
  }
  return chunks;
}

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

async function main() {
  const base = path.join(__dirname);
  const sourcesPath = path.join(base, 'sources.json');
  const outPath = path.join(base, 'vectorstore.json');

  const sources = readJSON(sourcesPath, {
    companyName: 'Our Company',
    urls: [],
    socials: [],
    texts: [
      {
        title: 'About',
        url: null,
        text: 'Add your About/Services/Portfolio/Contact information here to seed the chatbot.',
      },
    ],
  });

  const entries = [];
  // Pull raw texts
  for (const t of sources.texts || []) {
    const chunks = chunkText(t.text);
    chunks.forEach((c, idx) =>
      entries.push({ id: `text-${t.title}-${idx}`, title: t.title, url: t.url, text: c })
    );
  }
  // Fetch URLs
  for (const url of sources.urls || []) {
    try {
      const html = await fetchText(url);
      const text = cleanText(html);
      const chunks = chunkText(text);
      chunks.forEach((c, idx) => entries.push({ id: `url-${url}-${idx}`, title: 'Web', url, text: c }));
    } catch (_) {}
  }

  const embeddings = entries.map((e) => ({ ...e, embedding: cheapTextEmbedding(e.text) }));
  const store = { companyName: sources.companyName || 'Our Company', embeddings };
  fs.writeFileSync(outPath, JSON.stringify(store, null, 2));
  console.log(`Wrote ${embeddings.length} chunks to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


