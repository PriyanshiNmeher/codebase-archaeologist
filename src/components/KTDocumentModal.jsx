import React, { useState } from 'react';
import { FileText, Download, Copy, Check, X, File, BookOpen } from 'lucide-react';

const KTDocumentModal = ({ isOpen, onClose, content, title }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_KT.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">Knowledge Transfer Document</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'preview'
                ? 'bg-emerald-600/20 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'raw'
                ? 'bg-emerald-600/20 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <File className="w-4 h-4 inline mr-2" />
            Raw Markdown
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'preview' ? (
            <div className="prose prose-invert max-w-none">
              <div className="bg-slate-700/30 rounded-lg p-6">
                {content.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-2xl font-bold text-white mb-4">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-xl font-semibold text-emerald-400 mt-6 mb-3">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-lg font-medium text-cyan-400 mt-4 mb-2">{line.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={idx} className="text-slate-300 ml-4 mb-1">{line.substring(2)}</li>;
                  } else if (line.startsWith('|')) {
                    // Simple table handling
                    if (idx === 0 || line.includes('|---')) {
                      return null;
                    }
                    const cells = line.split('|').filter(c => c.trim());
                    return (
                      <div key={idx} className="grid grid-cols-3 gap-4 border-b border-slate-600 py-2">
                        {cells.map((cell, i) => (
                          <span key={i} className="text-slate-300">{cell.trim()}</span>
                        ))}
                      </div>
                    );
                  } else if (line.startsWith('```')) {
                    return <pre key={idx} className="bg-slate-900 p-4 rounded-lg overflow-x-auto my-4"><code className="text-sm text-cyan-300">{line}</code></pre>;
                  } else if (line.trim()) {
                    return <p key={idx} className="text-slate-300 mb-2">{line}</p>;
                  }
                  return <br key={idx} />;
                })}
              </div>
            </div>
          ) : (
            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm text-slate-300 font-mono whitespace-pre-wrap">
              {content}
            </pre>
          )}
        </div>

        {/* Footer with actions */}
        <div className="bg-slate-700/50 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            <BookOpen className="w-4 h-4 inline mr-1" />
            KT Document - Share with new team members
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download MD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KTDocumentModal;