import React from "react";
import { Bookmark } from "../services/types";
import { ExternalLink, Trash2, Star, Folder } from "lucide-react";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onDelete, onToggleFavorite }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Favori</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Titre / URL</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Catégorie</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut Lien</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {bookmarks.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <button 
                  onClick={() => onToggleFavorite(b.id)}
                  className={`p-1 rounded ${b.isFavorite ? "text-yellow-400" : "text-slate-300 hover:text-slate-500"}`}
                >
                  <Star fill={b.isFavorite ? "currentColor" : "none"} size={20} />
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-slate-900 truncate max-w-xs">{b.title}</div>
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1 truncate max-w-xs">
                  {b.url} <ExternalLink size={12} />
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                 <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                   {b.category || "Non classé"}
                 </span>
                 {b.folderPath.length > 0 && (
                   <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                     <Folder size={10} /> {b.folderPath[0]}
                   </div>
                 )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${b.linkStatus === 'ok' ? 'bg-green-100 text-green-800' : 
                    b.linkStatus === 'suspect' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {b.linkStatus || "unknown"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onDelete(b.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookmarks.length === 0 && (
        <div className="p-8 text-center text-slate-500">Aucun favori trouvé. Importez-en pour commencer.</div>
      )}
    </div>
  );
};
