import React, { useState, useEffect } from "react";
import { AuthUser } from "../services/types";
import { authService } from "../services/authService";
import App from "../App";
import { motion, AnimatePresence } from "framer-motion";
import { GammaCard, GammaButton, GammaInput, gradients } from "./ui/GammaDesignSystem";
import { Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Sparkles, KeyRound, RotateCcw } from "lucide-react";

type AuthView = "LOGIN" | "SIGNUP" | "VERIFY" | "FORGOT_REQUEST" | "FORGOT_CONFIRM";

export const AuthGate: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AuthView>("LOGIN");
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (view === "LOGIN") {
        try {
          const authUser = await authService.signIn(email, password);
          setUser(authUser);
        } catch (err: any) {
          // Si compte non vérifié, on propose de vérifier (via le catch général pour l'instant, 
          // mais on pourrait rediriger automatiquement si l'erreur est spécifique)
          throw err;
        }
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
         setView("LOGIN");
         setPassword("");
         setVerificationCode("");
         setDemoCode(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await authService.resendVerificationCode(email);
      setDemoCode(result.demoCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur renvoi code");
    } finally {
      setIsSubmitting(false);
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
  };

  if (loading) return null; // Or a nice full-screen loader

  if (user) {
    return <App user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-200/30 rounded-full blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <div className={`mx-auto w-16 h-16 rounded-2xl ${gradients.primary} flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20`}>
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Bookmarks Central</h1>
            <p className="text-slate-500 mt-2">Votre second cerveau numérique, organisé par IA.</p>
          </div>

          <GammaCard className="backdrop-blur-xl bg-white/90">
            <form onSubmit={handleAuthAction} className="space-y-5">
              
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2"
                  >
                    <AlertCircle size={16} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Simulation Box for Codes */}
              {demoCode && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-amber-50 border border-amber-100 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase mb-2">
                    <Mail size={12} /> Email Simulator
                  </div>
                  <p className="text-slate-600 text-sm mb-2">Code reçu "par email" :</p>
                  <div className="text-3xl font-mono font-bold text-amber-600 tracking-widest text-center select-all bg-white rounded-lg py-2 border border-amber-100">
                    {demoCode}
                  </div>
                </motion.div>
              )}

              {/* Fields based on View */}
              {(view === "LOGIN" || view === "SIGNUP" || view === "FORGOT_REQUEST") && (
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                   <GammaInput
                     type="email"
                     placeholder="name@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="pl-12"
                     required
                     autoFocus
                   />
                </div>
              )}

              {(view === "LOGIN" || view === "SIGNUP" || view === "FORGOT_CONFIRM") && (
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                   <GammaInput
                     type="password"
                     placeholder={view === "FORGOT_CONFIRM" ? "Nouveau mot de passe" : "Mot de passe"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="pl-12"
                     required
                   />
                </div>
              )}

              {(view === "VERIFY" || view === "FORGOT_CONFIRM") && (
                <div className="space-y-3">
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <GammaInput
                      type="text"
                      placeholder="Code à 6 chiffres"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="pl-12 text-center tracking-[0.5em] font-mono text-lg"
                      maxLength={6}
                      required
                    />
                  </div>
                  {view === "VERIFY" && (
                    <div className="flex justify-end">
                      <button 
                        type="button"
                        onClick={handleResendCode} 
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1"
                      >
                         <RotateCcw size={12} /> Renvoyer le code
                      </button>
                    </div>
                  )}
                </div>
              )}

              <GammaButton
                type="submit"
                className="w-full h-12 text-lg"
                isLoading={isSubmitting}
                icon={view === "LOGIN" ? <ArrowRight size={18} /> : view === "VERIFY" ? <CheckCircle2 size={18}/> : <ShieldCheck size={18} />}
              >
                {view === "LOGIN" && "Se connecter"}
                {view === "SIGNUP" && "Créer un compte"}
                {view === "VERIFY" && "Vérifier l'email"}
                {view === "FORGOT_REQUEST" && "Réinitialiser"}
                {view === "FORGOT_CONFIRM" && "Confirmer"}
              </GammaButton>

              {/* Navigation Links */}
              <div className="flex justify-between items-center text-sm pt-2">
                {view === "LOGIN" ? (
                  <>
                    <button type="button" onClick={() => setView("SIGNUP")} className="text-slate-500 hover:text-indigo-600 transition-colors">Créer un compte</button>
                    <button type="button" onClick={() => setView("FORGOT_REQUEST")} className="text-slate-400 hover:text-slate-600 transition-colors">Mot de passe oublié ?</button>
                  </>
                ) : (
                  <button type="button" onClick={() => { setView("LOGIN"); setError(null); }} className="text-slate-500 hover:text-indigo-600 transition-colors mx-auto">
                    Retour à la connexion
                  </button>
                )}
              </div>

            </form>
          </GammaCard>
          
          <div className="mt-8 text-center text-slate-400 text-xs">
            <p>Sécurisé avec WebCrypto SHA-256</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};