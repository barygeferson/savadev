import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Wand2, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const LANGUAGES = [
  { value: 'python', label: 'Python', extensions: ['.py'] },
  { value: 'javascript', label: 'JavaScript', extensions: ['.js', '.mjs'] },
  { value: 'typescript', label: 'TypeScript', extensions: ['.ts', '.tsx'] },
  { value: 'java', label: 'Java', extensions: ['.java'] },
  { value: 'csharp', label: 'C#', extensions: ['.cs'] },
  { value: 'cpp', label: 'C++', extensions: ['.cpp', '.cc', '.cxx'] },
  { value: 'c', label: 'C', extensions: ['.c', '.h'] },
  { value: 'go', label: 'Go', extensions: ['.go'] },
  { value: 'rust', label: 'Rust', extensions: ['.rs'] },
  { value: 'ruby', label: 'Ruby', extensions: ['.rb'] },
  { value: 'php', label: 'PHP', extensions: ['.php'] },
  { value: 'swift', label: 'Swift', extensions: ['.swift'] },
  { value: 'kotlin', label: 'Kotlin', extensions: ['.kt', '.kts'] },
  { value: 'lua', label: 'Lua', extensions: ['.lua'] },
];

interface CodeTranslatorProps {
  onTranslated?: (code: string) => void;
}

export function CodeTranslator({ onTranslated }: CodeTranslatorProps) {
  const [sourceLanguage, setSourceLanguage] = useState('python');
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputMethod, setInputMethod] = useState<'paste' | 'upload'>('paste');
  const { toast } = useToast();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-detect language from extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const detectedLang = LANGUAGES.find(lang => 
      lang.extensions.includes(extension)
    );
    
    if (detectedLang) {
      setSourceLanguage(detectedLang.value);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputCode(content);
    };
    reader.readAsText(file);
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!inputCode.trim()) {
      toast({
        title: "No code provided",
        description: "Please paste or upload some code to translate.",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    setOutputCode('');

    try {
      const { data, error } = await supabase.functions.invoke('translate-code', {
        body: { code: inputCode, sourceLanguage },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const translated = data?.translatedCode || '';
      setOutputCode(translated);
      onTranslated?.(translated);

      toast({
        title: "Translation complete!",
        description: "Your code has been translated to sdev.",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  }, [inputCode, sourceLanguage, onTranslated, toast]);

  const handleCopy = useCallback(() => {
    if (outputCode) {
      navigator.clipboard.writeText(outputCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [outputCode]);

  const handleUseInEditor = useCallback(() => {
    if (outputCode && onTranslated) {
      onTranslated(outputCode);
      toast({
        title: "Code loaded",
        description: "The translated code has been loaded into the editor.",
      });
    }
  }, [outputCode, onTranslated, toast]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-foreground">AI Code Translator</span>
        </div>
        <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 space-y-4">
        <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'paste' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="paste" className="text-xs">Paste Code</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="mt-3">
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`Paste your ${LANGUAGES.find(l => l.value === sourceLanguage)?.label || ''} code here...`}
              className="w-full h-40 p-3 font-mono text-sm bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-3">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-violet-500/50 transition-colors bg-background/50">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload a file</span>
              <span className="text-xs text-muted-foreground mt-1">
                Supports: {LANGUAGES.flatMap(l => l.extensions).join(', ')}
              </span>
              <input
                type="file"
                className="hidden"
                accept={LANGUAGES.flatMap(l => l.extensions).join(',')}
                onChange={handleFileUpload}
              />
            </label>
            {inputCode && inputMethod === 'upload' && (
              <p className="text-xs text-muted-foreground mt-2">
                ✓ File loaded ({inputCode.split('\n').length} lines)
              </p>
            )}
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !inputCode.trim()}
          className="w-full gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Translate to sdev
            </>
          )}
        </Button>

        {outputCode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Translated sdev code:</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                {onTranslated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUseInEditor}
                    className="h-7 text-xs"
                  >
                    Use in Editor
                  </Button>
                )}
              </div>
            </div>
            <pre className="w-full max-h-60 p-3 font-mono text-sm bg-muted/50 border border-border rounded-md overflow-auto text-foreground whitespace-pre-wrap">
              {outputCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
