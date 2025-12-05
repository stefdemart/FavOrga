import React, { useState } from "react";
import { Bookmark, BookmarkSource, AppView, LinkCheckResult, AuthUser, ImportSessionSummary } from "./services/types";
import { parseBookmarks } from "./services/bookmarkParser";

// Components
import { ImportSection } from "./components/ImportSection";
import { DuplicateFinder } from "./components/DuplicateFinder";
import { BookmarkList } from "./components/BookmarkList";
import { AiSorter } from "./components/AiSorter";
import { Dashboard } from "./components/Dashboard";
import { LinkChecker } from "./components/LinkChecker";
import { VisualGallery } from "./components/VisualGallery";
import { ReviewMode } from "./components/ReviewMode";
import { SmartCollectionsView } from "./components/SmartCollectionsView";
import { ExportMenu } from "./components/ExportMenu";
import { AccountMenu } from "./components/AccountMenu";
import { gradients } from "./components/ui/GammaDesignSystem";

import { LayoutDashboard, List, Grid, CopyPlus, Activity, Eye, Sliders, Download, Menu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AppProps {
  user: AuthUser;
  onLogout: () => void;
}

const App: React.FC<AppProps> = ({ user, onLogout }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  // Démarrer directement sur la vue IMPORT
  const [view, setView] = useState<AppView>(AppView.IMPORT);
  const [importSession, setImportSession] = useState<ImportSessionSummary>({ master: null, merges: [] });
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- Logic ---
  const handleImport = async (file: File, source: BookmarkSource, mode: "master" | "merge") => {
    const text = await file.text();
    const newBookmarks = parseBookmarks(text, source);
    const count = newBookmarks.length;

    if (mode === "master") {
      setBookmarks(newBookmarks);
      setImportSession({ master: { source, count, timestamp: Date.now() }, merges: [] });
    } else {
      const existingUrls = new Set(bookmarks.map(b => b.url));
      const filteredNew = newBookmarks.filter(b => !existingUrls.has(b.url));
      setBookmarks([...bookmarks, ...filteredNew]);
      setImportSession(prev => ({ ...prev, merges: [...prev.merges, { source, count: filteredNew.length, timestamp: Date.now() }] }));
    }
  };

  const handleDelete = (id: string) => setBookmarks(bookmarks.filter((b) => b.id !== id));
  const handleToggleFavorite = (id: string) => setBookmarks(bookmarks.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b));
  
  const handleUpdateStatus = (results: LinkCheckResult[]) => {
    setBookmarks(prev => prev.map(b => {
      const res = results.find(r => r.id === b.id);
      return res ? { ...b, linkStatus: res.status, linkStatusCode: res.httpCode, linkStatusMessage: res.message } : b;
    }));
  };

  const navItems = [
    { id: AppView.IMPORT, icon: Download, label: "Importer" },
    { sep: true },
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: "Tableau de bord" },
    { id: AppView.VISUAL, icon: Grid, label: "Galerie Visuelle" },
    { id: AppView.LIST, icon: List, label: "Liste Détaillée" },
    { id: AppView.SMART_COLLECTIONS, icon: Sliders, label: "Collections" },
    { sep: true },
    { id: AppView.LINK_CHECKER, icon: Activity, label: "Diagnostic" },
    { id: AppView.DUPLICATES, icon: CopyPlus, label: "Doublons" },
    { id: AppView.REVIEW, icon: Eye, label: "Mode Review" },
  ];

  return (
    // Background global Pearl Grey selon charte Gamma
    <div className="flex min-h-screen bg-[#F5F6F8]">
      
      {/* Sidebar: Blanc Pur, border subtle */}
      <motion.aside 
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-gray-100 sticky top-0 h-screen z-40 flex flex-col transition-all duration-300 shadow-sm"
      >
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3A7BFF] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white" size={20} />
          </div>
          {isSidebarOpen && (
            <motion.span initial={{opacity:0}} animate={{opacity:1}} className="font-bold text-[#1A1A1A] tracking-tight text-lg">
              Bookmarks AI
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item, idx) => {
            if (item.sep) return <div key={idx} className="my-6 border-t border-gray-100 mx-2" />;
            const Icon = item.icon as any;
            const active = view === item.id;
            return (
              <button
                key={item.id || idx}
                onClick={() => item.id && setView(item.id as AppView)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                  ${active ? "bg-[#F5F6F8] text-[#3A7BFF] font-medium" : "text-[#6C6E73] hover:bg-[#F5F6F8] hover:text-[#1A1A1A]"}
                `}
              >
                {active && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-[#3A7BFF] rounded-r-full" />}
                {Icon && <Icon size={20} className={active ? "text-[#3A7BFF]" : "text-gray-400 group-hover:text-gray-600"} />}
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <Menu size={20} />
           </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-[#F5F6F8]/80 backdrop-blur-xl px-12 py-6 flex items-center justify-between">
           <h2 className="text-2xl font-bold text-[#1A1A1A]">{navItems.find(i => i.id === view)?.label}</h2>
           <div className="flex items-center gap-4">
              <AccountMenu user={user} bookmarks={bookmarks} onLogout={onLogout} onRestore={(b) => { setBookmarks(b); setView(AppView.DASHBOARD); }} />
           </div>
        </header>

        {/* Spacing généreux (Padding 12 = 48px) */}
        <div className="p-12 max-w-[1400px] mx-auto">
           <AnimatePresence mode="wait">
             <motion.div
               key={view}
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -15 }}
               transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
             >
                {view === AppView.DASHBOARD && <Dashboard bookmarks={bookmarks} importSession={importSession} />}
                {view === AppView.IMPORT && (
                  <>
                    <ImportSection onImport={handleImport} />
                    {bookmarks.length > 0 && <div className="mt-16"><AiSorter bookmarks={bookmarks} onUpdateBookmarks={setBookmarks} /></div>}
                  </>
                )}
                {view === AppView.VISUAL && <VisualGallery bookmarks={bookmarks} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />}
                {view === AppView.LIST && <BookmarkList bookmarks={bookmarks} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />}
                {view === AppView.LINK_CHECKER && <LinkChecker bookmarks={bookmarks} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />}
                {view === AppView.DUPLICATES && <DuplicateFinder bookmarks={bookmarks} onDelete={handleDelete} />}
                {view === AppView.REVIEW && <ReviewMode bookmarks={bookmarks} onDelete={handleDelete} onKeep={() => {}} />}
                {view === AppView.SMART_COLLECTIONS && <SmartCollectionsView bookmarks={bookmarks} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />}
             
                {/* Floating Export */}
                {view !== AppView.IMPORT && bookmarks.length > 0 && view !== AppView.EXPORT && (
                   <div className="mt-20 border-t border-gray-200 pt-10">
                      <ExportMenu bookmarks={bookmarks} />
                   </div>
                )}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;