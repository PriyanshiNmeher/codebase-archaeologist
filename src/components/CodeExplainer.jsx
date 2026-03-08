// Code explain karne wala service (without AI, rule-based)
export const explainCode = (fileName, content, commits = []) => {
  if (!content) return "No content available";
  
  const lines = content.split('\n');
  const fileType = fileName.split('.').pop();
  
  // Basic file info
  let explanation = {
    summary: generateSummary(fileName, lines.length, fileType),
    structure: analyzeStructure(content, fileType),
    dependencies: findDependencies(content, fileType),
    functions: findFunctions(content, fileType),
    components: findComponents(content, fileType),
    recentChanges: formatRecentChanges(commits),
    suggestions: generateSuggestions(content, fileType)
  };
  
  return explanation;
};

// File summary generate karo
const generateSummary = (fileName, lineCount, fileType) => {
  const typeMap = {
    'js': 'JavaScript',
    'jsx': 'React Component',
    'ts': 'TypeScript',
    'tsx': 'React TypeScript Component',
    'css': 'Stylesheet',
    'scss': 'SCSS Stylesheet',
    'html': 'HTML Markup',
    'json': 'JSON Configuration',
    'md': 'Markdown Documentation'
  };
  
  return {
    fileName,
    fileType: typeMap[fileType] || 'Unknown',
    lineCount,
    purpose: guessPurpose(fileName, fileType)
  };
};

// File ka purpose guess karo
const guessPurpose = (fileName, fileType) => {
  if (fileName.includes('test') || fileName.includes('spec')) {
    return 'Testing and validation';
  } else if (fileName.includes('util') || fileName.includes('helper')) {
    return 'Utility functions and helpers';
  } else if (fileName.includes('config')) {
    return 'Configuration settings';
  } else if (fileType === 'jsx' || fileType === 'tsx') {
    return 'UI Component';
  } else if (fileType === 'css' || fileType === 'scss') {
    return 'Styling and theming';
  } else if (fileName === 'index.js' || fileName === 'index.jsx') {
    return 'Entry point / Main export';
  } else if (fileName.includes('api')) {
    return 'API integration and data fetching';
  } else if (fileName.includes('hook') || fileName.includes('use')) {
    return 'Custom React hook';
  }
  
  return 'Core application logic';
};

// File structure analyze karo
const analyzeStructure = (content, fileType) => {
  const structure = [];
  const lines = content.split('\n');
  
  // Imports section
  const imports = lines.filter(l => l.includes('import ') || l.includes('require('));
  if (imports.length > 0) {
    structure.push(`📥 Imports: ${imports.length} dependencies`);
  }
  
  // Components/Functions section
  const functions = lines.filter(l => l.includes('function ') || l.includes('=>'));
  if (functions.length > 0) {
    structure.push(`⚙️ Functions: ${functions.length} functions defined`);
  }
  
  // JSX/Return section for React files
  if (fileType === 'jsx' || fileType === 'tsx') {
    const hasJSX = lines.some(l => l.includes('return (') && l.includes('<'));
    if (hasJSX) {
      structure.push(`🖼️ UI Components: Contains JSX markup`);
    }
  }
  
  // Exports section
  const exports = lines.filter(l => l.includes('export '));
  if (exports.length > 0) {
    structure.push(`📤 Exports: ${exports.length} public members`);
  }
  
  return structure;
};

// Dependencies find karo
const findDependencies = (content, fileType) => {
  const dependencies = [];
  
  // Find imports
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    dependencies.push({
      type: 'import',
      name: match[1],
      isLocal: match[1].startsWith('.') || match[1].startsWith('/')
    });
  }
  
  while ((match = requireRegex.exec(content)) !== null) {
    dependencies.push({
      type: 'require',
      name: match[1],
      isLocal: match[1].startsWith('.') || match[1].startsWith('/')
    });
  }
  
  return dependencies;
};

// Functions find karo
const findFunctions = (content, fileType) => {
  const functions = [];
  const lines = content.split('\n');
  
  const functionRegex = /function\s+(\w+)\s*\(/g;
  const arrowRegex = /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g;
  
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    functions.push({
      name: match[1],
      type: 'regular',
      line: findLineNumber(lines, match[1])
    });
  }
  
  while ((match = arrowRegex.exec(content)) !== null) {
    functions.push({
      name: match[1],
      type: 'arrow',
      line: findLineNumber(lines, match[1])
    });
  }
  
  return functions;
};

// React components find karo
const findComponents = (content, fileType) => {
  if (fileType !== 'jsx' && fileType !== 'tsx') return [];
  
  const components = [];
  const lines = content.split('\n');
  
  // Find component definitions
  const componentRegex = /(?:function|const)\s+([A-Z][A-Za-z0-9]+)\s*(?:=|\(|\{)/g;
  let match;
  
  while ((match = componentRegex.exec(content)) !== null) {
    components.push({
      name: match[1],
      line: findLineNumber(lines, match[1])
    });
  }
  
  return components;
};

// Helper: line number find karo
const findLineNumber = (lines, text) => {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(text)) return i + 1;
  }
  return -1;
};

