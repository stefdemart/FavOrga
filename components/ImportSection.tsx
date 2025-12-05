import React, { useRef, useState } from "react";
import { BookmarkSource } from "../services/types";
import { motion, AnimatePresence } from "framer-motion";
import { GammaCard, GammaButton, SectionTitle, gradients } from "./ui/GammaDesignSystem";
import { Upload, FileUp, CheckCircle2, Loader2, Chrome, Compass, AppWindow, Globe, Disc, Shield, Rocket, Map, MoreHorizontal } from "lucide-react";

interface ImportSectionProps {
  onImport: (file: File, source: BookmarkSource, mode: "master" | "merge") => Promise<void>;
}

const steps = ["Lecture du fichier", "Analyse HTML", "Nettoyage doublons", "Finalisation"];

export const ImportSection: React.FC<ImportSectionProps> = ({ onImport }) => {
  const [source, setSource] = useState<BookmarkSource>("chrome");
  const [mode, setMode] = useState<"master" | "merge">("merge");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      setCurrentStep(0);
      
      // Fake progress animation
      const interval = setInterval(() => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      }, 600);

      await onImport(e.target.files[0], source, mode);
      
      clearInterval(interval);
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const sources: { id: BookmarkSource; label: string; icon: any; color: string; bg: string }[] = [
    { id: 'chrome', label: 'Chrome', icon: Chrome, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'edge', label: 'Edge', icon: AppWindow, color: 'text-sky-600', bg: 'bg-sky-50' },
    { id: 'firefox', label: 'Firefox', icon: Globe, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'safari', label: 'Safari', icon: Compass, color: 'text-blue-400', bg: 'bg-blue-50' },
    { id: 'opera', label: 'Opera', icon: Disc, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'brave', label: 'Brave', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'comet', label: 'Comet', icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'atlas', label: 'Atlas', icon: Map, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'other', label: 'Autre', icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <SectionTitle title="Importer des favoris" subtitle="Ajoutez ou fusionnez vos exports HTML." icon={<Upload size={24} />} />

      <GammaCard className="relative overflow-hidden">
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center backdrop-blur-md"
          >
             <div className="w-72 space-y-5">
                <div className="text-center mb-6">
                   <div className="inline-block p-4 rounded-full bg-indigo-50 mb-3 animate-pulse">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                   </div>
                   <h3 className="font-bold text-slate-800">Importation en cours...</h3>
                </div>
                {steps.map((step, idx) => (
                   <motion.div 
                     key={step}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: idx <= currentStep ? 1 : 0.4, x: 0 }}
                     className="flex items-center gap-3"
                   >
                      {idx < currentStep ? (
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                      ) : idx === currentStep ? (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
                      )}
                      <span className={`font-medium text-sm ${idx === currentStep ? "text-indigo-700" : "text-slate-600"}`}>{step}</span>
                   </motion.div>
                ))}
             </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
           {/* Source Selection (3/5 width) */}
           <div className="lg:col-span-3">
              <label className="block text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">1</span>
                 Sélectionnez le navigateur source
              </label>
              <div className="grid grid-cols-3 gap-3">
                 {sources.map(s => (
                    <motion.button
                      key={s.id}
                      onClick={() => setSource(s.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                        ${source === s.id 
                          ? `bg-white border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500` 
                          : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'
                        }
                      `}
                    >
                       <div className={`mb-2 p-2 rounded-lg ${source === s.id ? s.bg : 'bg-transparent'}`}>
                          <s.icon className={source === s.id ? s.color : 'text-slate-400'} size={24} />
                       </div>
                       <span className={`text-xs font-semibold ${source === s.id ? 'text-slate-800' : 'text-slate-500'}`}>{s.label}</span>
                       
                       {source === s.id && (
                          <motion.div layoutId="check" className="absolute top-2 right-2 text-indigo-500">
                             <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                          </motion.div>
                       )}
                    </motion.button>
                 ))}
              </div>
           </div>

           {/* Mode & Action (2/5 width) */}
           <div className="lg:col-span-2 flex flex-col h-full bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">2</span>
                   Méthode d'import
                </label>
                
                <div className="space-y-3">
                   <button 
                     onClick={() => setMode('merge')} 
                     className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${mode === 'merge' ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}
                   >
                      <div className={`p-2 rounded-lg ${mode === 'merge' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                         <FileUp size={20} />
                      </div>
                      <div>
                         <div className={`font-bold text-sm ${mode === 'merge' ? 'text-slate-800' : 'text-slate-500'}`}>Fusionner (Recommandé)</div>
                         <div className="text-xs text-slate-400">Ajoute les nouveaux, ignore les doublons.</div>
                      </div>
                   </button>

                   <button 
                     onClick={() => setMode('master')} 
                     className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${mode === 'master' ? 'bg-white border-rose-200 shadow-md ring-1 ring-rose-100' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}
                   >
                      <div className={`p-2 rounded-lg ${mode === 'master' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                         <Upload size={20} />
                      </div>
                      <div>
                         <div className={`font-bold text-sm ${mode === 'master' ? 'text-slate-800' : 'text-slate-500'}`}>Master Import</div>
                         <div className="text-xs text-slate-400">Remplace TOUTE votre bibliothèque.</div>
                      </div>
                   </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".html,.htm" className="hidden" />
                 <GammaButton 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full h-12 text-base shadow-lg shadow-indigo-500/20"
                    icon={<Upload size={18} />}
                 >
                    Sélectionner le fichier HTML
                 </GammaButton>
              </div>
           </div>
        </div>
      </GammaCard>
    </div>
  );
};