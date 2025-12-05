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

  // Réduction drastique de la taille du lot pour éviter le 429 (Quota Exceeded)
  // Le plan gratuit autorise un nombre limité de requêtes par minute (RPM)
  const batchSize = 5;
  const categorizedBookmarks = [...bookmarks];

  for (let i = 0; i < bookmarks.length; i += batchSize) {
    const batch = bookmarks.slice(i, i + batchSize);

    // Pause obligatoire entre les lots pour respecter le Rate Limit
    if (i > 0) {
        await delay(2000); // 2 secondes de pause
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
    } catch (e: any) {
      console.error("Erreur IA classification batch", e);
      
      // Gestion spécifique du 429 : On arrête proprement pour ne pas perdre ce qui est déjà fait
      if (e.message && (e.message.includes("429") || e.message.includes("RESOURCE_EXHAUSTED"))) {
          console.warn("Quota API atteint (429). Arrêt de la classification pour l'instant.");
          break; // On sort de la boucle et on renvoie ce qu'on a déjà classé
      }
    }
  }

  // Assigner _A VOIR pour les non classés (ceux qui restaient ou si l'API a échoué)
  return categorizedBookmarks.map(b => {
    if (!b.category) {
      return { ...b, folderPath: ["_A VOIR", ...b.folderPath] };
    }
    return b;
  });
};