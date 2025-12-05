import React, { useState, useMemo } from "react";
import { Bookmark } from "../services/types";
import { getFaviconUrl, getThumbnailUrl } from "../services/thumbnailService";
import { GammaCard, GammaInput, GammaPill, getCategoryColor, staggerContainer, fadeIn } from "./ui/GammaDesignSystem";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink, Trash2, Search, Filter, AlertTriangle, XCircle, ImageOff, User } from "lucide-react";

interface VisualGalleryProps {
  bookmarks: Bookmark[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

// Composant interne pour l'image avec gestion d'erreur et loading
const SmartThumbnail: React.FC<{ url: string; title: string }> = ({ url, title }) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const { url: src, isAvatar } = useMemo(() => getThumbnailUrl(url), [url]);

  return (
    <div className={`relative overflow-hidden ${isAvatar ? "aspect-square bg-slate-50 flex items-center justify-center p-6" : "aspect-video bg-slate-100"}`}>
      {/* Background blur effect for avatars to fill space nicely */}
      {isAvatar && status === 'loaded' && (
         <div className="absolute inset-0 opacity-20 blur-xl scale-150" style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}

      <motion.img 
        src={src} 
        alt={title} 
        initial={{ opacity: 0 }}
        animate={{ opacity: status === "loaded" ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`relative z-10 w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${isAvatar ? "rounded-full shadow-lg max-w-[120px] max-h-[120px] border-4 border-white" : ""}`}
        loading="lazy"
      />

      {/* Loading Skeleton */}
      {status === "loading" && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}

      {/* Error Fallback */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-50">
          {isAvatar ? <User size={48} /> : <ImageOff size={32} />}
        </div>
      )}
    </div>
  );
};

export const VisualGallery: React.FC<VisualGalleryProps> = ({ bookmarks, onToggleFavorite, onDelete }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Extraction unique des catégories
  const categories = useMemo(() => {
    const cats = new Set(bookmarks.map(b => b.category || "Autre"));
    return Array.from(cats).sort();
  }, [bookmarks]);

  // Filtrage combiné
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return bookmarks.filter(b => {
      const matchesSearch = 
        b.title.toLowerCase().includes(searchLower) || 
        b.url.toLowerCase().includes(searchLower);
      
      const matchesCategory = selectedCategory === "all" 
        ? true 
        : (b.category || "Autre") === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [bookmarks, search, selectedCategory]);

  return (
    <div>
       {/* --- Top Bar: Search & Filters --- */}
       <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm py-4 mb-8 border-b border-slate-200/50 -mx-8 px-8 space-y-4">
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <GammaInput 
               placeholder="Rechercher..." 
               value={search} 
               onChange={(e) => setSearch(e.target.value)}
               className="pl-12 shadow-lg shadow-slate-200/50 border-none h-12"
             />
          </div>

          {/* Theme Filters Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-sides">
             <div className="flex gap-2 mx-auto">
                <GammaPill 
                  label="Tous les thèmes" 
                  active={selectedCategory === "all"} 
                  count={bookmarks.length}
                  onClick={() => setSelectedCategory("all")} 
                />
                {categories.map(cat => (
                  <GammaPill 
                    key={cat} 
                    label={cat} 
                    active={selectedCategory === cat}
                    count={bookmarks.filter(b => (b.category || "Autre") === cat).length}
                    onClick={() => setSelectedCategory(cat)} 
                  />
                ))}
             </div>
          </div>
       </div>

       {/* --- Masonry Grid --- */}
       <motion.div 
         variants={staggerContainer} 
         initial="hidden" 
         animate="visible"
         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
       >
         <AnimatePresence mode="popLayout">
           {filtered.map(b => {
             const categoryColor = getCategoryColor(b.category);
             
             return (
               <motion.div 
                 key={b.id} 
                 layout 
                 variants={fadeIn}
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
               >
                 <GammaCard className="h-full flex flex-col group cursor-pointer relative" noPadding>
                    
                    {/* Image Area */}
                    <div className="relative group-hover:shadow-inner transition-shadow">
                       <SmartThumbnail url={b.url} title={b.title} />
                       
                       {/* Overlay Actions */}
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 justify-between z-20">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(b.id); }}
                            className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white text-white hover:text-amber-500 transition-colors shadow-lg"
                          >
                             <Star size={18} fill={b.isFavorite ? "currentColor" : "none"} />
                          </button>
                          <div className="flex gap-2">
                             <a 
                               href={b.url} 
                               target="_blank" 
                               rel="noreferrer"
                               onClick={(e) => e.stopPropagation()}
                               className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white text-white hover:text-blue-500 transition-colors shadow-lg"
                             >
                                <ExternalLink size={18} />
                             </a>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
                                className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-red-500 text-white transition-colors shadow-lg"
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </div>

                       {/* Status Badges (Absolute top) */}
                       {b.linkStatus && b.linkStatus !== 'ok' && b.linkStatus !== 'unknown' && (
                         <div className="absolute top-2 right-2 z-20">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-md ${b.linkStatus === 'dead' ? 'bg-red-500' : 'bg-amber-500'}`}>
                               {b.linkStatus === 'dead' ? <XCircle size={10} /> : <AlertTriangle size={10} />}
                               {b.linkStatus}
                            </span>
                         </div>
                       )}
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col">
                       {/* Header: Favicon + Category Badge */}
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                             <img src={getFaviconUrl(b.url)} className="w-4 h-4 rounded-sm opacity-80" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                             <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">{new URL(b.url).hostname.replace('www.', '')}</span>
                          </div>
                          {/* Gamma-style Colored Pill */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${categoryColor}`}>
                             {b.category || "Autre"}
                          </span>
                       </div>

                       <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-indigo-600 transition-colors" title={b.title}>
                          {b.title}
                       </h3>

                       {/* Footer info (date, etc can go here if needed) */}
                    </div>
                 </GammaCard>
               </motion.div>
             );
           })}
         </AnimatePresence>
         
         {filtered.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Filter size={24} className="opacity-50" />
               </div>
               <p>Aucun favori ne correspond à vos filtres.</p>
               <button 
                  onClick={() => { setSearch(""); setSelectedCategory("all"); }}
                  className="mt-4 text-indigo-500 hover:underline text-sm font-medium"
               >
                  Réinitialiser les filtres
               </button>
            </div>
         )}
       </motion.div>
    </div>
  );
};