import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookOpen, Variable, Wand2, GitBranch, Calculator, ArrowRight, Wrench, Sparkles } from 'lucide-react';

const REFERENCE = [
  {
    title: 'Core Types',
    icon: BookOpen,
    content: `**number** - Any number: \`42\`, \`3.14\`, \`-10\`
**text** - Strings: \`"hello"\`, \`'world'\`, \`\`backticks\`\`
**truth** - Booleans: \`yep\`, \`nope\`
**void** - Null value: \`void\`
**list** - Arrays: \`[1, 2, 3]\`
**tome** - Dictionaries: \`:: "key": value ;;\``,
  },
  {
    title: 'Variables',
    icon: Variable,
    content: `Use \`forge\` and \`be\`:
\`\`\`
forge x be 10
forge name be "sdev"
x be 20  // reassign
\`\`\``,
  },
  {
    title: 'Conjurations (Functions)',
    icon: Wand2,
    content: `Define with \`conjure\`:
\`\`\`
conjure add(a, b) ::
  yield a + b
;;

forge result be add(2, 3)
\`\`\`

**Lambdas** with \`->\`:
\`\`\`
forge double be (x) -> x * 2
forge sum be (a, b) -> a + b
\`\`\``,
  },
  {
    title: 'Control Flow',
    icon: GitBranch,
    content: `**Ponder (If):**
\`\`\`
ponder x > 10 ::
  speak("big")
;; otherwise ponder x > 5 ::
  speak("medium")
;; otherwise ::
  speak("small")
;;
\`\`\`

**Cycle (While):**
\`\`\`
cycle x < 10 ::
  x be x + 1
;;
\`\`\``,
  },
  {
    title: 'Operators',
    icon: Calculator,
    content: `**Math:** \`+\`, \`-\`, \`*\`, \`/\`, \`%\`, \`^\` (power)
**Compare:** \`equals\`, \`differs\`, \`<\`, \`>\`, \`<=\`, \`>=\`
**Logic:** \`also\` (and), \`either\` (or), \`isnt\` (not)
**Pipe:** \`|>\` chains function calls
**Text concat:** \`"a" + "b"\` → \`"ab"\``,
  },
  {
    title: 'Pipe Operator',
    icon: ArrowRight,
    content: `Chain operations with \`|>\`:
\`\`\`
// Traditional
forge doubled be each(nums, x -> x * 2)
forge filtered be sift(doubled, x -> x > 5)

// With pipes
forge result be nums |> each(x -> x * 2) |> sift(x -> x > 5)
\`\`\``,
  },
  {
    title: 'Built-in Functions',
    icon: Wrench,
    content: `**Output:** \`speak()\`, \`whisper()\`, \`shout()\`
**Type:** \`essence()\`, \`morph(value, "type")\`
**Lists:** \`measure()\`, \`gather()\`, \`pluck()\`, \`portion()\`
**Transform:** \`each()\`, \`sift()\`, \`fold()\`
**Text:** \`upper()\`, \`lower()\`, \`trim()\`, \`shatter()\`, \`weave()\`
**Math:** \`magnitude()\`, \`least()\`, \`greatest()\`, \`root()\`, \`ground()\`, \`elevate()\`, \`nearby()\`, \`chaos()\`
**Sequence:** \`sequence(n)\`, \`sequence(start, end)\`
**Tomes:** \`inscriptions()\`, \`contents()\`
**Misc:** \`reverse()\`, \`contains()\``,
  },
  {
    title: 'Unique Syntax',
    icon: Sparkles,
    content: `**Blocks:** \`::\` starts, \`;;\` ends (no braces!)
**No semicolons** required at end of statements
**Power operator:** \`2^10\` for exponentiation
**yep/nope** instead of true/false
**void** instead of null`,
  },
];

export function LanguageReference() {
  return (
    <div className="rounded-lg border border-border/50 glass overflow-hidden">
      <Accordion type="single" collapsible className="px-2">
        {REFERENCE.map((item, i) => {
          const Icon = item.icon;
          return (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/30">
              <AccordionTrigger className="text-sm py-3 hover:no-underline group">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-medium">{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 pl-9">
                <div className="space-y-2">
                  {item.content.split('\n').map((line, j) => {
                    if (line.startsWith('```')) return null;
                    if (line.startsWith('**') && line.includes('**')) {
                      const parts = line.split('**');
                      return (
                        <p key={j} className="my-1">
                          <strong className="text-primary font-mono text-xs">{parts[1]}</strong>
                          <span className="text-muted-foreground">{parts[2]}</span>
                        </p>
                      );
                    }
                    if (line.startsWith('`') && line.endsWith('`')) {
                      return (
                        <code key={j} className="block my-1 px-3 py-2 bg-background/50 border border-border/30 rounded text-xs font-mono text-foreground">
                          {line.slice(1, -1)}
                        </code>
                      );
                    }
                    if (line.trim()) {
                      return (
                        <code key={j} className="block px-3 py-1 bg-background/30 text-xs font-mono text-muted-foreground">
                          {line}
                        </code>
                      );
                    }
                    return null;
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
