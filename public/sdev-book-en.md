# The sdev Book

_The comprehensive reference for the sdev programming language._

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Variables and Values](#3-variables-and-values)
4. [Operators and Expressions](#4-operators-and-expressions)
5. [Control Flow](#5-control-flow)
6. [Functions](#6-functions)
7. [Collections](#7-collections)
8. [Strings](#8-strings)
9. [Object-Oriented Programming](#9-object-oriented-programming)
10. [Error Handling](#10-error-handling)
11. [Concurrency](#11-concurrency)
12. [Modules and Libraries](#12-modules-and-libraries)
13. [The UI Toolkit](#13-the-ui-toolkit)
14. [Graphics and Canvas](#14-graphics-and-canvas)
15. [Maps and GIS](#15-maps-and-gis)
16. [The Standard Library](#16-the-standard-library)
17. [Tooling](#17-tooling)
18. [Advanced Topics](#18-advanced-topics)
19. [Best Practices](#19-best-practices)
20. [A Cookbook of Examples](#20-a-cookbook-of-examples)
21. [Frequently Asked Questions](#21-frequently-asked-questions)
22. [Glossary](#22-glossary)
23. [Appendices](#23-appendices)

---


## 1. Introduction

Welcome to **The sdev Book** — the comprehensive reference for the sdev programming language. sdev is a modern, expressive language with a uniquely human-readable syntax (`forge`, `be`, `speak`, `conjure`, `summon`) designed to make code feel like prose without sacrificing power.


### 1.1 Why sdev?

sdev was created to bridge the gap between *talking about code* and *writing code*. Traditional languages force you into algebraic shorthand (`x = 1`, `def`, `var`). sdev replaces these with verbs and nouns that carry meaning: `forge x be 1`. The result is code that reads like a recipe, an essay, or a spell — depending on your style.


### 1.2 Who Should Read This Book

This book is for everyone: complete beginners learning to program for the first time, professional developers exploring an expressive new language, educators teaching computational thinking, and language designers studying alternative syntactic paradigms. Each chapter starts gentle and ramps up.


### 1.3 How To Use This Book

Read sequentially the first time. Skim later. Every example is runnable in the **online IDE** at https://s-dev.lovable.app or with the offline Python/JS interpreters available from the Downloads menu. Type the examples — do not just read them.


### 1.4 Conventions

Code blocks use the `sdev` syntax. Output is shown in `// =>` comments. Notes labeled **TIP**, **WARNING**, or **DEEP DIVE** signal important context. Bulgarian translations of every chapter are available in `sdev-book-bg.md`.


## 2. Getting Started

In this chapter you will install sdev (or skip installation entirely by using the web IDE), write your first program, and understand the moving parts of an sdev project.


### 2.1 Installing sdev

There are three ways to run sdev:

1. **Web IDE** — no install, open https://s-dev.lovable.app/ide.
2. **JavaScript interpreter** — `node sdev-interpreter.js my-file.sdev`.
3. **Python interpreter** — `python sdev-interpreter.py my-file.sdev`.

Windows users can run the bundled installer batch file from the Downloads menu.


### 2.2 Your First Program

Create a file `hello.sdev`:

```sdev
speak("Hello, world!")
```

Run it. You should see `Hello, world!` printed. Congratulations — you are an sdev programmer.


### 2.3 The REPL

Start the REPL with `python sdev-interpreter.py` (no arguments). Type expressions and they will be evaluated immediately. Type `:quit` or press Ctrl+D to exit.


### 2.4 Project Structure

A typical sdev project has:
- `main.sdev` — entry point
- `lib/` — your modules
- `assets/` — images, data files
- `README.md` — documentation

There is no required layout. sdev is happy with a single file.


### 2.5 Running From the IDE

In the web IDE, press `Ctrl+Enter` (or `Cmd+Enter` on macOS) to run the active tab. The output panel shows printed text; the App panel shows UI windows; the canvas shows graphics.


## 3. Variables and Values

Every program manipulates data. In sdev you create variables with `forge` and bind them with `be`. Values are typed dynamically — sdev figures it out at runtime.


### 3.1 Forging Variables

```sdev
forge name be "Ada"
forge age be 36
forge alive be yes
```

The `forge` keyword introduces a *new* binding. Re-assignment uses just the name:

```sdev
name be "Lovelace"
```


### 3.2 The Five Primitive Types

sdev recognises five primitive types: **number** (integer or float), **string**, **boolean** (`yes`/`no`), **void** (the absence of a value), and **collection** (lists/dictionaries — covered in the next chapter).


### 3.3 Type Inspection

Use `essence(value)` to ask what type a value is.

```sdev
speak(essence(42))      // => "number"
speak(essence("hi"))    // => "string"
speak(essence(yes))     // => "boolean"
```


### 3.4 Type Conversion

Use `morph(value, "type")` to convert.

```sdev
forge n be morph("42", "number")
speak(n + 1)  // => 43
```


### 3.5 Constants

Prefix with `eternal` to mark a value as immutable.

```sdev
eternal forge PI be 3.14159
PI be 4  // => error: cannot rebind eternal binding
```


### 3.6 Naming Rules

Identifiers must begin with a letter or underscore and may contain letters, digits, and underscores. Reserved keywords (`forge`, `be`, `if`, etc.) cannot be used. snake_case is conventional.


## 4. Operators and Expressions

sdev supports the usual arithmetic, comparison, and logical operators, with English-word aliases for clarity.


### 4.1 Arithmetic

Standard symbols: `+`, `-`, `*`, `/`, `%` (modulo), `**` (exponent). Integer division uses `//`.


### 4.2 Comparison

`==`, `!=`, `<`, `>`, `<=`, `>=`. The aliases `equals`, `differs`, `below`, `above` are available for prose-style code:

```sdev
if age above 18 then speak("Adult")
```


### 4.3 Logical

`and`, `or`, `not`. Short-circuit evaluation is guaranteed. The symbols `&&`, `||`, `!` also work.


### 4.4 String Operators

Concatenate with `+`. Repeat with `*`:

```sdev
speak("ha" * 3)  // => hahaha
```


### 4.5 Membership

`in` and `not in` test membership in collections and substrings in strings.

```sdev
if "lo" in "hello" then speak("found")
```


### 4.6 Operator Precedence

From highest to lowest: unary minus / not, `**`, `*` `/` `%` `//`, `+` `-`, comparisons, `and`, `or`. Use parentheses freely; sdev never penalises clarity.


## 5. Control Flow

Branching and looping in sdev use natural-language keywords.


### 5.1 If / Else

```sdev
if score above 90 then
  speak("A")
else if score above 75 then
  speak("B")
else
  speak("C")
end
```


### 5.2 When (Pattern Match)

`when` is a multi-branch matcher.

```sdev
when day:
  is "mon" then speak("Monday blues")
  is "fri" then speak("Almost weekend")
  else speak("A regular day")
end
```


### 5.3 While Loops

```sdev
forge i be 0
while i below 5:
  speak(i)
  i be i + 1
end
```


### 5.4 Until Loops

`until` is the inverse of `while` — runs while the condition is false:

```sdev
until ready:
  ready be checkStatus()
end
```


### 5.5 For-Each

```sdev
for item in [1, 2, 3]:
  speak(item)
end
```


### 5.6 Range Iteration

```sdev
for i in sequence(1, 10):
  speak(i)
end
```


### 5.7 Break and Continue

Use `escape` to break out of a loop and `skip` to jump to the next iteration.


## 6. Functions

Functions in sdev are declared with `conjure` and called by name with parentheses.


### 6.1 Defining a Function

```sdev
conjure greet(name):
  speak("Hello, " + name)
end
```


### 6.2 Returning Values

Use `yield` (or `return`) to produce a result.

```sdev
conjure square(x):
  yield x * x
end
speak(square(7))  // => 49
```


### 6.3 Default Parameters

```sdev
conjure greet(name be "stranger"):
  speak("Hello, " + name)
end
```


### 6.4 Variadic Functions

Use `...rest` to accept any number of arguments.

```sdev
conjure sumAll(...nums):
  yield fold(nums, 0, (a, b) => a + b)
end
```


### 6.5 Anonymous Functions (Lambdas)

```sdev
forge double be (x) => x * 2
speak(double(5))  // => 10
```


### 6.6 Higher-Order Functions

Functions are first-class values. Pass them around freely:

```sdev
forge nums be [1, 2, 3, 4]
forge doubled be each(nums, (n) => n * 2)
```


### 6.7 Closures

Inner functions capture variables from the enclosing scope.

```sdev
conjure makeCounter():
  forge n be 0
  yield () => { n be n + 1; yield n }
end
```


### 6.8 Recursion

sdev fully supports recursion. The classic factorial:

```sdev
conjure fact(n):
  if n <= 1 then yield 1
  yield n * fact(n - 1)
end
```


## 7. Collections

Lists and dictionaries are the workhorses of sdev. Both are dynamic and grow on demand.


### 7.1 Lists

```sdev
forge nums be [1, 2, 3]
speak(nums[0])         // => 1
gather(nums, 4)        // append
speak(magnitude(nums)) // length
```


### 7.2 Dictionaries

```sdev
forge user be { name: "Ada", age: 36 }
speak(user.name)       // => Ada
user.age be 37
```


### 7.3 List Operations

`each(list, fn)` maps. `sift(list, predicate)` filters. `fold(list, init, fn)` reduces. `weave(list, sep)` joins to string. `shatter(string, sep)` splits.


### 7.4 Slicing

```sdev
forge xs be [10, 20, 30, 40, 50]
speak(portion(xs, 1, 3))  // => [20, 30]
```


### 7.5 Searching

`seek(list, predicate)` returns the first match. `every(list, predicate)` returns `yes` if all match. `some(list, predicate)` returns `yes` if any match.


### 7.6 Sets

Convert a list to a unique-only set with `unique(list)`. Set operations: `union`, `intersect`, `difference`.


## 8. Strings

Strings are immutable sequences of Unicode characters.


### 8.1 Literals

Single or double quotes work identically. Triple quotes for multi-line:

```sdev
forge poem be """
  Roses are red
  Violets are blue
"""
```


### 8.2 Interpolation

Use `${...}` inside backtick strings.

```sdev
forge name be "Ada"
speak(`Hello, ${name}!`)
```


### 8.3 Common Operations

`upper`, `lower`, `trim`, `reverse`, `contains`, `replace`, `split` (alias `shatter`), `join` (alias `weave`), `length` (alias `magnitude`).


### 8.4 Regular Expressions

```sdev
forge re be regex("\\d+")
forge nums be findAll(re, "abc 123 def 456")
```


## 9. Object-Oriented Programming

sdev supports classes via the `essence` keyword and instance creation via `summon`.


### 9.1 Defining a Class

```sdev
essence Dog:
  forge name
  forge breed
  conjure bark():
    speak(name + " says woof!")
  end
end
```


### 9.2 Creating Instances

```sdev
forge rex be summon Dog(name: "Rex", breed: "Husky")
rex.bark()
```


### 9.3 Inheritance

```sdev
essence Puppy extends Dog:
  conjure yip():
    speak(name + " yips!")
  end
end
```


### 9.4 Methods and Self

Methods automatically have access to instance fields by name. Use `me` for explicit reference (`me.name`).


### 9.5 Static Methods

Prefix with `shared`:

```sdev
essence Math:
  shared conjure pi(): yield 3.14159 end
end
speak(Math.pi())
```


### 9.6 Polymorphism

Override methods freely in subclasses. Call the parent with `ancestor.method()`.


## 10. Error Handling

When things go wrong, sdev gives you tools to recover gracefully.


### 10.1 Try / Catch

```sdev
attempt:
  risky()
rescue err:
  speak("Failed: " + err.message)
end
```


### 10.2 Throwing Errors

```sdev
if age below 0 then
  raise "Age cannot be negative"
end
```


### 10.3 Finally

```sdev
attempt:
  openFile()
rescue err:
  speak(err)
finally:
  closeFile()
end
```


### 10.4 Custom Error Types

```sdev
essence ValidationError extends Error:
  forge field
end
```


## 11. Concurrency

sdev offers async/await-style concurrency with the keywords `dispatch` and `await`.


### 11.1 Dispatch

```sdev
forge task be dispatch fetchData()
```
Returns a promise.


### 11.2 Await

```sdev
forge data be await task
```


### 11.3 Parallel Tasks

```sdev
forge results be await all([dispatch fetch(a), dispatch fetch(b)])
```


### 11.4 Channels

For producer/consumer patterns, use `channel()`, `send`, and `receive`.


## 12. Modules and Libraries

Use `summon` to bring in code from other files or remote gists.


### 12.1 Local Imports

```sdev
summon "lib/math.sdev"
```


### 12.2 Gist Libraries

```sdev
summon "gist:abc123"
```
Fetches an sdev file from a GitHub Gist or the sdev gist registry.


### 12.3 Exporting

Use `share` to mark a value as exported.

```sdev
share conjure add(a, b): yield a + b end
```


## 13. The UI Toolkit

sdev includes a built-in declarative UI system. Build windows with buttons, inputs, sliders, tables, tabs, menus, and more — all from sdev code, rendered live in the IDE.


### 13.1 Your First Window

```sdev
window("Hello App", 400, 300)
  heading("Hello, world!", 1)
  paragraph("This is an sdev UI app.")
  button("Click me", () => alert("Hi!"))
endwindow
```

`window(title, width, height)` opens a window. `endwindow` closes the definition.


### 13.2 Layouts: Row & Column

```sdev
row
  button("Left")
  button("Right")
endrow

column
  label("Top")
  label("Bottom")
endcolumn
```


### 13.3 Inputs

```sdev
input("name", "Your name")
button("Greet", () => alert("Hello " + uiget("name")))
```

The first argument is the *bind name* — the variable that holds the input value. Read it with `uiget` and write it with `uiset`.


### 13.4 Checkboxes and Sliders

```sdev
checkbox("agree", "I agree to terms")
slider("volume", 0, 100, 1)
label("Volume: " + uiget("volume"))
```


### 13.5 Tabs and Groups

```sdev
tabs
  tab("Profile")
    input("name")
  endtab
  tab("Settings")
    checkbox("notifications", "Enable notifications")
  endtab
endtabs
```


### 13.6 Tables

```sdev
table(["Name", "Age"], [["Ada", 36], ["Linus", 54]])
```


### 13.7 Menus

```sdev
menu("File")
  menuitem("New", () => speak("new file"))
  menuitem("Open", () => speak("open"))
endmenu
```


### 13.8 Customization

Buttons accept a third argument for variant: `"default"`, `"primary"`, `"destructive"`, `"ghost"`. Windows accept width and height as second and third arguments. Images accept width, height, and alt text.


### 13.9 Reactive Values

Every interactive widget binds to a name. Read the current value with `uiget("name")`. Programmatically update with `uiset("name", newValue)`. The UI redraws automatically.


## 14. Graphics and Canvas

For drawing pixels, lines, shapes, and animations, sdev provides a canvas API.


### 14.1 Setting Up

```sdev
canvas(800, 600)
```


### 14.2 Drawing Shapes

`circle(x, y, r)`, `rect(x, y, w, h)`, `line(x1, y1, x2, y2)`, `polygon(points)`.


### 14.3 Colors and Fills

`color("red")`, `fill("#ff0080")`, `stroke("white", 2)`.


### 14.4 Text on Canvas

`text("Hello", x, y, size)`.


### 14.5 Animation Loop

Use `frame((t) => { ... })` to animate. `t` is the elapsed time in seconds.


### 14.6 Mouse and Keyboard

`onMouse((x, y) => ...)`, `onKey((key) => ...)`.


## 15. Maps and GIS

sdev integrates Leaflet for full mapping and geospatial features. See the dedicated `SDEV_LEAFLET_DOCUMENTATION.md` for the complete API.


### 15.1 Quick Map

```sdev
map(42.7, 23.3, 12)   // lat, lng, zoom
marker(42.7, 23.3, "Sofia")
```


### 15.2 Layers and Tiles

`tile("osm")`, `tile("satellite")`. Stack multiple layers.


### 15.3 GeoJSON

Load a GeoJSON file with `geojson(url)` and style features with a callback.


## 16. The Standard Library

A reference of the most-used built-in functions, grouped by purpose.


### 16.1 I/O

`speak`, `whisper`, `shout`, `ask` (read line), `readFile`, `writeFile`.


### 16.2 Math

`magnitude`, `least`, `greatest`, `root`, `ground` (floor), `elevate` (ceil), `random`, `pi`, `sin`, `cos`, `tan`, `log`.


### 16.3 Strings

`upper`, `lower`, `trim`, `reverse`, `contains`, `replace`, `shatter`, `weave`, `regex`, `findAll`, `match`.


### 16.4 Collections

`gather`, `pluck`, `portion`, `each`, `sift`, `fold`, `seek`, `every`, `some`, `zip`, `enumerate`, `unique`, `sort`.


### 16.5 Time

`now`, `delay`, `today`, `format`.


### 16.6 System

`env`, `argv`, `exit`, `osinfo`.


### 16.7 Encoding

`base64encode`, `base64decode`, `hexencode`, `hexdecode`, `jsonencode`, `jsondecode`.


## 17. Tooling

Editors, linters, and the bytecode compiler.


### 17.1 Web IDE

Full-featured browser IDE at https://s-dev.lovable.app/ide. Includes file tree, tabs, command palette (`Ctrl+Shift+P`), terminal, and live App preview.


### 17.2 VS Code Extension

Download `.vsix` from the Downloads menu. Provides syntax highlighting, snippets, and a Run command (`Ctrl+Enter`).


### 17.3 Bytecode Compiler

Compile to `.sdevc` for faster startup: `node sdev-interpreter.js --compile main.sdev`. Run with `--exec main.sdevc`.


### 17.4 The sdev Assistant

In-IDE AI chatbot that explains code, generates examples, and debugs runtime errors via a self-test loop.


## 18. Advanced Topics

Power-user features for systems, performance, and embedding.


### 18.1 JavaScript Interop

Embed raw JS with the `js` keyword:

```sdev
js { console.log("native") }
```
Values flow both ways via the shared scope.


### 18.2 Matrix Math

`matrix([[1,2],[3,4]])`, `matmul`, `inverse`, `transpose`, `det`.


### 18.3 Buffers and Pointers

`buffer(size)`, `pointer(value)`, `deref(p)`. For binary protocol work.


### 18.4 Kernel and Tasks

sdev includes a virtual OS kernel. `spawn(fn)` creates a task; `schedule()` yields cooperatively; `syscall("name", args)` invokes a syscall.


### 18.5 Garbage Collection

Mark-and-sweep GC runs automatically. Force a cycle with `gc()`.


### 18.6 Multi-Language Source

sdev source can be written in any of 26 languages. The translator normalises keywords at parse time. Set the source language with `// lang: bg`.


## 19. Best Practices

Idioms and patterns that make sdev programs delightful to read and maintain.


### 19.1 Name Things Well

sdev rewards descriptive names. `forge n be 0` is fine for a counter; `forge customers_seen be 0` is better when shared.


### 19.2 Prefer Verbs

Function names should be verbs (`compute`, `render`, `parse`); class names should be nouns (`Customer`, `Invoice`).


### 19.3 Keep Functions Small

Aim for under 20 lines. If a function does two things, split it.


### 19.4 Embrace Immutability

Use `eternal` liberally for values that should not change. Future readers will thank you.


### 19.5 Document Intent, Not Mechanics

Comments should explain *why*. The code already shows *what*.


## 20. A Cookbook of Examples

Short, complete programs that demonstrate idiomatic sdev.


### 20.1 FizzBuzz

```sdev
for i in sequence(1, 100):
  when:
    is i % 15 == 0 then speak("FizzBuzz")
    is i % 3 == 0 then speak("Fizz")
    is i % 5 == 0 then speak("Buzz")
    else speak(i)
  end
end
```


### 20.2 Word Count

```sdev
forge text be readFile("essay.txt")
forge words be shatter(text, " ")
speak("Word count: " + magnitude(words))
```


### 20.3 Todo App UI

```sdev
forge todos be []
window("Todos", 360, 480)
  input("new", "What to do?")
  button("Add", () => {
    gather(todos, uiget("new"))
    uiset("new", "")
  })
  for t in todos:
    label(t)
  end
endwindow
```


### 20.4 HTTP Fetch

```sdev
forge res be await fetch("https://api.example.com/users")
forge users be jsondecode(res.body)
for u in users: speak(u.name) end
```


### 20.5 Bouncing Ball

```sdev
canvas(400, 400)
forge x be 200; forge y be 200; forge dx be 3; forge dy be 2
frame((t) => {
  fill("black"); rect(0, 0, 400, 400)
  fill("cyan"); circle(x, y, 20)
  x be x + dx; y be y + dy
  if x < 0 or x > 400 then dx be -dx end
  if y < 0 or y > 400 then dy be -dy end
})
```


## 21. Frequently Asked Questions

Real questions from real sdev users.


### 21.1 Is sdev fast?

For interpreted execution, performance is on par with Python. The bytecode compiler (`.sdevc`) gives a 3–5× speedup. For hot loops, drop into `js { ... }` interop.


### 21.2 Can I use it in production?

sdev is best suited for scripting, education, prototyping, and embedded scenarios. Production web backends remain a stretch — but it is improving.


### 21.3 Why not just use Python?

Python is excellent. sdev exists for those who want a *more readable* alternative — closer to spoken English than algebraic shorthand.


### 21.4 Where do I report bugs?

Open an issue on the GitHub repository linked from the website footer.


### 21.5 Can I contribute?

Yes! sdev is open source. Pull requests for new builtins, language features, and translations are welcome.


## 22. Glossary

Quick definitions of key terms.


### 22.1 A–F

**Anonymous function** — a function without a name, created with `=>`.
**Bind** — to associate a name with a value.
**Closure** — a function that captures variables from its lexical scope.
**Conjure** — keyword to declare a function.
**Eternal** — modifier for immutable bindings.
**Forge** — keyword to declare a new variable.


### 22.2 G–N

**Gist** — a remote sdev module fetched via `summon`.
**Lambda** — synonym for anonymous function.
**Morph** — built-in for type conversion.
**Mutation** — changing the value of a binding.


### 22.3 O–Z

**Object** — instance of a class.
**Promise** — a value that will arrive later.
**Summon** — keyword to import or instantiate.
**VM** — the bytecode virtual machine.
**Yield** — return a value from a function.


## 23. Appendices


### 23.1 A. Keyword Reference

`forge`, `be`, `eternal`, `if`, `then`, `else`, `when`, `is`, `while`, `until`, `for`, `in`, `escape`, `skip`, `conjure`, `yield`, `return`, `essence`, `summon`, `share`, `extends`, `me`, `ancestor`, `attempt`, `rescue`, `finally`, `raise`, `dispatch`, `await`, `js`, `end`.


### 23.2 B. Operator Reference

`+ - * / % ** //`, `== != < > <= >=`, `and or not`, `equals differs above below`, `in`, `=>`.


### 23.3 C. Built-in Function Index

See Chapter 16 (The Standard Library). The complete index is in `SDEV_DOCUMENTATION.md`.


### 23.4 D. Source Languages

sdev source files may be written in: English, Bulgarian, Russian, Spanish, French, German, Italian, Portuguese, Polish, Romanian, Ukrainian, Greek, Turkish, Arabic, Hebrew, Hindi, Chinese (Simplified), Chinese (Traditional), Japanese, Korean, Vietnamese, Thai, Indonesian, Dutch, Swedish, Czech.


---

*End of book. Version 1.0. © sdev language.*
