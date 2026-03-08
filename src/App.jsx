// import React, { useState } from 'react';
// import { 
//   Github, 
//   MapPin, 
//   Code, 
//   BarChart3, 
//   AlertTriangle, 
//   Network, 
//   MessageSquare, 
//   Zap, 
//   GitBranch, 
//   FileText,
//   BookOpen  // ← YEH IMPORTANT HAI
// } from 'lucide-react';

// import MermaidDiagram from './components/MermaidDiagram';
// import FileList from './components/FileList';
// import ChatPanel from './components/ChatPanel';
// import StatsCard from './components/StatsCard';
// import KTButton from './components/KTButton';
// import KTDocumentModal from './components/KTDocumentModal';





// import { parseGithubUrl, fetchRepoData } from './services/githubService';
// import { generateCompleteDiagram, generateFileDiagram } from './services/mermaidGenerator';
// import { askGroq } from './services/groqService';
// import { generateKTDocument } from './services/ktGeneratorService';

// function App() {
//   const [githubUrl, setGithubUrl] = useState('');
//   const [repoData, setRepoData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [mermaidCode, setMermaidCode] = useState('');
//   const [chatMessages, setChatMessages] = useState([
//     {
//       role: 'ai',
//       content: '👋 Hello! I can help you understand this codebase.\n\n💡 **Try asking:**\n• "How many files are there?"\n• "Show me complex files"\n• "What dependencies exist?"\n\n📌 Click any file on the left for specific questions!\n\n📚 **New:** Click the "KT Document" button to generate documentation!'
//     }
//   ]);
//   const [activeTab, setActiveTab] = useState('visualization');
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [fileContent, setFileContent] = useState('');
//   const [fileHistory, setFileHistory] = useState([]);
  
//   // KT Document state
//   const [showKTModal, setShowKTModal] = useState(false);
//   const [ktDocument, setKtDocument] = useState('');
//   const [ktTitle, setKtTitle] = useState('');

//   // Analyze repository
//   const analyzeRepo = async () => {
//     if (!githubUrl) {
//       alert('Please enter a GitHub URL');
//       return;
//     }

//     setIsLoading(true);
//     setProgress(0);

//     try {
//       const { owner, repo } = parseGithubUrl(githubUrl);
//       const data = await fetchRepoData(owner, repo);
      
//       setProgress(30);

//       // Mock files for demo
//       const mockFiles = [
//         { name: 'App.jsx', path: 'src/App.jsx', lines: 150, complexity: 6, issues: 2 },
//         { name: 'index.js', path: 'src/index.js', lines: 20, complexity: 2, issues: 0 },
//         { name: 'Button.jsx', path: 'components/Button.jsx', lines: 80, complexity: 3, issues: 1 },
//         { name: 'Header.jsx', path: 'components/Header.jsx', lines: 60, complexity: 2, issues: 0 },
//         { name: 'Footer.jsx', path: 'components/Footer.jsx', lines: 50, complexity: 2, issues: 0 },
//         { name: 'Card.jsx', path: 'components/Card.jsx', lines: 90, complexity: 4, issues: 1 },
//         { name: 'api.js', path: 'services/api.js', lines: 120, complexity: 5, issues: 3 },
//         { name: 'utils.js', path: 'services/utils.js', lines: 80, complexity: 3, issues: 1 },
//         { name: 'styles.css', path: 'styles/styles.css', lines: 200, complexity: 1, issues: 0 },
//         { name: 'variables.css', path: 'styles/variables.css', lines: 50, complexity: 1, issues: 0 },
//       ];

//       const mockDependencies = [
//         { from: 'App.jsx', to: 'Button.jsx' },
//         { from: 'App.jsx', to: 'Header.jsx' },
//         { from: 'App.jsx', to: 'Footer.jsx' },
//         { from: 'App.jsx', to: 'api.js' },
//         { from: 'Button.jsx', to: 'styles.css' },
//         { from: 'Header.jsx', to: 'styles.css' },
//         { from: 'Card.jsx', to: 'Button.jsx' },
//         { from: 'Card.jsx', to: 'styles.css' },
//         { from: 'api.js', to: 'utils.js' },
//       ];

//       setProgress(70);

