import axios from 'axios';

// GitHub URL se owner aur repo name nikalna
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

// Repository ka data fetch karna
export const fetchRepoData = async (owner, repo) => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  
  const headers = token ? { Authorization: `token ${token}` } : {};
  
  try {
    // Repo info
    const repoRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    
    // Languages
    const langRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      { headers }
    );
    
    // Contents (root directory)
    const contentsRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents`,
      { headers }
    );
    
    return {
      name: repoRes.data.name,
      description: repoRes.data.description,
      stars: repoRes.data.stargazers_count,
      forks: repoRes.data.forks_count,
      languages: langRes.data,
      contents: contentsRes.data
    };
  } catch (error) {
    console.error('GitHub API error:', error);
    throw new Error('Failed to fetch repository data');
  }
};

// File content fetch karna
export const fetchFileContent = async (owner, repo, path) => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const headers = token ? { Authorization: `token ${token}` } : {};
  
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );
    
    // Content base64 encoded hota hai
    if (res.data.content) {
      const content = atob(res.data.content.replace(/\n/g, ''));
      return content;
    }
    return '';
  } catch (error) {
    console.error('Error fetching file:', error);
    return '';
  }
};