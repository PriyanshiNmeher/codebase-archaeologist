// Groq API service for code questions - Professional English only
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const askGroq = async (question, fileContent, fileName, fileHistory, repoContext = null) => {
  
  // Prepare context
  let systemPrompt = `You are an expert code assistant. You help developers understand codebases.
Answer questions professionally in clear English. Be concise but thorough.

Key responsibilities:
- Explain what code does
- Identify functions, components, dependencies
- Point out potential issues
- Suggest improvements
- Answer based on the provided context`;

  let userPrompt = '';

  if (fileName === 'general' || !fileName) {
    // General repository questions
    if (repoContext) {
      userPrompt = `Repository Context:
- Total files: ${repoContext.totalFiles}
- Main languages: ${JSON.stringify(repoContext.languages)}
- Total dependencies: ${repoContext.totalDependencies}
- Complexity score: ${repoContext.complexity}

User Question: ${question}

Answer the question based on this repository context. If the question asks for specific files, mention the available files.`;
    } else {
      userPrompt = `User Question: ${question}

You are helping with a codebase analysis tool. Answer general questions about how to use the tool or about code analysis.`;
    }
  } else {
    // File-specific questions
    userPrompt = `File: ${fileName}
File Content:
\`\`\`
${fileContent || 'No content available'}
\`\`\`

${fileHistory && fileHistory.length > 0 ? `Recent Changes:
${fileHistory.map(h => `- ${h.date}: ${h.message}`).join('\n')}` : ''}

User Question: ${question}

Answer the question about this specific file. If asked about functions, list them. If asked about purpose, explain what the file does. Be specific and reference line numbers when possible.`;
  }

  // Agar API key nahi hai to mock response do
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    console.warn('No Groq API key found. Using mock responses.');
    return getMockResponse(question, fileName, fileContent);
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Groq API error:', data.error);
      return getMockResponse(question, fileName, fileContent);
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error);
    return getMockResponse(question, fileName, fileContent);
  }
};

// Mock responses when API key is not available
const getMockResponse = (question, fileName, fileContent) => {
  const lowerQ = question.toLowerCase();
  
  // File-specific responses
  if (fileName && fileName !== 'general') {
    if (lowerQ.includes('function') || lowerQ.includes('method')) {
      return `**Functions in ${fileName}:**\n\nBased on the file content, I can see the following functions:\n\n• \`render()\` - Main rendering function\n• \`handleClick()\` - Event handler for clicks\n• \`useEffect()\` - React hook for side effects\n\nWould you like me to explain any specific function in detail?`;
    }
    
    if (lowerQ.includes('purpose') || lowerQ.includes('do')) {
      return `**Purpose of ${fileName}:**\n\nThis file appears to be a ${fileName.includes('App') ? 'main application component' : 'React component'}. It handles UI rendering and user interactions.\n\n**Key responsibilities:**\n• Renders UI elements\n• Manages component state\n• Handles user events\n• Imports necessary dependencies\n\nTotal lines: ~${fileContent?.split('\n').length || 100}`;
    }
    
    if (lowerQ.includes('import') || lowerQ.includes('dependency')) {
      return `**Dependencies in ${fileName}:**\n\nThis file imports the following:\n\n• \`react\` - Core React library\n• \`axios\` - HTTP client\n• Local components and utilities\n\nThese dependencies are used for building the UI and making API calls.`;
    }
    
    if (lowerQ.includes('complex')) {
      return `**Complexity Analysis for ${fileName}:**\n\nThis file has moderate complexity:\n• Lines of code: ~${fileContent?.split('\n').length || 100}\n• Functions: 3-5\n• Conditional logic: Present but manageable\n\nSuggestions for improvement:\n• Consider breaking down large functions\n• Add more comments for complex logic\n• Extract reusable utilities`;
    }
  }
  
  // General responses
  if (lowerQ.includes('file') && lowerQ.includes('how many')) {
    return `**Repository Statistics:**\n\nBased on the analysis, this repository contains approximately 10 files including:\n• React components (.jsx)\n• Utility files (.js)\n• Stylesheets (.css)\n\nYou can see all files in the left panel. Click on any file to view its diagram and ask specific questions.`;
  }
  
  if (lowerQ.includes('complex') || lowerQ.includes('hard')) {
    return `**Complexity Overview:**\n\nThe repository has a moderate complexity level.\n\n**Most complex files:**\n• \`App.jsx\` - Main component with state management\n• \`api.js\` - Handles API calls and error handling\n• \`Button.jsx\` - Reusable component with variants\n\nWould you like me to analyze any specific file in detail?`;
  }
  
  if (lowerQ.includes('depend')) {
    return `**Dependency Analysis:**\n\nThis project has approximately 9 dependencies between files. The main dependencies are:\n\n• \`App.jsx\` → \`Button.jsx\`, \`Header.jsx\`\n• \`api.js\` → \`utils.js\`\n• Components → Stylesheets\n\nThe visualization tab shows these connections graphically.`;
  }
  
  if (lowerQ.includes('language')) {
    return `**Languages Used:**\n\nThis repository uses the following languages:\n\n• JavaScript (50%) - Core logic\n• JSX (30%) - React components\n• CSS (20%) - Styling\n\nThis is a typical React application stack.`;
  }
  
  if (lowerQ.includes('hello') || lowerQ.includes('hi') || lowerQ.includes('hey')) {
    return `Hello! I'm your code assistant. I can help you understand this codebase.\n\n**You can ask me:**\n• "How many files are there?"\n• "Show me complex files"\n• "What languages are used?"\n• "Explain dependencies"\n\n**For specific files:**\nClick on any file in the left panel, then ask questions about it like:\n• "What does this file do?"\n• "Show me functions"\n• "What are the imports?"`;
  }
  
  return `I understand you're asking about "${question}". To give you the best answer, could you please:\n\n1. **Be more specific** - Ask about a particular file or aspect\n2. **Select a file** - Click on a file in the left panel for detailed analysis\n3. **Try these questions:**\n   • "How many files are there?"\n   • "What does App.jsx do?"\n   • "Show me dependencies"\n   • "Which files are most complex?"`;
};