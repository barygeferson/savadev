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
9. [Object-Oriented Programming](#object-oriented-programming)
10. [Async & Concurrency](#async--concurrency)
11. [Built-in Functions](#built-in-functions)
12. [Collections](#collections)
13. [Data Structures](#data-structures)
14. [Higher-Order Functions](#higher-order-functions)
15. [Matrix Operations](#matrix-operations)
16. [Graphics & Game Development](#graphics--game-development)
17. [File I/O](#file-io)
18. [Networking](#networking)
19. [Error Handling](#error-handling)
20. [Examples](#examples)
21. [JavaScript Interop](#javascript-interop-js-interpreter-only)
22. [Reference Card](#reference-card)

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

## Object-Oriented Programming

sdev supports full object-oriented programming with classes, inheritance, and methods.

### Defining Classes (essence)

Use `essence` to define a class:

```sdev
essence Animal ::
    conjure init(self, name) ::
        self.name be name
        self.energy be 100
    ;;
    
    conjure speak(self) ::
        speak(self.name + " makes a sound")
    ;;
    
    conjure eat(self, food) ::
        self.energy be self.energy + 10
        speak(self.name + " eats " + food)
    ;;
;;
```

### Creating Instances (new)

Use `new` to create instances:

```sdev
forge dog be new Animal("Buddy")
dog.speak()         // Buddy makes a sound
dog.eat("kibble")   // Buddy eats kibble
speak(dog.energy)   // 110
```

### Inheritance (extend)

Use `extend` to inherit from another class:

```sdev
essence Dog extend Animal ::
    conjure init(self, name, breed) ::
        super.init(name)
        self.breed be breed
    ;;
    
    conjure speak(self) ::
        speak(self.name + " barks: Woof!")
    ;;
    
    conjure fetch(self) ::
        self.energy be self.energy - 20
        speak(self.name + " fetches the ball")
    ;;
;;

forge rex be new Dog("Rex", "German Shepherd")
rex.speak()   // Rex barks: Woof!
rex.fetch()   // Rex fetches the ball
rex.eat("treat")  // Inherited: Rex eats treat
```

### Properties and Methods

```sdev
essence Rectangle ::
    conjure init(self, width, height) ::
        self.width be width
        self.height be height
    ;;
    
    conjure area(self) ::
        yield self.width * self.height
    ;;
    
    conjure perimeter(self) ::
        yield 2 * (self.width + self.height)
    ;;
    
    conjure scale(self, factor) ::
        self.width be self.width * factor
        self.height be self.height * factor
    ;;
    
    conjure describe(self) ::
        yield format("{}x{} rectangle", self.width, self.height)
    ;;
;;

forge rect be new Rectangle(10, 5)
speak(rect.area())       // 50
speak(rect.perimeter())  // 30
rect.scale(2)
speak(rect.describe())   // 20x10 rectangle
```

### Static-like Pattern

```sdev
essence MathUtils ::
    conjure init(self) ::
        // No instance state needed
    ;;
;;

// Add class-level functions
MathUtils.square be x -> x * x
MathUtils.cube be x -> x * x * x

speak(MathUtils.square(4))  // 16
speak(MathUtils.cube(3))    // 27
```

---

## Async & Concurrency

sdev supports asynchronous programming and concurrency.

### Async Functions

Use `async conjure` to define asynchronous functions:

```sdev
async conjure fetchUser(id) ::
    forge response be await fetch("https://api.example.com/users/" + id)
    yield response
;;
```

### Await

Use `await` to wait for async operations:

```sdev
async conjure loadData() ::
    forge user be await fetchUser(1)
    forge posts be await fetch("https://api.example.com/posts?userId=" + user.id)
    
    yield ::
        "user": user,
        "posts": posts
    ;;
;;
```

### Spawn (Concurrent Execution)

Use `spawn` to run functions concurrently:

```sdev
conjure task1() ::
    delay(2000)  // Simulate 2 second task
    speak("Task 1 complete")
    yield "result1"
;;

conjure task2() ::
    delay(1000)  // Simulate 1 second task
    speak("Task 2 complete")
    yield "result2"
;;

// Run concurrently
spawn task1()
spawn task2()
// Output: Task 2 complete (after 1s), Task 1 complete (after 2s)
```

### Delay

Pause execution for a specified time:

```sdev
speak("Starting...")
delay(1000)  // Wait 1 second
speak("1 second passed")
delay(2000)  // Wait 2 more seconds
speak("Done!")
```

### Async Iteration Pattern

```sdev
async conjure fetchAllUsers(ids) ::
    forge results be []
    
    within id be ids ::
        forge user be await fetchUser(id)
        gather(results, user)
    ;;
    
    yield results
;;

forge users be await fetchAllUsers([1, 2, 3, 4, 5])
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

## Data Structures

sdev includes built-in data structures for common use cases.

### Set

A collection with unique elements:

```sdev
forge s be Set()
s.add(1)
s.add(2)
s.add(1)  // Duplicate ignored

speak(s.size())    // 2
speak(s.has(1))    // yep
speak(s.values())  // [1, 2]
s.remove(1)
s.clear()
```

### Map

Key-value pairs with any key type:

```sdev
forge m be Map()
m.set("name", "Alice")
m.set("age", 25)

speak(m.get("name"))  // Alice
speak(m.has("age"))   // yep
speak(m.keys())       // ["name", "age"]
speak(m.values())     // ["Alice", 25]
speak(m.entries())    // [["name", "Alice"], ["age", 25]]
m.delete("age")
```

### Queue (FIFO)

First-In-First-Out:

```sdev
forge q be Queue()
q.enqueue("first")
q.enqueue("second")

speak(q.dequeue())  // first
speak(q.peek())     // second
speak(q.size())     // 1
speak(q.isEmpty())  // nope
```

### Stack (LIFO)

Last-In-First-Out:

```sdev
forge s be Stack()
s.push(1)
s.push(2)
s.push(3)

speak(s.pop())      // 3
speak(s.peek())     // 2
speak(s.size())     // 2
```

### LinkedList

Doubly-linked list:

```sdev
forge list be LinkedList()
list.append(1)
list.append(2)
list.prepend(0)

speak(list.toList())  // [0, 1, 2]
speak(list.get(1))    // 1
list.remove(1)
speak(list.size())    // 2
```

---

## Graphics & Game Development

sdev includes comprehensive built-in support for 2D graphics, canvas drawing, turtle graphics, and game development.

### Canvas Setup

```sdev
canvas(800, 600)      // Set canvas size
clear("#1a1a2e")      // Clear with background color
background("#2d2d44") // Set background color
```

### Basic Shapes

```sdev
// Rectangle (x, y, width, height, radius?)
fill("blue")
rect(50, 50, 100, 80)
rect(200, 50, 100, 80, 10)  // Rounded corners

// Circle (x, y, radius)
fill("red")
circle(150, 200, 50)

// Ellipse (x, y, radiusX, radiusY, rotation?)
fill("green")
ellipse(300, 200, 60, 40)
ellipse(400, 200, 60, 40, 45)  // Rotated 45 degrees

// Arc (x, y, radius, startAngle, endAngle, counterclockwise?)
stroke("yellow", 3)
arc(200, 350, 40, 0, 180)
arc(300, 350, 40, 0, 270, yep)  // Counter-clockwise

// Line (x1, y1, x2, y2)
stroke("white", 2)
line(50, 400, 200, 450)

// Point (x, y, size?)
fill("cyan")
point(100, 100)
point(120, 100, 5)  // Larger point

// Triangle (x1, y1, x2, y2, x3, y3)
fill("orange")
triangle(400, 100, 450, 180, 350, 180)

// Polygon (array of [x, y] points)
fill("purple")
polygon([[500, 100], [550, 150], [530, 200], [470, 200], [450, 150]])

// Star (x, y, outerRadius, innerRadius, points?)
fill("gold")
star(600, 150, 50, 25)
star(700, 150, 50, 25, 8)  // 8-pointed star

// Heart (x, y, size)
fill("red")
heart(650, 300, 40)
```

### Drawing State

```sdev
// Fill and Stroke
fill("blue")           // Set fill color
noFill()               // Disable fill
stroke("red", 2)       // Set stroke color and width
noStroke()             // Disable stroke
lineWidth(3)           // Set line width
lineCap("round")       // Line cap: round, square, butt
lineJoin("round")      // Line join: round, bevel, miter

// Transparency and Shadows
alpha(0.5)             // Set global alpha (0-1)
shadow("black", 10, 5, 5)  // Shadow: color, blur, offsetX, offsetY
noShadow()             // Disable shadow
```

### Text Drawing

```sdev
fill("white")
text("Hello, World!", 100, 100)      // Basic text
text("Large Text", 100, 150, 32)     // With font size

font("Arial", "bold")                // Font family and style
textAlign("center", "middle")        // Horizontal and vertical alignment
```

### Gradients

```sdev
// Linear Gradient (x1, y1, x2, y2, colorStops...)
// colorStops are [position, color] pairs where position is 0-1
linearGradient(0, 0, 400, 0, [0, "red"], [0.5, "yellow"], [1, "green"])
rect(0, 0, 400, 100)

// Radial Gradient (x1, y1, r1, x2, y2, r2, colorStops...)
radialGradient(200, 200, 0, 200, 200, 100, [0, "white"], [1, "blue"])
circle(200, 200, 100)
```

### Transformations

```sdev
save()                 // Save current state
translate(100, 100)    // Move origin
rotate(0.5)            // Rotate (radians)
scale(2)               // Scale uniformly
scale(2, 1.5)          // Scale x and y separately
restore()              // Restore saved state
resetTransform()       // Reset all transformations
```

### Path Drawing

```sdev
beginPath()
moveTo(50, 50)
lineTo(150, 50)
lineTo(150, 150)
lineTo(50, 150)
closePath()
fillPath()             // Fill the path
strokePath()           // Stroke the path

// Bezier Curves
beginPath()
moveTo(100, 100)
bezierTo(150, 50, 200, 150, 250, 100)  // cp1x, cp1y, cp2x, cp2y, x, y
strokePath()

// Quadratic Curves
beginPath()
moveTo(100, 200)
quadraticTo(150, 150, 200, 200)  // cpx, cpy, x, y
strokePath()
```

### Turtle Graphics

```sdev
turtle()               // Initialize turtle at center
forward(100)           // Move forward
backward(50)           // Move backward
left(90)               // Turn left (degrees)
right(45)              // Turn right (degrees)
penup()                // Stop drawing
pendown()              // Start drawing
pencolor("lime")       // Set pen color
penwidth(3)            // Set pen width
goto(200, 200)         // Go to coordinates
home()                 // Return to center
setheading(90)         // Set absolute heading
heading()              // Get current heading
pos()                  // Get current position [x, y]
turtleCircle(50)       // Draw circle of radius
turtleCircle(50, 72)   // Circle with specific steps
dot(10)                // Draw dot at position
dot(10, "red")         // Dot with color
stamp()                // Stamp turtle shape

// Example: Turtle Spiral
turtle()
clear("black")
within i be sequence(1, 200) ::
    pencolor(hue(i * 2))
    forward(i * 2)
    right(91)
;;
```

### Sprites & Game Development

```sdev
// Create Sprite (x, y, width, height, color?)
forge player be createSprite(100, 100, 50, 50, "blue")
forge enemy be createSprite(200, 150, 40, 40, "red")

// Access properties
speak(player.x)        // 100
speak(player.y)        // 100
speak(player.width)    // 50
speak(player.height)   // 50
speak(player.color)    // blue

// Set velocity
player.velocityX be 5
player.velocityY be 2

// Update sprite (applies velocity)
updateSprite(player)

// Move sprite by delta
moveSprite(player, 10, 5)

// Draw sprite
drawSprite(player)
drawSprite(enemy)

// Collision detection
ponder spriteCollides(player, enemy) ::
    speak("Hit!")
;;
```

### 2D Vectors (Vec2)

```sdev
forge v1 be Vec2(3, 4)
forge v2 be Vec2(1, 2)

forge sum be v1.add(v2)       // Vec2(4, 6)
forge diff be v1.sub(v2)      // Vec2(2, 2)
forge scaled be v1.mul(2)     // Vec2(6, 8)

speak(v1.mag())               // 5
forge unit be v1.normalize()  // Vec2(0.6, 0.8)
speak(v1.dot(v2))             // 11
speak(v1.distance(v2))        // 2.83
```

### Color Functions

```sdev
// RGB and RGBA
forge red be rgb(255, 0, 0)
forge transparent be rgba(255, 0, 0, 0.5)

// HSL and HSLA
forge blue be hue(240)              // Just hue (auto s=100, l=50)
forge purple be hue(280, 80, 60)    // hue, saturation, lightness
forge faded be hsla(120, 100, 50, 0.5)

// Random Color
forge color be randomColor()
```

### Graphics Math Utilities

```sdev
// Angle conversion
forge rad be radians(180)     // Degrees to radians -> PI
forge deg be degrees(3.14159) // Radians to degrees -> 180

// Interpolation
forge value be lerp(0, 100, 0.5)    // Linear interpolation -> 50

// Range mapping
forge mapped be mapRange(50, 0, 100, 0, 1)  // Map value to new range -> 0.5

// Constraining
forge clamped be constrain(150, 0, 100)  // Clamp to range -> 100

// Distance
forge d be dist(0, 0, 3, 4)  // Distance between points -> 5
```

### Complete Graphics Example

```sdev
// Starfield Animation
canvas(800, 600)

forge stars be []
within i be sequence(1, 100) ::
    stars.push(::
        "x": random(0, 800),
        "y": random(0, 600),
        "size": random(1, 4),
        "speed": random(1, 5)
    ;;)
;;

conjure drawFrame() ::
    clear("#000011")
    
    within star be stars ::
        // Update position
        star.y be star.y + star.speed
        ponder star.y > 600 ::
            star.y be 0
            star.x be random(0, 800)
        ;;
        
        // Draw star
        fill(rgba(255, 255, 255, star.size / 4))
        circle(star.x, star.y, star.size)
    ;;
;;

// Call drawFrame in a game loop
drawFrame()
```

### Graphics Function Reference

| Function | Description |
|----------|-------------|
| `canvas(w, h)` | Set canvas size |
| `clear(color?)` | Clear canvas |
| `background(color)` | Set background |
| `fill(color)` | Set fill color |
| `noFill()` | Disable fill |
| `stroke(color, width?)` | Set stroke |
| `noStroke()` | Disable stroke |
| `lineWidth(w)` | Set line width |
| `lineCap(style)` | Line cap style |
| `lineJoin(style)` | Line join style |
| `alpha(a)` | Set global alpha |
| `shadow(color, blur, x, y?)` | Add shadow |
| `noShadow()` | Remove shadow |
| `rect(x, y, w, h, r?)` | Draw rectangle |
| `circle(x, y, r)` | Draw circle |
| `ellipse(x, y, rx, ry, rot?)` | Draw ellipse |
| `arc(x, y, r, start, end, ccw?)` | Draw arc |
| `line(x1, y1, x2, y2)` | Draw line |
| `point(x, y, size?)` | Draw point |
| `triangle(x1, y1, x2, y2, x3, y3)` | Draw triangle |
| `polygon(points)` | Draw polygon |
| `star(x, y, outer, inner, pts?)` | Draw star |
| `heart(x, y, size)` | Draw heart |
| `text(str, x, y, size?)` | Draw text |
| `textAlign(h, v?)` | Set text alignment |
| `font(family, style?)` | Set font |
| `linearGradient(...)` | Create linear gradient |
| `radialGradient(...)` | Create radial gradient |
| `translate(x, y)` | Translate origin |
| `rotate(angle)` | Rotate canvas |
| `scale(x, y?)` | Scale canvas |
| `save()` | Save state |
| `restore()` | Restore state |
| `resetTransform()` | Reset transforms |
| `beginPath()` | Start new path |
| `closePath()` | Close path |
| `moveTo(x, y)` | Move to point |
| `lineTo(x, y)` | Line to point |
| `bezierTo(...)` | Bezier curve |
| `quadraticTo(...)` | Quadratic curve |
| `fillPath()` | Fill current path |
| `strokePath()` | Stroke current path |
| `turtle()` | Initialize turtle |
| `forward(d)` | Move forward |
| `backward(d)` | Move backward |
| `left(deg)` | Turn left |
| `right(deg)` | Turn right |
| `penup()` | Pen up |
| `pendown()` | Pen down |
| `pencolor(c)` | Set pen color |
| `penwidth(w)` | Set pen width |
| `goto(x, y)` | Go to position |
| `home()` | Return home |
| `setheading(deg)` | Set heading |
| `heading()` | Get heading |
| `pos()` | Get position |
| `turtleCircle(r, steps?)` | Draw circle |
| `dot(size?, color?)` | Draw dot |
| `stamp()` | Stamp turtle |
| `createSprite(...)` | Create sprite |
| `drawSprite(s)` | Draw sprite |
| `moveSprite(s, dx, dy)` | Move sprite |
| `updateSprite(s)` | Update sprite |
| `spriteCollides(a, b)` | Check collision |
| `rgb(r, g, b)` | RGB color |
| `rgba(r, g, b, a)` | RGBA color |
| `hue(h, s?, l?)` | HSL color |
| `hsla(h, s, l, a)` | HSLA color |
| `randomColor()` | Random color |
| `radians(deg)` | Convert to radians |
| `degrees(rad)` | Convert to degrees |
| `lerp(a, b, t)` | Linear interpolation |
| `mapRange(...)` | Map value to range |
| `constrain(v, min, max)` | Clamp value |
| `dist(x1, y1, x2, y2)` | Calculate distance |

---

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

## JavaScript Interop (JS Interpreter Only)

The JavaScript interpreter includes a special `js` keyword for calling external JavaScript functions directly. This is powerful for integrating with browser APIs and libraries like Leaflet.

### Syntax

```sdev
js <javascript expression>
```

The entire line after `js ` is executed as JavaScript and returns the result.

### Basic Examples

```sdev
// Call a global function
js alert("Hello from sdev!")

// Access browser APIs  
forge width be js window.innerWidth
forge height be js window.innerHeight
speak("Window size: " + width + "x" + height)

// Create DOM elements
js document.body.style.backgroundColor = "navy"

// Use Math functions
forge angle be js Math.PI / 4
forge result be js Math.sin(0.5)
```

### Leaflet Integration

The `js` keyword is especially useful with Leaflet:

```sdev
// Initialize a Leaflet map
forge myMap be js L.map("map").setView([51.505, -0.09], 13)

// Add a tile layer
js L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(myMap)

// Add a marker
forge marker be js L.marker([51.5, -0.09]).addTo(myMap)

// Bind a popup
js marker.bindPopup("Hello World!").openPopup()

// Add event listener
js myMap.on("click", function(e) { console.log(e.latlng); })
```

### Variable Access

sdev variables are accessible within `js` expressions:

```sdev
forge lat be 40.7128
forge lng be -74.0060
forge zoom be 12

// Use sdev variables in JavaScript
forge map be js L.map("map").setView([lat, lng], zoom)

forge name be "New York"
js console.log("Viewing: " + name)
```

### Complex Expressions

```sdev
// Inline object creation
forge options be js { dragging: true, zoomControl: false }

// Array operations
forge coords be js [[40.7, -74], [34.0, -118], [41.8, -87]]

// Function calls with callbacks
js setTimeout(function() { alert("Timer!"); }, 1000)

// Access localStorage
js localStorage.setItem("lastVisit", new Date().toISOString())
forge lastVisit be js localStorage.getItem("lastVisit")
```

### Error Handling

JavaScript errors are caught and converted to sdev errors:

```sdev
attempt ::
    js undefinedFunction()
;; rescue err ::
    speak("JS Error: " + err)
;;
```

### Security Notes

- The `js` keyword uses `new Function()` in browsers for sandboxed execution
- Variables from sdev are passed into the JavaScript context
- Global objects (window, document, L, etc.) remain accessible
- Use with caution - arbitrary JavaScript execution can have side effects

---

## Version

sdev version 1.0.0

For updates and more examples, visit the sdev repository.
