import React from "react";
import { Bookmark } from "../services/types";
import { exportToHtml, exportToJson } from "../services/bookmarkExporter";
import { Download } from "lucide-react";

interface ExportMenuProps {
  bookmarks: Bookmark[];
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ bookmarks }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" /> Exporter les favoris nettoyés
      </h2>
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => exportToHtml(bookmarks)}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded flex-1 text-center"
        >
          Format HTML (Netscape)
          <div className="text-xs font-normal opacity-70 mt-1">Compatible tous navigateurs</div>
        </button>
        <button
          onClick={() => exportToJson(bookmarks)}
          className="border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold py-3 px-6 rounded flex-1 text-center"
        >
          Format JSON
          <div className="text-xs font-normal text-slate-500 mt-1">Pour sauvegarde brute</div>
        </button>
      </div>
    </div>
  );
};
