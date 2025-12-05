import React, { useState } from "react";
import { Bookmark } from "../services/types";
import { getThumbnailUrl } from "../services/thumbnailService";
import { Check, X, SkipForward } from "lucide-react";

interface ReviewModeProps {
  bookmarks: Bookmark[];
  onKeep: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({ bookmarks, onKeep, onDelete }) => {
  // On ne revoit que ceux dans "_A VOIR" ou non classés
  const toReview = bookmarks.filter(b => !b.category || b.folderPath.includes("_A VOIR"));
  const [currentIndex, setCurrentIndex] = useState(0);

  if (toReview.length === 0) {
     return <div className="p-10 text-center text-slate-500 bg-white rounded shadow">Rien à revoir ! Tout est propre.</div>;
  }
  
  if (currentIndex >= toReview.length) {
     return <div className="p-10 text-center text-green-600 bg-green-50 rounded shadow font-bold">Session de revue terminée !</div>;
  }

  const current = toReview[currentIndex];

  const handleAction = (action: 'keep' | 'delete' | 'skip') => {
      if (action === 'delete') onDelete(current.id);
      // keep doesn't change anything functionally but moves pointer
      setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
       <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="relative h-64 bg-slate-100">
             <img 
               src={getThumbnailUrl(current.url)} 
               alt={current.title} 
               className="w-full h-full object-cover"
             />
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h2 className="text-xl font-bold truncate">{current.title}</h2>
                <div className="text-sm opacity-80 truncate">{current.url}</div>
             </div>
          </div>
          
          <div className="p-6 flex justify-center gap-8">
             <button 
               onClick={() => handleAction('delete')}
               className="flex flex-col items-center gap-1 text-red-500 hover:scale-110 transition-transform"
             >
                <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center">
                   <X size={28} />
                </div>
                <span className="text-sm font-medium">Supprimer</span>
             </button>

             <button 
               onClick={() => handleAction('skip')}
               className="flex flex-col items-center gap-1 text-slate-400 hover:scale-110 transition-transform mt-4"
             >
                <div className="w-10 h-10 rounded-full border-2 border-slate-300 flex items-center justify-center">
                   <SkipForward size={18} />
                </div>
                <span className="text-xs">Passer</span>
             </button>

             <button 
               onClick={() => handleAction('keep')}
               className="flex flex-col items-center gap-1 text-green-500 hover:scale-110 transition-transform"
             >
                <div className="w-14 h-14 rounded-full border-2 border-green-500 flex items-center justify-center">
                   <Check size={28} />
                </div>
                <span className="text-sm font-medium">Garder</span>
             </button>
          </div>
          
          <div className="bg-slate-50 p-2 text-center text-xs text-slate-400 border-t border-slate-100">
             {currentIndex + 1} / {toReview.length} dans la file d'attente
          </div>
       </div>
    </div>
  );
};
