import React from "react";
import { Bookmark, CategoryStats, ImportSessionSummary } from "../services/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis } from "recharts";
import { motion } from "framer-motion";
import { GammaCard, SectionTitle, GammaBadge, gradients, fadeIn, staggerContainer } from "./ui/GammaDesignSystem";
import { Chrome, Compass, Globe, AppWindow, Database, Layers, ArrowRight, Tag, Activity, Star, Info } from "lucide-react";

interface DashboardProps {
  bookmarks: Bookmark[];
  importSession?: ImportSessionSummary;
}

// Gamma Palette for Charts
const COLORS = ['#3A7BFF', '#4BE2B0', '#7B5CFA', '#F59E0B', '#EC4899', '#6366F1'];

// Helper pour icônes
const BrowserIcon = ({ source, size = 20 }: { source: string, size?: number }) => {
  const className = "text-slate-600";
  switch(source) {
    case 'chrome': return <Chrome size={size} className="text-[#3A7BFF]" />;
    case 'firefox': return <Globe size={size} className="text-orange-500" />;
    case 'safari': return <Compass size={size} className="text-[#3A7BFF]" />;
    case 'edge': return <AppWindow size={size} className="text-sky-600" />;
    default: return <Globe size={size} className={className} />;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ bookmarks, importSession }) => {
  const total = bookmarks.length;
  
  // --- Empty State ---
  if (total === 0) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex flex-col items-center justify-center py-20 text-center">
         <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Info className="text-indigo-500 w-12 h-12" />
         </div>
         <h2 className="text-2xl font-bold text-slate-800 mb-2">Bienvenue sur votre Dashboard</h2>
         <p className="text-slate-500 max-w-md mb-8">
           Il semble que vous n'ayez pas encore importé de favoris. Commencez par importer un fichier HTML pour voir vos statistiques.
         </p>
         {/* L'utilisateur utilisera le menu Importer, pas de bouton ici pour éviter conflit de nav */}
         <div className="text-sm text-indigo-500 font-bold bg-indigo-50 px-4 py-2 rounded-lg">
            👈 Cliquez sur "Importer" dans le menu
         </div>
      </motion.div>
    );
  }

  // --- Stats Calculations ---
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
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-10">
      
      <SectionTitle title="Tableau de bord" subtitle="Vue d'ensemble de votre base de connaissances." />

      {/* --- Import Timeline (Gamma Storytelling) --- */}
      {importSession && (importSession.master || importSession.merges.length > 0) && (
        <GammaCard className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Layers size={200} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-indigo-200">
              <Activity size={20} /> Session d'Import Actuelle
            </h3>
            
            <div className="flex flex-wrap items-center gap-8">
              {/* Master Node */}
              {importSession.master ? (
                <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 min-w-[220px]">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <BrowserIcon source={importSession.master.source} size={32} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-300 mb-1">Master</div>
                    <div className="text-3xl font-bold">{importSession.master.count}</div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 italic text-sm">Pas de master défini</div>
              )}

              {/* Connector */}
              {importSession.merges.length > 0 && <ArrowRight className="text-slate-500 opacity-50" />}

              {/* Merges Nodes */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {importSession.merges.map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#4BE2B0]/10 border border-[#4BE2B0]/20 p-4 rounded-xl flex items-center gap-3 min-w-[150px]"
                  >
                     <div className="bg-white/90 p-2 rounded-lg">
                        <BrowserIcon source={m.source} size={18} />
                     </div>
                     <div>
                        <div className="text-[10px] text-[#4BE2B0] font-bold uppercase mb-0.5">Fusion</div>
                        <div className="font-bold text-white text-lg">+{m.count}</div>
                     </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </GammaCard>
      )}

      {/* --- KPI Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GammaCard className="flex items-center justify-between group cursor-default" noPadding>
           <div className="p-8">
             <div className="text-[#6C6E73] text-xs font-bold uppercase tracking-wider mb-2">Total Favoris</div>
             <div className="text-5xl font-bold text-[#1A1A1A]">{total}</div>
           </div>
           <div className="w-20 h-full bg-[#3A7BFF]/5 flex items-center justify-center group-hover:bg-[#3A7BFF]/10 transition-colors">
             <Database size={28} className="text-[#3A7BFF]" />
           </div>
        </GammaCard>

        <GammaCard className="flex items-center justify-between group cursor-default" noPadding>
           <div className="p-8">
             <div className="text-[#6C6E73] text-xs font-bold uppercase tracking-wider mb-2">Favoris</div>
             <div className="text-5xl font-bold text-amber-500">{favorites}</div>
           </div>
           <div className="w-20 h-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
             <Star fill="currentColor" size={28} className="text-amber-500" />
           </div>
        </GammaCard>

        <GammaCard className="flex items-center justify-between group cursor-default" noPadding>
           <div className="p-8">
             <div className="text-[#6C6E73] text-xs font-bold uppercase tracking-wider mb-2">Non Classés</div>
             <div className="text-5xl font-bold text-rose-500">{uncategorized}</div>
           </div>
           <div className="w-20 h-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
             <Tag size={28} className="text-rose-500" />
           </div>
        </GammaCard>
      </div>

      {/* --- Charts Row --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Pie Chart: Themes */}
        <GammaCard className="flex flex-col h-[420px]">
          <h3 className="font-bold text-[#1A1A1A] mb-6 text-xl">Répartition Thématique</h3>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={catData}
                   cx="50%"
                   cy="50%"
                   innerRadius={70}
                   outerRadius={110}
                   paddingAngle={4}
                   dataKey="count"
                   cornerRadius={6}
                   stroke="none"
                 >
                   {catData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
             {catData.map((c, i) => (
               <div key={i} className="flex items-center gap-2 text-xs text-[#6C6E73] bg-[#F5F6F8] px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {c.name}
               </div>
             ))}
          </div>
        </GammaCard>

        {/* Bar Chart + Flags */}
        <div className="space-y-8">
           {/* Types */}
           <GammaCard className="h-[220px] flex flex-col">
              <h3 className="font-bold text-[#1A1A1A] mb-4 text-lg">Types de Domaines</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                     <XAxis type="number" hide />
                     <Tooltip cursor={{fill: '#F5F6F8'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                     <Bar dataKey="count" fill="#7B5CFA" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: '#F5F6F8' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </GammaCard>

           {/* Country Cards (Gamma Style) */}
           <div className="grid grid-cols-2 gap-6">
              {countryData.length > 0 ? countryData.map((c, i) => (
                 <GammaCard key={i} className="flex items-center justify-between p-5" noPadding>
                    <div className="p-5 flex items-center gap-4">
                       <span className="text-3xl bg-[#F5F6F8] p-2 rounded-xl">
                         {c.name === 'FR' ? '🇫🇷' : c.name === 'US' ? '🇺🇸' : c.name === 'DE' ? '🇩🇪' : c.name === 'UK' ? '🇬🇧' : '🌍'}
                       </span>
                       <div>
                          <div className="font-bold text-[#1A1A1A] text-lg">.{c.name}</div>
                          <div className="text-xs text-[#6C6E73] font-medium">{c.count} sites</div>
                       </div>
                    </div>
                 </GammaCard>
              )) : (
                 <div className="col-span-2 text-center text-[#6C6E73] text-sm py-8 bg-[#F5F6F8] rounded-2xl border border-dashed border-gray-200">
                    Pas assez de données géographiques
                 </div>
              )}
           </div>
        </div>
      </div>
    </motion.div>
  );
};