// Recent changes format karo
const formatRecentChanges = (commits) => {
  if (!commits || commits.length === 0) return [];
  
  return commits.map(commit => ({
    date: commit.date,
    author: commit.author,
    message: commit.message,
    additions: commit.additions,
    deletions: commit.deletions,
    type: commit.additions > commit.deletions ? 'added' : 'modified'
  }));
};

// Suggestions generate karo
const generateSuggestions = (content, fileType) => {
  const suggestions = [];
  const lines = content.split('\n');
  
  // Check for console.log statements
  const consoles = lines.filter(l => l.includes('console.log'));
  if (consoles.length > 0) {
    suggestions.push('🔍 Remove console.log statements before production');
  }
  
  // Check for long functions
  const longFunctions = lines.filter(l => l.includes('function') && l.length > 100);
  if (longFunctions.length > 0) {
    suggestions.push('📏 Some functions are long - consider breaking them down');
  }
  
  // Check for TODO comments
  const todos = lines.filter(l => l.includes('TODO') || l.includes('FIXME'));
  if (todos.length > 0) {
    suggestions.push(`📝 ${todos.length} TODO items need attention`);
  }
  
  // Check for missing comments
  if (lines.length > 100 && lines.filter(l => l.trim().startsWith('//')).length < 5) {
    suggestions.push('💬 Add more comments for better code understanding');
  }
  
  return suggestions;
};

// Generate KT document
export const generateKTDocument = (fileName, explanation, commits, developerActivity) => {
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  let ktDoc = `# 📋 Knowledge Transfer Document\n\n`;
  ktDoc += `**File:** ${fileName}\n`;
  ktDoc += `**Generated:** ${today}\n`;
  ktDoc += `**Purpose:** ${explanation.summary.purpose}\n\n`;
  
  ktDoc += `## 📊 File Overview\n\n`;
  ktDoc += `- **Type:** ${explanation.summary.fileType}\n`;
  ktDoc += `- **Lines:** ${explanation.summary.lineCount}\n`;
  ktDoc += `- **Dependencies:** ${explanation.dependencies.length}\n`;
  ktDoc += `- **Functions:** ${explanation.functions.length}\n`;
  ktDoc += `- **Components:** ${explanation.components.length}\n\n`;
  
  ktDoc += `## 🏗️ Code Structure\n\n`;
  explanation.structure.forEach(item => {
    ktDoc += `- ${item}\n`;
  });
  ktDoc += '\n';
  
  if (explanation.functions.length > 0) {
    ktDoc += `## ⚙️ Functions\n\n`;
    explanation.functions.slice(0, 5).forEach(func => {
      ktDoc += `- \`${func.name}\` (line ${func.line})\n`;
    });
    if (explanation.functions.length > 5) {
      ktDoc += `- ... and ${explanation.functions.length - 5} more\n`;
    }
    ktDoc += '\n';
  }
  
  if (explanation.dependencies.length > 0) {
    ktDoc += `## 📦 Dependencies\n\n`;
    const external = explanation.dependencies.filter(d => !d.isLocal);
    const local = explanation.dependencies.filter(d => d.isLocal);
    
    if (external.length > 0) {
      ktDoc += `**External Packages:**\n`;
      external.slice(0, 5).forEach(dep => {
        ktDoc += `- ${dep.name}\n`;
      });
    }
    
    if (local.length > 0) {
      ktDoc += `\n**Local Files:**\n`;
      local.slice(0, 5).forEach(dep => {
        ktDoc += `- ${dep.name}\n`;
      });
    }
    ktDoc += '\n';
  }
  
  if (commits.length > 0) {
    ktDoc += `## 🔄 Recent Changes\n\n`;
    commits.slice(0, 5).forEach(commit => {
      ktDoc += `### ${commit.date} - ${commit.author}\n`;
      ktDoc += `**Message:** ${commit.message}\n`;
      ktDoc += `**Changes:** +${commit.additions} -${commit.deletions}\n\n`;
    });
  }
  
  if (developerActivity.length > 0) {
    ktDoc += `## 👥 Developer Activity (Last 30 Days)\n\n`;
    developerActivity.forEach(dev => {
      ktDoc += `- **${dev.name}**: ${dev.commits} commits\n`;
    });
    ktDoc += '\n';
  }
  
  if (explanation.suggestions.length > 0) {
    ktDoc += `## 💡 Suggestions for New Developer\n\n`;
    explanation.suggestions.forEach(suggestion => {
      ktDoc += `- ${suggestion}\n`;
    });
    ktDoc += '\n';
  }
  
  ktDoc += `---\n`;
  ktDoc += `*Generated by Codebase Archaeologist - Making knowledge transfer easy!* 🚀\n`;
  
  return ktDoc;
};