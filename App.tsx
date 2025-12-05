import React, { useState } from "react";
import { Bookmark, BookmarkSource, AppView, LinkCheckResult, AuthUser } from "./services/types";
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

import { LayoutDashboard, List, Grid, CopyPlus, Activity, Eye, Sliders, Download } from "lucide-react";

interface AppProps {
  user: AuthUser;
  onLogout: () => void;
}

const App: React.FC<AppProps> = ({ user, onLogout }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);

  // --- Handlers ---

  const handleImport = async (file: File, source: BookmarkSource, mode: "master" | "merge") => {
    const text = await file.text();
    const newBookmarks = parseBookmarks(text, source);
    
    if (mode === "master") {
      setBookmarks(newBookmarks);
    } else {
      // Merge: Avoid exact URL duplicates from new batch
      const existingUrls = new Set(bookmarks.map(b => b.url));
      const filteredNew = newBookmarks.filter(b => !existingUrls.has(b.url));
      setBookmarks([...bookmarks, ...filteredNew]);
    }
  };

  const handleRestore = (restoredBookmarks: Bookmark[]) => {
    setBookmarks(restoredBookmarks);
    setView(AppView.DASHBOARD);
  };

  const handleDelete = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setBookmarks(bookmarks.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b));
  };

  const handleUpdateStatus = (results: LinkCheckResult[]) => {
    setBookmarks(prev => prev.map(b => {
      const res = results.find(r => r.id === b.id);
      if (res) {
        return { 
          ...b, 
          linkStatus: res.status, 
          linkStatusCode: res.httpCode, 
          linkStatusMessage: res.message 
        };
      }
      return b;
    }));
  };

  // --- UI Layout ---

  const NavButton = ({ target, icon: Icon, label }: { target: AppView; icon: any; label: string }) => (
    <button
      onClick={() => setView(target)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium
        ${view === target ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-200"}`}
    >
      <Icon size={18} />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">B</div>
             <span className="font-bold text-slate-800 text-lg hidden sm:block">Bookmarks Central AI</span>
          </div>
          
          <div className="flex items-center gap-4">
             <AccountMenu 
                user={user} 
                bookmarks={bookmarks} 
                onLogout={onLogout} 
                onRestore={handleRestore}
             />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        
        {/* Navigation Toolbar */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm overflow-x-auto">
          <NavButton target={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavButton target={AppView.IMPORT} icon={Download} label="Importer" />
          <div className="w-px bg-slate-200 mx-2"></div>
          <NavButton target={AppView.VISUAL} icon={Grid} label="Galerie" />
          <NavButton target={AppView.LIST} icon={List} label="Liste" />
          <NavButton target={AppView.SMART_COLLECTIONS} icon={Sliders} label="Collections" />
          <div className="w-px bg-slate-200 mx-2"></div>
          <NavButton target={AppView.REVIEW} icon={Eye} label="Review" />
          <NavButton target={AppView.DUPLICATES} icon={CopyPlus} label="Doublons" />
          <NavButton target={AppView.LINK_CHECKER} icon={Activity} label="Diagnostic" />
        </div>

        {/* View Switcher */}
        <div className="animate-fade-in">
          {view === AppView.DASHBOARD && <Dashboard bookmarks={bookmarks} />}
          
          {view === AppView.IMPORT && (
            <div className="max-w-3xl mx-auto">
              <ImportSection onImport={handleImport} />
              <AiSorter bookmarks={bookmarks} onUpdateBookmarks={setBookmarks} />
            </div>
          )}

          {view === AppView.LIST && (
            <BookmarkList bookmarks={bookmarks} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />
          )}

          {view === AppView.VISUAL && (
            <VisualGallery bookmarks={bookmarks} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />
          )}

          {view === AppView.DUPLICATES && (
             <DuplicateFinder bookmarks={bookmarks} onDelete={handleDelete} />
          )}

          {view === AppView.LINK_CHECKER && (
             <LinkChecker bookmarks={bookmarks} onUpdateStatus={handleUpdateStatus} />
          )}

          {view === AppView.REVIEW && (
             <ReviewMode bookmarks={bookmarks} onDelete={handleDelete} onKeep={() => {}} />
          )}

          {view === AppView.SMART_COLLECTIONS && (
             <SmartCollectionsView bookmarks={bookmarks} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />
          )}
        </div>

        {/* Floating Export FAB (visible except on Import/Export view) */}
        {view !== AppView.IMPORT && bookmarks.length > 0 && (
           <div className="fixed bottom-6 right-6">
             <button 
               onClick={() => setView(AppView.EXPORT)}
               className="bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition-transform hover:scale-105"
               title="Exporter"
             >
               <Download />
             </button>
           </div>
        )}

        {view === AppView.EXPORT && (
          <div className="max-w-2xl mx-auto mt-10">
            <ExportMenu bookmarks={bookmarks} />
            <div className="mt-8 text-center">
              <button onClick={() => setView(AppView.DASHBOARD)} className="text-blue-600 underline">Retour au Dashboard</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
