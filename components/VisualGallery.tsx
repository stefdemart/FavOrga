import React, { useState } from "react";
import { Bookmark } from "../services/types";
import { getFaviconUrl, getThumbnailUrl } from "../services/thumbnailService";
import { Star, ExternalLink, Trash2, Search } from "lucide-react";

interface VisualGalleryProps {
  bookmarks: Bookmark[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VisualGallery: React.FC<VisualGalleryProps> = ({ bookmarks, onToggleFavorite, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cardSize, setCardSize] = useState<"compact" | "comfort" | "large">("comfort");

  // Group by Category
  const filtered = bookmarks.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = filtered.reduce((acc, b) => {
    const cat = b.category || "Non classé";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(b);
    return acc;
  }, {} as Record<string, Bookmark[]>);

  const gridClass = {
    compact: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
    comfort: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4",
    large: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }[cardSize];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10 border-b border-slate-200">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par titre ou URL..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1">
          {(["compact", "comfort", "large"] as const).map(s => (
            <button
              key={s}
              onClick={() => setCardSize(s)}
              className={`px-3 py-1 text-sm rounded-md capitalize ${cardSize === s ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Explicitly type the map arguments to avoid 'unknown' type error on items */}
      {Object.entries(grouped).map(([category, items]: [string, Bookmark[]]) => (
        <div key={category}>
          <h1 className="text-xl font-bold text-slate-700 mb-4 pl-2 border-l-4 border-blue-500">{category}</h1>
          <div className={`grid ${gridClass} gap-6`}>
            {items.map(b => (
              <div key={b.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col group">
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {cardSize !== 'compact' && (
                    <img 
                      src={getThumbnailUrl(b.url)} 
                      alt={b.title} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                      onClick={() => onToggleFavorite(b.id)}
                      className={`p-1.5 rounded-full bg-white/90 shadow ${b.isFavorite ? 'text-yellow-500' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Star size={16} fill={b.isFavorite ? "currentColor" : "none"} />
                    </button>
                  </div>
                  {b.linkStatus === 'suspect' && (
                     <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded">Suspect</div>
                  )}
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={getFaviconUrl(b.url)} alt="" className="w-4 h-4" />
                    <h2 className="text-sm font-semibold text-slate-800 truncate" title={b.title}>{b.title}</h2>
                  </div>
                  
                  {cardSize !== 'compact' && b.folderPath.length > 0 && (
                     <h3 className="text-xs text-slate-500 mb-2 truncate">{b.folderPath.join(' > ')}</h3>
                  )}

                  <div className="mt-auto flex justify-between items-center pt-2 border-t border-slate-100">
                    <a 
                      href={b.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                       Visiter <ExternalLink size={10} />
                    </a>
                    <button onClick={() => onDelete(b.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};