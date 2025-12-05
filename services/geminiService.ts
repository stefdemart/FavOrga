import { GoogleGenAI } from "@google/genai";
import { Bookmark } from "./types";

// Catégories fixes
export const AVAILABLE_CATEGORIES = [
  "Développement & Tech",
  "Design & UX",
  "Actualités & Média",
  "Commerce & Shopping",
  "Finance & Business",
  "Éducation & Apprentissage",
  "Divertissement & Loisirs",
  "Outils & Productivité",
  "Voyage & Lifestyle",
  "Autre"
];

// Helper pour introduire un délai
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const categorizeBookmarks = async (bookmarks: Bookmark[]): Promise<Bookmark[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key manquante");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash"; 

  // Configuration anti-429 (Rate Limiting)
  // Le plan gratuit est souvent limité à ~15 RPM (Requêtes par minute).
  // Batch size petit + délai important entre les appels.
  const batchSize = 3;
  const categorizedBookmarks = [...bookmarks];

  for (let i = 0; i < bookmarks.length; i += batchSize) {
    const batch = bookmarks.slice(i, i + batchSize);

    // Pause préventive entre les lots
    // 4000ms garantit qu'on ne dépasse pas ~15 RPM même si la réponse est rapide.
    if (i > 0) {
        await delay(4000); 
    }

    const prompt = `
      Tu es un assistant de classement de favoris.
      Voici une liste de favoris (Titre - URL).
      Assigne à chacun EXACTEMENT une catégorie parmi cette liste : ${AVAILABLE_CATEGORIES.join(", ")}.
      Si tu ne sais pas, utilise "Autre".
      
      Réponds UNIQUEMENT avec un objet JSON au format :
      {
        "results": [
          { "id": "id_du_favori", "category": "Nom de la catégorie" }
        ]
      }

      Favoris à classer :
      ${JSON.stringify(batch.map(b => ({ id: b.id, title: b.title, url: b.url })))}
    `;

    let retryCount = 0;
    const maxRetries = 3;
    let success = false;

    while (!success && retryCount < maxRetries) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        const responseText = result.text;
        if (responseText) {
          const json = JSON.parse(responseText);
          if (json.results && Array.isArray(json.results)) {
            json.results.forEach((res: { id: string; category: string }) => {
              const index = categorizedBookmarks.findIndex(b => b.id === res.id);
              if (index !== -1 && AVAILABLE_CATEGORIES.includes(res.category)) {
                categorizedBookmarks[index] = {
                  ...categorizedBookmarks[index],
                  category: res.category
                };
              }
            });
          }
        }
        success = true;

      } catch (e: any) {
        retryCount++;
        const isQuotaError = e.message && (e.message.includes("429") || e.message.includes("RESOURCE_EXHAUSTED"));
        
        console.warn(`Erreur batch ${i} (tentative ${retryCount}/${maxRetries})`, e);

        if (isQuotaError) {
          if (retryCount < maxRetries) {
            // Backoff exponentiel : 10s, 20s...
            const waitTime = 10000 * retryCount;
            console.warn(`Quota atteint (429). Pause de ${waitTime/1000}s avant retry...`);
            await delay(waitTime);
          } else {
            console.error("Abandon du batch après plusieurs échecs de quota.");
            // Si on échoue trop souvent sur le quota, on arrête tout le processus pour ne pas bloquer l'UI indéfiniment
            return finalize(categorizedBookmarks);
          }
        } else {
          // Autres erreurs (réseau, parsing) : petite pause et retry
          if (retryCount < maxRetries) await delay(2000);
        }
      }
    }
  }

  return finalize(categorizedBookmarks);
};

// Helper pour finaliser le tableau (mettre _A VOIR par défaut)
const finalize = (bookmarks: Bookmark[]) => {
  return bookmarks.map(b => {
    if (!b.category) {
      return { ...b, folderPath: ["_A VOIR", ...b.folderPath] };
    }
    return b;
  });
};
