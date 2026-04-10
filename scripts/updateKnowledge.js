const fs = require('fs');
const path = require('path');

// Paths
const PROJECTS_PATH = path.join(__dirname, '../src/data/projects.json');
const KNOWLEDGE_PATH = path.join(__dirname, '../public/data/default/knowledge.json');

// Helper to format project for knowledge base
const formatProject = (p) => {
    return `Project: ${p.title}. Client: ${p.client}. Description: ${p.description} Technologies: ${p.technologies.join(', ')}. Results: ${Object.entries(p.results || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}.`;
};

const updateKnowledgeBase = () => {
    console.log('🔄 Updating knowledge base from projects.json...');

    try {
        // 1. Read Projects
        const projectsRaw = fs.readFileSync(PROJECTS_PATH, 'utf8');
        const projects = JSON.parse(projectsRaw);
        console.log(`✅ Loaded ${projects.length} projects.`);

        // 2. Read Knowledge Base
        let knowledge = { items: [], metadata: [] };
        if (fs.existsSync(KNOWLEDGE_PATH)) {
            const knowledgeRaw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8');
            knowledge = JSON.parse(knowledgeRaw);
        }

        // 3. Filter out old portfolio items and summary list
        // We keep company/team items
        const nonPortfolioIndices = knowledge.metadata
            .map((m, i) => ({ ...m, index: i }))
            .filter(m => m.type !== 'portfolio')
            .map(m => m.index);

        const cleanItems = nonPortfolioIndices.map(i => knowledge.items[i]);
        const cleanMetadata = nonPortfolioIndices.map(i => knowledge.metadata[i]);

        // Also filter out any lingering "Project:" or "Summary List" text items that might not have metadata (if manually added)
        const finalItems = [];
        const finalMetadata = [];

        cleanItems.forEach((item, idx) => {
            if (!item.startsWith('Project:') && !item.startsWith('Summary List of All Resonira Projects:')) {
                finalItems.push(item);
                finalMetadata.push(cleanMetadata[idx]);
            }
        });

        // 4. Add New Project Items
        const newItems = [];
        const newMetadata = [];

        projects.forEach(p => {
            newItems.push(formatProject(p));
            newMetadata.push({ type: 'portfolio', id: p.id });
        });

        // 5. Add Master Summary List
        const summaryList = projects.map((p, i) => `${i + 1}. ${p.title} (${p.category})`).join(', ');
        const summaryItem = `Summary List of All Resonira Projects: ${summaryList}. Use this list when asked to list all projects.`;

        newItems.push(summaryItem);
        // Metadata for summary is not strictly needed but good for consistency, or we leave it out (it's a special item)
        // We'll leave it without metadata access via getCompanyInfo logic, but getProjectList finds it by string match.

        // 6. Combine
        const updatedKnowledge = {
            items: [...finalItems, ...newItems],
            metadata: [...finalMetadata, ...newMetadata]
        };

        // 7. Write
        fs.writeFileSync(KNOWLEDGE_PATH, JSON.stringify(updatedKnowledge, null, 2));
        console.log(`✅ Knowledge base updated successfully! Total items: ${updatedKnowledge.items.length}`);

    } catch (err) {
        console.error('❌ Failed to update knowledge base:', err);
        process.exit(1);
    }
};

updateKnowledgeBase();
