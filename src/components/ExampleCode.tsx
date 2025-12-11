interface ExampleCodeProps {
  onSelect: (code: string) => void;
}

const EXAMPLES = [
  { name: 'Hello World', code: `speak("Hello, World!")` },
  { name: 'Variables', code: `forge name be "sdev"
forge version be 1.0
speak("Welcome to " + name + " v" + morph(version, "text"))` },
  { name: 'Functions', code: `conjure greet(who) ::
  yield "Hello, " + who + "!"
;;

speak(greet("World"))` },
  { name: 'Loops', code: `forge i be 1
cycle i <= 5 ::
  speak("Count: " + morph(i, "text"))
  i be i + 1
;;` },
  { name: 'Turtle Graphics', code: `// Draw a colorful spiral!
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
  { name: 'Canvas Art', code: `// Draw shapes on canvas
canvas(400, 400)
clear("#0d0d15")

// Colorful circles
forge i be 0
cycle i < 10 ::
  fill(hue(i * 36, 80, 60))
  stroke(hue(i * 36, 100, 80))
  circle(200 + i * 15, 200, 150 - i * 15)
  i be i + 1
;;

fill("#ffffff")
text("sdev art!", 150, 210, 24)` },
  { name: 'Fibonacci', code: `conjure fib(n) ::
  ponder n <= 1 :: yield n ;;
  yield fib(n - 1) + fib(n - 2)
;;

forge i be 0
cycle i < 10 ::
  speak("fib(" + morph(i, "text") + ") = " + morph(fib(i), "text"))
  i be i + 1
;;` },
  { name: 'FizzBuzz', code: `conjure fizzbuzz(n) ::
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
];

export function ExampleCode({ onSelect }: ExampleCodeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLES.map((example) => (
        <button
          key={example.name}
          onClick={() => onSelect(example.code)}
          className="px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {example.name}
        </button>
      ))}
    </div>
  );
}