//       const repoStats = {
//         name: repo,
//         url: githubUrl,
//         owner,
//         repo,
//         files: mockFiles,
//         dependencies: mockDependencies,
//         stats: {
//           totalFiles: mockFiles.length,
//           totalLines: mockFiles.reduce((sum, f) => sum + f.lines, 0),
//           languages: { JavaScript: 50, JSX: 30, CSS: 20 },
//           complexity: 45,
//           techDebt: 25
//         }
//       };

//       setRepoData(repoStats);

//       // Generate complete diagram
//       const code = generateCompleteDiagram(mockFiles, mockDependencies, repo);
//       setMermaidCode(code);

//       setProgress(100);

//       setChatMessages([{
//         role: 'ai',
//         content: `✅ Analysis complete for ${repo}!

// 📊 **Statistics:**
// • Total files: ${mockFiles.length}
// • Total dependencies: ${mockDependencies.length}
// • Complexity: 45%
// • Tech debt: 25%

// 💡 **What you can do:**
// • Select a file from the left panel
// • Ask general questions
// • Click "KT Document" to generate documentation`
//       }]);

//       setIsLoading(false);
//     } catch (error) {
//       console.error('Analysis error:', error);
//       alert('Error analyzing repository: ' + error.message);
//       setIsLoading(false);
//     }
//   };

//   // Get repository context for chat
//   const getRepoContext = () => {
//     if (!repoData) return null;
    
//     return {
//       totalFiles: repoData.files.length,
//       languages: repoData.stats.languages,
//       totalDependencies: repoData.dependencies.length,
//       complexity: repoData.stats.complexity,
//       files: repoData.files.map(f => f.name)
//     };
//   };

//   // Handle file selection
//   const handleFileSelect = async (file) => {
//     setSelectedFile(file);
    
//     // Mock file content
//     const mockContent = getMockFileContent(file.name);
//     setFileContent(mockContent);
    
//     // Mock commit history
//     const mockHistory = getMockCommitHistory(file.name);
//     setFileHistory(mockHistory);
    
//     // Generate file-specific diagram
//     const code = generateFileDiagram(file, repoData?.dependencies || []);
//     setMermaidCode(code);
    
//     // Stay in visualization tab
//     setActiveTab('visualization');
    
//     // Add a message about file selection
//     setChatMessages(prev => [...prev, {
//       role: 'ai',
//       content: `📄 You selected **${file.name}**\n\nNow you can ask me specific questions about this file:\n• "What does this file do?"\n• "Show me functions"\n• "What are the imports?"\n• "How complex is this?"`
//     }]);
//   };

//   // Handle KT Document generation
//   const handleGenerateKT = () => {
//     if (!repoData) return;
    
//     const document = generateKTDocument(repoData, selectedFile);
//     setKtDocument(document);
    
//     if (selectedFile) {
//       setKtTitle(`KT - ${selectedFile.name}`);
//     } else {
//       setKtTitle(`KT - ${repoData.name} (Complete)`);
//     }
    
//     setShowKTModal(true);
//   };

//   // Mock file content
//   const getMockFileContent = (fileName) => {
//     if (fileName === 'App.jsx') {
//       return `import React from 'react';
// import Button from './components/Button';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import { fetchData } from './services/api';

// function App() {
//   const [data, setData] = React.useState([]);
  
//   React.useEffect(() => {
//     fetchData().then(setData);
//   }, []);
  
//   return (
//     <div className="app">
//       <Header />
//       <main>
//         {data.map(item => (
//           <Button key={item.id}>{item.name}</Button>
//         ))}
//       </main>
//       <Footer />
//     </div>
//   );
// }

// export default App;`;
//     }
    
//     if (fileName === 'Button.jsx') {
//       return `import React from 'react';
// import './styles.css';

// const Button = ({ children, onClick, variant = 'primary' }) => {
//   return (
//     <button 
//       className={\`btn btn-\${variant}\`}
//       onClick={onClick}
//     >
//       {children}
//     </button>
//   );
// };

// export default Button;`;
//     }
    
//     if (fileName === 'api.js') {
//       return `import axios from 'axios';
// import { formatParams } from './utils';

// const API_URL = 'https://api.example.com';

// export const fetchData = async () => {
//   const response = await axios.get(\`\${API_URL}/data\`);
//   return response.data;
// };

// export const postData = async (data) => {
//   const response = await axios.post(\`\${API_URL}/data\`, data);
//   return response.data;
// };`;
//     }
    
//     return `// Sample content for ${fileName}`;
//   };

