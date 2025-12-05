import React from "react";
import { Bookmark, CategoryStats, ImportSessionSummary } from "../services/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, AreaChart, Area } from "recharts";
import { Globe, Chrome, Compass, AppWindow, FileText, Layers, GitMerge, Database, Flag, Tag, Link as LinkIcon } from "lucide-react";

interface DashboardProps {
  bookmarks: Bookmark[];
  importSession?: ImportSessionSummary;
}

const COLORS = ['#6366F1', '#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const FLAG_MAP: Record<string, string> = {
  'fr': '🇫🇷', 'uk': '🇬🇧', 'us': '🇺🇸', 'de': '🇩🇪', 'jp': '🇯🇵', 'cn': '🇨🇳', 'ru': '🇷🇺',
  'es': '🇪🇸', 'it': '🇮🇹', 'br': '🇧🇷', 'ca': '🇨🇦', 'au': '🇦🇺', 'in': '🇮🇳', 'eu': '🇪🇺',
  'ch': '🇨🇭', 'be': '🇧🇪', 'io': '👨‍💻', 'dev': '💻', 'ai': '🤖', 'app': '📱'
};

const TYPE_MAP: Record<string, string> = {
  'com': 'Commercial',
  'org': 'Organisation',
  'net': 'Réseau',
  'edu': 'Éducation',
  'gov': 'Gouvernement',
  'io': 'Tech / Startup',
  'dev': 'Développement',
  'ai': 'Intelligence A.',
  'app': 'Application'
};

// Helper pour les icônes de source
const SourceIcon = ({ source, size = 16 }: { source: string, size?: number }) => {
   switch (source) {
     case 'chrome': return <Chrome size={size} className="text-blue-500" />;
     case 'safari': return <Compass size={size} className="text-blue-400" />;
     case 'edge': return <AppWindow size={size} className="text-blue-700" />;
     case 'firefox': return <Globe size={size} className="text-orange-500" />;
     default: return <FileText size={size} className="text-slate-400" />;
   }
};

