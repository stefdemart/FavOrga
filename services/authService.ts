import { AuthUser } from "./types";

const STORAGE_KEY_USERS = "bca_users_v2_db";
const STORAGE_KEY_SESSION = "bca_session_v2";

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
  verificationCode?: string;
  resetCode?: string;
}

export const authService = {
  // 1. Inscription
  async signUp(email: string, password: string): Promise<{ user: AuthUser; requiresVerification: boolean; demoCode?: string }> {
    // Simuler latence réseau
    await new Promise(r => setTimeout(r, 800));

    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    const existingUserIndex = users.findIndex((u) => u.email === email);

    const passwordHash = await hashPassword(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserIndex !== -1) {
      const existingUser = users[existingUserIndex];
      // Si l'utilisateur existe et est déjà vérifié, erreur
      if (existingUser.isVerified) {
        throw new Error("Cet email est déjà utilisé.");
      }
      
      // Si l'utilisateur existe mais N'EST PAS vérifié, on écrase (nouvelle tentative)
      // On met à jour le mot de passe et le code
      const updatedUser: StoredUser = {
        ...existingUser,
        passwordHash,
        verificationCode,
        createdAt: new Date().toISOString() // Reset date
      };
      
      users[existingUserIndex] = updatedUser;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      return { 
        user: { id: updatedUser.id, email: updatedUser.email, createdAt: updatedUser.createdAt, isVerified: false },
        requiresVerification: true,
        demoCode: verificationCode
      };
    }

    // Nouvel utilisateur
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
      requiresVerification: true,
      demoCode: verificationCode
    };
  },

  // 1.5 Renvoyer le code
  async resendVerificationCode(email: string): Promise<{ demoCode: string }> {
    await new Promise(r => setTimeout(r, 600));
    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) throw new Error("Utilisateur introuvable.");
    
    const user = users[userIndex];
    if (user.isVerified) throw new Error("Compte déjà vérifié.");

    // Générer un nouveau code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    users[userIndex] = user;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    return { demoCode: verificationCode };
  },

  // 2. Vérification Email
  async verifyEmail(email: string, code: string): Promise<AuthUser> {
    await new Promise(r => setTimeout(r, 600));

    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) throw new Error("Utilisateur introuvable.");
    
    const user = users[userIndex];
    if (user.verificationCode !== code) {
       throw new Error("Code de vérification incorrect.");
    }

    user.isVerified = true;
    delete user.verificationCode;
    users[userIndex] = user;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    const authUser: AuthUser = { id: user.id, email: user.email, createdAt: user.createdAt, isVerified: true };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser));
    
    return authUser;
  },

  // 3. Connexion
  async signIn(email: string, password: string): Promise<AuthUser> {
    await new Promise(r => setTimeout(r, 800));

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
       // On pourrait renvoyer le code ici, mais pour la démo on demande de refaire signUp si perdu
       throw new Error("Compte non vérifié. Veuillez valider votre email.");
    }

    const authUser: AuthUser = { id: user.id, email: user.email, createdAt: user.createdAt, isVerified: true };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser));
    return authUser;
  },

  // 4. Logout
  async signOut(): Promise<void> {
    await new Promise(r => setTimeout(r, 300));
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  // 5. Session Check
  async getCurrentUser(): Promise<AuthUser | null> {
    const session = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!session) return null;
    try {
      return JSON.parse(session) as AuthUser;
    } catch {
      return null;
    }
  },

  // 6. Reset Password Flow
  async requestPasswordReset(email: string): Promise<{ demoCode: string }> {
    await new Promise(r => setTimeout(r, 600));
    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
       throw new Error("Aucun compte associé à cet email.");
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    users[userIndex].resetCode = resetCode; 
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    return { demoCode: resetCode };
  },

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    await new Promise(r => setTimeout(r, 800));
    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) throw new Error("Utilisateur introuvable.");
    
    const user = users[userIndex];
    if (user.resetCode !== code) {
       throw new Error("Code de réinitialisation incorrect.");
    }

    const newHash = await hashPassword(newPassword);
    user.passwordHash = newHash;
    delete user.resetCode;
    
    users[userIndex] = user;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }
};