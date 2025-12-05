import { SmartCollection, Bookmark } from "./types";

export const smartCollections: SmartCollection[] = [
  {
    id: "recent",
    name: "Ajoutés récemment",
    filterDescription: "Moins de 30 jours",
    filterFn: (b: Bookmark) => {
      const date = new Date(b.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
  },
  {
    id: "favorites",
    name: "Mes Favoris",
    filterDescription: "Marqués comme favoris",
    filterFn: (b: Bookmark) => b.isFavorite
  },
  {
    id: "uncategorized",
    name: "Non Classés",
    filterDescription: "Pas de catégorie ou dossier _A VOIR",
    filterFn: (b: Bookmark) => !b.category || b.folderPath.includes("_A VOIR")
  },
  {
    id: "suspects",
    name: "Liens Suspects",
    filterDescription: "Détectés comme potentiellement morts",
    filterFn: (b: Bookmark) => b.linkStatus === "suspect" || b.linkStatus === "dead"
  }
];
