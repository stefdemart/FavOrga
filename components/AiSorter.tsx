import React, { useState } from "react";
import { categorizeBookmarks } from "../services/geminiService";
import { Bookmark } from "../services/types";
import { Sparkles, BrainCircuit } from "lucide-react";

interface AiSorterProps {
  bookmarks: Bookmark[];
  onUpdateBookmarks: (updated: Bookmark[]) => void;
}

export const AiSorter: React.FC<AiSorterProps> = ({ bookmarks, onUpdateBookmarks }) => {
  const [loading, setLoading] = useState(false);
  
  const handleSort = async () => {
    const unclassified = bookmarks.filter(b => !b.category || b.folderPath.includes("_A VOIR"));
    if (unclassified.length === 0) {
      alert("Tous les favoris sont déjà classés !");
      return;
    }

    setLoading(true);
    try {
      // On ne re-classe que les non-classés pour économiser des tokens
      const classified = await categorizeBookmarks(unclassified);
      
      // Merge back
      const newBookmarks = bookmarks.map(b => {
        const found = classified.find(c => c.id === b.id);
        return found || b;
      });
      
      onUpdateBookmarks(newBookmarks);
    } catch (e) {
      alert("Erreur lors du classement IA. Vérifiez la clé API.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <BrainCircuit /> Assistant de Classement IA
           </h2>
           <p className="text-indigo-100 mt-2 max-w-2xl">
             Laissez l'IA analyser vos titres et URLs pour les ranger automatiquement dans les bonnes catégories.
             Cible uniquement les favoris non classés.
           </p>
        </div>
        <button
          onClick={handleSort}
          disabled={loading}
          className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-6 rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-75 disabled:scale-100 flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
          ) : (
            <Sparkles size={20} />
          )}
          {loading ? "Analyse en cours..." : "Lancer le classement"}
        </button>
      </div>
    </div>
  );
};
