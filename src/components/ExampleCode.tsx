import { Sparkles, Code2, Palette, Cpu, Gamepad2 } from 'lucide-react';

interface ExampleCodeProps {
  onSelect: (code: string) => void;
}

const EXAMPLES = [
  { name: 'Hello World', icon: Sparkles, category: 'basics', code: `speak("Hello, World!")` },
  { name: 'Variables', icon: Code2, category: 'basics', code: `forge name be "sdev"
forge version be 1.0
speak("Welcome to " + name + " v" + morph(version, "text"))` },
  { name: 'Functions', icon: Code2, category: 'basics', code: `conjure greet(who) ::
  yield "Hello, " + who + "!"
;;

speak(greet("World"))` },
  { name: 'Loops', icon: Code2, category: 'basics', code: `forge i be 1
cycle i <= 5 ::
  speak("Count: " + morph(i, "text"))
  i be i + 1
;;` },
  { name: 'Fibonacci', icon: Cpu, category: 'algorithms', code: `conjure fib(n) ::
  ponder n <= 1 :: yield n ;;
  yield fib(n - 1) + fib(n - 2)
;;

forge i be 0
cycle i < 10 ::
  speak("fib(" + morph(i, "text") + ") = " + morph(fib(i), "text"))
  i be i + 1
;;` },
  { name: 'FizzBuzz', icon: Cpu, category: 'algorithms', code: `conjure fizzbuzz(n) ::
  ponder n % 15 equals 0 :: yield "FizzBuzz" ;;
  otherwise ponder n % 3 equals 0 :: yield "Fizz" ;;
  otherwise ponder n % 5 equals 0 :: yield "Buzz" ;;
  otherwise :: yield morph(n, "text") ;;
;;

forge i be 1
cycle i <= 20 ::
  speak(fizzbuzz(i))
  i be i + 1
;;` },
  { name: 'Turtle Spiral', icon: Palette, category: 'graphics', code: `// Draw a colorful spiral!
canvas(400, 400)
clear("#0d0d15")
turtle()

forge i be 0
cycle i < 200 ::
  pencolor(hue(i * 2))
  forward(i * 0.5)
  right(25)
  i be i + 1
;;` },
  { name: 'Turtle Flower', icon: Palette, category: 'graphics', code: `// Draw a flower with turtle graphics
canvas(400, 400)
clear("#0d0d15")
turtle()
penwidth(2)

conjure petal() ::
  forge j be 0
  cycle j < 30 ::
    forward(2)
    right(6)
    j be j + 1
  ;;
  forge k be 0
  cycle k < 30 ::
    forward(2)
    right(6)
    k be k + 1
  ;;
;;

forge i be 0
cycle i < 12 ::
  pencolor(hue(i * 30, 80, 60))
  petal()
  right(30)
  i be i + 1
;;` },
  { name: 'Shapes', icon: Gamepad2, category: 'graphics', code: `// Draw various shapes
canvas(400, 400)
clear("#0d0d15")

// Star
fill(hue(45, 100, 60))
stroke(hue(45, 100, 80), 2)
star(80, 80, 40, 20, 5)

// Heart
fill(hue(350, 80, 55))
noStroke()
heart(200, 30, 60)

// Rounded rect
fill(hue(200, 70, 50))
stroke("#ffffff", 2)
rect(280, 50, 80, 60, 15)

// Ellipse
fill(hue(280, 70, 60))
ellipse(80, 200, 50, 30)

// Triangle
fill(hue(120, 70, 50))
triangle(200, 160, 250, 240, 150, 240)

fill("#ffffff")
text("Shapes Gallery", 120, 380, 20)` },
  { name: 'Starfield', icon: Gamepad2, category: 'graphics', code: `// Starfield effect
canvas(400, 400)
clear("#0a0a12")

forge i be 0
cycle i < 150 ::
  forge x be random() * 400
  forge y be random() * 400
  forge size be random() * 2 + 0.5
  forge brightness be random() * 50 + 50
  fill(hue(random() * 60 + 180, 20, brightness))
  point(x, y, size)
  i be i + 1
;;

// Add some larger stars
forge j be 0
cycle j < 10 ::
  fill(hue(random() * 40 + 200, 60, 80))
  star(random() * 380 + 10, random() * 380 + 10, 8, 3, 4)
  j be j + 1
;;` },
  { name: 'Spirograph', icon: Palette, category: 'graphics', code: `// Spirograph pattern
canvas(400, 400)
clear("#0d0d15")
turtle()
penwidth(1)

forge R be 100  // outer radius
forge r be 60   // inner radius  
forge d be 80   // pen distance

forge t be 0
cycle t < 3600 ::
  forge angle be t * PI / 180
  forge x be 200 + (R - r) * cos(angle) + d * cos((R - r) / r * angle)
  forge y be 200 + (R - r) * sin(angle) + d * sin((R - r) / r * angle)
  
  pencolor(hue(t / 10))
  ponder t equals 0 ::
    penup()
    goto(x, y)
    pendown()
  ;;
  otherwise ::
    goto(x, y)
  ;;
  t be t + 2
;;` },
  { name: 'Wave Art', icon: Palette, category: 'graphics', code: `// Animated wave pattern
canvas(400, 400)
clear("#0d0d15")

forge y be 0
cycle y < 400 ::
  forge x be 0
  cycle x < 400 ::
    forge wave be sin(x / 20 + y / 30) * 127 + 128
    forge hueVal be (x + y) / 4
    fill(hue(hueVal, 70, wave / 4))
    point(x, y, 2)
    x be x + 4
  ;;
  y be y + 4
;;` },
];

const categoryColors: Record<string, string> = {
  basics: 'border-neon-cyan/50 hover:border-neon-cyan hover:shadow-neon-cyan text-neon-cyan',
  algorithms: 'border-neon-violet/50 hover:border-neon-violet hover:shadow-neon-violet text-neon-violet',
  graphics: 'border-neon-magenta/50 hover:border-neon-magenta hover:shadow-neon-magenta text-neon-magenta',
};

export function ExampleCode({ onSelect }: ExampleCodeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLES.map((example) => {
        const Icon = example.icon;
        const colorClass = categoryColors[example.category] || categoryColors.basics;
        
        return (
          <button
            key={example.name}
            onClick={() => onSelect(example.code)}
            className={`group flex items-center gap-2 px-3 py-2 text-sm rounded-lg border bg-card/50 backdrop-blur-sm transition-all hover:bg-card ${colorClass}`}
          >
            <Icon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="font-mono text-xs">{example.name}</span>
          </button>
        );
      })}
    </div>
  );
}
