import React, { useState } from "react";
import { Bookmark } from "../services/types";
import { smartCollections } from "../services/smartCollectionsService";
import { BookmarkList } from "./BookmarkList";
import { Filter } from "lucide-react";

interface SmartCollectionsViewProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const SmartCollectionsView: React.FC<SmartCollectionsViewProps> = ({ bookmarks, onDelete, onToggleFavorite }) => {
  const [activeCollectionId, setActiveCollectionId] = useState(smartCollections[0].id);

  const activeCollection = smartCollections.find(c => c.id === activeCollectionId) || smartCollections[0];
  const filteredBookmarks = bookmarks.filter(activeCollection.filterFn);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
       <div className="w-full md:w-64 space-y-2 shrink-0">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Collections Intelligentes</h3>
          {smartCollections.map(col => {
             const count = bookmarks.filter(col.filterFn).length;
             return (
               <button
                 key={col.id}
                 onClick={() => setActiveCollectionId(col.id)}
                 className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors
                    ${activeCollectionId === col.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100 text-slate-700'}
                 `}
               >
                 <div>
                    <div className="font-medium">{col.name}</div>
                    <div className="text-xs opacity-75 truncate">{col.filterDescription}</div>
                 </div>
                 <div className="bg-white/50 px-2 py-0.5 rounded text-xs font-bold">{count}</div>
               </button>
             );
          })}
       </div>

       <div className="flex-1">
          <div className="bg-white p-4 rounded-t-lg border-b border-slate-100 flex items-center gap-2">
             <Filter size={18} className="text-blue-500" />
             <h2 className="font-bold text-slate-800">{activeCollection.name}</h2>
          </div>
          <BookmarkList bookmarks={filteredBookmarks} onDelete={onDelete} onToggleFavorite={onToggleFavorite} />
       </div>
    </div>
  );
};
