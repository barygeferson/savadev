interface ExampleCodeProps {
  onSelect: (code: string) => void;
}

const EXAMPLES = [
  {
    name: 'Hello World',
    code: `// Welcome to sdev - a unique language!
speak("Hello, World!")`,
  },
  {
    name: 'Variables',
    code: `// Use 'forge' to create variables
// Use 'be' for assignment

forge name be "sdev"
forge version be 1.0
forge active be yep

speak("Welcome to " + name)
speak("Version: " + morph(version, "text"))
speak("Active: " + morph(active, "text"))`,
  },
  {
    name: 'Functions',
    code: `// Use 'conjure' to create functions
// Use '::' and ';;' for blocks

conjure greet(who) ::
  yield "Hello, " + who + "!"
;;

conjure add(a, b) ::
  yield a + b
;;

speak(greet("World"))
speak("2 + 3 = " + morph(add(2, 3), "text"))`,
  },
  {
    name: 'Conditionals',
    code: `// Use 'ponder' for if statements
// Use 'otherwise' for else

forge score be 85

ponder score >= 90 ::
  speak("Grade: A")
;; otherwise ponder score >= 80 ::
  speak("Grade: B")
;; otherwise ponder score >= 70 ::
  speak("Grade: C")
;; otherwise ::
  speak("Grade: F")
;;`,
  },
  {
    name: 'Loops',
    code: `// Use 'cycle' for loops

forge i be 1
cycle i <= 5 ::
  speak("Count: " + morph(i, "text"))
  i be i + 1
;;

// Using sequence (like range)
speak("\\nSquares:")
forge nums be sequence(1, 6)
forge j be 0
cycle j < measure(nums) ::
  forge n be nums[j]
  speak(morph(n, "text") + "^2 = " + morph(n^2, "text"))
  j be j + 1
;;`,
  },
  {
    name: 'Lambdas & Pipes',
    code: `// Lambdas use -> syntax
// Pipe with |> chains operations

forge double be (x) -> x * 2
forge square be (x) -> x * x

speak("Double 5: " + morph(double(5), "text"))
speak("Square 4: " + morph(square(4), "text"))

// Pipe chains: value flows through functions
forge nums be [1, 2, 3, 4, 5]
forge result be nums |> each(x -> x * 2) |> sift(x -> x > 5)
speak("Doubled and filtered: " + morph(result, "text"))`,
  },
  {
    name: 'Lists',
    code: `forge fruits be ["apple", "banana", "cherry"]
speak("Fruits: " + morph(fruits, "text"))
speak("First: " + fruits[0])
speak("Last: " + fruits[-1])

gather(fruits, "date")
speak("After gather: " + morph(fruits, "text"))
speak("Length: " + morph(measure(fruits), "text"))

// Transform with each
forge upper_fruits be each(fruits, x -> upper(x))
speak("Uppercase: " + morph(upper_fruits, "text"))`,
  },
  {
    name: 'Tomes (Dicts)',
    code: `// Tomes are key-value collections
// Use :: key: value, ... ;; syntax

forge person be :: 
  "name": "Alice",
  "age": 30,
  "city": "Wonderland"
;;

speak("Name: " + person["name"])
speak("Age: " + morph(person["age"], "text"))

person["quest"] be "Adventure"
speak("Keys: " + morph(inscriptions(person), "text"))
speak("Values: " + morph(contents(person), "text"))`,
  },
  {
    name: 'Fibonacci',
    code: `conjure fib(n) ::
  ponder n <= 1 ::
    yield n
  ;;
  yield fib(n - 1) + fib(n - 2)
;;

speak("Fibonacci sequence:")
forge i be 0
cycle i < 10 ::
  speak("fib(" + morph(i, "text") + ") = " + morph(fib(i), "text"))
  i be i + 1
;;`,
  },
  {
    name: 'FizzBuzz',
    code: `conjure fizzbuzz(n) ::
  ponder n % 15 equals 0 ::
    yield "FizzBuzz"
  ;; otherwise ponder n % 3 equals 0 ::
    yield "Fizz"
  ;; otherwise ponder n % 5 equals 0 ::
    yield "Buzz"
  ;; otherwise ::
    yield morph(n, "text")
  ;;
;;

forge i be 1
cycle i <= 20 ::
  speak(fizzbuzz(i))
  i be i + 1
;;`,
  },
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
