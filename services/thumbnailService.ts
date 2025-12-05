export const getThumbnailUrl = (url: string): string => {
  // Utilisation d'un service type WordPress mShots pour la démo.
  // En prod, un service dédié est préférable pour la privacy.
  try {
    const encodedUrl = encodeURIComponent(url);
    return `https://s0.wordpress.com/mshots/v1/${encodedUrl}?w=400&h=300`;
  } catch {
    return "https://picsum.photos/400/300"; // Fallback
  }
};

export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
};
