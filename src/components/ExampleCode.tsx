import { useState } from 'react';
import { Sparkles, Code2, Palette, Cpu, Gamepad2, Box, Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface ExampleCodeProps {
  onSelect: (code: string) => void;
}

interface Example {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basics' | 'algorithms' | 'graphics' | '3d';
  code: string;
}

const EXAMPLES: Example[] = [
  // Basics
  { 
    name: 'Hello World', 
    icon: Sparkles, 
    category: 'basics', 
    code: `// Welcome to sdev!
speak("Hello, World!")`
  },
  { 
    name: 'Variables', 
    icon: Code2, 
    category: 'basics', 
    code: `forge name be "sdev"
forge version be 1.0
speak("Welcome to " + name + " v" + morph(version, "text"))`
  },
  { 
    name: 'Functions', 
    icon: Code2, 
    category: 'basics', 
    code: `conjure greet(who) ::
  yield "Hello, " + who + "!"
;;

speak(greet("World"))`
  },
  { 
    name: 'Loops', 
    icon: Code2, 
    category: 'basics', 
    code: `forge i be 1
cycle i <= 5 ::
  speak("Count: " + morph(i, "text"))
  i be i + 1
;;`
  },
  { 
    name: 'Lists', 
    icon: Code2, 
    category: 'basics', 
    code: `forge fruits be ["apple", "banana", "cherry"]
speak("Fruits: " + weave(fruits, ", "))
gather(fruits, "mango")
speak("Added mango: " + weave(fruits, ", "))
speak("Total: " + morph(measure(fruits), "text"))`
  },
  
  // Algorithms
  { 
    name: 'Fibonacci', 
    icon: Cpu, 
    category: 'algorithms', 
    code: `conjure fib(n) ::
  ponder n <= 1 :: yield n ;;
  yield fib(n - 1) + fib(n - 2)
;;

forge i be 0
cycle i < 10 ::
  speak("fib(" + morph(i, "text") + ") = " + morph(fib(i), "text"))
  i be i + 1
;;`
  },
  { 
    name: 'FizzBuzz', 
    icon: Cpu, 
    category: 'algorithms', 
    code: `conjure fizzbuzz(n) ::
  ponder n % 15 equals 0 :: yield "FizzBuzz" ;;
  otherwise ponder n % 3 equals 0 :: yield "Fizz" ;;
  otherwise ponder n % 5 equals 0 :: yield "Buzz" ;;
  otherwise :: yield morph(n, "text") ;;
;;

forge i be 1
cycle i <= 20 ::
  speak(fizzbuzz(i))
  i be i + 1
;;`
  },
  { 
    name: 'Prime Check', 
    icon: Cpu, 
    category: 'algorithms', 
    code: `conjure isPrime(n) ::
  ponder n < 2 :: yield nope ;;
  forge i be 2
  cycle i * i <= n ::
    ponder n % i equals 0 :: yield nope ;;
    i be i + 1
  ;;
  yield yep
;;

forge num be 1
cycle num <= 20 ::
  ponder isPrime(num) ::
    speak(morph(num, "text") + " is prime!")
  ;;
  num be num + 1
;;`
  },
  
  // Graphics
  { 
    name: 'Turtle Spiral', 
    icon: Palette, 
    category: 'graphics', 
    code: `// Draw a colorful spiral!
canvas(400, 400)
clear("#0d0d15")
turtle()

forge i be 0
cycle i < 200 ::
  pencolor(hue(i * 2))
  forward(i * 0.5)
  right(25)
  i be i + 1
;;`
  },
  { 
    name: 'Turtle Flower', 
    icon: Palette, 
    category: 'graphics', 
    code: `// Draw a flower with turtle graphics
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
;;`
  },
  { 
    name: 'Shapes Gallery', 
    icon: Gamepad2, 
    category: 'graphics', 
    code: `// Draw various shapes
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
text("Shapes Gallery", 120, 380, 20)`
  },
  { 
    name: 'Starfield', 
    icon: Gamepad2, 
    category: 'graphics', 
    code: `// Starfield effect
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
;;`
  },
  { 
    name: 'Spirograph', 
    icon: Palette, 
    category: 'graphics', 
    code: `// Spirograph pattern
canvas(400, 400)
clear("#0d0d15")
turtle()
penwidth(1)

forge R be 100
forge r be 60
forge d be 80

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
;;`
  },
  { 
    name: 'Wave Pattern', 
    icon: Palette, 
    category: 'graphics', 
    code: `// Wave pattern
canvas(400, 400)
clear("#0d0d15")

forge y be 0
cycle y < 400 ::
  forge x be 0
  cycle x < 400 ::
    forge wave be sin(x / 20 + y / 30) * 127 + 128
    forge hueVal be (x + y) / 4
    fill(hue(hueVal, 70, wave / 4))
    point(x, y, 3)
    x be x + 4
  ;;
  y be y + 4
;;`
  },
  
  // 3D Examples
  { 
    name: '3D Cube', 
    icon: Box, 
    category: '3d', 
    code: `// 3D Wireframe Cube
canvas(400, 400)
clear("#0d0d15")

// Cube vertices (centered at origin, size 100)
forge vertices be [
  [-50, -50, -50], [50, -50, -50], [50, 50, -50], [-50, 50, -50],
  [-50, -50, 50], [50, -50, 50], [50, 50, 50], [-50, 50, 50]
]

// Edges (pairs of vertex indices)
forge edges be [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7]
]

// Rotation angle
forge angleX be 0.5
forge angleY be 0.7

// Project 3D to 2D with rotation
conjure project(v) ::
  forge x be v[0]
  forge y be v[1]
  forge z be v[2]
  
  // Rotate around Y axis
  forge x2 be x * cos(angleY) - z * sin(angleY)
  forge z2 be x * sin(angleY) + z * cos(angleY)
  
  // Rotate around X axis
  forge y2 be y * cos(angleX) - z2 * sin(angleX)
  forge z3 be y * sin(angleX) + z2 * cos(angleX)
  
  // Simple perspective projection
  forge scale be 200 / (z3 + 300)
  yield [200 + x2 * scale, 200 + y2 * scale]
;;

// Draw edges
stroke(hue(180, 100, 60), 2)
forge i be 0
cycle i < measure(edges) ::
  forge edge be edges[i]
  forge p1 be project(vertices[edge[0]])
  forge p2 be project(vertices[edge[1]])
  line(p1[0], p1[1], p2[0], p2[1])
  i be i + 1
;;

// Draw vertices
fill(hue(300, 100, 70))
forge j be 0
cycle j < measure(vertices) ::
  forge p be project(vertices[j])
  circle(p[0], p[1], 4)
  j be j + 1
;;

fill("#ffffff")
text("3D Wireframe Cube", 110, 380, 18)`
  },
  { 
    name: '3D Pyramid', 
    icon: Layers, 
    category: '3d', 
    code: `// 3D Pyramid
canvas(400, 400)
clear("#0d0d15")

// Pyramid vertices
forge apex be [0, -60, 0]
forge base be [
  [-50, 40, -50], [50, 40, -50],
  [50, 40, 50], [-50, 40, 50]
]

forge angleY be 0.8

conjure rotateProject(v) ::
  forge x be v[0] * cos(angleY) - v[2] * sin(angleY)
  forge z be v[0] * sin(angleY) + v[2] * cos(angleY)
  forge scale be 200 / (z + 300)
  yield [200 + x * scale, 200 + v[1] * scale]
;;

// Draw base
stroke(hue(50, 100, 60), 2)
forge i be 0
cycle i < 4 ::
  forge p1 be rotateProject(base[i])
  forge p2 be rotateProject(base[(i + 1) % 4])
  line(p1[0], p1[1], p2[0], p2[1])
  i be i + 1
;;

// Draw edges to apex
stroke(hue(200, 100, 70), 2)
forge apexProj be rotateProject(apex)
forge j be 0
cycle j < 4 ::
  forge bp be rotateProject(base[j])
  line(apexProj[0], apexProj[1], bp[0], bp[1])
  j be j + 1
;;

// Draw vertices
fill(hue(0, 100, 70))
circle(apexProj[0], apexProj[1], 6)

fill(hue(120, 100, 60))
forge k be 0
cycle k < 4 ::
  forge bp be rotateProject(base[k])
  circle(bp[0], bp[1], 4)
  k be k + 1
;;

fill("#ffffff")
text("3D Pyramid", 150, 380, 18)`
  },
  { 
    name: '3D Sphere Points', 
    icon: Box, 
    category: '3d', 
    code: `// 3D Sphere made of points
canvas(400, 400)
clear("#0d0d15")

forge radius be 80
forge rotY be 0.5

// Generate points on sphere using fibonacci distribution
forge points be 200
forge phi be (1 + root(5)) / 2

forge i be 0
cycle i < points ::
  // Fibonacci sphere algorithm
  forge y be 1 - (i / (points - 1)) * 2
  forge radiusAtY be root(1 - y * y)
  forge theta be 2 * PI * i / phi
  
  forge x be cos(theta) * radiusAtY * radius
  forge z be sin(theta) * radiusAtY * radius
  forge yPos be y * radius
  
  // Rotate around Y axis
  forge xRot be x * cos(rotY) - z * sin(rotY)
  forge zRot be x * sin(rotY) + z * cos(rotY)
  
  // Project to 2D with depth shading
  forge depth be (zRot + radius) / (radius * 2)
  forge brightness be 30 + depth * 70
  
  fill(hue(200 + depth * 60, 80, brightness))
  forge size be 2 + depth * 3
  circle(200 + xRot, 200 + yPos, size)
  
  i be i + 1
;;

fill("#ffffff")
text("3D Sphere (Fibonacci)", 100, 380, 16)`
  },
];

const categoryColors: Record<string, string> = {
  basics: 'border-neon-cyan/50 hover:border-neon-cyan hover:shadow-neon-cyan',
  algorithms: 'border-neon-violet/50 hover:border-neon-violet hover:shadow-neon-violet',
  graphics: 'border-neon-magenta/50 hover:border-neon-magenta hover:shadow-neon-magenta',
  '3d': 'border-amber-500/50 hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]',
};

const categoryLabels: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  basics: { label: 'Basics', icon: Sparkles },
  algorithms: { label: 'Algorithms', icon: Cpu },
  graphics: { label: 'Graphics', icon: Palette },
  '3d': { label: '3D', icon: Box },
};

