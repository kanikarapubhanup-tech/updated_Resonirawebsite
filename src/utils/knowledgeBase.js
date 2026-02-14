/**
 * Knowledge Base Loader with Embeddings
 * Supports FAISS, SQLite, or JSON-based vector storage
 */

import configLoader from './configLoader';

class KnowledgeBase {
  constructor() {
    this.vectors = [];
    this.texts = [];
    this.metadata = [];
    this.embeddings = null;
    this.initialized = false;
  }

  /**
   * Initialize knowledge base from config
   */
  async initialize(companyId = 'default') {
    const config = configLoader.getConfig();
    const kbConfig = config?.knowledgeBase;

    if (!kbConfig || !kbConfig.enabled) {
      console.log('Knowledge base disabled');
      return;
    }

    try {
      // Load knowledge data - use public folder path
      const dataPath = kbConfig.dataPath || `/data/${companyId}/knowledge.json`;
      console.log('📚 Loading knowledge base from:', dataPath);
      const response = await fetch(dataPath);

      if (!response.ok) {
        throw new Error(`Failed to load knowledge base: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Extract texts
      this.texts = data.items || data;
      this.metadata = data.metadata || [];

      // Generate embeddings
      await this.generateEmbeddings(kbConfig.embeddingModel || 'openai');

      this.initialized = true;
      console.log(`✅ Knowledge base initialized with ${this.texts.length} items`);
    } catch (error) {
      console.warn('⚠️ Knowledge base initialization failed (continuing without it):', error.message);
      // Continue without knowledge base - this is not critical
      this.initialized = false;
      this.texts = [];
      this.vectors = [];
    }
  }

  /**
   * Generate embeddings for texts
   */
  async generateEmbeddings(model = 'openai') {
    const config = configLoader.getConfig();
    const apiKey = config?.apiKeys?.openai || process.env.REACT_APP_OPENAI_API_KEY;

    if (!apiKey && model === 'openai') {
      console.warn('OpenAI API key not found, skipping embeddings');
      return;
    }

    try {
      // For now, use simple TF-IDF or word vectors
      // In production, use OpenAI embeddings API or local model

      // Placeholder: Generate simple embeddings
      this.vectors = this.texts.map((text, idx) => {
        // Simple hash-based embedding (replace with real embeddings)
        const words = text.toLowerCase().split(/\s+/);
        const vector = new Array(128).fill(0);
        words.forEach((word, i) => {
          const hash = this.simpleHash(word);
          vector[hash % 128] += 1 / (i + 1);
        });
        // Normalize
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return vector.map(val => magnitude > 0 ? val / magnitude : 0);
      });

      console.log('Embeddings generated');
    } catch (error) {
      console.error('Embedding generation error:', error);
    }
  }

  /**
   * Simple hash function for demo
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Search for relevant context
   */
  async search(query, topK = 3) {
    if (!this.initialized || this.vectors.length === 0) {
      return [];
    }

    try {
      // Generate query embedding (simplified)
      const queryWords = query.toLowerCase().split(/\s+/);
      const queryVector = new Array(128).fill(0);
      queryWords.forEach((word, i) => {
        const hash = this.simpleHash(word);
        queryVector[hash % 128] += 1 / (i + 1);
      });
      const magnitude = Math.sqrt(queryVector.reduce((sum, val) => sum + val * val, 0));
      const normalizedQuery = queryVector.map(val => magnitude > 0 ? val / magnitude : 0);

      // Calculate similarities
      const similarities = this.vectors.map((vector, idx) => {
        const dotProduct = vector.reduce((sum, val, i) => sum + val * normalizedQuery[i], 0);
        return { index: idx, similarity: dotProduct };
      });

      // Sort by similarity and get top K
      similarities.sort((a, b) => b.similarity - a.similarity);
      const topResults = similarities.slice(0, topK);

      // Filter by threshold
      const config = configLoader.getConfig();
      const threshold = config?.knowledgeBase?.similarityThreshold || 0.7;

      return topResults
        .filter(result => result.similarity >= threshold)
        .map(result => ({
          text: this.texts[result.index],
          similarity: result.similarity,
          metadata: this.metadata[result.index] || {}
        }));

    } catch (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }
  }

  /**
   * Get all project titles from knowledge base
   */
  getProjectList() {
    if (!this.initialized || this.texts.length === 0) return '';

    // Extract items starting with "Project:" and get just the title
    const projects = this.texts
      .filter(text => text.startsWith('Project:'))
      .map(text => {
        // Extract "Project: [Title]. Client: ..." -> "[Title]"
        const match = text.match(/Project:\s*(.*?)\.\s*Client:/);
        return match ? match[1] : null;
      })
      .filter(title => title !== null);

    if (projects.length === 0) return '';

    // Check if there is already a summary list item and use that instead if available
    const summaryItem = this.texts.find(text => text.startsWith('Summary List of All Resonira Projects:'));
    if (summaryItem) {
      return summaryItem.replace('Summary List of All Resonira Projects:', '').trim();
    }

    return projects.join(', ');
  }

  /**
   * Get core company and team info
   */
  getCompanyInfo() {
    if (!this.initialized || this.texts.length === 0) return '';

    // If metadata is available, use it to filter
    if (this.metadata && this.metadata.length === this.texts.length) {
      const companyItems = this.texts.filter((_, idx) => {
        const type = this.metadata[idx].type;
        return type === 'company' || type === 'team';
      });

      if (companyItems.length > 0) {
        return companyItems.join('\n');
      }
    }

    // Fallback: simple heuristic if metadata fails
    return this.texts.filter(text =>
      !text.startsWith('Project:') &&
      !text.startsWith('Summary List')
    ).join('\n');
  }

  /**
   * Get context for AI prompt
   */
  async getContext(query) {
    // If we have very few items (small knowledge base), just return everything
    // This bypasses the poor quality of the hash-based embeddings
    if (this.initialized && this.texts.length < 50) {
      // We already inject project list and company info separately in useGroqChat
      // So here we can just return nothing, or just valid search results if we want to be safe
      // But for "who is the founder", the vector search might miss it.
      // Let's rely on the system prompt injection for the core info.
      return '';
    }

    const results = await this.search(query);
    if (results.length === 0) return '';

    const contextText = results
      .map((r, idx) => `${idx + 1}. ${r.text}`)
      .join('\n');

    return `Relevant context:\n${contextText}\n\nUse this context to answer the user's question.`;
  }
}

// Singleton instance
export const knowledgeBase = new KnowledgeBase();
export default knowledgeBase;

