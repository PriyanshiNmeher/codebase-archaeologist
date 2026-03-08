import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText } from 'lucide-react';

const ChatPanel = ({ messages = [], onSendMessage, selectedFile }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const safeMessages = messages || [];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [safeMessages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage?.(input);
      setInput('');
    }
  };

  // Filter out loading messages
  const displayMessages = safeMessages.filter(msg => !msg.isLoading);

  return (
    <div className="flex flex-col h-[600px] bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-600/50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-white">Code Assistant</span>
          {selectedFile && (
            <div className="ml-2 flex items-center gap-1 bg-cyan-600/20 px-2 py-1 rounded">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-400 truncate max-w-[150px]">
                {selectedFile.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400">Ask me anything about the codebase!</p>
            <p className="text-sm mt-2 text-slate-500">
              💡 Try: "What files are there?" or "Show me complex files"
            </p>
          </div>
        ) : (
          displayMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg?.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg?.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700/50 text-slate-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {msg?.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {msg?.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {msg?.content || ''}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {safeMessages.some(msg => msg.isLoading) && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - ALWAYS ENABLED */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700/50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about the codebase..."
            className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              input.trim()
                ? 'bg-cyan-600 hover:bg-cyan-500' 
                : 'bg-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {selectedFile ? (
          <p className="text-xs text-cyan-400/70 mt-2 text-center">
            💬 Currently asking about: {selectedFile.name}
          </p>
        ) : (
          <p className="text-xs text-slate-500 mt-2 text-center">
            💬 No file selected - I can still answer general questions!
          </p>
        )}
      </form>
    </div>
  );
};

export default ChatPanel;