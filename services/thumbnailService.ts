/**
 * Détermine si une URL est un profil social (LinkedIn, Twitter/X).
 */
const isSocialProfile = (url: string): { type: 'linkedin' | 'twitter' | 'other', id: string } | null => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname.split('/').filter(Boolean);

    // LinkedIn Profile
    if (hostname.includes('linkedin.com') && path[0] === 'in' && path[1]) {
      return { type: 'linkedin', id: path[1] };
    }
    
    // LinkedIn Company (tentative)
    if (hostname.includes('linkedin.com') && path[0] === 'company' && path[1]) {
       // Unavatar ne supporte pas toujours bien les pages company directement via le endpoint standard,
       // mais on peut tenter.
       return { type: 'other', id: path[1] }; 
    }

    // Twitter / X
    if ((hostname === 'twitter.com' || hostname === 'x.com') && path[0]) {
      // Ignorer les pages système
      if (!['home', 'explore', 'notifications', 'messages', 'search'].includes(path[0])) {
        return { type: 'twitter', id: path[0] };
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const getThumbnailUrl = (url: string): { url: string; isAvatar: boolean } => {
  const social = isSocialProfile(url);

  if (social) {
    if (social.type === 'linkedin') {
      // Utilisation d'unavatar pour LinkedIn (fallback possible)
      return { 
        url: `https://unavatar.io/linkedin/${social.id}?fallback=https://source.boringavatars.com/beam/120/${social.id}`, 
        isAvatar: true 
      };
    }
    if (social.type === 'twitter') {
      return { 
        url: `https://unavatar.io/twitter/${social.id}`, 
        isAvatar: true 
      };
    }
  }

  // Pour les sites classiques, on utilise le screenshot WordPress (mShots)
  // ou un fallback si c'est une vidéo YouTube par exemple (on pourrait améliorer pour YT ici)
  try {
    const encodedUrl = encodeURIComponent(url);
    return { 
      url: `https://s0.wordpress.com/mshots/v1/${encodedUrl}?w=600&h=450`, 
      isAvatar: false 
    };
  } catch {
    return { 
      url: "https://picsum.photos/400/300", 
      isAvatar: false 
    };
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