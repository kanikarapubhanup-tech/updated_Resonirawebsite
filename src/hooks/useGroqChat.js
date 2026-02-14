import { useState, useCallback } from 'react';
import configLoader from '../utils/configLoader';
import knowledgeBase from '../utils/knowledgeBase';

const useGroqChat = (apiKey = null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Get API key from config if not provided
  const getApiKey = useCallback(() => {
    if (apiKey) return apiKey;
    const config = configLoader.getConfig();
    // Check multiple possible env var names (Netlify might use GROQ_API_KEY, React needs REACT_APP_ prefix)
    return config?.apiKeys?.groq ||
      process.env.GROQ_API_KEY ||
      '';
  }, [apiKey]);

  // Get system prompt from config or use default
  const getSystemPrompt = useCallback(() => {
    const config = configLoader.getConfig();
    const aiConfig = config?.ai || {};

    // Use custom system prompt from config if available
    if (aiConfig.systemPrompt) {
      return aiConfig.systemPrompt;
    }

    // Default system prompt with strict domain restrictions
    const companyName = config?.name || 'Resonira Technologies';
    const assistantName = aiConfig?.personality?.name || 'Jessi';

    // Company-specific services (Resonira or from config)
    const companyServices = companyName === 'Resonira Technologies' || companyName.includes('Resonira')
      ? 'IT consulting, AI solutions, software development, cloud services, and helping businesses transform through innovative technology'
      : (config?.description || 'our products and services');

    return `
You are ${assistantName}, the friendly, natural-sounding AI voice assistant for ${companyName}. 
You sound and act like a real human — conversational, relaxed, and helpful. 

---

### 🎯 CORE PURPOSE
Your ONLY job is to talk about ${companyName} — its services, products, business solutions, and related topics. 
You help users understand what ${companyName} offers, discuss client needs, and direct them to the "Book a Call" button in the navigation bar when they want to schedule a meeting.

---

### 🚫 ABSOLUTE RESTRICTIONS (NEVER BREAK)
1. ❌ Never describe yourself as a generic AI assistant.
2. ❌ Never say you can “answer questions”, “generate text”, or “provide general info”.
3. ❌ Never answer general knowledge questions (politics, science, history, news, etc.).
4. ❌ Never talk about other companies, products, or celebrities.
5. ✅ If asked something off-topic, politely redirect:
   → “Oh, I’m actually here to help with ${companyName} stuff. What can I tell you about our services?”

---

### ✅ WHEN ASKED "WHAT CAN YOU DO?"
Always say one of the following naturally (and vary phrasing):
- "I can help you understand what ${companyName} can do for your business."
- "I can understand your requirements and give suggestions."
- "I can tell you about ${companyName}'s services — ${companyServices}."

Then finish with a friendly follow-up like:
→ "What would you like to know more about?" or "Want me to explain how that works?"

### 📅 WHEN USER WANTS TO SCHEDULE A MEETING
If the user asks to schedule a meeting, book a call, set up an appointment, or anything related to scheduling:
- Direct them to click the "Book a Call" button in the navigation bar at the top of the page
- Say something natural like: "Sure! Just click the 'Book a Call' button in the top navigation bar, and you can pick a time that works for you."
- Or: "Great! You can schedule a meeting by clicking the 'Book a Call' button up in the navigation bar."
- Keep it short and friendly — under 30 words
- Don't mention the calendar widget in the voice agent — only direct them to the navbar button

---

### 💬 STYLE & PERSONALITY
- Speak **exactly like a human** — short, relaxed, and friendly.
- Use **contractions**: I’m, we’re, that’s, it’s, can’t, don’t, you’ll.
- Use **natural fillers**: “um”, “you know”, “well”, “so”, “yeah”.
- **Mix short and medium sentences**.
- Keep **responses under 40 words** — one clear idea per response.
- Be **warm, confident, and approachable** — like a friendly colleague.
- Avoid robotic or formal tone completely.

Example good tone:
> “Hey! I’m ${assistantName} from ${companyName}. What can I help you with today?”
> “Yeah, absolutely! We can totally help with that. Want me to tell you how?”
> “Sure thing! Let me explain — it’s actually pretty simple.”

---

### 🧠 KNOWLEDGE SCOPE
You can talk about:
- ${config?.description ? `- ${config.description}` : '- Company products and services'}
- Industry-related information
- ${companyName}’s mission, clients, and technologies
- How ${companyName} helps businesses grow

---

### ⚠️ BAD RESPONSES (NEVER SAY)
- “I can answer questions, generate text, provide suggestions...” ❌
- “Thank you for your inquiry. At ${companyName}, we offer...” ❌
- “Based on your question, I can provide the following details...” ❌
- Any generic or robotic phrasing ❌

---

### 🌟 GOAL
Keep every response human, short, and contextual.
Your purpose is to **engage naturally**, **help users understand ${companyName}**, and **guide them toward next steps (like scheduling a meeting or learning more).**
`;
  }, []);
  // Add message to conversation history
  const addToHistory = useCallback((role, content) => {
    const newMessage = {
      role,
      content,
      timestamp: new Date().toISOString()
    };

    setConversationHistory(prev => {
      const updated = [...prev, newMessage];

      // Keep only last 20 messages (10 exchanges) for context
      if (updated.length > 20) {
        return updated.slice(-20);
      }

      return updated;
    });

    return newMessage;
  }, []);

  // Get AI response from Groq via Netlify function (keeps API key server-side)
  const getResponse = useCallback(async (userMessage) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Add user message to history
      addToHistory('user', userMessage);

      // Get system prompt (from config or default)
      const systemPrompt = getSystemPrompt();

      // Get knowledge base context if enabled
      let knowledgeContext = '';
      const config = configLoader.getConfig();
      if (config?.knowledgeBase?.enabled && knowledgeBase.initialized) {
        try {
          knowledgeContext = await knowledgeBase.getContext(userMessage);
        } catch (err) {
          console.warn('Knowledge base context error:', err);
        }
      }

      // Combine system prompt with knowledge context, project list, and company info
      const projectList = knowledgeBase.initialized ? knowledgeBase.getProjectList() : '';
      const companyInfo = knowledgeBase.initialized ? knowledgeBase.getCompanyInfo() : '';

      let fullSystemPrompt = systemPrompt;

      if (companyInfo) {
        fullSystemPrompt += `\n\n### 🏢 COMPANY & TEAM INFO\nHere is critical information about the company and leadership team. Always use this truth.\n${companyInfo}\n`;
      }

      if (projectList) {
        fullSystemPrompt += `\n\n### 📋 MASTER PROJECT LIST\nHere is a complete list of ${config?.name || 'our'} projects. Use this list whenever the user asks to "list projects", "what have you worked on?", or similar questions. Do not make up projects.\n\n${projectList}\n`;
      }

      if (knowledgeContext) {
        fullSystemPrompt += `\n\n${knowledgeContext}`;
      }

      // Prepare messages for API
      const messages = [
        {
          role: 'system',
          content: fullSystemPrompt
        },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Call Netlify function to proxy Groq API (API key stays server-side)
      let data;
      try {
        const response = await fetch('/.netlify/functions/groq-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.8,
            max_tokens: 1024,
            top_p: 0.9,
            frequency_penalty: 0.2,
            presence_penalty: 0.2,
            stop: ['---', '###']
          })
        });

        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Backend function failed');
        }
      } catch (backendError) {
        console.warn('Backend function failed, falling back to direct API call:', backendError);

        // Fallback to direct client-side call
        const apiKey = getApiKey();
        if (!apiKey) {
          throw new Error('Groq API Key is missing for direct call');
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            messages: messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.8,
            max_tokens: 1024,
            top_p: 0.9,
            frequency_penalty: 0.2,
            presence_penalty: 0.2,
            stop: ['---', '###']
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
        }
        data = await response.json();
      }

      // Handle response
      let aiResponse;
      if (data.response) {
        // Response from Netlify function
        aiResponse = data.response;
      } else if (data.choices && data.choices.length > 0) {
        // Direct API response (fallback)
        aiResponse = data.choices[0].message.content.trim();
      } else {
        throw new Error('No response from Groq AI');
      }

      if (!aiResponse) {
        throw new Error('Empty response from Groq AI');
      }

      const aiResponseText = typeof aiResponse === 'string' ? aiResponse.trim() : String(aiResponse).trim();

      // Add AI response to history
      addToHistory('assistant', aiResponseText);

      return aiResponseText;

    } catch (err) {
      console.error('Groq AI error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [conversationHistory, addToHistory, getSystemPrompt, getApiKey]);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  // Get conversation summary for display
  const getDisplayHistory = useCallback(() => {
    // Return last 6 messages for display (3 exchanges)
    return conversationHistory.slice(-6);
  }, [conversationHistory]);

  return {
    getResponse,
    addToHistory,
    clearHistory,
    getDisplayHistory,
    conversationHistory,
    isProcessing,
    error
  };
};

export default useGroqChat;

