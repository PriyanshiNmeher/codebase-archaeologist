// import axios from 'axios';

// // GitHub URL se owner aur repo name nikalna
// export const parseGithubUrl = (url) => {
//   try {
//     const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
//     if (!match) throw new Error("Invalid GitHub URL");
//     return { 
//       owner: match[1], 
//       repo: match[2].replace('.git', '') 
//     };
//   } catch (error) {
//     throw new Error("Invalid GitHub URL format");
//   }
// };

// // Repository ka data fetch karna
// export const fetchRepoData = async (owner, repo) => {
//   const token = import.meta.env.VITE_GITHUB_TOKEN;
  
//   const headers = token ? { Authorization: `token ${token}` } : {};
  
//   try {
//     // Repo info
//     const repoRes = await axios.get(
//       `https://api.github.com/repos/${owner}/${repo}`,
//       { headers }
//     );
    
//     // Languages
//     const langRes = await axios.get(
//       `https://api.github.com/repos/${owner}/${repo}/languages`,
//       { headers }
//     );
    
//     // Contents (root directory)
//     const contentsRes = await axios.get(
//       `https://api.github.com/repos/${owner}/${repo}/contents`,
//       { headers }
//     );
    
//     return {
//       name: repoRes.data.name,
//       description: repoRes.data.description,
//       stars: repoRes.data.stargazers_count,
//       forks: repoRes.data.forks_count,
//       languages: langRes.data,
//       contents: contentsRes.data
//     };
//   } catch (error) {
//     console.error('GitHub API error:', error);
//     throw new Error('Failed to fetch repository data');
//   }
// };

// // File content fetch karna
// export const fetchFileContent = async (owner, repo, path) => {
//   const token = import.meta.env.VITE_GITHUB_TOKEN;
//   const headers = token ? { Authorization: `token ${token}` } : {};
  
//   try {
//     const res = await axios.get(
//       `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
//       { headers }
//     );
    
//     // Content base64 encoded hota hai
//     if (res.data.content) {
//       const content = atob(res.data.content.replace(/\n/g, ''));
//       return content;
//     }
//     return '';
//   } catch (error) {
//     console.error('Error fetching file:', error);
//     return '';
//   }
// };


import axios from 'axios';

// GitHub token from .env
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Parse GitHub URL
export const parseGithubUrl = (url) => {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error("Invalid GitHub URL");
    return { 
      owner: match[1], 
      repo: match[2].replace('.git', '') 
    };
  } catch (error) {
    throw new Error("Invalid GitHub URL format");
  }
};

// Fetch repository data
export const fetchRepoData = async (owner, repo) => {
  const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
  
  try {
    // Get repo info
    const repoRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    
    // Get languages
    const langRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      { headers }
    );
    
    // Get contents (root directory)
    const contentsRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents`,
      { headers }
    );
    
    return {
      name: repoRes.data.name,
      full_name: repoRes.data.full_name,
      description: repoRes.data.description,
      stars: repoRes.data.stargazers_count,
      forks: repoRes.data.forks_count,
      languages: langRes.data,
      contents: contentsRes.data
    };
  } catch (error) {
    console.error('GitHub API error:', error);
    throw new Error('Failed to fetch repository data. Check if repository exists and is public.');
  }
};

// Fetch file content
export const fetchFileContent = async (owner, repo, path) => {
  const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
  
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );
    
    if (res.data.content) {
      // Decode base64 content
      const content = atob(res.data.content.replace(/\n/g, ''));
      return content;
    }
    return '';
  } catch (error) {
    console.error('Error fetching file:', error);
    return '';
  }
};

// Fetch commit history for a file
export const fetchFileCommits = async (owner, repo, path) => {
  const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
  
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      { 
        headers,
        params: { path, per_page: 5 }
      }
    );
    
    return res.data.map(commit => ({
      date: new Date(commit.commit.author.date).toLocaleDateString(),
      author: commit.commit.author.name,
      message: commit.commit.message,
      sha: commit.sha.substring(0, 7)
    }));
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
};

// Recursively fetch all files from repository
export const fetchAllFiles = async (owner, repo, path = '') => {
  const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
  
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );
    
    let files = [];
    
    for (const item of res.data) {
      if (item.type === 'file') {
        // Only include code files
        if (isCodeFile(item.name)) {
          files.push({
            name: item.name,
            path: item.path,
            type: 'file',
            size: item.size,
            sha: item.sha,
            download_url: item.download_url
          });
        }
      } else if (item.type === 'dir') {
        // Recursively get files from subdirectories
        const subFiles = await fetchAllFiles(owner, repo, item.path);
        files = [...files, ...subFiles];
      }
    }
    
    return files;
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
};

// Check if file is code file
const isCodeFile = (filename) => {
  const codeExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb',
    '.php', '.c', '.cpp', '.cs', '.swift', '.kt', '.rs',
    '.html', '.css', '.scss', '.json', '.md'
  ];
  return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

// Analyze dependencies between files
export const analyzeDependencies = (files, contents) => {
  const dependencies = [];
  
  files.forEach(file => {
    if (contents[file.path]) {
      const content = contents[file.path];
      const lines = content.split('\n');
      
      // Check for import statements
      lines.forEach(line => {
        // ES6 imports
        const importMatch = line.match(/import\s+.*?from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          // Find which file this imports
          const importedFile = files.find(f => 
            f.path.includes(importPath.replace(/^\.\//, '')) ||
            importPath.includes(f.name.replace(/\.[^/.]+$/, ''))
          );
          
          if (importedFile) {
            dependencies.push({
              from: file.name,
              to: importedFile.name,
              type: 'import'
            });
          }
        }
        
        // require statements
        const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
        if (requireMatch) {
          const requirePath = requireMatch[1];
          const requiredFile = files.find(f => 
            f.path.includes(requirePath.replace(/^\.\//, ''))
          );
          
          if (requiredFile) {
            dependencies.push({
              from: file.name,
              to: requiredFile.name,
              type: 'require'
            });
          }
        }
      });
    }
  });
  
  // Remove duplicates
  const uniqueDeps = [];
  const seen = new Set();
  dependencies.forEach(dep => {
    const key = `${dep.from}|${dep.to}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDeps.push(dep);
    }
  });
  
  return uniqueDeps;
};

// Calculate file complexity
export const calculateComplexity = (content) => {
  if (!content) return 3;
  
  const lines = content.split('\n').length;
  const functions = (content.match(/function\s+\w+|=>|const\s+\w+\s*=\s*\(/g) || []).length;
  const conditionals = (content.match(/if|else|switch|case|for|while/g) || []).length;
  
  // Simple complexity formula
  let complexity = Math.floor((functions * 2 + conditionals) / 10) + 1;
  
  // Cap at 10
  return Math.min(10, Math.max(1, complexity));
};

// Find issues in code
export const findIssues = (content) => {
  if (!content) return 0;
  
  let issues = 0;
  
  // Check for TODOs
  issues += (content.match(/TODO|FIXME|HACK/g) || []).length;
  
  // Check for console.log
  issues += (content.match(/console\.(log|debug|info)/g) || []).length;
  
  // Check for long lines (>100 chars)
  const lines = content.split('\n');
  issues += lines.filter(l => l.length > 100).length;
  
  return issues;
};