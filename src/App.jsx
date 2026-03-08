import React, { useState } from 'react';
import { 
  Github, MapPin, Code, BarChart3, AlertTriangle, 
  Network, MessageSquare, Zap, GitBranch, FileText 
} from 'lucide-react';

import MermaidDiagram from './components/MermaidDiagram';
import FileList from './components/FileList';
import ChatPanel from './components/ChatPanel';
import StatsCard from './components/StatsCard';

import { parseGithubUrl, fetchRepoData } from './services/githubService';
import { generateCompleteDiagram, generateFileDiagram } from './services/mermaidGenerator';
import { answerCodeQuestion } from './services/aiService';

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mermaidCode, setMermaidCode] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      content: '👋 Hello! Main aapki codebase mein madad kar sakta hoon!\n\n💡 **Try karo:**\n• "Kitni files hain?"\n• "Complex files dikhao"\n• "Dependencies batao"\n\n📌 Ya kisi file pe click karo specific questions ke liye!'
    }
  ]);
  const [activeTab, setActiveTab] = useState('visualization');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [fileHistory, setFileHistory] = useState([]);

  // Analyze repository
  const analyzeRepo = async () => {
    if (!githubUrl) {
      alert('Please enter a GitHub URL');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const { owner, repo } = parseGithubUrl(githubUrl);
      const data = await fetchRepoData(owner, repo);
      
      setProgress(30);

      // Mock files for demo
      const mockFiles = [
        { name: 'App.jsx', path: 'src/App.jsx', lines: 150, complexity: 6, issues: 2 },
        { name: 'index.js', path: 'src/index.js', lines: 20, complexity: 2, issues: 0 },
        { name: 'Button.jsx', path: 'components/Button.jsx', lines: 80, complexity: 3, issues: 1 },
        { name: 'Header.jsx', path: 'components/Header.jsx', lines: 60, complexity: 2, issues: 0 },
        { name: 'api.js', path: 'services/api.js', lines: 120, complexity: 5, issues: 3 },
        { name: 'styles.css', path: 'styles/styles.css', lines: 200, complexity: 1, issues: 0 },
      ];

      const mockDependencies = [
        { from: 'App.jsx', to: 'Button.jsx' },
        { from: 'App.jsx', to: 'Header.jsx' },
        { from: 'App.jsx', to: 'api.js' },
        { from: 'Button.jsx', to: 'styles.css' },
        { from: 'Header.jsx', to: 'styles.css' },
      ];

      setProgress(70);

      const repoStats = {
        name: repo,
        url: githubUrl,
        owner,
        repo,
        files: mockFiles,
        dependencies: mockDependencies,
        stats: {
          totalFiles: mockFiles.length,
          totalLines: mockFiles.reduce((sum, f) => sum + f.lines, 0),
          languages: { JavaScript: 60, JSX: 30, CSS: 10 },
          complexity: 45,
          techDebt: 25
        }
      };

      setRepoData(repoStats);

      const code = generateCompleteDiagram(mockFiles, mockDependencies, repo);
      setMermaidCode(code);

      setProgress(100);

      setChatMessages([{
        role: 'ai',
        content: `✅ Analysis complete for ${repo}!

📊 **Statistics:**
• Total files: ${mockFiles.length}
• Total dependencies: ${mockDependencies.length}
• Complexity: 45%
• Tech debt: 25%

💡 **Ab kya kar sakte ho:**
• Left panel se koi file select karo
• Ya mujhse general questions poocho:
  - "Kitni files hain?"
  - "Complex files dikhao"
  - "Dependencies batao"`
      }]);

      setIsLoading(false);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error analyzing repository: ' + error.message);
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    
    // Mock file content for demo
    const mockContent = getMockFileContent(file.name);
    setFileContent(mockContent);
    
    // Mock commit history
    const mockHistory = getMockCommitHistory(file.name);
    setFileHistory(mockHistory);
    
    // Generate diagram
    const code = generateFileDiagram(file, repoData?.dependencies || []);
    setMermaidCode(code);
    
    // Switch to chat tab
    setActiveTab('chat');
    
    // Add message about selected file
    setChatMessages(prev => [...prev, {
      role: 'ai',
      content: `📄 Aapne **${file.name}** select kiya hai!\n\nAb mujhse is file ke baare mein pooch sakte ho:\n• "Ye file kya karti hai?"\n• "Functions dikhao"\n• "Imports batao"\n• "Complexity kya hai?"\n• "Recent changes"`
    }]);
  };

  // Mock file content for demo
  const getMockFileContent = (fileName) => {
    if (fileName === 'App.jsx') {
      return `import React from 'react';
import Button from './components/Button';
import Header from './components/Header';
import { fetchData } from './services/api';

function App() {
  const [data, setData] = React.useState([]);
  
  React.useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return (
    <div className="app">
      <Header />
      <main>
        {data.map(item => (
          <Button key={item.id} onClick={() => handleClick(item)}>
            {item.name}
          </Button>
        ))}
      </main>
    </div>
  );
}

export default App;`;
    }
    
    if (fileName === 'Button.jsx') {
      return `import React from 'react';
import './styles.css';

const Button = ({ children, onClick, variant = 'primary' }) => {
  const handleClick = (e) => {
    console.log('Button clicked:', children);
    onClick?.(e);
  };
  
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default Button;`;
    }
    
    if (fileName === 'api.js') {
      return `import axios from 'axios';

const API_URL = 'https://api.example.com';

export const fetchData = async () => {
  try {
    const response = await axios.get(\`\${API_URL}/data\`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const postData = async (data) => {
  const response = await axios.post(\`\${API_URL}/data\`, data);
  return response.data;
};

// Helper function
const formatParams = (params) => {
  return Object.entries(params)
    .map(([key, value]) => \`\${key}=\${encodeURIComponent(value)}\`)
    .join('&');
};`;
    }
    
    return `// Sample content for ${fileName}\n// This is a demo file.`;
  };

  // Mock commit history
  const getMockCommitHistory = (fileName) => {
    return [
      {
        date: '2024-03-15',
        author: 'John Doe',
        message: `Fixed bug in ${fileName}`,
        additions: 5,
        deletions: 2
      },
      {
        date: '2024-03-10',
        author: 'Jane Smith',
        message: `Added new feature to ${fileName}`,
        additions: 20,
        deletions: 3
      },
      {
        date: '2024-03-05',
        author: 'John Doe',
        message: `Initial commit of ${fileName}`,
        additions: 100,
        deletions: 0
      }
    ];
  };

  // Answer general questions
  const answerGeneralQuestion = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('file') && (lowerQuestion.includes('kitni') || lowerQuestion.includes('how many'))) {
      return `📁 Is repository mein **${repoData.files.length} files** hain.\n\nKuch important files:\n${repoData.files.slice(0, 5).map(f => `• ${f.name}`).join('\n')}`;
    }
    
    if (lowerQuestion.includes('complex') || lowerQuestion.includes('mushkil')) {
      const complexFiles = repoData.files.filter(f => f.complexity > 5);
      return `📊 **Complex Files:**\n\n${complexFiles.slice(0, 3).map(f => `• ${f.name} (${f.complexity}/10)`).join('\n')}`;
    }
    
    if (lowerQuestion.includes('depend')) {
      return `🔗 Is repository mein **${repoData.dependencies.length} dependencies** hain.`;
    }
    
    if (lowerQuestion.includes('language') || lowerQuestion.includes('bhasha')) {
      const langs = Object.entries(repoData.stats.languages)
        .map(([lang, percent]) => `• ${lang}: ${percent}%`)
        .join('\n');
      return `📝 **Languages used:**\n${langs}`;
    }
    
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('namaste')) {
      return `👋 Namaste! Main aapki kaise madad kar sakta hoon?\n\nAap pooch sakte ho:\n• "Kitni files hain?"\n• "Complex files dikhao"\n• "Dependencies batao"\n\nYa kisi file pe click karo specific questions ke liye!`;
    }
    
    return `🤖 Main aapki madad kar sakta hoon!\n\n**General questions:**\n• "Kitni files hain?"\n• "Complex files dikhao"\n• "Languages batao"\n• "Dependencies dikhao"\n\n**File-specific:**\nLeft panel se koi file select karo aur poocho!`;
  };

  // Handle chat messages
  const handleSendMessage = (message) => {
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);

    // Show typing indicator
    setChatMessages(prev => [...prev, { role: 'ai', content: '...', isLoading: true }]);

    // Generate AI response
    setTimeout(() => {
      // Remove typing indicator
      setChatMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // Get AI response
      let response;
      
      if (selectedFile) {
        // If file selected, answer about that file
        response = answerCodeQuestion(message, selectedFile.name, fileContent, fileHistory);
      } else {
        // If no file selected, answer general questions
        response = answerGeneralQuestion(message);
      }
      
      setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
    }, 800);
  };

  // Reset everything
  const handleNewAnalysis = () => {
    setRepoData(null);
    setSelectedFile(null);
    setChatMessages([{
      role: 'ai',
      content: '👋 Hello! Main aapki codebase mein madad kar sakta hoon!\n\n💡 **Try karo:**\n• "Kitni files hain?"\n• "Complex files dikhao"\n• "Dependencies batao"\n\n📌 Ya kisi file pe click karo specific questions ke liye!'
    }]);
    setMermaidCode('');
    setGithubUrl('');
  };

  // If no repo data, show upload screen
  if (!repoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-6 mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mx-auto flex items-center justify-center">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Codebase Archaeologist</h1>
            <p className="text-xl text-slate-400">
              Visualize and analyze any GitHub repository
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              GitHub Repository URL
            </label>
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 mb-4"
            />
            
            <button
              onClick={analyzeRepo}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {isLoading ? 'Analyzing...' : 'Analyze Repository'}
            </button>

            {isLoading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Fetching repository data...</span>
                  <span className="text-cyan-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Github, label: 'GitHub Integration' },
              { icon: Network, label: 'Dependency Maps' },
              { icon: BarChart3, label: 'Complexity Analysis' },
              { icon: MessageSquare, label: 'AI Chat' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4 text-center">
                  <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">{feature.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-950/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{repoData.name}</h1>
              <p className="text-xs text-slate-400 truncate max-w-md">{repoData.url}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedFile && (
              <div className="flex items-center gap-2 bg-cyan-600/20 px-3 py-1 rounded-lg">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400 truncate max-w-[150px]">
                  {selectedFile.name}
                </span>
              </div>
            )}
            
            <button
              onClick={handleNewAnalysis}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <StatsCard icon={Code} label="Total Files" value={repoData.stats.totalFiles} />
          <StatsCard icon={BarChart3} label="Total Lines" value={repoData.stats.totalLines} color="green" />
          <StatsCard icon={AlertTriangle} label="Complexity" value={`${repoData.stats.complexity}%`} color="orange" />
          <StatsCard icon={AlertTriangle} label="Tech Debt" value={`${repoData.stats.techDebt}%`} color="red" />
          <StatsCard icon={Network} label="Dependencies" value={repoData.dependencies.length} color="blue" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left column - File list */}
          <div className="col-span-1">
            <FileList 
              files={repoData.files} 
              onFileSelect={handleFileSelect} 
              selectedFile={selectedFile} 
            />
          </div>

          {/* Right column - Visualization and chat */}
          <div className="col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-700/50 pb-2">
              <button
                onClick={() => setActiveTab('visualization')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'visualization'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Visualization
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Chat {selectedFile && '📄'}
              </button>
            </div>

            {/* Visualization */}
            {activeTab === 'visualization' && (
              <MermaidDiagram 
                code={mermaidCode} 
                filename={`${repoData.name}_diagram`}
              />
            )}

            {/* Chat */}
            {activeTab === 'chat' && (
              <ChatPanel 
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                selectedFile={selectedFile}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;