import React, { useState, useEffect } from "react";
import { AuthUser } from "../services/types";
import { authService } from "../services/authService";
import App from "../App";
import { Lock, LogIn, UserPlus, ShieldCheck, Mail, Info, KeyRound, ArrowLeft } from "lucide-react";

type AuthView = "LOGIN" | "SIGNUP" | "VERIFY" | "FORGOT_REQUEST" | "FORGOT_CONFIRM";

export const AuthGate: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AuthView>("LOGIN");
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null); // Pour affichage UI
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (view === "LOGIN") {
        const authUser = await authService.signIn(email, password);
        setUser(authUser);
      } else if (view === "SIGNUP") {
        const result = await authService.signUp(email, password);
        if (result.requiresVerification) {
           setDemoCode(result.demoCode || null);
           setView("VERIFY");
        } else {
           setUser(result.user);
        }
      } else if (view === "VERIFY") {
         const authUser = await authService.verifyEmail(email, verificationCode);
         setUser(authUser);
      } else if (view === "FORGOT_REQUEST") {
         const result = await authService.requestPasswordReset(email);
         setDemoCode(result.demoCode);
         setView("FORGOT_CONFIRM");
      } else if (view === "FORGOT_CONFIRM") {
         await authService.confirmPasswordReset(email, verificationCode, password);
         setSuccessMsg("Mot de passe réinitialisé avec succès ! Connectez-vous.");
         setView("LOGIN");
         setPassword("");
         setVerificationCode("");
         setDemoCode(null);
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
    setDemoCode(null);
    setError(null);
    setSuccessMsg(null);
  };

  const resetForm = (newView: AuthView) => {
      setView(newView);
      setError(null);
      setSuccessMsg(null);
      setPassword("");
      setVerificationCode("");
      setDemoCode(null);
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
            {view === "VERIFY" || view === "FORGOT_CONFIRM" ? <ShieldCheck className="text-white w-8 h-8" /> : 
             view.includes("FORGOT") ? <KeyRound className="text-white w-8 h-8" /> : 
             <Lock className="text-white w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-white">Bookmarks Central AI</h1>
          <p className="text-slate-400 mt-2">Centralisez, nettoyez et sécurisez vos favoris.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm animate-pulse">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 rounded mb-4 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {(view === "VERIFY" || view === "FORGOT_CONFIRM") && (
             <div className="animate-fade-in-up">
                
                {/* Simulation de réception Email */}
                {demoCode && (
                  <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded mb-6 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                       <Mail size={64} className="text-yellow-500" />
                    </div>
                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase mb-1">
                       <Info size={14} /> Simulation d'Email
                    </div>
                    <p className="text-yellow-200 text-sm leading-relaxed">
                       Puisque ceci est une démo sans serveur SMTP, voici le code que vous auriez reçu par email :
                    </p>
                    <div className="mt-2 bg-slate-900/50 p-2 rounded text-center">
                       <span className="text-2xl font-mono font-bold text-white tracking-widest select-all">{demoCode}</span>
                    </div>
                  </div>
                )}

                <div className="text-blue-200 text-sm text-center mb-4 bg-blue-900/30 p-3 rounded">
                   Code de {view === "VERIFY" ? "vérification" : "réinitialisation"} pour <strong>{email}</strong>.
                </div>
                
                <label className="block text-slate-300 text-sm font-medium mb-1">Code reçu</label>
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
          )}

          {/* Email field needed for Login, Signup and Forgot Request */}
          {view !== "VERIFY" && view !== "FORGOT_CONFIRM" && (
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
          )}

          {/* Password field for Login, Signup and Reset Confirm */}
          {(view === "LOGIN" || view === "SIGNUP" || view === "FORGOT_CONFIRM") && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">
                   {view === "FORGOT_CONFIRM" ? "Nouveau mot de passe" : "Mot de passe"}
                </label>
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {view === "LOGIN" && <><LogIn size={18} /> Se connecter</>}
            {view === "SIGNUP" && <><Mail size={18} /> S'inscrire avec Email</>}
            {view === "VERIFY" && <><ShieldCheck size={18} /> Valider le code</>}
            {view === "FORGOT_REQUEST" && <><KeyRound size={18} /> Envoyer code de reset</>}
            {view === "FORGOT_CONFIRM" && <><Lock size={18} /> Changer le mot de passe</>}
          </button>
        </form>

        {view === "LOGIN" && (
           <div className="mt-3 text-right">
              <button onClick={() => resetForm("FORGOT_REQUEST")} className="text-slate-500 hover:text-blue-400 text-xs">
                 Mot de passe oublié ?
              </button>
           </div>
        )}

        {view !== "VERIFY" && view !== "FORGOT_CONFIRM" && view !== "FORGOT_REQUEST" && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                 resetForm(view === "LOGIN" ? "SIGNUP" : "LOGIN");
              }}
              className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4"
            >
              {view === "LOGIN"
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        )}
        
        {(view === "VERIFY" || view === "FORGOT_REQUEST" || view === "FORGOT_CONFIRM") && (
           <div className="mt-6 text-center">
              <button 
                 onClick={() => resetForm("LOGIN")} 
                 className="text-slate-500 hover:text-white text-xs flex items-center justify-center gap-1 mx-auto"
              >
                 <ArrowLeft size={12} /> Retour à la connexion
              </button>
           </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          Securité : Hashage client SHA-256 + Mock 2FA.
        </div>
      </div>
    </div>
  );
};