import axios from 'axios';

// GitHub se commit history fetch karo
export const fetchCommitHistory = async (owner, repo, filePath) => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const headers = token ? { Authorization: `token ${token}` } : {};
  
  try {
    // File ki commit history lo
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      { 
        headers,
        params: { path: filePath, per_page: 10 }
      }
    );
    
    // Commit details fetch karo
    const commits = await Promise.all(
      response.data.map(async (commit) => {
        // Commit details with file changes
        const detailRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`,
          { headers }
        );
        
        // Find our specific file in the commit
        const fileChanged = detailRes.data.files?.find(f => f.filename === filePath);
        
        return {
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          email: commit.commit.author.email,
          date: new Date(commit.commit.author.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          additions: fileChanged?.additions || 0,
          deletions: fileChanged?.deletions || 0,
          changes: fileChanged?.changes || 0,
          patch: fileChanged?.patch || 'No patch available',
          url: commit.html_url
        };
      })
    );
    
    return commits;
  } catch (error) {
    console.error('Error fetching commit history:', error);
    return [];
  }
};

// Developer activity summary
export const getDeveloperActivity = async (owner, repo) => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const headers = token ? { Authorization: `token ${token}` } : {};
  
  try {
    // Last 30 days ke commits
    const since = new Date();
    since.setDate(since.getDate() - 30);
    
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      { 
        headers,
        params: { since: since.toISOString(), per_page: 100 }
      }
    );
    
    // Group by author
    const authorActivity = {};
    
    response.data.forEach(commit => {
      const author = commit.commit.author.name;
      if (!authorActivity[author]) {
        authorActivity[author] = {
          name: author,
          email: commit.commit.author.email,
          commits: 0,
          files: new Set(),
          lastCommit: commit.commit.author.date
        };
      }
      
      authorActivity[author].commits++;
      // We can't get files without fetching each commit, so this is approximate
    });
    
    return Object.values(authorActivity).map(author => ({
      ...author,
      files: Array.from(author.files).length
    }));
  } catch (error) {
    console.error('Error fetching developer activity:', error);
    return [];
  }
};