// AI Service for code explanation (without external API)
export const answerCodeQuestion = (question, fileName, fileContent, fileHistory = []) => {
  const lowerQuestion = question.toLowerCase();
  const lines = fileContent?.split('\n') || [];
  
  // File info
  const fileInfo = {
    name: fileName,
    lines: lines.length,
    functions: extractFunctions(fileContent),
    imports: extractImports(fileContent),
    exports: extractExports(fileContent),
    components: extractComponents(fileContent, fileName),
    recentChanges: fileHistory.slice(0, 3)
  };

  // Answer based on question type
  if (lowerQuestion.includes('what') && lowerQuestion.includes('do')) {
    return answerWhatDoesItDo(fileInfo, lines);
  }
  else if (lowerQuestion.includes('how') && lowerQuestion.includes('use')) {
    return answerHowToUse(fileInfo);
  }
  else if (lowerQuestion.includes('function') || lowerQuestion.includes('method')) {
    return answerAboutFunctions(fileInfo, lowerQuestion);
  }
  else if (lowerQuestion.includes('import') || lowerQuestion.includes('dependency')) {
    return answerAboutImports(fileInfo);
  }
  else if (lowerQuestion.includes('export')) {
    return answerAboutExports(fileInfo);
  }
  else if (lowerQuestion.includes('component')) {
    return answerAboutComponents(fileInfo);
  }
  else if (lowerQuestion.includes('change') || lowerQuestion.includes('modified')) {
    return answerAboutChanges(fileInfo);
  }
  else if (lowerQuestion.includes('complex') || lowerQuestion.includes('hard')) {
    return answerAboutComplexity(fileInfo, lines);
  }
  else if (lowerQuestion.includes('line') || lowerQuestion.includes('line number')) {
    return answerAboutLineNumbers(fileInfo, lowerQuestion, lines);
  }
  else if (lowerQuestion.includes('explain')) {
    return explainFileComplete(fileInfo, lines);
  }
  else if (lowerQuestion.includes('summary') || lowerQuestion.includes('overview')) {
    return getFileSummary(fileInfo, lines);
  }
  else {
    return getGeneralHelp(fileName);
  }
};

// Extract functions from code
const extractFunctions = (content) => {
  if (!content) return [];
  
  const functions = [];
  const lines = content.split('\n');
  
  // Function patterns
  const patterns = [
    /function\s+(\w+)\s*\(/g,                    // function name() {}
    /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,       // const name = () => {}
    /const\s+(\w+)\s*=\s*function\s*\(/g,         // const name = function() {}
    /(\w+)\s*:\s*function\s*\(/g,                 // name: function() {}
    /async\s+function\s+(\w+)\s*\(/g,             // async function name() {}
    /const\s+(\w+)\s*=\s*async\s*\(/g             // const name = async () => {}
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const funcName = match[1];
      // Find line number
      const lineNumber = lines.findIndex(l => l.includes(funcName)) + 1;
      functions.push({
        name: funcName,
        line: lineNumber,
        type: pattern.source.includes('async') ? 'async' : 'regular'
      });
    }
  });
  
  return functions.slice(0, 10); // Limit to 10 functions
};

// Extract imports
const extractImports = (content) => {
  if (!content) return [];
  
  const imports = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // import ... from '...'
    const importMatch = line.match(/import\s+.*?from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      imports.push({
        type: 'import',
        source: importMatch[1],
        line: index + 1,
        isLocal: importMatch[1].startsWith('.') || importMatch[1].startsWith('/')
      });
    }
    
    // require('...')
    const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
    if (requireMatch) {
      imports.push({
        type: 'require',
        source: requireMatch[1],
        line: index + 1,
        isLocal: requireMatch[1].startsWith('.') || requireMatch[1].startsWith('/')
      });
    }
  });
  
  return imports;
};

// Extract exports
const extractExports = (content) => {
  if (!content) return [];
  
  const exports = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // export default ...
    if (line.includes('export default')) {
      const match = line.match(/export\s+default\s+(\w+)/);
      exports.push({
        type: 'default',
        name: match ? match[1] : 'default export',
        line: index + 1
      });
    }
    
    // export { ... }
    if (line.includes('export {') && line.includes('}')) {
      exports.push({
        type: 'named',
        name: 'multiple exports',
        line: index + 1
      });
    }
    
    // export const ...
    if (line.includes('export const') || line.includes('export function')) {
      const match = line.match(/export\s+(?:const|function|let|var)\s+(\w+)/);
      if (match) {
        exports.push({
          type: 'named',
          name: match[1],
          line: index + 1
        });
      }
    }
  });
  
  return exports;
};

