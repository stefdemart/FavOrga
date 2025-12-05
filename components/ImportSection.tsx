import React, { useRef, useState } from "react";
import { BookmarkSource } from "../services/types";
import { Upload, FilePlus, RefreshCcw, Chrome, Globe, Compass, AppWindow } from "lucide-react";

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
      // Simulate small delay for UI feedback
      await new Promise(r => setTimeout(r, 600));
      await onImport(e.target.files[0], source, mode);
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const getIcon = (s: BookmarkSource) => {
     switch(s) {
       case 'chrome': return <Chrome size={18} className="text-blue-600"/>;
       case 'edge': return <AppWindow size={18} className="text-blue-800"/>;
       case 'firefox': return <Globe size={18} className="text-orange-600"/>;
       case 'safari': return <Compass size={18} className="text-blue-400"/>;
       default: return <Globe size={18} className="text-slate-600"/>;
     }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
        <Upload className="w-6 h-6 text-blue-600" /> Importer des favoris
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">1. Source du fichier</label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {getIcon(source)}
             </div>
             <select 
              value={source} 
              onChange={(e) => setSource(e.target.value as BookmarkSource)}
              className="w-full pl-10 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-slate-50"
            >
              <option value="chrome">Google Chrome</option>
              <option value="edge">Microsoft Edge</option>
              <option value="firefox">Mozilla Firefox</option>
              <option value="safari">Safari</option>
              <option value="other">Autre / Netscape HTML</option>
            </select>
          </div>
        </div>

        <div>
           <label className="block text-sm font-semibold text-slate-700 mb-3">2. Stratégie d'import</label>
           <div className="flex gap-3">
              <button 
                onClick={() => setMode("merge")}
                className={`flex-1 py-3 px-3 rounded-lg text-sm border transition-all ${mode === 'merge' ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="font-bold flex items-center justify-center gap-1.5"><FilePlus size={16}/> Fusionner</div>
                <div className="text-[10px] opacity-75 text-center mt-1">Ajoute sans doublons</div>
              </button>
              <button 
                onClick={() => setMode("master")}
                 className={`flex-1 py-3 px-3 rounded-lg text-sm border transition-all ${mode === 'master' ? 'bg-red-50 border-red-500 text-red-800 shadow-sm ring-1 ring-red-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="font-bold flex items-center justify-center gap-1.5"><RefreshCcw size={16}/> Master</div>
                <div className="text-[10px] opacity-75 text-center mt-1">Remplace tout</div>
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2 h-[50px] shadow-lg"
          >
            {isProcessing ? (
              <>
                 <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                 Analyse...
              </>
            ) : (
              "Sélectionner le fichier HTML"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};