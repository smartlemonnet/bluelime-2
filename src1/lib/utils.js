import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const getYouTubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  let videoId = null;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname.includes('youtube.com')) {
      if (urlObj.pathname.includes('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1].split('?')[0];
      } else if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      }
    } else if (hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.substring(1);
    }
  } catch (e) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      videoId = match[1];
    }
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};