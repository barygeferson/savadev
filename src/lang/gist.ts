// Gist fetching utilities for sdev library imports

export interface GistFile {
  filename: string;
  content: string;
}

export interface GistCache {
  [gistId: string]: {
    files: GistFile[];
    timestamp: number;
  };
}

const gistCache: GistCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function parseGistUrl(url: string): { gistId: string; filename?: string } | null {
  // Formats:
  // https://gist.github.com/username/gistid
  // https://gist.github.com/gistid
  // gist:gistid
  // gist:username/gistid
  // gist:gistid/filename.sdev
  
  if (url.startsWith('gist:')) {
    const parts = url.slice(5).split('/');
    if (parts.length === 1) {
      return { gistId: parts[0] };
    } else if (parts.length === 2) {
      // Could be username/gistid or gistid/filename
      if (parts[1].includes('.')) {
        return { gistId: parts[0], filename: parts[1] };
      }
      return { gistId: parts[1] };
    } else if (parts.length === 3) {
      return { gistId: parts[1], filename: parts[2] };
    }
    return null;
  }
  
  const gistPattern = /gist\.github\.com\/(?:[\w-]+\/)?([a-f0-9]+)(?:#file-(.+))?/;
  const match = url.match(gistPattern);
  if (match) {
    return {
      gistId: match[1],
      filename: match[2]?.replace(/-/g, '.'),
    };
  }
  
  // Try as raw gist ID
  if (/^[a-f0-9]+$/.test(url)) {
    return { gistId: url };
  }
  
  return null;
}

export async function fetchGist(gistId: string): Promise<GistFile[]> {
  // Check cache
  const cached = gistCache[gistId];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.files;
  }
  
  const response = await fetch(`https://api.github.com/gists/${gistId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch gist: ${response.status}`);
  }
  
  const data = await response.json();
  const files: GistFile[] = Object.values(data.files).map((f: unknown) => {
    const file = f as { filename: string; content: string };
    return {
      filename: file.filename,
      content: file.content,
    };
  });
  
  // Cache the result
  gistCache[gistId] = { files, timestamp: Date.now() };
  
  return files;
}

export async function fetchGistCode(url: string): Promise<string> {
  const parsed = parseGistUrl(url);
  if (!parsed) {
    throw new Error(`Invalid gist URL: ${url}`);
  }
  
  const files = await fetchGist(parsed.gistId);
  
  if (parsed.filename) {
    const file = files.find(f => f.filename === parsed.filename || f.filename.toLowerCase() === parsed.filename?.toLowerCase());
    if (!file) {
      throw new Error(`File not found in gist: ${parsed.filename}`);
    }
    return file.content;
  }
  
  // Find first .sdev file or first file
  const sdevFile = files.find(f => f.filename.endsWith('.sdev'));
  if (sdevFile) return sdevFile.content;
  
  if (files.length > 0) return files[0].content;
  
  throw new Error('No files found in gist');
}
