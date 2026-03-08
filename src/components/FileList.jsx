import React from 'react';
import { File, Folder, AlertCircle, CheckCircle } from 'lucide-react';

const FileList = ({ files = [], onFileSelect, selectedFile }) => {
  const safeFiles = files || [];
  
  if (safeFiles.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
        <File className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No files to display</p>
        <p className="text-xs text-slate-500 mt-2">Analyze a repository first</p>
      </div>
    );
  }

  // Group files by folder
  const groupedFiles = {};
  safeFiles.forEach(file => {
    if (file && file.path) {
      const folder = file.path.split('/')[0] || 'root';
      if (!groupedFiles[folder]) groupedFiles[folder] = [];
      groupedFiles[folder].push(file);
    }
  });

  return (
    <div className="space-y-4">
      <div className="bg-slate-700/30 rounded-lg p-3 mb-2">
        <p className="text-sm text-slate-300">
          <span className="font-bold text-cyan-400">{safeFiles.length}</span> files found
        </p>
        <p className="text-xs text-slate-400 mt-1">Click any file to ask questions about it</p>
      </div>

      {Object.entries(groupedFiles).map(([folder, folderFiles]) => (
        <div key={folder} className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="bg-slate-700/50 px-4 py-2 flex items-center gap-2">
            <Folder className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-white">{folder}/</span>
            <span className="text-xs text-slate-400 ml-auto">{folderFiles.length} files</span>
          </div>
          
          <div className="divide-y divide-slate-700/50 max-h-[400px] overflow-y-auto">
            {folderFiles.map((file, idx) => {
              const isSelected = selectedFile?.name === file.name;
              
              return (
                <div
                  key={idx}
                  onClick={() => onFileSelect?.(file)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-cyan-600/20 border-l-2 border-cyan-400' 
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <File className="w-4 h-4 text-cyan-400" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                          {file?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-400">{file?.path || 'No path'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">{file?.lines || '?'} lines</span>
                      {file?.issues > 0 && (
                        <span className="text-orange-400" title={`${file.issues} issues`}>
                          <AlertCircle className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;