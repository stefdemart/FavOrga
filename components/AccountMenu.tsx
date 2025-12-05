import React, { useState, useRef, useEffect } from "react";
import { AuthUser, Bookmark } from "../services/types";
import { cloudBackupService } from "../services/cloudBackupService";
import { LogOut, CloudUpload, CloudDownload, User, Settings, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountMenuProps {
  user: AuthUser;
  bookmarks: Bookmark[];
  onLogout: () => void;
  onRestore: (bookmarks: Bookmark[]) => void;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({ user, bookmarks, onLogout, onRestore }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBackup = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await cloudBackupService.saveSnapshot(user.id, bookmarks);
      setMessage("Sauvegarde chiffrée réussie !");
    } catch (e) {
      setMessage("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRestore = async () => {
    if (!confirm("Attention, ceci va remplacer vos favoris actuels par la dernière sauvegarde. Continuer ?")) return;
    setLoading(true);
    setMessage(null);
    try {
      const data = await cloudBackupService.loadLatestSnapshot(user.id);
      if (data) {
        onRestore(data);
        setMessage("Restauration réussie !");
      } else {
        setMessage("Aucune sauvegarde trouvée.");
      }
    } catch (e) {
      setMessage("Erreur restauration.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Génération des initiales pour l'avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
      
      {/* Actions rapides Cloud (toujours visibles pour l'UX) */}
      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200">
         <button
            onClick={handleBackup}
            disabled={loading}
            title="Sauvegarder dans le cloud chiffré"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md transition-all disabled:opacity-50"
         >
           <CloudUpload size={18} />
         </button>
         <div className="w-px h-4 bg-slate-300 mx-1"></div>
         <button
            onClick={handleRestore}
            disabled={loading}
            title="Charger la dernière sauvegarde"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md transition-all disabled:opacity-50"
         >
           <CloudDownload size={18} />
         </button>
      </div>

      {/* Zone Avatar & Menu */}
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 focus:outline-none group"
        >
          {/* Avatar Cercle */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md border-2 border-white group-hover:shadow-lg transition-all text-white font-bold text-sm tracking-widest">
            {getInitials(user.email)}
          </div>
          
          {/* Indicateur dropdown */}
          <ChevronDown 
            size={16} 
            className={`text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
            >
              {/* Header Profil */}
              <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Connecté en tant que</p>
                <p className="text-sm font-semibold text-slate-800 truncate" title={user.email}>{user.email}</p>
              </div>

              {/* Options */}
              <div className="p-2">
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors flex items-center gap-3"
                >
                  <User size={16} />
                  Mon Profil
                </button>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Settings size={16} />
                  Paramètres
                </button>
              </div>

              <div className="h-px bg-slate-100 my-1 mx-2"></div>

              <div className="p-2">
                <button 
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3 font-medium"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Toast Feedback Sauvegarde */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 bg-slate-800 text-white text-sm py-2 px-4 rounded-full shadow-xl z-[100] flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};