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
}

export const authService = {
  async signUp(email: string, password: string): Promise<AuthUser> {
    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.find((u) => u.email === email)) {
      throw new Error("Cet email est déjà utilisé.");
    }

    const passwordHash = await hashPassword(password);
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Auto login
    const authUser: AuthUser = { id: newUser.id, email: newUser.email, createdAt: newUser.createdAt };
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

    const authUser: AuthUser = { id: user.id, email: user.email, createdAt: user.createdAt };
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
