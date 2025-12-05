import React, { useState } from "react";
import { Bookmark } from "../services/types";
import { getFaviconUrl, getThumbnailUrl } from "../services/thumbnailService";
import { GammaCard, GammaInput, gradients, staggerContainer, fadeIn } from "./ui/GammaDesignSystem";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink, Trash2, Search, Filter } from "lucide-react";

interface VisualGalleryProps {
  bookmarks: Bookmark[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VisualGallery: React.FC<VisualGalleryProps> = ({ bookmarks, onToggleFavorite, onDelete }) => {
  const [search, setSearch] = useState("");
  
  const filtered = bookmarks.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
       <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm py-4 mb-6 border-b border-slate-200/50">
          <div className="max-w-2xl mx-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <GammaInput 
               placeholder="Rechercher dans votre galerie..." 
               value={search} 
               onChange={(e) => setSearch(e.target.value)}
               className="pl-12 shadow-lg shadow-slate-200/50 border-none"
             />
          </div>
       </div>

       <motion.div 
         variants={staggerContainer} 
         initial="hidden" 
         animate="visible"
         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
       >
         <AnimatePresence>
           {filtered.map(b => (
             <motion.div key={b.id} variants={fadeIn} layout>
               <GammaCard className="h-full flex flex-col group cursor-pointer" noPadding>
                  <div className="relative aspect-video bg-slate-200 overflow-hidden">
                     <img 
                       src={getThumbnailUrl(b.url)} 
                       alt={b.title} 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                       loading="lazy"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 justify-between">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onToggleFavorite(b.id); }}
                          className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white text-white hover:text-amber-500 transition-colors"
                        >
                           <Star size={16} fill={b.isFavorite ? "currentColor" : "none"} />
                        </button>
                        <button 
                           onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
                           className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-red-500 text-white transition-colors"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                     <div className="flex items-center gap-2 mb-2">
                        <img src={getFaviconUrl(b.url)} className="w-4 h-4 rounded-sm" alt="" />
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{b.category || "Autre"}</span>
                     </div>
                     <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                        {b.title}
                     </h3>
                     <a 
                       href={b.url} 
                       target="_blank"
                       rel="noreferrer"
                       className="mt-auto text-xs text-slate-400 hover:text-slate-600 truncate flex items-center gap-1"
                     >
                       <ExternalLink size={10} /> {new URL(b.url).hostname}
                     </a>
                  </div>
               </GammaCard>
             </motion.div>
           ))}
         </AnimatePresence>
       </motion.div>
    </div>
  );
};