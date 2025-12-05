import React, { useState } from "react";
import { Bookmark, LinkCheckResult } from "../services/types";
import { checkLinksInBatches } from "../services/linkCheckerService";
import { GammaCard, GammaButton, SectionTitle, GammaBadge } from "./ui/GammaDesignSystem";
import { Play, RotateCcw, Activity, Trash2, ExternalLink, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface LinkCheckerProps {
  bookmarks: Bookmark[];
  onUpdateStatus: (results: LinkCheckResult[]) => void;
  onDelete: (id: string) => void;
}

export const LinkChecker: React.FC<LinkCheckerProps> = ({ bookmarks, onUpdateStatus, onDelete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStart = async () => {
    setIsRunning(true);
    const toCheck = bookmarks.filter(b => b.linkStatus === 'unknown' || !b.linkStatus);
    const iterator = checkLinksInBatches(toCheck.map(b => ({id: b.id, url: b.url})));
    
    for await (const batch of iterator) {
        onUpdateStatus(batch);
        setProgress(prev => prev + batch.length);
    }
    setIsRunning(false);
  };

  const suspects = bookmarks.filter(b => b.linkStatus === 'suspect' || b.linkStatus === 'dead');

  return (
    <div className="max-w-5xl mx-auto">
       <SectionTitle title="Diagnostic" subtitle="Détectez les liens morts et nettoyez votre base." icon={<Activity />} />

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GammaCard className="md:col-span-2 flex items-center justify-between">
             <div>
                <h3 className="font-bold text-slate-700">État du diagnostic</h3>
                <p className="text-slate-500 text-sm mt-1">{progress} / {bookmarks.length} sites vérifiés</p>
             </div>
             <div className="flex gap-3">
                <GammaButton onClick={handleStart} disabled={isRunning} icon={<Play size={16} />}>
                   {isRunning ? "Analyse..." : "Lancer"}
                </GammaButton>
             </div>
          </GammaCard>

          <GammaCard className={`flex flex-col justify-center items-center ${suspects.length > 0 ? 'bg-amber-50 border-amber-100' : ''}`}>
             <div className="text-3xl font-bold text-slate-800">{suspects.length}</div>
             <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Suspects détectés</div>
          </GammaCard>
       </div>

       <div className="space-y-3">
          {suspects.map(b => (
             <motion.div key={b.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <GammaCard className="flex items-center justify-between p-4 border-l-4 border-l-amber-400" noPadding>
                  <div className="p-4 flex items-center gap-4 flex-1 min-w-0">
                     <div className={`p-2 rounded-full ${b.linkStatus === 'dead' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {b.linkStatus === 'dead' ? <XCircle size={20} /> : <AlertTriangle size={20} />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 truncate">{b.title}</div>
                        <a href={b.url} target="_blank" className="text-xs text-blue-500 hover:underline truncate flex items-center gap-1">
                           {b.url} <ExternalLink size={10} />
                        </a>
                     </div>
                     <GammaBadge color={b.linkStatus === 'dead' ? 'red' : 'yellow'}>
                        {b.linkStatus === 'dead' ? 'Erreur Fatale' : 'Timeout / CORS'}
                     </GammaBadge>
                  </div>
                  <div className="pr-4">
                     <GammaButton variant="danger" onClick={() => onDelete(b.id)} icon={<Trash2 size={16} />}>
                        Supprimer
                     </GammaButton>
                  </div>
               </GammaCard>
             </motion.div>
          ))}
       </div>
    </div>
  );
};