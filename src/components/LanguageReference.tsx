import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const REFERENCE = [
  {
    title: 'Core Types',
    content: `**number** - Any number: \`42\`, \`3.14\`, \`-10\`
**text** - Strings: \`"hello"\`, \`'world'\`, \`\`backticks\`\`
**truth** - Booleans: \`yep\`, \`nope\`
**void** - Null value: \`void\`
**list** - Arrays: \`[1, 2, 3]\`
**tome** - Dictionaries: \`:: "key": value ;;\``,
  },
  {
    title: 'Variables',
    content: `Use \`forge\` and \`be\`:
\`\`\`
forge x be 10
forge name be "sdev"
x be 20  // reassign
\`\`\``,
  },
  {
    title: 'Conjurations (Functions)',
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
    content: `**Math:** \`+\`, \`-\`, \`*\`, \`/\`, \`%\`, \`^\` (power)
**Compare:** \`equals\`, \`differs\`, \`<\`, \`>\`, \`<=\`, \`>=\`
**Logic:** \`also\` (and), \`either\` (or), \`isnt\` (not)
**Pipe:** \`|>\` chains function calls
**Text concat:** \`"a" + "b"\` → \`"ab"\``,
  },
  {
    title: 'Pipe Operator',
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
    content: `**Blocks:** \`::\` starts, \`;;\` ends (no braces!)
**No semicolons** required at end of statements
**Power operator:** \`2^10\` for exponentiation
**yep/nope** instead of true/false
**void** instead of null`,
  },
];

export function LanguageReference() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground">Language Reference</span>
      </div>
      <Accordion type="single" collapsible className="px-2">
        {REFERENCE.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-border">
            <AccordionTrigger className="text-sm py-3 hover:no-underline">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-4">
              <div className="prose prose-sm prose-invert max-w-none">
                {item.content.split('\n').map((line, j) => {
                  if (line.startsWith('```')) return null;
                  if (line.startsWith('**') && line.includes('**')) {
                    const parts = line.split('**');
                    return (
                      <p key={j} className="my-1">
                        <strong className="text-foreground">{parts[1]}</strong>
                        {parts[2]}
                      </p>
                    );
                  }
                  if (line.startsWith('`') && line.endsWith('`')) {
                    return (
                      <code key={j} className="block my-1 px-2 py-1 bg-muted rounded text-xs font-mono">
                        {line.slice(1, -1)}
                      </code>
                    );
                  }
                  if (line.trim()) {
                    return (
                      <code key={j} className="block px-2 py-0.5 bg-muted/50 text-xs font-mono">
                        {line}
                      </code>
                    );
                  }
                  return null;
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