//   // Mock commit history
//   const getMockCommitHistory = (fileName) => {
//     return [
//       {
//         date: '2024-03-15',
//         author: 'John Doe',
//         message: `Fixed bug in ${fileName}`,
//       },
//       {
//         date: '2024-03-10',
//         author: 'Jane Smith',
//         message: `Added new feature`,
//       }
//     ];
//   };

//   // Handle chat messages with Groq
//   const handleSendMessage = async (message) => {
//     // Add user message
//     setChatMessages(prev => [...prev, { role: 'user', content: message }]);

//     // Show typing indicator
//     setChatMessages(prev => [...prev, { role: 'ai', content: '...', isLoading: true }]);

//     try {
//       // Get response from Groq
//       let response;
      
//       if (selectedFile) {
//         // File-specific question
//         response = await askGroq(
//           message, 
//           fileContent, 
//           selectedFile.name, 
//           fileHistory,
//           getRepoContext()
//         );
//       } else {
//         // General question with repo context
//         response = await askGroq(
//           message, 
//           null, 
//           'general', 
//           [],
//           getRepoContext()
//         );
//       }
      
//       // Remove typing indicator and add response
//       setChatMessages(prev => [
//         ...prev.filter(msg => !msg.isLoading), 
//         { role: 'ai', content: response }
//       ]);
//     } catch (error) {
//       console.error('Chat error:', error);
//       setChatMessages(prev => [
//         ...prev.filter(msg => !msg.isLoading), 
//         { role: 'ai', content: '❌ Sorry, I encountered an error. Please try again.' }
//       ]);
//     }
//   };

//   // Reset everything
//   const handleNewAnalysis = () => {
//     setRepoData(null);
//     setSelectedFile(null);
//     setChatMessages([{
//       role: 'ai',
//       content: '👋 Hello! I can help you understand this codebase.\n\n💡 **Try asking:**\n• "How many files are there?"\n• "Show me complex files"\n• "What dependencies exist?"\n\n📌 Click any file on the left for specific questions!\n\n📚 **New:** Click the "KT Document" button to generate documentation!'
//     }]);
//     setMermaidCode('');
//     setGithubUrl('');
//     setShowKTModal(false);
//   };

//   // If no repo data, show upload screen
//   if (!repoData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
//         <div className="max-w-4xl mx-auto px-6 py-16">
//           <div className="text-center space-y-6 mb-12">
//             <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mx-auto flex items-center justify-center">
//               <MapPin className="w-10 h-10 text-white" />
//             </div>
//             <h1 className="text-4xl font-bold text-white">Codebase Archaeologist</h1>
//             <p className="text-xl text-slate-400">
//               Visualize, analyze, and generate documentation for any GitHub repository
//             </p>
//           </div>

//           <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
//             <label className="block text-sm font-medium text-slate-300 mb-2">
//               GitHub Repository URL
//             </label>
//             <input
//               type="text"
//               placeholder="https://github.com/username/repository"
//               value={githubUrl}
//               onChange={(e) => setGithubUrl(e.target.value)}
//               className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 mb-4"
//             />
            
//             <button
//               onClick={analyzeRepo}
//               disabled={isLoading}
//               className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
//             >
//               <Zap className="w-5 h-5" />
//               {isLoading ? 'Analyzing...' : 'Analyze Repository'}
//             </button>

//             {isLoading && (
//               <div className="mt-4">
//                 <div className="flex justify-between text-sm mb-2">
//                   <span className="text-slate-300">Fetching repository data...</span>
//                   <span className="text-cyan-400">{Math.round(progress)}%</span>
//                 </div>
//                 <div className="w-full bg-slate-700/50 rounded-full h-2">
//                   <div
//                     className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full transition-all"
//                     style={{ width: `${progress}%` }}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
//             {[
//               { icon: Github, label: 'GitHub Integration' },
//               { icon: Network, label: 'Dependency Maps' },
//               { icon: BarChart3, label: 'Complexity Analysis' },
//               { icon: BookOpen, label: 'KT Documentation' },
//             ].map((feature, idx) => {
//               const Icon = feature.icon;
//               return (
//                 <div key={idx} className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4 text-center">
//                   <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
//                   <p className="text-xs text-slate-400">{feature.label}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Main dashboard
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
//       {/* Header */}
//       <header className="border-b border-slate-700/50 bg-slate-950/50 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
//               <MapPin className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-white">{repoData.name}</h1>
//               <p className="text-xs text-slate-400 truncate max-w-md">{repoData.url}</p>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-3">
//             {selectedFile && (
//               <div className="flex items-center gap-2 bg-cyan-600/20 px-3 py-1 rounded-lg">
//                 <FileText className="w-4 h-4 text-cyan-400" />
//                 <span className="text-sm text-cyan-400">{selectedFile.name}</span>
//               </div>
//             )}
            
