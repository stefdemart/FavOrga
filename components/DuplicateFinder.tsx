import React, { useMemo } from "react";
import { Bookmark } from "../services/types";
import { Trash2, AlertTriangle } from "lucide-react";

interface DuplicateFinderProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
}

export const DuplicateFinder: React.FC<DuplicateFinderProps> = ({ bookmarks, onDelete }) => {
  const duplicates = useMemo(() => {
    const groups: Record<string, Bookmark[]> = {};
    bookmarks.forEach(b => {
      // Normalize URL for comparison (remove trailing slash)
      const norm = b.url.replace(/\/$/, "");
      if (!groups[norm]) groups[norm] = [];
      groups[norm].push(b);
    });
    return Object.values(groups).filter(g => g.length > 1);
  }, [bookmarks]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="text-orange-500" />
        <h2 className="text-xl font-bold">Doublons détectés ({duplicates.length} groupes)</h2>
      </div>

      {duplicates.length === 0 ? (
        <div className="text-green-600 bg-green-50 p-4 rounded text-center">Aucun doublon trouvé !</div>
      ) : (
        <div className="space-y-6">
          {duplicates.map((group, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
               <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-sm font-medium text-slate-600 truncate">
                 URL: {group[0].url}
               </div>
               <div className="divide-y divide-slate-100">
                 {group.map((b) => (
                   <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-medium text-slate-800">{b.title}</div>
                        <div className="text-xs text-slate-500">Dossier: {b.folderPath.join('/') || "Racine"} | Source: {b.source}</div>
                        <div className="text-xs text-slate-400">Ajouté le: {new Date(b.createdAt).toLocaleDateString()}</div>
                      </div>
                      <button 
                        onClick={() => onDelete(b.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                      >
                        <Trash2 size={16} /> Supprimer
                      </button>
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
