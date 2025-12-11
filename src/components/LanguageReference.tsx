import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const REFERENCE = [
  {
    title: 'Data Types',
    content: `**int** - Integer numbers: \`42\`, \`-10\`
**float** - Decimal numbers: \`3.14\`, \`-0.5\`
**string** - Text: \`"hello"\`, \`'world'\`
**bool** - Boolean: \`true\`, \`false\`
**null** - Null value: \`null\`
**list** - Arrays: \`[1, 2, 3]\`
**dict** - Objects: \`{"key": "value"}\``,
  },
  {
    title: 'Variables',
    content: `Declare with \`let\`:
\`\`\`
let x = 10;
let name = "sdev";
x = 20;  // reassign
\`\`\``,
  },
  {
    title: 'Functions',
    content: `Define with \`func\`:
\`\`\`
func add(a, b) {
  return a + b;
}

let result = add(2, 3);
\`\`\``,
  },
  {
    title: 'Control Flow',
    content: `**If/Else:**
\`\`\`
if x > 10 {
  print("big");
} else if x > 5 {
  print("medium");
} else {
  print("small");
}
\`\`\`

**While:**
\`\`\`
while x < 10 {
  x = x + 1;
}
\`\`\``,
  },
  {
    title: 'Operators',
    content: `**Arithmetic:** \`+\`, \`-\`, \`*\`, \`/\`, \`%\`
**Comparison:** \`==\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`
**Logical:** \`and\`, \`or\`, \`not\` (or \`&&\`, \`||\`, \`!\`)
**String concat:** \`"a" + "b"\` → \`"ab"\``,
  },
  {
    title: 'Built-in Functions',
    content: `**I/O:** \`print(value)\`
**Type:** \`type(x)\`, \`int(x)\`, \`float(x)\`, \`str(x)\`, \`bool(x)\`
**Collections:** \`len(x)\`, \`push(list, item)\`, \`pop(list)\`
**Strings:** \`split(str, sep)\`, \`join(list, sep)\`
**Math:** \`abs(x)\`, \`min(...)\`, \`max(...)\`, \`sqrt(x)\`, \`pow(x,y)\`, \`floor(x)\`, \`ceil(x)\`, \`round(x)\`
**Range:** \`range(n)\`, \`range(start, end)\`, \`range(start, end, step)\`
**Dict:** \`keys(dict)\`, \`values(dict)\`
**Slice:** \`slice(list, start, end)\``,
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
