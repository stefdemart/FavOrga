import React, { useState } from "react";
import { AuthUser, Bookmark } from "../services/types";
import { cloudBackupService } from "../services/cloudBackupService";
import { LogOut, CloudUpload, CloudDownload, User } from "lucide-react";

interface AccountMenuProps {
  user: AuthUser;
  bookmarks: Bookmark[];
  onLogout: () => void;
  onRestore: (bookmarks: Bookmark[]) => void;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({ user, bookmarks, onLogout, onRestore }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <div className="flex items-center gap-4 bg-slate-800 p-2 px-4 rounded-lg border border-slate-700 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center">
          <User size={16} />
        </div>
        <div className="hidden md:block">
           <span className="text-xs text-slate-400 block">Compte connecté</span>
           <span className="text-sm text-slate-200 font-medium">{user.email}</span>
        </div>
      </div>

      <div className="h-8 w-px bg-slate-600 mx-2"></div>

      <div className="flex gap-2">
         <button
            onClick={handleBackup}
            disabled={loading}
            title="Sauvegarder dans le cloud chiffré"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
         >
           <CloudUpload size={18} />
         </button>
         <button
            onClick={handleRestore}
            disabled={loading}
            title="Charger la dernière sauvegarde"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
         >
           <CloudDownload size={18} />
         </button>
         <button
            onClick={onLogout}
            title="Se déconnecter"
            className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded transition-colors"
         >
           <LogOut size={18} />
         </button>
      </div>
      
      {message && (
        <div className="absolute top-16 right-4 bg-blue-600 text-white text-xs py-1 px-3 rounded shadow-lg animate-fade-in-down z-50">
          {message}
        </div>
      )}
    </div>
  );
};
