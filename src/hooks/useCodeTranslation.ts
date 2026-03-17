import { useState, useCallback } from 'react';

// Simple djb2 hash for cache keys
function hashCode(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0; // keep unsigned 32-bit
  }
  return h.toString(36);
}

const LS_TRANSLATION_CACHE = 'sdev-translation-cache';

interface CacheEntry {
  translated: string;
  detectedLanguage: string;
  timestamp: number;
}

function loadCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(LS_TRANSLATION_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, CacheEntry>) {
  // Keep only 50 most recent entries
  const entries = Object.entries(cache).sort((a, b) => b[1].timestamp - a[1].timestamp).slice(0, 50);
  localStorage.setItem(LS_TRANSLATION_CACHE, JSON.stringify(Object.fromEntries(entries)));
}

export interface TranslationResult {
  translated: string;
  detectedLanguage: string;
  fromCache: boolean;
}

export interface TranslationState {
  isTranslating: boolean;
  lastResult: TranslationResult | null;
  error: string | null;
}

export function useCodeTranslation() {
  const [state, setState] = useState<TranslationState>({
    isTranslating: false,
    lastResult: null,
    error: null,
  });

  const translate = useCallback(async (
    code: string,
    sourceLanguage: string = 'auto',
    forceRetranslate = false
  ): Promise<TranslationResult | null> => {
    if (!code.trim()) return null;

    const cacheKey = hashCode(code + sourceLanguage);
    const cache = loadCache();

    // Return cached result unless forced
    if (!forceRetranslate && cache[cacheKey]) {
      const result: TranslationResult = {
        translated: cache[cacheKey].translated,
        detectedLanguage: cache[cacheKey].detectedLanguage,
        fromCache: true,
      };
      setState(prev => ({ ...prev, lastResult: result, error: null }));
      return result;
    }

    setState(prev => ({ ...prev, isTranslating: true, error: null }));

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/translate-sdev`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ code, sourceLanguage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      // Save to cache
      cache[cacheKey] = {
        translated: data.translated,
        detectedLanguage: data.detectedLanguage,
        timestamp: Date.now(),
      };
      saveCache(cache);

      const result: TranslationResult = {
        translated: data.translated,
        detectedLanguage: data.detectedLanguage,
        fromCache: false,
      };
      setState({ isTranslating: false, lastResult: result, error: null });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState(prev => ({ ...prev, isTranslating: false, error: msg }));
      return null;
    }
  }, []);

  const clearLastResult = useCallback(() => {
    setState(prev => ({ ...prev, lastResult: null, error: null }));
  }, []);

  return { ...state, translate, clearLastResult };
}

// Check if code likely needs translation (contains non-ASCII or non-English sdev keywords)
const SDEV_ENGLISH_KEYWORDS = new Set([
  'forge', 'be', 'conjure', 'yield', 'ponder', 'otherwise', 'cycle', 'iterate',
  'through', 'within', 'yeet', 'skip', 'speak', 'essence', 'extend', 'self',
  'super', 'new', 'attempt', 'rescue', 'also', 'either', 'isnt', 'equals',
  'differs', 'yep', 'nope', 'void', 'summon', 'async', 'await', 'spawn',
]);

export function mightNeedTranslation(code: string): boolean {
  // Has non-ASCII characters (Chinese, Arabic, Cyrillic, accented Latin, etc.)
  if (/[^\x00-\x7F]/.test(code)) return true;

  // Extract words and check if any look like they might be foreign keywords
  const words = code.toLowerCase().match(/\b[a-z_][a-z0-9_]*\b/g) ?? [];
  const nonKeywordWords = words.filter(w =>
    !SDEV_ENGLISH_KEYWORDS.has(w) &&
    w.length > 3 &&
    !/^(true|false|null|undefined|function|return|if|else|while|for|class|this|import|export|const|let|var|int|str|bool|float|def|end|do|then|begin|in|of|and|or|not|mod|div)$/.test(w)
  );

  // If many words are not sdev keywords and not comments, might be foreign
  const commentlessCode = code.replace(/#.*/g, '').replace(/\/\/.*/g, '');
  const totalWords = commentlessCode.toLowerCase().match(/\b[a-z_][a-z0-9_]*\b/g) ?? [];
  if (totalWords.length === 0) return false;

  // Check comment language — if comments have non-English sentences
  const comments = code.match(/#.+/g) ?? [];
  for (const c of comments) {
    if (/[^\x00-\x7F]/.test(c)) return true;
  }

  return nonKeywordWords.length > totalWords.length * 0.4;
}