export const Dashboard: React.FC<DashboardProps> = ({ bookmarks, importSession }) => {
  const total = bookmarks.length;
  const favorites = bookmarks.filter(b => b.isFavorite).length;
  const uncategorized = bookmarks.filter(b => !b.category).length;
  const suspects = bookmarks.filter(b => b.linkStatus === 'suspect' || b.linkStatus === 'dead').length;

  // 1. Stats par Catégorie (Pie Chart)
  const categoryData: CategoryStats[] = bookmarks.reduce((acc, curr) => {
    const cat = curr.category || "Non classé";
    const existing = acc.find(i => i.name === cat);
    if (existing) existing.count++;
    else acc.push({ name: cat, count: 1 });
    return acc;
  }, [] as CategoryStats[]).sort((a, b) => b.count - a.count).slice(0, 6);

  // 2. Stats par Pays (Basé sur TLD Country Code)
  const countryData = bookmarks.reduce((acc, curr) => {
     try {
        const hostname = new URL(curr.url).hostname;
        const parts = hostname.split('.');
        const ext = parts[parts.length - 1].toLowerCase();
        
        // On ne garde que les TLDs à 2 lettres (souvent des pays) + quelques exceptions tech
        if (ext.length === 2 && ext !== 'com' && ext !== 'io' && ext !== 'ai') {
           const flag = FLAG_MAP[ext] || '🏳️';
           const label = ext.toUpperCase();
           const existing = acc.find(i => i.name === label);
           if (existing) existing.count++;
           else acc.push({ name: label, count: 1, flag });
        }
     } catch {}
     return acc;
  }, [] as any[]).sort((a, b) => b.count - a.count).slice(0, 5);

  // 3. Stats par Type de site (Generic TLDs + Tech)
  const typeData = bookmarks.reduce((acc, curr) => {
    try {
       const hostname = new URL(curr.url).hostname;
       const parts = hostname.split('.');
       const ext = parts[parts.length - 1].toLowerCase();
       
       if (TYPE_MAP[ext] || ['com', 'net', 'org', 'info'].includes(ext)) {
          const label = TYPE_MAP[ext] || '.' + ext.toUpperCase();
          const existing = acc.find(i => i.name === label);
          if (existing) existing.count++;
          else acc.push({ name: label, count: 1 });
       }
    } catch {}
    return acc;
 }, [] as CategoryStats[]).sort((a, b) => b.count - a.count).slice(0, 5);


  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* --- Section Historique Import (Master/Merge) --- */}
      {importSession && (importSession.master || importSession.merges.length > 0) && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Database size={120} />
           </div>
           
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
             <Layers className="text-blue-400" /> État de la Session
           </h3>
           
           <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
              {/* MASTER */}
              {importSession.master ? (
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl min-w-[220px]">
                   <div className="bg-white p-3 rounded-full shadow-lg">
                      <SourceIcon source={importSession.master.source} size={32} />
                   </div>
                   <div>
                      <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">Source Master</div>
                      <div className="text-2xl font-bold">{importSession.master.count}</div>
                      <div className="text-xs text-slate-400">favoris de base</div>
                   </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-slate-800/50 border border-dashed border-slate-600 p-4 rounded-xl min-w-[220px] opacity-60">
                   <Database size={24} className="text-slate-500"/>
                   <div className="text-sm text-slate-400">Aucun Master</div>
                </div>
              )}

              {/* FLOW ARROW */}
              {importSession.merges.length > 0 && (
                 <div className="hidden md:flex text-slate-600">
                    <GitMerge size={24} className="rotate-90 text-blue-500" />
                 </div>
              )}

              {/* MERGES */}
              <div className="flex flex-wrap gap-3">
                 {importSession.merges.map((merge, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 p-3 rounded-xl animate-fade-in-up hover:bg-green-500/20 transition-colors" style={{animationDelay: `${idx * 100}ms`}}>
                       <div className="bg-white/90 p-2 rounded-full shadow-sm">
                          <SourceIcon source={merge.source} size={18} />
                       </div>
                       <div>
                          <div className="text-[10px] text-green-400 font-bold uppercase">Fusionné</div>
                          <div className="font-bold text-white">+{merge.count}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
           <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{total}</p>
           </div>
           <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database size={24} />
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
           <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Favoris</p>
              <p className="text-3xl font-bold text-yellow-500 mt-1">{favorites}</p>
           </div>
           <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center">
              <div className="text-xl">★</div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow group cursor-pointer">
           <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider group-hover:text-red-500 transition-colors">À Trier</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{uncategorized}</p>
           </div>
           <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
              <Tag size={24} />
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
           <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Santé Liens</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{total - suspects}<span className="text-sm text-slate-400 font-normal">/{total}</span></p>
           </div>
           <div className={`w-12 h-12 rounded-full flex items-center justify-center ${suspects > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
              <div className="text-xl">♥</div>
           </div>
        </div>
      </div>

      {/* --- Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Thématiques (Grand) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
            <Tag size={20} className="text-indigo-500" /> Univers Thématiques
          </h3>
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
             <div className="flex-1 h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="count"
                      cornerRadius={6}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="hidden md:block w-px h-40 bg-slate-100 mx-4"></div>
             <div className="w-full md:w-1/3 space-y-4 pt-4 md:pt-0">
                {categoryData.slice(0, 3).map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                        <span className="text-sm font-medium text-slate-600 truncate max-w-[120px]" title={cat.name}>{cat.name}</span>
                     </div>
                     <span className="text-sm font-bold text-slate-800">{Math.round((cat.count / total) * 100)}%</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* 2. Top Pays (Vertical List ludique) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <Flag size={20} className="text-pink-500" /> Origine Géographique
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             {countryData.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center text-sm p-4">
                  <Globe size={48} className="mb-2 opacity-20" />
                  Pas assez de données géographiques (.fr, .de, etc.)
               </div>
             ) : (
               countryData.map((c, idx) => (
                 <div key={idx} className="relative flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-pink-50 transition-colors group">
                    <div className="flex items-center gap-3 relative z-10">
                       <span className="text-2xl drop-shadow-sm">{c.flag}</span>
                       <span className="font-bold text-slate-700">.{c.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 bg-white px-2 py-1 rounded-lg shadow-sm text-xs relative z-10">{c.count} sites</span>
                    
                    {/* Progress Bar background */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-slate-200/50 rounded-xl transition-all duration-1000 group-hover:bg-pink-200/30" 
                      style={{ width: `${(c.count / (countryData[0]?.count || 1)) * 100}%` }}
                    ></div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* 3. Types de sites (Bar Chart) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
             <LinkIcon size={20} className="text-blue-500" /> Typologie des Domaines
           </h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={typeData} margin={{top: 10, right: 30, left: 0, bottom: 0}} barSize={40}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9', radius: 8}} 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} 
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#60A5FA'} />
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