// Extract React components
const extractComponents = (content, fileName) => {
  if (!content || (!fileName.includes('.jsx') && !fileName.includes('.tsx'))) {
    return [];
  }
  
  const components = [];
  const lines = content.split('\n');
  
  // Component patterns
  const patterns = [
    /function\s+([A-Z][A-Za-z0-9]+)\s*\(/g,        // function Component() {}
    /const\s+([A-Z][A-Za-z0-9]+)\s*=\s*\(/g,       // const Component = () => {}
    /const\s+([A-Z][A-Za-z0-9]+)\s*=\s*\([^)]*\)\s*=>/g, // const Component = () => {}
    /class\s+([A-Z][A-Za-z0-9]+)\s+extends/g       // class Component extends
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const compName = match[1];
      const lineNumber = lines.findIndex(l => l.includes(compName)) + 1;
      
      // Check if it returns JSX
      let hasJSX = false;
      for (let i = lineNumber; i < Math.min(lineNumber + 20, lines.length); i++) {
        if (lines[i].includes('return') && lines[i].includes('<')) {
          hasJSX = true;
          break;
        }
      }
      
      if (hasJSX) {
        components.push({
          name: compName,
          line: lineNumber,
          hasJSX: true
        });
      }
    }
  });
  
  return components;
};

// Answer: What does it do?
const answerWhatDoesItDo = (fileInfo, lines) => {
  const firstFewLines = lines.slice(0, 5).join('\n');
  
  let answer = `📄 **${fileInfo.name}**\n\n`;
  
  if (fileInfo.name.includes('.jsx') || fileInfo.name.includes('.tsx')) {
    answer += `This is a **React component file**`;
    if (fileInfo.components.length > 0) {
      answer += ` that contains ${fileInfo.components.length} component(s): ${fileInfo.components.map(c => c.name).join(', ')}.\n\n`;
    } else {
      answer += `.\n\n`;
    }
  } else if (fileInfo.name.includes('.js') || fileInfo.name.includes('.ts')) {
    answer += `This is a **JavaScript/TypeScript module**`;
    if (fileInfo.functions.length > 0) {
      answer += ` that exports ${fileInfo.functions.length} function(s).\n\n`;
    } else {
      answer += `.\n\n`;
    }
  } else if (fileInfo.name.includes('.css') || fileInfo.name.includes('.scss')) {
    answer += `This is a **stylesheet file** that contains styling rules.\n\n`;
  }
  
  answer += `**Quick Stats:**\n`;
  answer += `• Lines of code: ${fileInfo.lines}\n`;
  answer += `• Functions: ${fileInfo.functions.length}\n`;
  answer += `• Imports: ${fileInfo.imports.length}\n`;
  answer += `• Exports: ${fileInfo.exports.length}\n\n`;
  
  if (fileInfo.functions.length > 0) {
    answer += `**Main Functions:**\n`;
    fileInfo.functions.slice(0, 3).forEach(f => {
      answer += `• \`${f.name}\` (line ${f.line})\n`;
    });
  }
  
  return answer;
};

// Answer: How to use it?
const answerHowToUse = (fileInfo) => {
  let answer = `🔧 **How to use ${fileInfo.name}**\n\n`;
  
  if (fileInfo.exports.length > 0) {
    answer += `**Import it like this:**\n`;
    answer += '```javascript\n';
    
    // Show import examples
    const defaultExport = fileInfo.exports.find(e => e.type === 'default');
    const namedExports = fileInfo.exports.filter(e => e.type === 'named');
    
    if (defaultExport) {
      answer += `import ${defaultExport.name || 'Component'} from './${fileInfo.name}';\n`;
    }
    
    if (namedExports.length > 0) {
      const names = namedExports.map(e => e.name).filter(Boolean).join(', ');
      if (names) {
        answer += `import { ${names} } from './${fileInfo.name}';\n`;
      }
    }
    
    answer += '```\n\n';
  }
  
  if (fileInfo.components.length > 0) {
    answer += `**Use the component like this:**\n`;
    answer += '```jsx\n';
    answer += `<${fileInfo.components[0].name} />\n`;
    answer += '```\n';
  }
  
  return answer;
};

