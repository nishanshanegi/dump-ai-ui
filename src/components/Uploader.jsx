import { useState } from 'react';
import api from '../services/api';
import { UploadCloud, X, CheckCircle2, AlertCircle, Type, FileUp, Sparkles } from 'lucide-react';

export default function Uploader({ onClose }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'note'
  const [file, setFile] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // --- LOGIC: HANDLE FILE UPLOAD ---
  const handleFileUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (err) {
      setStatus('error');
      setErrorMessage("File upload failed. Please try again.");
    }
  };

  // --- LOGIC: HANDLE TEXT INGESTION ---
  const handleNoteIngest = async () => {
    if (!noteContent.trim()) return;
    setStatus('uploading');

    try {
      await api.post('/ingest', {
        content_type: 'text',
        title: noteTitle || 'Quick Note',
        content: noteContent
      });
      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (err) {
      setStatus('error');
      setErrorMessage("Note saving failed. Please check your connection.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-[100] p-6 font-['Nunito']">
      <div className="bg-white w-full max-w-xl rounded-[50px] shadow-2xl p-12 relative border border-slate-50 animate-in zoom-in-95 duration-300">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-10 top-10 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Sync Knowledge</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
            Add new memory to your decentralized brain
          </p>

          {/* TABS SELECTOR (Soft UI Style) */}
          <div className="flex bg-slate-50 p-2 rounded-[24px] mt-8 w-fit mx-auto border border-slate-100">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex items-center space-x-2 px-8 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'file'
                ? 'bg-white text-[#F0AA67] shadow-md shadow-orange-100'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <FileUp size={16} /> <span>File</span>
            </button>
            <button
              onClick={() => setActiveTab('note')}
              className={`flex items-center space-x-2 px-8 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'note'
                ? 'bg-white text-[#F0AA67] shadow-md shadow-orange-100'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Type size={16} /> <span>Note</span>
            </button>
          </div>
        </div>

        {status === 'success' ? (
          <div className="py-12 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-[#F0AA67]" />
            </div>
            <p className="font-black text-slate-800 text-xl tracking-tight">Knowledge Synced!</p>
            <p className="text-slate-400 text-sm mt-2 font-semibold">The AI worker is processing your data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'file' ? (
              /* FILE UPLOAD VIEW */
              <label className="border-2 border-dashed border-slate-100 rounded-[40px] p-16 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-orange-200 transition-all group">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-[#F0AA67]" />
                </div>
                <p className="text-sm font-black text-slate-700 tracking-tight">
                  {file ? file.name : "Select Document or Image"}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                  Supports <span className="text-[#F0AA67]">PDF, PNG, JPG</span> (Max 10MB)
                </p>
                <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} />
              </label>
            ) : (
              /* TEXT NOTE VIEW */
              <div className="space-y-4">
                <input
                  className="w-full bg-slate-100 p-5 rounded-2xl border-none outline-none focus:ring-4 ring-orange-50 text-sm font-bold text-slate-800 placeholder:text-slate-400"
                  placeholder="Give this note a title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />

                <textarea
                  className="w-full bg-slate-100 p-6 rounded-[32px] border-none outline-none focus:ring-4 ring-orange-50 text-sm font-semibold text-slate-700 placeholder:text-slate-400 min-h-[160px] resize-none"
                  placeholder="Paste or type your raw knowledge here (e.g. WiFi passwords, meeting snippets)..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
            )}

            {/* Error Message */}
            {status === 'error' && (
              <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={activeTab === 'file' ? handleFileUpload : handleNoteIngest}
              disabled={status === 'uploading' || (activeTab === 'file' && !file) || (activeTab === 'note' && !noteContent)}
              className="w-full bg-slate-900 text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-30 flex items-center justify-center space-x-2"
            >
              {status === 'uploading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>

                  <span>Add to Knowledge Vault</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}