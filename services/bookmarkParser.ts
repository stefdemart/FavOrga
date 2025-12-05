import { Bookmark, BookmarkSource } from "./types";

export const parseBookmarks = (htmlContent: string, source: BookmarkSource): Bookmark[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const bookmarks: Bookmark[] = [];
  
  const links = doc.querySelectorAll("a");
  
  links.forEach((link) => {
    const url = link.getAttribute("href");
    if (!url || url.startsWith("javascript:") || url.startsWith("place:")) return;

    // Tentative de reconstruction du chemin des dossiers
    const folderPath: string[] = [];
    let parent = link.parentElement;
    while (parent) {
      if (parent.tagName === "DL" || parent.tagName === "UL") {
        const header = parent.previousElementSibling;
        if (header && (header.tagName === "H3" || header.tagName === "DT")) {
          folderPath.unshift(header.textContent || "Dossier");
        }
      }
      parent = parent.parentElement;
    }

    const addDate = link.getAttribute("add_date");
    const createdAt = addDate 
      ? new Date(parseInt(addDate) * 1000).toISOString() 
      : new Date().toISOString();

    bookmarks.push({
      id: crypto.randomUUID(),
      title: link.textContent || "Sans titre",
      url: url,
      category: null,
      folderPath: folderPath,
      source: source,
      isFavorite: false,
      createdAt: createdAt,
      lastUpdatedAt: new Date().toISOString(),
      linkStatus: "unknown"
    });
  });

  return bookmarks;
};