// Answer: About functions
const answerAboutFunctions = (fileInfo, question) => {
  // Check if asking about specific function
  const functionMatch = question.match(/function\s+(\w+)/);
  const specificFunction = functionMatch ? functionMatch[1] : null;
  
  if (specificFunction) {
    const func = fileInfo.functions.find(f => 
      f.name.toLowerCase() === specificFunction.toLowerCase()
    );
    
    if (func) {
      return `🔍 **Function \`${func.name}\`**\n\nLocated at line ${func.line}. This is a ${func.type} function.`;
    }
  }
  
  if (fileInfo.functions.length === 0) {
    return "No functions found in this file.";
  }
  
  let answer = `⚙️ **Functions in this file (${fileInfo.functions.length} total)**\n\n`;
  
  fileInfo.functions.slice(0, 5).forEach(f => {
    answer += `• \`${f.name}\` at line ${f.line}\n`;
  });
  
  if (fileInfo.functions.length > 5) {
    answer += `\n... and ${fileInfo.functions.length - 5} more functions.`;
  }
  
  return answer;
};

// Answer: About imports
const answerAboutImports = (fileInfo) => {
  if (fileInfo.imports.length === 0) {
    return "No imports found in this file.";
  }
  
  const externalImports = fileInfo.imports.filter(i => !i.isLocal);
  const localImports = fileInfo.imports.filter(i => i.isLocal);
  
  let answer = `📦 **Imports in this file (${fileInfo.imports.length} total)**\n\n`;
  
  if (externalImports.length > 0) {
    answer += `**External Packages:**\n`;
    externalImports.slice(0, 5).forEach(i => {
      answer += `• \`${i.source}\` (line ${i.line})\n`;
    });
    answer += '\n';
  }
  
  if (localImports.length > 0) {
    answer += `**Local Files:**\n`;
    localImports.slice(0, 5).forEach(i => {
      answer += `• \`${i.source}\` (line ${i.line})\n`;
    });
  }
  
  return answer;
};

// Answer: About exports
const answerAboutExports = (fileInfo) => {
  if (fileInfo.exports.length === 0) {
    return "No exports found in this file.";
  }
  
  let answer = `📤 **Exports from this file (${fileInfo.exports.length} total)**\n\n`;
  
  fileInfo.exports.forEach(e => {
    answer += `• ${e.type}: \`${e.name || 'anonymous'}\` (line ${e.line})\n`;
  });
  
  return answer;
};

// Answer: About components
const answerAboutComponents = (fileInfo) => {
  if (fileInfo.components.length === 0) {
    return "No React components found in this file.";
  }
  
  let answer = `⚛️ **React Components in this file (${fileInfo.components.length} total)**\n\n`;
  
  fileInfo.components.forEach(c => {
    answer += `• \`<${c.name} />\` at line ${c.line}\n`;
  });
  
  return answer;
};

// Answer: About recent changes
const answerAboutChanges = (fileInfo) => {
  if (fileInfo.recentChanges.length === 0) {
    return "No recent changes tracked for this file.";
  }
  
  let answer = `🔄 **Recent Changes**\n\n`;
  
  fileInfo.recentChanges.forEach(change => {
    answer += `• ${change.date}: ${change.message} (by ${change.author})\n`;
  });
  
  return answer;
};

// Answer: About complexity
const answerAboutComplexity = (fileInfo, lines) => {
  // Calculate simple complexity score
  let complexityScore = 1;
  
  // More functions = more complexity
  complexityScore += fileInfo.functions.length * 0.5;
  
  // More imports = more complexity
  complexityScore += fileInfo.imports.length * 0.2;
  
  // Long files are more complex
  complexityScore += Math.floor(fileInfo.lines / 100);
  
  complexityScore = Math.min(10, Math.max(1, Math.round(complexityScore)));
  
  let answer = `📊 **Complexity Analysis**\n\n`;
  answer += `This file has a complexity score of **${complexityScore}/10**.\n\n`;
  
  if (complexityScore >= 8) {
    answer += "⚠️ **High complexity!** Consider breaking this file into smaller modules.\n";
  } else if (complexityScore >= 5) {
    answer += "📏 **Moderate complexity.** Manageable but could be improved.\n";
  } else {
    answer += "✅ **Low complexity.** This file is well-organized.\n";
  }
  
  return answer;
};