//             {/* KT Document Button */}
//             <KTButton 
//               onClick={handleGenerateKT}
//               disabled={!repoData}
//               selectedFile={selectedFile}
//             />
            
//             <button
//               onClick={handleNewAnalysis}
//               className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2"
//             >
//               <GitBranch className="w-4 h-4" />
//               New Analysis
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main content */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         {/* Stats */}
//         <div className="grid grid-cols-5 gap-4 mb-8">
//           <StatsCard icon={Code} label="Total Files" value={repoData.stats.totalFiles} />
//           <StatsCard icon={BarChart3} label="Total Lines" value={repoData.stats.totalLines} color="green" />
//           <StatsCard icon={AlertTriangle} label="Complexity" value={`${repoData.stats.complexity}%`} color="orange" />
//           <StatsCard icon={AlertTriangle} label="Tech Debt" value={`${repoData.stats.techDebt}%`} color="red" />
//           <StatsCard icon={Network} label="Dependencies" value={repoData.dependencies.length} color="blue" />
//         </div>

//         {/* Main grid */}
//         <div className="grid grid-cols-3 gap-8">
//           {/* Left column - File list */}
//           <div className="col-span-1">
//             <FileList 
//               files={repoData.files} 
//               onFileSelect={handleFileSelect} 
//               selectedFile={selectedFile} 
//             />
//           </div>

//           {/* Right column - Visualization and chat */}
//           <div className="col-span-2 space-y-8">
//             {/* Tabs */}
//             <div className="flex gap-2 border-b border-slate-700/50 pb-2">
//               <button
//                 onClick={() => setActiveTab('visualization')}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                   activeTab === 'visualization'
//                     ? 'bg-cyan-600 text-white'
//                     : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
//                 }`}
//               >
//                 Visualization
//               </button>
//               <button
//                 onClick={() => setActiveTab('chat')}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                   activeTab === 'chat'
//                     ? 'bg-cyan-600 text-white'
//                     : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
//                 }`}
//               >
//                 Chat
//               </button>
//             </div>

//             {/* Visualization - Shows diagram */}
//             {activeTab === 'visualization' && (
//               <MermaidDiagram 
//                 code={mermaidCode} 
//                 filename={`${repoData.name}_${selectedFile?.name || 'complete'}`}
//               />
//             )}

//             {/* Chat - Always working */}
//             {activeTab === 'chat' && (
//               <ChatPanel 
//                 messages={chatMessages}
//                 onSendMessage={handleSendMessage}
//                 selectedFile={selectedFile}
//               />
//             )}
//           </div>
//         </div>
//       </main>

//       {/* KT Document Modal */}
//       <KTDocumentModal
//         isOpen={showKTModal}
//         onClose={() => setShowKTModal(false)}
//         content={ktDocument}
//         title={ktTitle}
//       />
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { 
  Github, MapPin, Code, BarChart3, AlertTriangle, 
  Network, MessageSquare, Zap, GitBranch, FileText,
  BookOpen, Loader
} from 'lucide-react';

import MermaidDiagram from './components/MermaidDiagram';
import FileList from './components/FileList';
import ChatPanel from './components/ChatPanel';
import StatsCard from './components/StatsCard';
import KTButton from './components/KTButton';
import KTDocumentModal from './components/KTDocumentModal';

import { 
  parseGithubUrl, 
  fetchRepoData, 
  fetchAllFiles, 
  fetchFileContent, 
  fetchFileCommits,
  analyzeDependencies,
  calculateComplexity,
  findIssues
} from './services/githubService';

