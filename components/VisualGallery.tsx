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
    <div className={`relative overflow-hidden ${isAvatar ? "aspect-square bg-[#F5F6F8] flex items-center justify-center p-6" : "aspect-video bg-[#F5F6F8]"}`}>
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

      {/* Loading Skeleton avec Soft Pulse (Framer Motion) */}
      <AnimatePresence>
        {status === "loading" && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#F5F6F8] z-0"
          >
            <motion.div
              className="w-full h-full bg-gradient-to-br from-gray-200/50 to-gray-300/50"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Fallback */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-[#F5F6F8] z-20">
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
       <div className="sticky top-0 z-20 bg-[#F5F6F8]/95 backdrop-blur-sm py-6 mb-8 border-b border-gray-200/50 -mx-12 px-12 space-y-6">
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <GammaInput 
               placeholder="Rechercher un favori..." 
               value={search} 
               onChange={(e) => setSearch(e.target.value)}
               className="pl-14 shadow-lg shadow-gray-200/50 border-none h-14 text-lg"
             />
          </div>

          {/* Theme Filters Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-sides">
             <div className="flex gap-3 mx-auto">
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
         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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
                 <GammaCard className="h-full flex flex-col group cursor-pointer relative transition-all duration-300" noPadding>
                    
                    {/* Image Area */}
                    <div className="relative group-hover:shadow-inner transition-shadow">
                       <SmartThumbnail url={b.url} title={b.title} />
                       
                       {/* Overlay Actions */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5 justify-between z-20">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(b.id); }}
                            className="bg-white/30 backdrop-blur-md p-2.5 rounded-full hover:bg-white text-white hover:text-amber-500 transition-colors shadow-lg"
                          >
                             <Star size={20} fill={b.isFavorite ? "currentColor" : "none"} />
                          </button>
                          <div className="flex gap-3">
                             <a 
                               href={b.url} 
                               target="_blank" 
                               rel="noreferrer"
                               onClick={(e) => e.stopPropagation()}
                               className="bg-white/30 backdrop-blur-md p-2.5 rounded-full hover:bg-white text-white hover:text-[#3A7BFF] transition-colors shadow-lg"
                             >
                                <ExternalLink size={20} />
                             </a>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
                                className="bg-white/30 backdrop-blur-md p-2.5 rounded-full hover:bg-red-500 text-white transition-colors shadow-lg"
                             >
                                <Trash2 size={20} />
                             </button>
                          </div>
                       </div>

                       {/* Status Badges (Absolute top) */}
                       {b.linkStatus && b.linkStatus !== 'ok' && b.linkStatus !== 'unknown' && (
                         <div className="absolute top-3 right-3 z-20">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-md ${b.linkStatus === 'dead' ? 'bg-red-500' : 'bg-amber-500'}`}>
                               {b.linkStatus === 'dead' ? <XCircle size={10} /> : <AlertTriangle size={10} />}
                               {b.linkStatus}
                            </span>
                         </div>
                       )}
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex-1 flex flex-col">
                       {/* Header: Favicon + Category Badge */}
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                             <img src={getFaviconUrl(b.url)} className="w-4 h-4 rounded-sm opacity-60 grayscale group-hover:grayscale-0 transition-all" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                             <span className="text-xs text-gray-400 font-medium truncate max-w-[120px]">{new URL(b.url).hostname.replace('www.', '')}</span>
                          </div>
                          {/* Gamma-style Colored Pill */}
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${categoryColor}`}>
                             {b.category || "Autre"}
                          </span>
                       </div>

                       <h3 className="font-bold text-[#1A1A1A] text-lg line-clamp-2 leading-snug mb-2 group-hover:text-[#3A7BFF] transition-colors" title={b.title}>
                          {b.title}
                       </h3>
                    </div>
                 </GammaCard>
               </motion.div>
             );
           })}
         </AnimatePresence>
         
         {filtered.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Filter size={32} className="opacity-40" />
               </div>
               <p className="text-lg">Aucun favori ne correspond à vos filtres.</p>
               <button 
                  onClick={() => { setSearch(""); setSelectedCategory("all"); }}
                  className="mt-4 text-[#3A7BFF] hover:underline font-medium"
               >
                  Réinitialiser les filtres
               </button>
            </div>
         )}
       </motion.div>
    </div>
  );
};