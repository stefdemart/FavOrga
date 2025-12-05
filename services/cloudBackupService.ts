import { Bookmark, CloudSnapshotMeta } from "./types";

/**
 * Service de sauvegarde Cloud (Mock Chiffré).
 * Simule un backend en stockant des blobs JSON chiffrés (AES-GCM) dans localStorage.
 * Chaque utilisateur a son propre espace de stockage isolé par son User ID.
 */

const BACKUP_PREFIX = "bca_backup_";

// Helper pour générer une clé de chiffrement dérivée de l'ID utilisateur (pour la démo)
// En prod: La clé viendrait d'un serveur ou d'un key wrapping plus complexe.
async function getCryptoKey(userId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(userId.padEnd(32, "0").slice(0, 32)), // Pad simple pour la démo
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("salt_simulated_cloud"),
      iterations: 1000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export const cloudBackupService = {
  async listSnapshots(userId: string): Promise<CloudSnapshotMeta[]> {
    const key = `${BACKUP_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    try {
      const data = JSON.parse(stored);
      // Dans ce mock simple, on stocke qu'une seule sauvegarde "Latest", mais on retourne un tableau pour l'interface
      return [
        {
          id: "latest",
          createdAt: data.createdAt,
          bookmarkCount: data.count,
        },
      ];
    } catch {
      return [];
    }
  },

  async saveSnapshot(userId: string, bookmarks: Bookmark[]): Promise<void> {
    const key = await getCryptoKey(userId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(bookmarks));

    const encryptedContent = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedData
    );

    // Stockage format: { iv: [bytes], data: [bytes], createdAt: string, count: number }
    const payload = {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedContent)),
      createdAt: new Date().toISOString(),
      count: bookmarks.length,
    };

    localStorage.setItem(`${BACKUP_PREFIX}${userId}`, JSON.stringify(payload));
  },

  async loadLatestSnapshot(userId: string): Promise<Bookmark[] | null> {
    const storageKey = `${BACKUP_PREFIX}${userId}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    try {
      const payload = JSON.parse(stored);
      const key = await getCryptoKey(userId);
      const iv = new Uint8Array(payload.iv);
      const data = new Uint8Array(payload.data);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
      );

      const decryptedString = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decryptedString) as Bookmark[];
    } catch (e) {
      console.error("Erreur déchiffrement sauvegarde:", e);
      return null;
    }
  },
};
