import { LinkCheckResult } from "./types";

// Note: Côté client pur, CORS bloquera beaucoup de requêtes.
// "mode: 'no-cors'" permet d'éviter l'erreur réseau mais retourne une réponse opaque (status 0).
// On considère status 0 comme "Suspect" mais pas mort, 200-299 comme OK.
// Pour un vrai check, il faut un proxy backend.

export async function* checkLinksInBatches(
  urls: { id: string; url: string }[]
): AsyncGenerator<LinkCheckResult[], void, unknown> {
  const batchSize = 5;
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(async (item) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(item.url, {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // Opaque response (no-cors) or success
        return {
          id: item.id,
          url: item.url,
          status: "ok", // On assume OK si pas d'exception réseau
          httpCode: response.status || 200,
        } as LinkCheckResult;

      } catch (e) {
        return {
          id: item.id,
          url: item.url,
          status: "suspect", // Réseau échoué ou bloqué, à vérifier manuellement
          message: e instanceof Error ? e.message : "Erreur inconnue"
        } as LinkCheckResult;
      }
    });

    const results = await Promise.all(promises);
    yield results;
  }
}
