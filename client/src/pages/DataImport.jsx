import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldAlert, 
  FileJson,
  Calendar,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function DataImport() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [datasets, setDatasets] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  const fetchDatasets = async () => {
    try {
      const res = await api.get('/dashboard/datasets');
      setDatasets(res.data);
    } catch (err) {
      console.error('Error fetching datasets list:', err);
    } finally {
      setLoadingDatasets(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // Format bytes to human readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Drag handers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMsg('');
    setSuccessMsg('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  };

  const handleFileChange = (e) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const validateAndSelectFile = (file) => {
    const isCsv = file.name.endsWith('.csv');
    const isJson = file.name.endsWith('.json');
    if (!isCsv && !isJson) {
      setErrorMsg('Invalid file format. Please upload either a CSV (.csv) or JSON (.json) file.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsUploading(true);
    setUploadProgress(15);

    const formData = new FormData();
    formData.append('file', selectedFile);

    // Simulate animated loading progress steps
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) {
          clearInterval(timer);
          return 85;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const res = await api.post('/data/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      clearInterval(timer);
      setUploadProgress(100);
      
      setTimeout(() => {
        setSuccessMsg(`Import Complete! Parsed and dynamically added ${res.data.importedRowsCount} datapoints from ${selectedFile.name}.`);
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        fetchDatasets(); // Refresh list
      }, 300);

    } catch (err) {
      clearInterval(timer);
      setIsUploading(false);
      setUploadProgress(0);
      setErrorMsg(err.message || 'Import operation failed. Validate schema matching.');
    }
  };

  return (
    <div className="space-y-8 animate-slide">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Upload Spreadsheet Datasets</h2>
        <p className="text-xs text-gray-400 mt-0.5">Drag-and-drop metrics files to compile aggregated revenue, customer conversion, and signups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Uploader card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 shadow-glass">
            <form onSubmit={handleImportSubmit} className="space-y-6">
              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  dragActive 
                    ? 'border-brand-primary bg-brand-primary/10 shadow-glass-glow' 
                    : selectedFile 
                      ? 'border-brand-accent/50 bg-brand-accent/5' 
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".csv,.json"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                
                {selectedFile ? (
                  selectedFile.name.endsWith('.json') ? (
                    <FileJson className="w-12 h-12 text-brand-secondary mb-4 animate-pulse-subtle" />
                  ) : (
                    <FileSpreadsheet className="w-12 h-12 text-brand-accent mb-4 animate-pulse-subtle" />
                  )
                ) : (
                  <UploadCloud className="w-12 h-12 text-gray-500 mb-4" />
                )}

                {selectedFile ? (
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-white block">{selectedFile.name}</span>
                    <span className="text-xs text-gray-400 block">{formatBytes(selectedFile.size)}</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <span className="text-sm font-semibold text-white block">Drag and drop your spreadsheet here</span>
                    <span className="text-xs text-gray-400 block">or click to browse local files (Supports CSV or JSON)</span>
                  </div>
                )}
              </div>

              {/* Progress Bar Indicator */}
              {isUploading && (
                <div className="space-y-2 animate-fade">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-400">Parsing and parsing datapoints...</span>
                    <span className="text-brand-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Feedback Alerts */}
              {successMsg && (
                <div className="p-4 rounded-xl bg-brand-accent/15 border border-brand-accent/25 text-brand-accent flex items-start gap-3 text-xs font-semibold animate-fade">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger flex items-start gap-3 text-xs font-semibold animate-fade">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit trigger */}
              {selectedFile && !isUploading && (
                <button
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-glass-glow transition-all animate-fade"
                >
                  <Database className="w-4 h-4" />
                  <span>Parse and Compile Dataset metrics</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right 1 Column: File format tips */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Schema Guidelines</span>
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Ensure your file conforms to the structure below to guarantee successful compiling.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="font-bold text-white block mb-1">Required Headers:</span>
              <ul className="list-disc pl-4 text-gray-400 space-y-1 text-[11px]">
                <li><code className="text-brand-primary font-bold">date</code> - YYYY-MM-DD format</li>
                <li><code className="text-brand-primary font-bold">revenue</code> - Sales billing (decimal/number)</li>
                <li><code className="text-brand-primary font-bold">sales</code> - Total volume quantity (integer)</li>
                <li><code className="text-brand-primary font-bold">signups</code> - Account acquisitions (integer)</li>
              </ul>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="font-bold text-white block mb-1">Optional Headers:</span>
              <ul className="list-disc pl-4 text-gray-400 space-y-1 text-[11px]">
                <li><code className="text-brand-secondary font-bold">category</code> - e.g. Software, Consulting</li>
                <li><code className="text-brand-secondary font-bold">segment</code> - e.g. Enterprise, SMB, Consumer</li>
                <li><code className="text-brand-secondary font-bold">conversion_rate</code> - Conversion percentage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Historically uploaded Datasets list */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass">
        <h3 className="text-base font-bold text-white tracking-tight mb-4">Historical Imports</h3>
        
        {loadingDatasets ? (
          <div className="h-20 flex items-center justify-center text-xs text-gray-500 font-semibold">
            Fetching uploads history...
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500 font-semibold">
            No history recorded. Compile your first dataset today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-dark-border text-gray-400 font-semibold">
                  <th className="py-3 px-4">Dataset Name</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Parsed Rows</th>
                  <th className="py-3 px-4">Import Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-gray-300 font-medium">
                {datasets.map((ds) => (
                  <tr key={ds.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3.5 px-4 font-bold text-white">{ds.name}</td>
                    <td className="py-3.5 px-4 text-gray-400">{ds.file_name}</td>
                    <td className="py-3.5 px-4">{formatBytes(ds.file_size)}</td>
                    <td className="py-3.5 px-4 text-brand-primary font-bold">{ds.row_count} rows</td>
                    <td className="py-3.5 px-4">{formatDate(ds.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
