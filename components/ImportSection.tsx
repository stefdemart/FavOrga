import React, { useRef, useState } from "react";
import { BookmarkSource } from "../services/types";
import { motion, AnimatePresence } from "framer-motion";
import { GammaCard, GammaButton, SectionTitle, gradients } from "./ui/GammaDesignSystem";
import { Upload, FileUp, CheckCircle2, Loader2, Chrome, Compass, AppWindow, Globe } from "lucide-react";

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

  const sources: { id: BookmarkSource; label: string; icon: any; color: string }[] = [
    { id: 'chrome', label: 'Chrome', icon: Chrome, color: 'text-blue-600' },
    { id: 'edge', label: 'Edge', icon: AppWindow, color: 'text-blue-800' },
    { id: 'firefox', label: 'Firefox', icon: Globe, color: 'text-orange-500' },
    { id: 'safari', label: 'Safari', icon: Compass, color: 'text-blue-400' },
    { id: 'other', label: 'Autre', icon: FileUp, color: 'text-slate-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <SectionTitle title="Importer des favoris" subtitle="Ajoutez ou fusionnez vos exports HTML." icon={<Upload size={24} />} />

      <GammaCard className="relative overflow-hidden">
        {isProcessing && (
          <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
             <div className="w-64 space-y-4">
                {steps.map((step, idx) => (
                   <motion.div 
                     key={step}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: idx <= currentStep ? 1 : 0.3, x: 0 }}
                     className="flex items-center gap-3"
                   >
                      {idx < currentStep ? (
                        <CheckCircle2 className="text-emerald-500" size={20} />
                      ) : idx === currentStep ? (
                        <Loader2 className="animate-spin text-indigo-500" size={20} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                      )}
                      <span className={`font-medium ${idx === currentStep ? "text-indigo-600" : "text-slate-600"}`}>{step}</span>
                   </motion.div>
                ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Source Selection */}
           <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">1. Navigateur d'origine</label>
              <div className="grid grid-cols-2 gap-3">
                 {sources.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSource(s.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${source === s.id ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-md'}`}
                    >
                       <s.icon className={`mb-2 ${s.color}`} size={24} />
                       <span className="text-xs font-medium text-slate-600">{s.label}</span>
                    </button>
                 ))}
              </div>
           </div>

           {/* Mode & Action */}
           <div className="flex flex-col justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4">2. Méthode</label>
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                   <button 
                     onClick={() => setMode('merge')} 
                     className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'merge' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                   >
                     Fusionner (Ajout)
                   </button>
                   <button 
                     onClick={() => setMode('master')} 
                     className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'master' ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}
                   >
                     Master (Remplace)
                   </button>
                </div>
              </div>

              <div>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".html,.htm" className="hidden" />
                 <GammaButton 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full h-14 text-lg shadow-xl shadow-indigo-500/20"
                    icon={<Upload />}
                 >
                    Sélectionner le fichier HTML
                 </GammaButton>
                 <p className="text-center text-xs text-slate-400 mt-3">Compatible Chrome, Firefox, Safari, Edge</p>
              </div>
           </div>
        </div>
      </GammaCard>
    </div>
  );
};