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
  // Le plan gratuit est très limité (15 RPM max, parfois moins en pic).
  // On garde un batch petit et on augmente les délais.
  const batchSize = 3; 
  const categorizedBookmarks = [...bookmarks];

  for (let i = 0; i < bookmarks.length; i += batchSize) {
    const batch = bookmarks.slice(i, i + batchSize);

    // Pause préventive entre les lots
    // 5000ms = 12 requêtes / minute max théorique.
    if (i > 0) {
        await delay(5000); 
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
          // Backoff agressif pour 429 : 15s, 30s, 45s
          const waitTime = 15000 * retryCount;
          console.warn(`Quota atteint (429). Pause de ${waitTime/1000}s avant retry...`);
          await delay(waitTime);
        } else {
          // Autres erreurs : petite pause
          if (retryCount < maxRetries) await delay(2000);
        }
      }
    }
    
    // FAIL-SOFT : Si le batch échoue totalement après 3 essais, on log l'erreur mais on CONTINUE.
    // Les favoris de ce batch resteront simplement non classés.
    if (!success) {
        console.error(`Batch ${i} abandonné après ${maxRetries} tentatives. Les favoris de ce lot resteront non classés.`);
    }
  }

  return finalize(categorizedBookmarks);
};

// Helper pour finaliser le tableau (mettre _A VOIR par défaut si pas de catégorie)
const finalize = (bookmarks: Bookmark[]) => {
  return bookmarks.map(b => {
    if (!b.category) {
      return { ...b, folderPath: ["_A VOIR", ...b.folderPath] };
    }
    return b;
  });
};