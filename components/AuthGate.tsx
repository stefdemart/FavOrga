import React, { useState, useEffect } from "react";
import { AuthUser } from "../services/types";
import { authService } from "../services/authService";
import App from "../App";
import { Lock, LogIn, UserPlus, ShieldCheck, Mail } from "lucide-react";

type AuthView = "LOGIN" | "SIGNUP" | "VERIFY";

export const AuthGate: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AuthView>("LOGIN");
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (view === "LOGIN") {
        const authUser = await authService.signIn(email, password);
        setUser(authUser);
      } else if (view === "SIGNUP") {
        const result = await authService.signUp(email, password);
        if (result.requiresVerification) {
           setView("VERIFY");
        } else {
           setUser(result.user);
        }
      } else if (view === "VERIFY") {
         const authUser = await authService.verifyEmail(email, verificationCode);
         setUser(authUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
    setView("LOGIN");
    setEmail("");
    setPassword("");
    setVerificationCode("");
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si utilisateur connecté, on rend l'application
  if (user) {
    return <App user={user} onLogout={handleLogout} />;
  }

  // Sinon, écrans d'auth
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/50">
            {view === "VERIFY" ? <ShieldCheck className="text-white w-8 h-8" /> : <Lock className="text-white w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-white">Bookmarks Central AI</h1>
          <p className="text-slate-400 mt-2">Centralisez, nettoyez et sécurisez vos favoris.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {view === "VERIFY" ? (
             <div className="animate-fade-in-up">
                <div className="text-blue-200 text-sm text-center mb-4 bg-blue-900/30 p-3 rounded">
                   Un code de vérification a été envoyé à <strong>{email}</strong> (Vérifiez la console ou l'alerte pour la démo).
                </div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Code de vérification (6 chiffres)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-center tracking-[0.5em] text-xl"
                  placeholder="000000"
                />
             </div>
          ) : (
             <>
               <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
             </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {view === "LOGIN" && <><LogIn size={18} /> Se connecter</>}
            {view === "SIGNUP" && <><Mail size={18} /> S'inscrire avec Email</>}
            {view === "VERIFY" && <><ShieldCheck size={18} /> Valider le code</>}
          </button>
        </form>

        {view !== "VERIFY" && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                 setView(view === "LOGIN" ? "SIGNUP" : "LOGIN");
                 setError(null);
              }}
              className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4"
            >
              {view === "LOGIN"
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        )}
        
        {view === "VERIFY" && (
           <div className="mt-6 text-center">
              <button onClick={() => setView("SIGNUP")} className="text-slate-500 hover:text-white text-xs">Retour</button>
           </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          Securité : Hashage client SHA-256 + Mock 2FA.
        </div>
      </div>
    </div>
  );
};