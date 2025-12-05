import React from "react";
import { Bookmark, CategoryStats, ImportSessionSummary } from "../services/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { Globe, Chrome, Compass, AppWindow, FileText, Layers, GitMerge, Database } from "lucide-react";

interface DashboardProps {
  bookmarks: Bookmark[];
  importSession?: ImportSessionSummary;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

// Helper pour les icônes de source
const SourceIcon = ({ source, size = 16 }: { source: string, size?: number }) => {
   switch (source) {
     case 'chrome': return <Chrome size={size} className="text-blue-500" />;
     case 'safari': return <Compass size={size} className="text-blue-400" />; // Generic for Safari
     case 'edge': return <AppWindow size={size} className="text-blue-700" />; // Generic for Edge
     case 'firefox': return <Globe size={size} className="text-orange-500" />; // Generic for FF
     default: return <FileText size={size} className="text-slate-400" />;
   }
};

export const Dashboard: React.FC<DashboardProps> = ({ bookmarks, importSession }) => {
  const total = bookmarks.length;
  const favorites = bookmarks.filter(b => b.isFavorite).length;
  const uncategorized = bookmarks.filter(b => !b.category).length;
  const suspects = bookmarks.filter(b => b.linkStatus === 'suspect' || b.linkStatus === 'dead').length;

  // Stats par Catégorie
  const categoryData: CategoryStats[] = bookmarks.reduce((acc, curr) => {
    const cat = curr.category || "Non classé";
    const existing = acc.find(i => i.name === cat);
    if (existing) existing.count++;
    else acc.push({ name: cat, count: 1 });
    return acc;
  }, [] as CategoryStats[]).sort((a, b) => b.count - a.count).slice(0, 7);

  // Stats par TLD (Top Level Domain) pour "Pays/Type"
  const tldData = bookmarks.reduce((acc, curr) => {
     try {
        const hostname = new URL(curr.url).hostname;
        const parts = hostname.split('.');
        const ext = parts.length > 1 ? '.' + parts[parts.length - 1] : 'Autre';
        
        const existing = acc.find(i => i.name === ext);
        if (existing) existing.count++;
        else acc.push({ name: ext, count: 1 });
     } catch {
        // Ignorer URLs invalides
     }
     return acc;
  }, [] as CategoryStats[]).sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Zone Imports en cours / Historique */}
      {importSession && (importSession.master || importSession.merges.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Layers className="text-blue-600" /> Structure de l'Import
           </h3>
           <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              
              {/* MASTER */}
              {importSession.master ? (
                <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 p-4 rounded-xl min-w-[200px]">
                   <div className="bg-white p-3 rounded-full shadow-sm">
                      <SourceIcon source={importSession.master.source} size={32} />
                   </div>
                   <div>
                      <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">Master</div>
                      <div className="text-xl font-bold text-slate-800">{importSession.master.count}</div>
                      <div className="text-xs text-slate-500">favoris initiaux</div>
                   </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 border-dashed p-4 rounded-xl min-w-[200px] opacity-60">
                   <Database size={24} className="text-slate-400"/>
                   <div className="text-sm text-slate-500">Aucun Master</div>
                </div>
              )}

              {/* CONNECTEUR */}
              {importSession.merges.length > 0 && (
                 <div className="hidden md:flex text-slate-300">
                    <GitMerge size={24} className="rotate-90" />
                 </div>
              )}

              {/* MERGES */}
              <div className="flex flex-wrap gap-4">
                 {importSession.merges.map((merge, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-green-50 border border-green-200 p-3 rounded-lg animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
                       <div className="bg-white p-2 rounded-full shadow-sm">
                          <SourceIcon source={merge.source} size={20} />
                       </div>
                       <div>
                          <div className="text-[10px] text-green-700 font-bold uppercase">Fusion +</div>
                          <div className="font-bold text-slate-800">+{merge.count}</div>
                       </div>
                    </div>
                 ))}
                 {importSession.merges.length === 0 && importSession.master && (
                    <div className="text-sm text-slate-400 italic py-4">
                       Aucune source supplémentaire fusionnée.
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
          <div className="text-blue-100 text-sm font-medium">Total Favoris</div>
          <div className="text-4xl font-bold mt-2">{total}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-400 transform hover:scale-105 transition-transform">
          <div className="text-slate-500 text-sm font-medium uppercase">Favoris (Star)</div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{favorites}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-slate-400 transform hover:scale-105 transition-transform">
          <div className="text-slate-500 text-sm font-medium uppercase">Non Classés</div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{uncategorized}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500 transform hover:scale-105 transition-transform">
          <div className="text-slate-500 text-sm font-medium uppercase">Liens Suspects</div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{suspects}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Catégories Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800 border-b pb-2">Thématiques</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* TLD / Pays Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800 border-b pb-2">Extensions & Origines</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={tldData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                 <XAxis type="number" hide />
                 <YAxis type="category" dataKey="name" width={50} tick={{fontSize: 12}} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                 <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                    {tldData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};