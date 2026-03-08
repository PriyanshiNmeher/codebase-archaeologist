// // File type emoji
// const getFileEmoji = (filename) => {
//   if (filename.endsWith('.jsx') || filename.endsWith('.tsx')) return '⚛️';
//   if (filename.endsWith('.js') || filename.endsWith('.ts')) return '📜';
//   if (filename.endsWith('.css') || filename.endsWith('.scss')) return '🎨';
//   if (filename.endsWith('.json')) return '📦';
//   if (filename.endsWith('.md')) return '📝';
//   if (filename.endsWith('.html')) return '🌐';
//   return '📄';
// };

// // Complete repository ka diagram generate karna
// export const generateCompleteDiagram = (files, dependencies, repoName) => {
//   let code = `graph TD
//     title["📊 ${repoName} Repository"]
//     style title fill:#4ECDC4,color:#fff,stroke:#fff,font-size:16px
    
//     title --> stats["📈 Statistics
//     • Total Files: ${files.length}
//     • Dependencies: ${dependencies.length}"]
//     style stats fill:#FFB7B2,color:#000,stroke:#000
// `;

//   // Files ko folder ke hisaab se group karna
//   const folders = {};
//   files.forEach(file => {
//     const parts = file.path.split('/');
//     const folder = parts.length > 1 ? parts[0] : 'root';
//     if (!folders[folder]) folders[folder] = [];
//     folders[folder].push(file);
//   });

//   // Har folder ke liye subgraph banana
//   let folderIndex = 0;
//   Object.entries(folders).forEach(([folderName, folderFiles]) => {
//     const folderId = `folder${folderIndex}`;
//     code += `
    
//     subgraph ${folderId}["📁 ${folderName}/ (${folderFiles.length} files)"]
//       direction TB`;
    
//     folderFiles.forEach((file, idx) => {
//       const fileId = `${folderName}${idx}`.replace(/[^a-zA-Z0-9]/g, '_');
//       const emoji = getFileEmoji(file.name);
//       const complexityColor = file.complexity > 7 ? '#ef4444' : 
//                              file.complexity > 4 ? '#f59e0b' : '#10b981';
      
//       code += `
//       ${fileId}["${emoji} ${file.name}
//       📊 ${file.complexity || 5}/10"]`;
      
//       if (file.issues > 0) {
//         code += `
//       style ${fileId} fill:${complexityColor}20,stroke:${complexityColor}`;
//       }
//     });
    
//     code += `
//     end
    
//     stats --> ${folderId}`;
//     folderIndex++;
//   });

//   // Dependencies add karna
//   if (dependencies.length > 0) {
//     code += `
    
//     subgraph deps["🔗 Dependencies (${dependencies.length})"]
//       direction LR`;
    
//     dependencies.slice(0, 10).forEach((dep, idx) => {
//       code += `
//       dep${idx}["${dep.from} → ${dep.to}"]`;
//     });
    
//     if (dependencies.length > 10) {
//       code += `
//       more["... and ${dependencies.length - 10} more"]`;
//     }
    
//     code += `
//     end
    
//     stats --> deps`;
//   }

//   code += `
    
//     deps --> endNode["✅ Analysis Complete"]
//     style endNode fill:#6BCB77,color:#fff,stroke:#fff`;

//   return code;
// };

// // Specific file ka diagram generate karna
// export const generateFileDiagram = (file, dependencies) => {
//   const incoming = dependencies.filter(d => d.to === file.name);
//   const outgoing = dependencies.filter(d => d.from === file.name);
  
//   let code = `graph TD
//     title["📄 ${file.name}"]
//     style title fill:#4ECDC4,color:#fff,stroke:#fff
    
//     title --> info["📋 Details
//     • Lines: ${file.lines || 'N/A'}
//     • Complexity: ${file.complexity || 5}/10
//     • Issues: ${file.issues || 0}"]
//     style info fill:#FFB7B2,color:#000,stroke:#000
// `;

//   if (incoming.length > 0) {
//     code += `
    
//     subgraph incoming["📥 Imported By (${incoming.length})"]
//       direction LR`;
    
//     incoming.slice(0, 5).forEach((dep, idx) => {
//       code += `
//       in${idx}["${dep.from}"]`;
//     });
    
//     code += `
//     end
    
//     info --> incoming`;
//   }

//   if (outgoing.length > 0) {
//     code += `
    
//     subgraph outgoing["📤 Imports (${outgoing.length})"]
//       direction LR`;
    
//     outgoing.slice(0, 5).forEach((dep, idx) => {
//       code += `
//       out${idx}["${dep.to}"]`;
//     });
    
//     code += `
//     end
    
//     info --> outgoing`;
//   }

//   code += `
    
