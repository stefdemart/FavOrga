import { AuthUser } from "./types";

/**
 * Service d'authentification (Mock sécurisé).
 * NOTE: En production, remplacez ceci par Supabase Auth, Firebase Auth, ou un backend OAuth.
 * Ce mock utilise Web Crypto pour hasher les mots de passe avant stockage localStorage.
 */

const STORAGE_KEY_USERS = "bca_users_db";
const STORAGE_KEY_SESSION = "bca_session";

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  isVerified: boolean;
  verificationCode?: string; // Stocké temporairement pour le mock
}

export const authService = {
  async signUp(email: string, password: string): Promise<{ user: AuthUser; requiresVerification: boolean }> {
    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.find((u) => u.email === email)) {
      throw new Error("Cet email est déjà utilisé.");
    }

    const passwordHash = await hashPassword(password);
    
    // Génération d'un code à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Simulation envoi email
    console.log(`[SIMULATION EMAIL] Code de vérification pour ${email} : ${verificationCode}`);
    alert(`[SIMULATION] Votre code de vérification est : ${verificationCode}`);

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
      isVerified: false,
      verificationCode
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    return { 
      user: { id: newUser.id, email: newUser.email, createdAt: newUser.createdAt, isVerified: false },
      requiresVerification: true 
    };
  },

  async verifyEmail(email: string, code: string): Promise<AuthUser> {
    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) throw new Error("Utilisateur introuvable.");
    
    const user = users[userIndex];
    if (user.verificationCode !== code) {
       throw new Error("Code de vérification incorrect.");
    }

    // Valider l'utilisateur
    user.isVerified = true;
    delete user.verificationCode;
    users[userIndex] = user;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    // Créer la session
    const authUser: AuthUser = { id: user.id, email: user.email, createdAt: user.createdAt, isVerified: true };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser));
    
    return authUser;
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error("Identifiants invalides.");
    }

    const inputHash = await hashPassword(password);
    if (inputHash !== user.passwordHash) {
      throw new Error("Identifiants invalides.");
    }
    
    if (!user.isVerified) {
       throw new Error("Compte non vérifié. Veuillez vous réinscrire pour recevoir un nouveau code.");
    }

    const authUser: AuthUser = { id: user.id, email: user.email, createdAt: user.createdAt, isVerified: true };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser));
    return authUser;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const session = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!session) return null;
    try {
      return JSON.parse(session) as AuthUser;
    } catch {
      return null;
    }
  },
};