export function ExampleCode({ onSelect }: ExampleCodeProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = ['basics', 'algorithms', 'graphics', '3d'] as const;

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const categoryExamples = EXAMPLES.filter((e) => e.category === category);
        const isExpanded = expandedCategory === category;
        const CategoryIcon = categoryLabels[category].icon;

        return (
          <div key={category} className="space-y-2">
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card/50 backdrop-blur-sm transition-all group ${categoryColors[category]}`}
            >
              <div className="flex items-center gap-3">
                <CategoryIcon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="font-medium text-sm">{categoryLabels[category].label}</span>
                <span className="text-xs text-muted-foreground">({categoryExamples.length})</span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Examples Grid */}
            {isExpanded && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {categoryExamples.map((example) => {
                  const Icon = example.icon;
                  return (
                    <button
                      key={example.name}
                      onClick={() => onSelect(example.code)}
                      className={`group flex flex-col items-center gap-2 p-3 text-sm rounded-lg border bg-card/30 backdrop-blur-sm transition-all hover:bg-card/60 hover:scale-[1.02] ${categoryColors[category]}`}
                    >
                      <Icon className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-all group-hover:scale-110" />
                      <span className="font-mono text-xs text-center leading-tight">{example.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Quick access row for most popular */}
      <div className="pt-2 border-t border-border/30">
        <p className="text-xs text-muted-foreground mb-2 font-mono">Quick start:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.filter((e) => ['Hello World', 'Turtle Spiral', '3D Cube'].includes(e.name)).map((example) => {
            const Icon = example.icon;
            return (
              <button
                key={example.name}
                onClick={() => onSelect(example.code)}
                className={`group flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border bg-card/50 backdrop-blur-sm transition-all hover:bg-card ${categoryColors[example.category]}`}
              >
                <Icon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="font-mono text-xs">{example.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
