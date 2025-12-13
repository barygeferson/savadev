# sdev Programming Language

## Complete Documentation & Tutorial

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Syntax Overview](#syntax-overview)
4. [Variables](#variables)
5. [Data Types](#data-types)
6. [Operators](#operators)
7. [Control Flow](#control-flow)
8. [Functions](#functions)
9. [Built-in Functions](#built-in-functions)
10. [Collections](#collections)
11. [Higher-Order Functions](#higher-order-functions)
12. [Matrix Operations](#matrix-operations)
13. [File I/O](#file-io)
14. [Networking](#networking)
15. [Error Handling](#error-handling)
16. [Examples](#examples)
17. [Reference Card](#reference-card)

---

## Introduction

**sdev** is a unique, expressive programming language designed to be different from conventional languages. It features:

- **Unique syntax** with keywords like `forge`, `conjure`, `ponder`
- **Block-based structure** using `::` and `;;` instead of braces
- **Expressive operators** like `also`, `either`, `isnt`
- **Pipe operator** `|>` for functional composition
- **Lambda expressions** with `->` arrow syntax
- **Built-in matrix operations** for machine learning
- **File I/O and networking** for real-world applications

---

## Getting Started

### Installation

#### Option 1: Python Interpreter
```bash
# Download sdev-interpreter.py
python sdev-interpreter.py              # Start REPL
python sdev-interpreter.py program.sdev # Run a file
```

#### Option 2: As a Python Library
```python
from sdev_interpreter import execute

result = execute('speak("Hello, World!")')
```

### Your First Program

Create a file `hello.sdev`:
```sdev
// This is a comment
speak("Hello, World!")
```

Run it:
```bash
python sdev-interpreter.py hello.sdev
```

Output:
```
Hello, World!
```

---

## Syntax Overview

### Comments
```sdev
// Single line comment
# Also a comment (Python style)
```

### Blocks
sdev uses `::` to start a block and `;;` to end it:
```sdev
ponder x > 5 ::
    speak("x is greater than 5")
;;
```

### Semicolons
**Not required!** Statements are separated by newlines.

---

## Variables

### Declaring Variables
Use `forge` to create variables and `be` for assignment:

```sdev
forge name be "Alice"
forge age be 25
forge active be yep
```

### Reassigning Variables
```sdev
forge count be 0
count be count + 1
count be 10
```

### Constants
sdev provides mathematical constants:
```sdev
speak(PI)       // 3.141592653589793
speak(TAU)      // 6.283185307179586
speak(E)        // 2.718281828459045
speak(INFINITY) // inf
```

---

## Data Types

### Numbers
```sdev
forge integer be 42
forge decimal be 3.14
forge negative be -10
forge scientific be 1.5e10
```

### Text (Strings)
```sdev
forge single be 'Hello'
forge double be "World"
forge multi be `This is a
multiline string`

// Escape sequences
forge escaped be "Line1\nLine2\tTabbed"
```

### Truth (Booleans)
```sdev
forge yes be yep    // true
forge no be nope    // false
```

### Void (Null)
```sdev
forge nothing be void
```

### Lists
```sdev
forge numbers be [1, 2, 3, 4, 5]
forge mixed be [1, "two", yep, void]
forge nested be [[1, 2], [3, 4]]
```

### Tomes (Dictionaries)
```sdev
forge person be :: 
    "name": "Alice",
    "age": 30,
    "active": yep
;;

// Access values
speak(person["name"])  // Alice
speak(person.name)     // Alice (dot notation)
```

---

## Operators

### Arithmetic
| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Addition | `5 + 3` → `8` |
| `-` | Subtraction | `5 - 3` → `2` |
| `*` | Multiplication | `5 * 3` → `15` |
| `/` | Division | `5 / 2` → `2.5` |
| `%` | Modulo | `5 % 2` → `1` |
| `^` | Power | `2 ^ 3` → `8` |

### Comparison
| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Equality | `5 equals 5` → `yep` |
| `differs` | Inequality | `5 differs 3` → `yep` |
| `<>` | Inequality (alt) | `5 <> 3` → `yep` |
| `<` | Less than | `3 < 5` → `yep` |
| `>` | Greater than | `5 > 3` → `yep` |
| `<=` | Less or equal | `3 <= 3` → `yep` |
| `>=` | Greater or equal | `5 >= 5` → `yep` |

### Logical
| Operator | Description | Example |
|----------|-------------|---------|
| `also` | Logical AND | `yep also yep` → `yep` |
| `either` | Logical OR | `nope either yep` → `yep` |
| `isnt` | Logical NOT | `isnt nope` → `yep` |

### String Operations
```sdev
// Concatenation
"Hello" + " " + "World"  // "Hello World"

// Repetition
"ha" * 3  // "hahaha"
```

### Pipe Operator
Chain function calls:
```sdev
forge result be [3, 1, 4, 1, 5]
    |> sort
    |> reverse
speak(result)  // [5, 4, 3, 1, 1]

// Equivalent to:
speak(reverse(sort([3, 1, 4, 1, 5])))
```

---

## Control Flow

### Conditionals (ponder/otherwise)

```sdev
forge age be 18

ponder age >= 18 ::
    speak("You are an adult")
;; otherwise ::
    speak("You are a minor")
;;
```

### Chained Conditionals
```sdev
forge grade be 85

ponder grade >= 90 ::
    speak("A")
;; otherwise ponder grade >= 80 ::
    speak("B")
;; otherwise ponder grade >= 70 ::
    speak("C")
;; otherwise ::
    speak("F")
;;
```

### While Loop (cycle)
```sdev
forge count be 0
cycle count < 5 ::
    speak(count)
    count be count + 1
;;
// Output: 0 1 2 3 4
```

### For-In Loop (within)
```sdev
forge fruits be ["apple", "banana", "cherry"]

within fruit be fruits ::
    speak(fruit)
;;
// Output: apple banana cherry
```

### Iterating with Index
```sdev
within item be enumerate(fruits) ::
    forge idx be item[0]
    forge fruit be item[1]
    speak(idx + ": " + fruit)
;;
```

### Loop Control

#### Break (yeet)
```sdev
cycle yep ::
    forge input be input("Enter 'quit' to exit: ")
    ponder input equals "quit" ::
        yeet
    ;;
;;
```

#### Continue (skip)
```sdev
within i be sequence(10) ::
    ponder i % 2 equals 0 ::
        skip  // Skip even numbers
    ;;
    speak(i)  // Print odd numbers only
;;
```

---

## Functions

### Declaring Functions (conjure)
```sdev
conjure greet(name) ::
    speak("Hello, " + name + "!")
;;

greet("World")  // Hello, World!
```

### Return Values (yield)
```sdev
conjure add(a, b) ::
    yield a + b
;;

forge result be add(5, 3)
speak(result)  // 8
```

### Lambda Functions
```sdev
// Single parameter
forge double be x -> x * 2
speak(double(5))  // 10

// Multiple parameters
forge multiply be (a, b) -> a * b
speak(multiply(4, 3))  // 12
```

### Closures
```sdev
conjure makeCounter() ::
    forge count be 0
    yield () -> ::
        count be count + 1
        yield count
    ;;
;;

forge counter be makeCounter()
speak(counter())  // 1
speak(counter())  // 2
speak(counter())  // 3
```

### Recursive Functions
```sdev
conjure factorial(n) ::
    ponder n <= 1 ::
        yield 1
    ;;
    yield n * factorial(n - 1)
;;

speak(factorial(5))  // 120
```

---

## Built-in Functions

### Output Functions
| Function | Description | Example |
|----------|-------------|---------|
| `speak(...)` | Print with spaces | `speak("Hello", "World")` → `Hello World` |
| `whisper(...)` | Print concatenated | `whisper("a", "b", "c")` → `abc` |
| `shout(...)` | Print uppercase | `shout("hello")` → `HELLO` |

### Input
```sdev
forge name be input("What's your name? ")
speak("Hello, " + name)
```

### Type Functions
| Function | Description | Example |
|----------|-------------|---------|
| `essence(val)` | Get type name | `essence(42)` → `"number"` |
| `morph(val, type)` | Convert type | `morph("42", "number")` → `42` |

### Type Names
- `"void"` - null values
- `"number"` - numbers
- `"text"` - strings
- `"truth"` - booleans
- `"list"` - lists
- `"tome"` - dictionaries
- `"conjuration"` - functions

### Math Functions
| Function | Description |
|----------|-------------|
| `magnitude(x)` | Absolute value |
| `root(x)` | Square root |
| `ground(x)` | Floor |
| `elevate(x)` | Ceiling |
| `nearby(x)` | Round |
| `least(...)` | Minimum |
| `greatest(...)` | Maximum |
| `sin(x)`, `cos(x)`, `tan(x)` | Trigonometric |
| `asin(x)`, `acos(x)`, `atan(x)` | Inverse trig |
| `log(x)`, `log10(x)`, `log2(x)` | Logarithms |
| `exp(x)` | e^x |

### Random Functions
| Function | Description | Example |
|----------|-------------|---------|
| `chaos()` | Random 0-1 | `chaos()` → `0.7234...` |
| `randint(min, max)` | Random integer | `randint(1, 10)` → `7` |
| `pick(list)` | Random element | `pick([1,2,3])` → `2` |
| `shuffle(list)` | Shuffle copy | `shuffle([1,2,3])` → `[3,1,2]` |

### String Functions
| Function | Description | Example |
|----------|-------------|---------|
| `measure(s)` | Length | `measure("hello")` → `5` |
| `upper(s)` | Uppercase | `upper("hi")` → `"HI"` |
| `lower(s)` | Lowercase | `lower("HI")` → `"hi"` |
| `trim(s)` | Strip whitespace | `trim("  hi  ")` → `"hi"` |
| `reverse(s)` | Reverse | `reverse("abc")` → `"cba"` |
| `contains(s, sub)` | Contains | `contains("hello", "ell")` → `yep` |
| `starts(s, prefix)` | Starts with | `starts("hello", "he")` → `yep` |
| `ends(s, suffix)` | Ends with | `ends("hello", "lo")` → `yep` |
| `replace(s, old, new)` | Replace | `replace("hi", "i", "ello")` → `"hello"` |
| `locate(s, sub)` | Find index | `locate("hello", "l")` → `2` |
| `shatter(s, sep)` | Split | `shatter("a,b,c", ",")` → `["a","b","c"]` |
| `chars(s)` | To char list | `chars("abc")` → `["a","b","c"]` |
| `format(s, ...)` | Format string | `format("Hi {}", "Bob")` → `"Hi Bob"` |
| `padLeft(s, w, c)` | Left pad | `padLeft("5", 3, "0")` → `"005"` |
| `padRight(s, w, c)` | Right pad | `padRight("5", 3, "0")` → `"500"` |

---

## Collections

### List Operations
```sdev
forge list be [1, 2, 3]

// Access
speak(list[0])     // 1
speak(list[-1])    // 3 (last element)

// Modify
list[0] be 10
speak(list)        // [10, 2, 3]

// Slicing
speak(list[0:2])   // [10, 2]
speak(list[1:])    // [2, 3]
speak(list[:2])    // [10, 2]
speak(list[::2])   // [10, 3] (every 2nd)
```

### List Functions
| Function | Description | Example |
|----------|-------------|---------|
| `measure(list)` | Length | `measure([1,2,3])` → `3` |
| `gather(list, item)` | Append | `gather([1,2], 3)` → `[1,2,3]` |
| `pluck(list)` | Pop last | `pluck([1,2,3])` → `3` |
| `snatch(list, idx)` | Remove at index | `snatch([1,2,3], 1)` → `2` |
| `insert(list, idx, item)` | Insert at index | `insert([1,3], 1, 2)` → `[1,2,3]` |
| `portion(list, start, end)` | Slice | `portion([1,2,3,4], 1, 3)` → `[2,3]` |
| `weave(list, sep)` | Join | `weave([1,2,3], "-")` → `"1-2-3"` |
| `reverse(list)` | Reverse | `reverse([1,2,3])` → `[3,2,1]` |
| `sort(list)` | Sort ascending | `sort([3,1,2])` → `[1,2,3]` |
| `sortDesc(list)` | Sort descending | `sortDesc([1,2,3])` → `[3,2,1]` |
| `unique(list)` | Remove duplicates | `unique([1,1,2])` → `[1,2]` |
| `clone(list)` | Deep copy | `clone([1,[2,3]])` |

### Tome (Dictionary) Functions
```sdev
forge person be :: "name": "Alice", "age": 30 ;;

// Access
speak(person["name"])  // Alice
speak(person.age)      // 30

// Modify
person["city"] be "NYC"
person.age be 31

// Functions
speak(inscriptions(person))  // ["name", "age", "city"]
speak(contents(person))      // ["Alice", 31, "NYC"]
speak(entries(person))       // [["name","Alice"], ...]
speak(contains(person, "name"))  // yep
```

| Function | Description |
|----------|-------------|
| `inscriptions(tome)` | Get all keys |
| `contents(tome)` | Get all values |
| `entries(tome)` | Get key-value pairs |
| `merge(t1, t2, ...)` | Merge dictionaries |
| `erase(tome, key)` | Remove key |

### Set Operations
| Function | Description | Example |
|----------|-------------|---------|
| `union(a, b)` | Union | `union([1,2], [2,3])` → `[1,2,3]` |
| `intersect(a, b)` | Intersection | `intersect([1,2], [2,3])` → `[2]` |
| `difference(a, b)` | Difference | `difference([1,2,3], [2])` → `[1,3]` |

---

## Higher-Order Functions

### each (map)
Transform each element:
```sdev
forge numbers be [1, 2, 3, 4, 5]
forge doubled be each(numbers, x -> x * 2)
speak(doubled)  // [2, 4, 6, 8, 10]

// With index
forge indexed be each(numbers, (x, i) -> x + i)
```

### sift (filter)
Keep elements matching predicate:
```sdev
forge numbers be [1, 2, 3, 4, 5, 6]
forge evens be sift(numbers, x -> x % 2 equals 0)
speak(evens)  // [2, 4, 6]
```

### fold (reduce)
Reduce to single value:
```sdev
forge numbers be [1, 2, 3, 4, 5]
forge total be fold(numbers, 0, (acc, x) -> acc + x)
speak(total)  // 15

// Find maximum
forge max be fold(numbers, numbers[0], (a, b) -> a > b ~ a : b)
```

### seek (find)
Find first matching element:
```sdev
forge users be [
    :: "name": "Alice", "age": 25 ;;,
    :: "name": "Bob", "age": 30 ;;
]
forge adult be seek(users, u -> u.age >= 30)
speak(adult.name)  // Bob
```

### every & some
```sdev
forge nums be [2, 4, 6, 8]
speak(every(nums, x -> x % 2 equals 0))  // yep (all even)
speak(some(nums, x -> x > 5))  // yep (some > 5)
```

### zip & enumerate
```sdev
forge a be [1, 2, 3]
forge b be ["a", "b", "c"]
speak(zip(a, b))  // [[1,"a"], [2,"b"], [3,"c"]]

speak(enumerate(["x", "y", "z"]))  // [[0,"x"], [1,"y"], [2,"z"]]
```

---

## Matrix Operations

### Creating Matrices
```sdev
// Zero matrix
forge zeros be matrix(3, 3, 0)
// [[0,0,0], [0,0,0], [0,0,0]]

// Identity matrix
forge eye be identity(3)
// [[1,0,0], [0,1,0], [0,0,1]]

// From list
forge m be reshape([1,2,3,4,5,6], 2, 3)
// [[1,2,3], [4,5,6]]
```

### Matrix Functions
| Function | Description |
|----------|-------------|
| `matrix(rows, cols, fill)` | Create matrix |
| `identity(n)` | Identity matrix |
| `transpose(m)` | Transpose |
| `matmul(a, b)` | Matrix multiply |
| `matadd(a, b)` | Matrix add |
| `matsub(a, b)` | Matrix subtract |
| `matscale(m, scalar)` | Scale matrix |
| `dot(a, b)` | Dot product |
| `reshape(list, rows, cols)` | Reshape to 2D |
| `flatten(m)` | Flatten to 1D |
| `shape(m)` | Get dimensions |
| `sum(m)` | Sum all elements |
| `mean(list)` | Calculate mean |

### Example: Matrix Operations
```sdev
forge a be [[1, 2], [3, 4]]
forge b be [[5, 6], [7, 8]]

// Addition
speak(matadd(a, b))  // [[6,8], [10,12]]

// Multiplication
speak(matmul(a, b))  // [[19,22], [43,50]]

// Transpose
speak(transpose(a))  // [[1,3], [2,4]]

// Dot product of vectors
forge v1 be [1, 2, 3]
forge v2 be [4, 5, 6]
speak(dot(v1, v2))  // 32
```

---

## File I/O

### Reading Files
```sdev
forge content be decipher("data.txt")
speak(content)

// Read JSON
forge data be unetch(decipher("config.json"))
speak(data.setting)
```

### Writing Files
```sdev
inscribe("output.txt", "Hello, World!")

// Write JSON
forge data be :: "name": "Alice", "score": 100 ;;
inscribe("data.json", etch(data, 2))  // Pretty print with indent
```

### Appending to Files
```sdev
appendFile("log.txt", "New entry\n")
```

### File Operations
| Function | Description |
|----------|-------------|
| `decipher(path)` | Read file |
| `inscribe(path, content)` | Write file |
| `appendFile(path, content)` | Append to file |
| `fileExists(path)` | Check if exists |
| `deleteFile(path)` | Delete file |
| `listDir(path)` | List directory |

---

## Networking

### HTTP Requests
```sdev
// Simple GET request
forge data be fetch("https://api.example.com/users")
speak(data)

// POST request with options
forge response be fetch("https://api.example.com/users", ::
    "method": "POST",
    "headers": :: "Content-Type": "application/json" ;;,
    "body": :: "name": "Alice" ;;
;;)
```

---

## Error Handling

### Try/Rescue (try/catch)
```sdev
attempt ::
    forge result be decipher("missing.txt")
    speak(result)
;; rescue error ::
    speak("Error occurred: " + error)
;;
```

### Assertions
```sdev
forge age be 18
assert(age >= 0, "Age cannot be negative")
assert(age < 150)  // Default message
```

---

## Examples

### FizzBuzz
```sdev
within i be sequence(1, 101) ::
    ponder i % 15 equals 0 ::
        speak("FizzBuzz")
    ;; otherwise ponder i % 3 equals 0 ::
        speak("Fizz")
    ;; otherwise ponder i % 5 equals 0 ::
        speak("Buzz")
    ;; otherwise ::
        speak(i)
    ;;
;;
```

### Fibonacci Sequence
```sdev
conjure fibonacci(n) ::
    ponder n <= 1 ::
        yield n
    ;;
    yield fibonacci(n - 1) + fibonacci(n - 2)
;;

within i be sequence(10) ::
    speak(fibonacci(i))
;;
```

### Quick Sort
```sdev
conjure quicksort(arr) ::
    ponder measure(arr) <= 1 ::
        yield arr
    ;;
    
    forge pivot be arr[0]
    forge rest be portion(arr, 1)
    
    forge less be sift(rest, x -> x < pivot)
    forge greater be sift(rest, x -> x >= pivot)
    
    yield quicksort(less) + [pivot] + quicksort(greater)
;;

speak(quicksort([3, 6, 8, 10, 1, 2, 1]))
// [1, 1, 2, 3, 6, 8, 10]
```

### Simple Calculator
```sdev
conjure calculate(a, op, b) ::
    ponder op equals "+" ::
        yield a + b
    ;; otherwise ponder op equals "-" ::
        yield a - b
    ;; otherwise ponder op equals "*" ::
        yield a * b
    ;; otherwise ponder op equals "/" ::
        yield a / b
    ;; otherwise ::
        yield "Unknown operator"
    ;;
;;

speak(calculate(10, "+", 5))   // 15
speak(calculate(10, "*", 3))   // 30
```

### Word Counter
```sdev
conjure countWords(text) ::
    forge words be shatter(trim(text), " ")
    forge counts be ::;;
    
    within word be words ::
        forge w be lower(word)
        ponder contains(counts, w) ::
            counts[w] be counts[w] + 1
        ;; otherwise ::
            counts[w] be 1
        ;;
    ;;
    
    yield counts
;;

forge text be "The quick brown fox jumps over the lazy dog"
speak(countWords(text))
```

### Neural Network Layer (Matrix Operations)
```sdev
// Simple feedforward layer
conjure sigmoid(x) ::
    yield 1 / (1 + exp(-x))
;;

conjure feedforward(inputs, weights, bias) ::
    // Matrix multiply inputs by weights
    forge z be matmul(inputs, weights)
    
    // Add bias
    forge output be matadd(z, bias)
    
    // Apply activation (element-wise sigmoid)
    yield each(output, row -> each(row, x -> sigmoid(x)))
;;

// Example usage
forge inputs be [[1, 2, 3]]  // 1x3 input
forge weights be [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]  // 3x2 weights
forge bias be [[0.1, 0.1]]  // 1x2 bias

forge result be feedforward(inputs, weights, bias)
speak(result)
```

---

## Reference Card

### Keywords
| Keyword | Purpose |
|---------|---------|
| `forge` | Declare variable |
| `be` | Assignment |
| `conjure` | Declare function |
| `yield` | Return value |
| `ponder` | If statement |
| `otherwise` | Else clause |
| `cycle` | While loop |
| `within` | For-in loop |
| `yeet` | Break |
| `skip` | Continue |
| `attempt` | Try block |
| `rescue` | Catch block |
| `yep` | True |
| `nope` | False |
| `void` | Null |
| `also` | Logical AND |
| `either` | Logical OR |
| `isnt` | Logical NOT |
| `equals` | Equality |
| `differs` | Inequality |

### Special Symbols
| Symbol | Purpose |
|--------|---------|
| `::` | Start block |
| `;;` | End block |
| `->` | Lambda arrow |
| `|>` | Pipe operator |
| `~` | Ternary if |
| `:` | Ternary else / dict key-value |

### Quick Examples
```sdev
// Variable
forge x be 42

// Function
conjure greet(name) ::
    yield "Hello, " + name
;;

// If/else
ponder x > 0 ::
    speak("positive")
;; otherwise ::
    speak("non-positive")
;;

// Loop
within i be sequence(5) ::
    speak(i)
;;

// Lambda
forge double be x -> x * 2

// Pipe
[1,2,3] |> each(x -> x * 2) |> speak

// Dict
forge obj be :: "key": "value" ;;
```

---

## Version

sdev version 1.0.0

For updates and more examples, visit the sdev repository.
