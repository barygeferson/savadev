import { useState, useCallback } from 'react';
import { translateSource as coreTranslate, hasNonAscii } from '@/lang/translator';

/**
 * useCodeTranslation
 * ──────────────────────────────────────────────────────────────
 * Thin React wrapper around the built-in language translator that
 * lives in `src/lang/translator.ts`. Translation is now part of the
 * sdev language CORE — it runs synchronously inside the lexer for
 * EVERY entry point (interpreter, compiler, VM, REPL, edge function).
 *
 * This hook just adapts the synchronous core API to the hook-based
 * UI surface that the IDE was already built against.
 */

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
    _forceRetranslate = false
  ): Promise<TranslationResult | null> => {
    if (!code.trim()) return null;
    try {
      // Synchronous — no network, no AI, fully deterministic.
      const { translated, detectedLanguage } = coreTranslate(code, sourceLanguage);
      const result: TranslationResult = {
        translated,
        detectedLanguage: detectedLanguage ?? 'English',
        fromCache: true, // Built-in translator is always instant ⇒ "cached" in UI terms.
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

// Heuristic: does this code likely contain non-English keywords?
// Re-exported from the core translator so the IDE stays untouched.
export function mightNeedTranslation(code: string): boolean {
  if (hasNonAscii(code)) return true;
  // Quick check: if no canonical English keywords at all, may be foreign.
  return !/\b(forge|conjure|ponder|cycle|speak|yield|essence)\b/.test(code);
}