//     ${incoming.length > 0 ? 'incoming' : 'info'} --> endNode["✅ Done"]
//     style endNode fill:#6BCB77,color:#fff,stroke:#fff`;

//   return code;
// };


// File type emoji
const getFileEmoji = (filename) => {
  if (filename.endsWith('.jsx') || filename.endsWith('.tsx')) return '⚛️';
  if (filename.endsWith('.js') || filename.endsWith('.ts')) return '📜';
  if (filename.endsWith('.css') || filename.endsWith('.scss')) return '🎨';
  if (filename.endsWith('.json')) return '📦';
  if (filename.endsWith('.md')) return '📝';
  if (filename.endsWith('.html')) return '🌐';
  return '📄';
};

// Complete repository ka diagram
export const generateCompleteDiagram = (files, dependencies, repoName) => {
  let code = `graph TD
    title["📊 ${repoName} Repository"]
    style title fill:#4ECDC4,color:#fff,stroke:#fff,font-size:16px
    
    title --> stats["📈 Statistics
    • Files: ${files.length}
    • Dependencies: ${dependencies.length}"]
    style stats fill:#FFB7B2,color:#000,stroke:#000
`;

  // Files ko folder wise group karo
  const folders = {};
  files.forEach(file => {
    const folder = file.path.split('/')[0] || 'root';
    if (!folders[folder]) folders[folder] = [];
    folders[folder].push(file);
  });

  // Har folder ke liye subgraph
  let folderIndex = 0;
  Object.entries(folders).forEach(([folderName, folderFiles]) => {
    const folderId = `folder${folderIndex}`;
    code += `
    
    subgraph ${folderId}["📁 ${folderName}/ (${folderFiles.length} files)"]
      direction TB`;
    
    folderFiles.forEach((file, idx) => {
      const fileId = `file_${folderIndex}_${idx}`;
      const emoji = getFileEmoji(file.name);
      const complexityColor = file.complexity > 7 ? '#ef4444' : 
                             file.complexity > 4 ? '#f59e0b' : '#10b981';
      
      code += `
      ${fileId}["${emoji} ${file.name}
      📊 ${file.complexity || 5}/10"]`;
      
      // Style based on complexity
      code += `
      style ${fileId} fill:${complexityColor}20,stroke:${complexityColor}`;
    });
    
    code += `
    end
    
    stats --> ${folderId}`;
    folderIndex++;
  });

  // Dependencies
  if (dependencies.length > 0) {
    code += `
    
    subgraph deps["🔗 Dependencies"]
      direction LR`;
    
    // Unique dependencies
    const uniqueDeps = [...new Set(dependencies.map(d => `${d.from} → ${d.to}`))];
    uniqueDeps.slice(0, 8).forEach((dep, idx) => {
      code += `
      dep${idx}["${dep}"]`;
    });
    
    if (uniqueDeps.length > 8) {
      code += `
      more["... and ${uniqueDeps.length - 8} more"]`;
    }
    
    code += `
    end
    
    stats --> deps`;
  }

  code += `
    
    deps --> endNode["✅ Analysis Complete"]
    style endNode fill:#6BCB77,color:#fff,stroke:#fff`;

  return code;
};

// Specific file ka diagram
export const generateFileDiagram = (file, dependencies) => {
  const incoming = dependencies.filter(d => d.to === file.name);
  const outgoing = dependencies.filter(d => d.from === file.name);
  
  let code = `graph TD
    title["📄 ${file.name}"]
    style title fill:#4ECDC4,color:#fff,stroke:#fff
    
    title --> info["📋 File Info
    • Lines: ${file.lines || 'N/A'}
    • Complexity: ${file.complexity || 5}/10
    • Issues: ${file.issues || 0}"]
    style info fill:#FFB7B2,color:#000,stroke:#000
`;

  if (incoming.length > 0) {
    code += `
    
    subgraph incoming["📥 Imported By (${incoming.length})"]
      direction LR`;
    
    incoming.slice(0, 5).forEach((dep, idx) => {
      code += `
      in${idx}["${dep.from}"]`;
    });
    
    code += `
    end
    
    info --> incoming`;
  }

  if (outgoing.length > 0) {
    code += `
    
    subgraph outgoing["📤 Imports (${outgoing.length})"]
      direction LR`;
    
    outgoing.slice(0, 5).forEach((dep, idx) => {
      code += `
      out${idx}["${dep.to}"]`;
    });
    
    code += `
    end
    
    info --> outgoing`;
  }

  code += `
    
    ${incoming.length > 0 || outgoing.length > 0 ? 'incoming' : 'info'} --> endNode["✅ Done"]
    style endNode fill:#6BCB77,color:#fff,stroke:#fff`;

  return code;
};