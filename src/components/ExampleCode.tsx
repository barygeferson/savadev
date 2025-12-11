interface ExampleCodeProps {
  onSelect: (code: string) => void;
}

const EXAMPLES = [
  {
    name: 'Hello World',
    code: `print("Hello, World!");`,
  },
  {
    name: 'Variables',
    code: `let name = "sdev";
let version = 1.0;
print("Welcome to " + name + " v" + str(version));`,
  },
  {
    name: 'Functions',
    code: `func greet(name) {
  return "Hello, " + name + "!";
}

func add(a, b) {
  return a + b;
}

print(greet("World"));
print("2 + 3 = " + str(add(2, 3)));`,
  },
  {
    name: 'Conditionals',
    code: `let score = 85;

if score >= 90 {
  print("Grade: A");
} else if score >= 80 {
  print("Grade: B");
} else if score >= 70 {
  print("Grade: C");
} else {
  print("Grade: F");
}`,
  },
  {
    name: 'Loops',
    code: `// While loop
let i = 1;
while i <= 5 {
  print("Count: " + str(i));
  i = i + 1;
}

// Using range
print("\\nSquares:");
let nums = range(1, 6);
let j = 0;
while j < len(nums) {
  let n = nums[j];
  print(str(n) + "^2 = " + str(n * n));
  j = j + 1;
}`,
  },
  {
    name: 'Lists',
    code: `let fruits = ["apple", "banana", "cherry"];
print("Fruits: " + str(fruits));
print("First: " + fruits[0]);
print("Last: " + fruits[-1]);

push(fruits, "date");
print("After push: " + str(fruits));
print("Length: " + str(len(fruits)));`,
  },
  {
    name: 'Dictionaries',
    code: `let person = {
  "name": "Alice",
  "age": 30,
  "city": "Wonderland"
};

print("Name: " + person["name"]);
print("Age: " + str(person["age"]));

person["job"] = "Explorer";
print("Keys: " + str(keys(person)));
print("Values: " + str(values(person)));`,
  },
  {
    name: 'Fibonacci',
    code: `func fib(n) {
  if n <= 1 {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

print("Fibonacci sequence:");
let i = 0;
while i < 10 {
  print("fib(" + str(i) + ") = " + str(fib(i)));
  i = i + 1;
}`,
  },
  {
    name: 'Factorial',
    code: `func factorial(n) {
  if n <= 1 {
    return 1;
  }
  return n * factorial(n - 1);
}

let i = 0;
while i <= 10 {
  print(str(i) + "! = " + str(factorial(i)));
  i = i + 1;
}`,
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
