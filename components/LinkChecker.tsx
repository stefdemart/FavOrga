import React, { useState, useRef } from "react";
import { Bookmark, LinkCheckResult } from "../services/types";
import { checkLinksInBatches } from "../services/linkCheckerService";
import { Play, Pause, RotateCcw, Activity, Trash2, ExternalLink } from "lucide-react";

interface LinkCheckerProps {
  bookmarks: Bookmark[];
  onUpdateStatus: (results: LinkCheckResult[]) => void;
  onDelete: (id: string) => void; // Added delete capability
}

export const LinkChecker: React.FC<LinkCheckerProps> = ({ bookmarks, onUpdateStatus, onDelete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const generatorRef = useRef<AsyncGenerator<LinkCheckResult[], void, unknown> | null>(null);

  const startCheck = async () => {
    setIsRunning(true);
    const toCheck = bookmarks.map(b => ({ id: b.id, url: b.url }));
    
    if (!generatorRef.current) {
        generatorRef.current = checkLinksInBatches(toCheck);
    }

    try {
       while(isRunning) {
          if (!generatorRef.current) break; 
          const next = await generatorRef.current.next();
          if (next.done) {
             setIsRunning(false);
             generatorRef.current = null;
             break;
          }
          onUpdateStatus(next.value);
          setProgress(p => p + next.value.length);
       }
    } catch (e) {
       console.error(e);
       setIsRunning(false);
    }
  };
  
  const handleStart = async () => {
      if (isRunning) return;
      setIsRunning(true);
      
      const toCheck = bookmarks.filter(b => b.linkStatus === 'unknown');
      if (toCheck.length === 0) {
          alert("Tout a déjà été vérifié ou réinitialisez les status.");
          setIsRunning(false);
          return;
      }

      const iterator = checkLinksInBatches(toCheck.map(b => ({id: b.id, url: b.url})));
      
      for await (const batch of iterator) {
          onUpdateStatus(batch);
          setProgress(prev => prev + batch.length);
      }
      setIsRunning(false);
  };

  const handleReset = () => {
      setProgress(0);
      setIsRunning(false);
  };

  const suspects = bookmarks.filter(b => b.linkStatus === 'suspect' || b.linkStatus === 'dead');

  return (
    <div className="bg-white rounded-lg shadow p-6">
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-blue-500" /> Diagnostic de disponibilité
         </h2>
         <div className="text-sm text-slate-500">
           {progress} / {bookmarks.length} vérifiés
         </div>
       </div>

       <p className="text-slate-600 mb-6 truncate">
         Diagnostic de disponibilité - teste chaque site, marque comme suspect ceux qui ne répondent pas (nécessite validation manuelle).
       </p>

       <div className="flex gap-4 mb-8">
         {!isRunning ? (
            <button 
              onClick={handleStart}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center gap-2 shadow-sm"
            >
              <Play size={18} /> Lancer le test
            </button>
         ) : (
             <button 
               className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded flex items-center gap-2 cursor-not-allowed opacity-75 shadow-sm"
             >
               <Pause size={18} /> En cours...
             </button>
         )}
         
         <button 
            onClick={handleReset}
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded flex items-center gap-2 shadow-sm"
         >
            <RotateCcw size={18} /> Réinitialiser
         </button>
       </div>

       <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">
            Résultats Suspects <span className="text-red-500">({suspects.length})</span>
          </h3>
          
          {suspects.length === 0 && (
             <div className="text-slate-400 italic py-4 text-center bg-slate-50 rounded">
               Aucun lien suspect détecté pour le moment.
             </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            {suspects.map(b => (
              <div key={b.id} className="flex items-center justify-between bg-white p-3 rounded border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="font-medium text-slate-800 truncate">{b.title}</div>
                    <a href={b.url} target="_blank" className="text-xs text-blue-500 hover:underline truncate block flex items-center gap-1">
                      {b.url} <ExternalLink size={10} />
                    </a>
                    <div className="text-xs text-red-500 font-bold mt-1">
                       {b.linkStatus === 'dead' ? 'MORT (404/500)' : 'SUSPECT (Timeout/CORS)'} 
                       {b.linkStatusMessage && <span className="font-normal text-slate-500"> - {b.linkStatusMessage}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => onDelete(b.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Supprimer définitivement"
                  >
                    <Trash2 size={18} />
                  </button>
              </div>
            ))}
          </div>
       </div>
    </div>
  );
};