// Answer: About specific line
const answerAboutLineNumbers = (fileInfo, question, lines) => {
  const match = question.match(/line\s+(\d+)/i);
  
  if (match) {
    const lineNum = parseInt(match[1]);
    
    if (lineNum > 0 && lineNum <= lines.length) {
      const lineContent = lines[lineNum - 1];
      return `📌 **Line ${lineNum}**\n\n\`${lineContent}\``;
    } else {
      return `Line number ${lineNum} is out of range. This file has ${lines.length} lines.`;
    }
  }
  
  return "Please specify a line number, e.g., 'what's at line 42?'";
};

// Complete file explanation
const explainFileComplete = (fileInfo, lines) => {
  let answer = `📘 **Complete Explanation of ${fileInfo.name}**\n\n`;
  
  // Overview
  answer += `### Overview\n`;
  answer += `This is a ${fileInfo.name.includes('.jsx') ? 'React component' : 'JavaScript module'} file with ${fileInfo.lines} lines of code.\n\n`;
  
  // Structure
  answer += `### Structure\n`;
  answer += `• **Imports:** ${fileInfo.imports.length} dependencies\n`;
  answer += `• **Functions:** ${fileInfo.functions.length} functions\n`;
  answer += `• **Exports:** ${fileInfo.exports.length} exports\n`;
  
  if (fileInfo.components.length > 0) {
    answer += `• **Components:** ${fileInfo.components.length} React components\n`;
  }
  
  answer += '\n';
  
  // Dependencies
  if (fileInfo.imports.length > 0) {
    answer += `### Dependencies\n`;
    fileInfo.imports.slice(0, 5).forEach(i => {
      answer += `• \`${i.source}\` (${i.isLocal ? 'local' : 'external'})\n`;
    });
    answer += '\n';
  }
  
  // First few lines preview
  answer += `### Code Preview\n`;
  answer += '```javascript\n';
  answer += lines.slice(0, 10).join('\n');
  if (lines.length > 10) {
    answer += '\n...';
  }
  answer += '\n```\n';
  
  return answer;
};

// File summary
const getFileSummary = (fileInfo, lines) => {
  let summary = `📋 **File Summary: ${fileInfo.name}**\n\n`;
  
  summary += `**Type:** ${fileInfo.name.includes('.jsx') ? 'React Component' : 'JavaScript Module'}\n`;
  summary += `**Size:** ${fileInfo.lines} lines\n`;
  summary += `**Functions:** ${fileInfo.functions.length}\n`;
  summary += `**Imports:** ${fileInfo.imports.length}\n`;
  summary += `**Exports:** ${fileInfo.exports.length}\n\n`;
  
  if (fileInfo.functions.length > 0) {
    summary += `**Main Functions:** `;
    summary += fileInfo.functions.slice(0, 3).map(f => f.name).join(', ');
    if (fileInfo.functions.length > 3) summary += '...';
    summary += '\n\n';
  }
  
  summary += `💡 **Tip:** Ask specific questions like:\n`;
  summary += `• "What does this file do?"\n`;
  summary += `• "Show me all functions"\n`;
  summary += `• "How do I use this component?"\n`;
  summary += `• "What are the dependencies?"`;
  
  return summary;
};

// General help
const getGeneralHelp = (fileName) => {
  return `🤖 **I can help you understand ${fileName}!**\n\n` +
    `Try asking me:\n\n` +
    `📌 **About the file:**\n` +
    `• "What does this file do?"\n` +
    `• "Explain this file"\n` +
    `• "Give me a summary"\n\n` +
    
    `📌 **About functions:**\n` +
    `• "Show me all functions"\n` +
    `• "Tell me about function X"\n\n` +
    
    `📌 **About dependencies:**\n` +
    `• "What are the imports?"\n` +
    `• "Show dependencies"\n\n` +
    
    `📌 **About components:**\n` +
    `• "What components are here?"\n` +
    `• "How to use this component?"\n\n` +
    
    `📌 **About changes:**\n` +
    `• "Recent changes"\n` +
    `• "Who modified this file?"\n\n` +
    
    `📌 **About complexity:**\n` +
    `• "How complex is this?"\n` +
    `• "Code complexity"`;
};