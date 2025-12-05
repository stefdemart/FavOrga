import React, { useRef, useState } from "react";
import { BookmarkSource } from "../services/types";
import { Upload, FilePlus, RefreshCcw } from "lucide-react";

interface ImportSectionProps {
  onImport: (file: File, source: BookmarkSource, mode: "master" | "merge") => Promise<void>;
}

export const ImportSection: React.FC<ImportSectionProps> = ({ onImport }) => {
  const [source, setSource] = useState<BookmarkSource>("chrome");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"master" | "merge">("merge");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      await onImport(e.target.files[0], source, mode);
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
        <Upload className="w-5 h-5" /> Importer des favoris
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Source du fichier</label>
          <select 
            value={source} 
            onChange={(e) => setSource(e.target.value as BookmarkSource)}
            className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="chrome">Google Chrome</option>
            <option value="edge">Microsoft Edge</option>
            <option value="firefox">Mozilla Firefox</option>
            <option value="safari">Safari</option>
            <option value="other">Autre (Format Netscape HTML)</option>
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">Mode d'import</label>
           <div className="flex gap-2">
              <button 
                onClick={() => setMode("merge")}
                className={`flex-1 py-2 px-3 rounded text-sm border ${mode === 'merge' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-300 text-slate-600'}`}
              >
                <div className="font-bold flex items-center justify-center gap-1"><FilePlus size={14}/> Fusionner</div>
                <div className="text-[10px] opacity-75">Ajoute les nouveaux</div>
              </button>
              <button 
                onClick={() => setMode("master")}
                 className={`flex-1 py-2 px-3 rounded text-sm border ${mode === 'master' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-300 text-slate-600'}`}
              >
                <div className="font-bold flex items-center justify-center gap-1"><RefreshCcw size={14}/> Master</div>
                <div className="text-[10px] opacity-75">Remplace tout</div>
              </button>
           </div>
        </div>

        <div className="flex items-end">
          <input 
            type="file" 
            accept=".html,.htm" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2 h-[42px]"
          >
            {isProcessing ? "Traitement..." : "Sélectionner le fichier HTML"}
          </button>
        </div>
      </div>
    </div>
  );
};
