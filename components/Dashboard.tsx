import React from "react";
import { Bookmark, CategoryStats, ImportSessionSummary } from "../services/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis } from "recharts";
import { motion } from "framer-motion";
import { GammaCard, SectionTitle, GammaBadge, gradients, fadeIn, staggerContainer } from "./ui/GammaDesignSystem";
import { Chrome, Compass, Globe, AppWindow, Database, Layers, ArrowRight, Tag, Activity, Star } from "lucide-react";

interface DashboardProps {
  bookmarks: Bookmark[];
  importSession?: ImportSessionSummary;
}

const COLORS = ['#6366F1', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];

// Helper pour icônes
const BrowserIcon = ({ source, size = 20 }: { source: string, size?: number }) => {
  const className = "text-slate-600";
  switch(source) {
    case 'chrome': return <Chrome size={size} className="text-blue-500" />;
    case 'firefox': return <Globe size={size} className="text-orange-500" />;
    case 'safari': return <Compass size={size} className="text-blue-400" />;
    case 'edge': return <AppWindow size={size} className="text-blue-700" />;
    default: return <Globe size={size} className={className} />;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ bookmarks, importSession }) => {
  // --- Stats Calculations ---
  const total = bookmarks.length;
  const favorites = bookmarks.filter(b => b.isFavorite).length;
  const uncategorized = bookmarks.filter(b => !b.category).length;
  
  // Categories
  const catData = bookmarks.reduce((acc, curr) => {
    const cat = curr.category || "Autres";
    const existing = acc.find(i => i.name === cat);
    if (existing) existing.count++;
    else acc.push({ name: cat, count: 1 });
    return acc;
  }, [] as any[]).sort((a, b) => b.count - a.count).slice(0, 5);

  // Countries (Simple extraction)
  const countryData = bookmarks.reduce((acc, curr) => {
    try {
      const host = new URL(curr.url).hostname;
      const parts = host.split('.');
      const tld = parts[parts.length - 1];
      if (tld.length === 2 && tld !== 'io' && tld !== 'ai' && tld !== 'co') {
        const existing = acc.find(i => i.name === tld.toUpperCase());
        if (existing) existing.count++;
        else acc.push({ name: tld.toUpperCase(), count: 1 });
      }
    } catch {}
    return acc;
  }, [] as any[]).sort((a, b) => b.count - a.count).slice(0, 4);

  // URL Types
  const typeData = bookmarks.reduce((acc, curr) => {
    try {
      const host = new URL(curr.url).hostname;
      if (host.includes('.com')) acc['.COM'] = (acc['.COM'] || 0) + 1;
      else if (host.includes('.org')) acc['.ORG'] = (acc['.ORG'] || 0) + 1;
      else if (host.includes('.edu')) acc['.EDU'] = (acc['.EDU'] || 0) + 1;
      else if (host.includes('.gov')) acc['.GOV'] = (acc['.GOV'] || 0) + 1;
      else acc['AUTRE'] = (acc['AUTRE'] || 0) + 1;
    } catch {}
    return acc;
  }, {} as Record<string, number>);
  const barData = Object.entries(typeData).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
      
      <SectionTitle title="Tableau de bord" subtitle="Vue d'ensemble de votre base de connaissances." />

      {/* --- Import Timeline (Gamma Storytelling) --- */}
      {importSession && (importSession.master || importSession.merges.length > 0) && (
        <GammaCard className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Layers size={200} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-200">
              <Activity size={20} /> Session d'Import Actuelle
            </h3>
            
            <div className="flex flex-wrap items-center gap-6">
              {/* Master Node */}
              {importSession.master ? (
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[200px]">
                  <div className="bg-white p-3 rounded-xl shadow-lg">
                    <BrowserIcon source={importSession.master.source} size={28} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-300">Master</div>
                    <div className="text-2xl font-bold">{importSession.master.count}</div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 italic text-sm">Pas de master défini</div>
              )}

              {/* Connector */}
              {importSession.merges.length > 0 && <ArrowRight className="text-slate-500" />}

              {/* Merges Nodes */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {importSession.merges.map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3 min-w-[140px]"
                  >
                     <div className="bg-white/90 p-1.5 rounded-lg">
                        <BrowserIcon source={m.source} size={16} />
                     </div>
                     <div>
                        <div className="text-[10px] text-emerald-300 font-bold uppercase">Fusion</div>
                        <div className="font-bold text-emerald-100">+{m.count}</div>
                     </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </GammaCard>
      )}

      {/* --- KPI Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GammaCard className="flex items-center justify-between group cursor-default">
           <div>
             <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Favoris</div>
             <div className="text-4xl font-bold text-slate-800">{total}</div>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
             <Database size={24} />
           </div>
        </GammaCard>

        <GammaCard className="flex items-center justify-between group cursor-default">
           <div>
             <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Favoris</div>
             <div className="text-4xl font-bold text-amber-500">{favorites}</div>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
             <Star fill="currentColor" size={24} />
           </div>
        </GammaCard>

        <GammaCard className="flex items-center justify-between group cursor-default">
           <div>
             <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Non Classés</div>
             <div className="text-4xl font-bold text-rose-500">{uncategorized}</div>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
             <Tag size={24} />
           </div>
        </GammaCard>
      </div>

      {/* --- Charts Row --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pie Chart: Themes */}
        <GammaCard className="flex flex-col h-[400px]">
          <h3 className="font-bold text-slate-700 mb-4">Répartition Thématique</h3>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={catData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="count"
                   cornerRadius={6}
                 >
                   {catData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
             {catData.map((c, i) => (
               <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {c.name}
               </div>
             ))}
          </div>
        </GammaCard>

        {/* Bar Chart + Flags */}
        <div className="space-y-6">
           {/* Types */}
           <GammaCard className="h-[200px] flex flex-col">
              <h3 className="font-bold text-slate-700 mb-2">Types de Domaines</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                     <XAxis type="number" hide />
                     <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px' }} />
                     <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#f8fafc' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </GammaCard>

           {/* Country Cards (Gamma Style) */}
           <div className="grid grid-cols-2 gap-4">
              {countryData.length > 0 ? countryData.map((c, i) => (
                 <GammaCard key={i} className="flex items-center justify-between p-4" noPadding>
                    <div className="p-4 flex items-center gap-3">
                       <span className="text-2xl shadow-sm rounded bg-white px-1">
                         {c.name === 'FR' ? '🇫🇷' : c.name === 'US' ? '🇺🇸' : c.name === 'DE' ? '🇩🇪' : c.name === 'UK' ? '🇬🇧' : '🌍'}
                       </span>
                       <div>
                          <div className="font-bold text-slate-800">.{c.name}</div>
                          <div className="text-xs text-slate-400">{c.count} sites</div>
                       </div>
                    </div>
                 </GammaCard>
              )) : (
                 <div className="col-span-2 text-center text-slate-400 text-sm py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Pas assez de données géographiques
                 </div>
              )}
           </div>
        </div>
      </div>
    </motion.div>
  );
};