import { generateCompleteDiagram, generateFileDiagram } from './services/mermaidGenerator';
import { generateKTDocument } from './services/ktGeneratorService';

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      content: '👋 Hello! I can help you understand this codebase.\n\nEnter a GitHub URL above to get started!'
    }
  ]);
  const [activeTab, setActiveTab] = useState('visualization');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [fileCommits, setFileCommits] = useState([]);
  const [fileContents, setFileContents] = useState({});
  
  // KT Document state
  const [showKTModal, setShowKTModal] = useState(false);
  const [ktDocument, setKtDocument] = useState('');
  const [ktTitle, setKtTitle] = useState('');

  // Analyze repository
  const analyzeRepo = async () => {
    if (!githubUrl) {
      alert('Please enter a GitHub URL');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setProgressMessage('Parsing GitHub URL...');

    try {
      const { owner, repo } = parseGithubUrl(githubUrl);
      
      setProgress(10);
      setProgressMessage('Fetching repository info...');
      
      // Fetch basic repo data
      const repoInfo = await fetchRepoData(owner, repo);
      
      setProgress(30);
      setProgressMessage('Fetching all files...');
      
      // Fetch all files
      const files = await fetchAllFiles(owner, repo);
      
      setProgress(50);
      setProgressMessage('Analyzing file contents...');
      
      // Fetch content for each file
      const contents = {};
      for (let i = 0; i < Math.min(files.length, 20); i++) {
        const file = files[i];
        const content = await fetchFileContent(owner, repo, file.path);
        contents[file.path] = content;
        
        // Update progress
        setProgress(50 + Math.floor((i / files.length) * 30));
      }
      
      setFileContents(contents);
      
      setProgress(80);
      setProgressMessage('Analyzing dependencies...');
      
      // Calculate complexity and issues for each file
      const filesWithDetails = files.map(file => ({
        ...file,
        lines: contents[file.path] ? contents[file.path].split('\n').length : 0,
        complexity: calculateComplexity(contents[file.path]),
        issues: findIssues(contents[file.path])
      }));
      
      // Analyze dependencies
      const dependencies = analyzeDependencies(filesWithDetails, contents);
      
      setProgress(90);
      setProgressMessage('Generating visualization...');
      
      // Calculate language percentages
      const languages = {};
      filesWithDetails.forEach(file => {
        const ext = file.name.split('.').pop();
        if (ext) {
          languages[ext] = (languages[ext] || 0) + 1;
        }
      });
      
      // Convert to percentages
      const totalFiles = filesWithDetails.length;
      const langPercentages = {};
      Object.entries(languages).forEach(([lang, count]) => {
        langPercentages[lang] = Math.round((count / totalFiles) * 100);
      });
      
      // Calculate overall complexity
      const avgComplexity = filesWithDetails.reduce((sum, f) => sum + f.complexity, 0) / filesWithDetails.length;
      const totalIssues = filesWithDetails.reduce((sum, f) => sum + f.issues, 0);
      
      const repoStats = {
        name: repoInfo.name,
        full_name: repoInfo.full_name,
        url: githubUrl,
        owner,
        repo,
        description: repoInfo.description,
        stars: repoInfo.stars,
        forks: repoInfo.forks,
        files: filesWithDetails,
        dependencies,
        stats: {
          totalFiles: filesWithDetails.length,
          totalLines: filesWithDetails.reduce((sum, f) => sum + f.lines, 0),
          languages: langPercentages,
          complexity: Math.round(avgComplexity * 10),
          techDebt: Math.min(100, totalIssues * 5)
        }
      };

      setRepoData(repoStats);

      // Generate complete diagram
      const code = generateCompleteDiagram(filesWithDetails, dependencies, repoInfo.name);
      setMermaidCode(code);

      setProgress(100);
      setProgressMessage('Analysis complete!');

      setChatMessages([{
        role: 'ai',
        content: `✅ Analysis complete for **${repoInfo.name}**!

📊 **Statistics:**
• Total files: ${filesWithDetails.length}
• Total dependencies: ${dependencies.length}
• Languages: ${Object.keys(langPercentages).slice(0, 3).join(', ')}
• Complexity: ${Math.round(avgComplexity * 10)}%

💡 **What you can do:**
• Select any file from the left panel
• Ask questions about the code
• Generate KT documentation`
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
    
    // Get file content from stored contents
    const content = fileContents[file.path] || '';
    setFileContent(content);
    
    // Fetch commit history if available
    if (repoData) {
      const commits = await fetchFileCommits(repoData.owner, repoData.repo, file.path);
      setFileCommits(commits);
    }
    
    // Generate file-specific diagram
    const code = generateFileDiagram(file, repoData?.dependencies || []);
    setMermaidCode(code);
    
    // Stay in visualization tab
    setActiveTab('visualization');
    
    // Add a message about file selection
    setChatMessages(prev => [...prev, {
      role: 'ai',
      content: `📄 You selected **${file.name}**\n\n**File info:**\n• Lines: ${file.lines}\n• Complexity: ${file.complexity}/10\n• Issues: ${file.issues}\n\nAsk me specific questions about this file!`
    }]);
  };

  // Handle KT Document generation
  const handleGenerateKT = () => {
    if (!repoData) return;
    
    const document = generateKTDocument(repoData, selectedFile, fileContents);
    setKtDocument(document);
    
    if (selectedFile) {
      setKtTitle(`KT - ${selectedFile.name}`);
    } else {
      setKtTitle(`KT - ${repoData.name} (Complete)`);
    }
    
    setShowKTModal(true);
  };

  // Handle chat messages
  const handleSendMessage = (message) => {
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);

    // Show typing indicator
    setChatMessages(prev => [...prev, { role: 'ai', content: '...', isLoading: true }]);

    // Generate response
    setTimeout(() => {
      let response = '';
      
      if (selectedFile) {
        // File-specific response
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('function') || lowerMsg.includes('method')) {
          const functions = (fileContent.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []);
          response = `**Functions in ${selectedFile.name}:**\n\n${functions.length > 0 ? functions.map(f => `• \`${f}\``).join('\n') : 'No functions found.'}`;
        }
        else if (lowerMsg.includes('purpose') || lowerMsg.includes('do')) {
          response = `**Purpose of ${selectedFile.name}:**\n\nThis file appears to be a ${selectedFile.name.includes('.jsx') ? 'React component' : 'JavaScript module'}. It contains ${selectedFile.lines} lines of code with complexity ${selectedFile.complexity}/10.`;
        }
        else if (lowerMsg.includes('import') || lowerMsg.includes('dependency')) {
          const imports = (fileContent.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || []);
          response = `**Dependencies in ${selectedFile.name}:**\n\n${imports.length > 0 ? imports.map(i => `• \`${i}\``).join('\n') : 'No imports found.'}`;
        }
        else {
          response = `I can help you with ${selectedFile.name}! Try asking:\n• "What functions are in this file?"\n• "What is the purpose?"\n• "Show me imports"`;
        }
      } else {
        // General response
        if (!repoData) {
          response = "Please enter a GitHub URL first to analyze a repository.";
        } else {
          response = `I can help you with this repository! Try:\n• Selecting a file from the left\n• Asking "How many files?"\n• Asking "What languages are used?"`;
        }
      }
      
      setChatMessages(prev => [...prev.filter(msg => !msg.isLoading), { role: 'ai', content: response }]);
    }, 500);
  };

  // Reset everything
  const handleNewAnalysis = () => {
    setRepoData(null);
    setSelectedFile(null);
    setFileContents({});
    setChatMessages([{
      role: 'ai',
      content: '👋 Hello! I can help you understand this codebase.\n\nEnter a GitHub URL above to get started!'
    }]);
    setMermaidCode('');
    setGithubUrl('');
    setShowKTModal(false);
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
              Visualize, analyze, and document any public GitHub repository
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              GitHub Repository URL
            </label>
            <input
              type="text"
              placeholder="https://github.com/facebook/react"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 mb-4"
            />
            
            <button
              onClick={analyzeRepo}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {isLoading ? progressMessage : 'Analyze Repository'}
            </button>

            {isLoading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">{progressMessage}</span>
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

          <div className="text-center text-sm text-slate-500 mt-4">
            <p>⚡ Works with any public GitHub repository</p>
            <p className="mt-1">Example: https://github.com/facebook/react</p>
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
                <span className="text-sm text-cyan-400">{selectedFile.name}</span>
              </div>
            )}
            
            {/* KT Document Button */}
            <KTButton 
              onClick={handleGenerateKT}
              disabled={!repoData}
              selectedFile={selectedFile}
            />
            
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
                Chat
              </button>
            </div>

            {/* Visualization - Shows diagram */}
            {activeTab === 'visualization' && (
              <MermaidDiagram 
                code={mermaidCode} 
                filename={`${repoData.name}_${selectedFile?.name || 'complete'}`}
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

      {/* KT Document Modal */}
      {showKTModal && (
        <KTDocumentModal
          isOpen={showKTModal}
          onClose={() => setShowKTModal(false)}
          content={ktDocument}
          title={ktTitle}
        />
      )}
    </div>
  );
}

export default App;