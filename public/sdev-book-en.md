# The sdev Book

_The comprehensive reference for the sdev programming language._

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Why sdev?](#1-1-why-sdev)
   - 1.2 [A Brief History](#1-2-a-brief-history)
   - 1.3 [Who Should Read This Book](#1-3-who-should-read-this-book)
   - 1.4 [How To Use This Book](#1-4-how-to-use-this-book)
   - 1.5 [Conventions](#1-5-conventions)
   - 1.6 [A First Taste](#1-6-a-first-taste)
2. [Getting Started](#2-getting-started)
   - 2.1 [Installing sdev](#2-1-installing-sdev)
   - 2.2 [Your First Program](#2-2-your-first-program)
   - 2.3 [The REPL](#2-3-the-repl)
   - 2.4 [Project Structure](#2-4-project-structure)
   - 2.5 [Running From the IDE](#2-5-running-from-the-ide)
   - 2.6 [Anatomy of a Program](#2-6-anatomy-of-a-program)
   - 2.7 [Editor Setup](#2-7-editor-setup)
   - 2.8 [Common Pitfalls For Beginners](#2-8-common-pitfalls-for-beginners)
3. [Variables and Values](#3-variables-and-values)
   - 3.1 [Forging Variables](#3-1-forging-variables)
   - 3.2 [The Six Primitive Types](#3-2-the-six-primitive-types)
   - 3.3 [Type Inspection](#3-3-type-inspection)
   - 3.4 [Type Conversion (`morph`)](#3-4-type-conversion-morph)
   - 3.5 [Constants (`eternal`)](#3-5-constants-eternal)
   - 3.6 [Naming Rules](#3-6-naming-rules)
   - 3.7 [Scope](#3-7-scope)
   - 3.8 [Nothing, Truthiness, Equality](#3-8-nothing-truthiness-equality)
   - 3.9 [Numbers In Detail](#3-9-numbers-in-detail)
   - 3.10 [Strings In Detail](#3-10-strings-in-detail)
4. [Operators and Expressions](#4-operators-and-expressions)
   - 4.1 [Arithmetic](#4-1-arithmetic)
   - 4.2 [Comparison](#4-2-comparison)
   - 4.3 [Logical](#4-3-logical)
   - 4.4 [String Operators](#4-4-string-operators)
   - 4.5 [Membership](#4-5-membership)
   - 4.6 [Pipelines (`|>`)](#4-6-pipelines)
   - 4.7 [Operator Precedence](#4-7-operator-precedence)
   - 4.8 [Truthy Conversions](#4-8-truthy-conversions)
5. [Control Flow](#5-control-flow)
   - 5.1 [If / Then / Else](#5-1-if-then-else)
   - 5.2 [When (Pattern Match)](#5-2-when-pattern-match)
   - 5.3 [While And Until](#5-3-while-and-until)
   - 5.4 [For ... In](#5-4-for-in)
   - 5.5 [Escape And Skip](#5-5-escape-and-skip)
   - 5.6 [Labelled Loops](#5-6-labelled-loops)
   - 5.7 [Match (Destructuring)](#5-7-match-destructuring)
6. [Functions](#6-functions)
   - 6.1 [Defining a Function](#6-1-defining-a-function)
   - 6.2 [Default and Keyword Arguments](#6-2-default-and-keyword-arguments)
   - 6.3 [Variadic Arguments](#6-3-variadic-arguments)
   - 6.4 [Returning Values](#6-4-returning-values)
   - 6.5 [Anonymous Functions (Lambdas)](#6-5-anonymous-functions-lambdas)
   - 6.6 [Closures](#6-6-closures)
   - 6.7 [Higher-Order Functions](#6-7-higher-order-functions)
   - 6.8 [Recursion](#6-8-recursion)
   - 6.9 [Generators (`yield`)](#6-9-generators-yield)
   - 6.10 [Decorators](#6-10-decorators)
7. [Collections](#7-collections)
   - 7.1 [Lists](#7-1-lists)
   - 7.2 [Dictionaries](#7-2-dictionaries)
   - 7.3 [Slicing](#7-3-slicing)
   - 7.4 [Map / Filter / Reduce](#7-4-map-filter-reduce)
   - 7.5 [Sets](#7-5-sets)
   - 7.6 [Tuples](#7-6-tuples)
   - 7.7 [Iteration Idioms](#7-7-iteration-idioms)
   - 7.8 [Performance Notes](#7-8-performance-notes)
8. [Strings In Depth](#8-strings-in-depth)
   - 8.1 [Literals](#8-1-literals)
   - 8.2 [Indexing And Slicing](#8-2-indexing-and-slicing)
   - 8.3 [Searching](#8-3-searching)
   - 8.4 [Manipulation](#8-4-manipulation)
   - 8.5 [Encoding](#8-5-encoding)
   - 8.6 [Formatting](#8-6-formatting)
   - 8.7 [Regular Expressions](#8-7-regular-expressions)
   - 8.8 [Unicode And Locales](#8-8-unicode-and-locales)
9. [Object-Oriented Programming](#9-object-oriented-programming)
   - 9.1 [Defining a Class](#9-1-defining-a-class)
   - 9.2 [Creating Instances](#9-2-creating-instances)
   - 9.3 [Inheritance](#9-3-inheritance)
   - 9.4 [Class Methods And Fields](#9-4-class-methods-and-fields)
   - 9.5 [Mixins (`weave`)](#9-5-mixins-weave)
   - 9.6 [Operator Overloading](#9-6-operator-overloading)
   - 9.7 [Properties](#9-7-properties)
   - 9.8 [Abstract Classes And Interfaces](#9-8-abstract-classes-and-interfaces)
10. [Error Handling](#10-error-handling)
   - 10.1 [Raising Errors](#10-1-raising-errors)
   - 10.2 [Attempt / Rescue / Finally](#10-2-attempt-rescue-finally)
   - 10.3 [Error Types](#10-3-error-types)
   - 10.4 [Multiple Rescues](#10-4-multiple-rescues)
   - 10.5 [Re-raising](#10-5-re-raising)
   - 10.6 [Stack Traces](#10-6-stack-traces)
   - 10.7 [Assertions](#10-7-assertions)
   - 10.8 [Defensive Programming Idioms](#10-8-defensive-programming-idioms)
11. [Concurrency](#11-concurrency)
   - 11.1 [Async Functions](#11-1-async-functions)
   - 11.2 [Dispatch And Await](#11-2-dispatch-and-await)
   - 11.3 [Parallel Composition](#11-3-parallel-composition)
   - 11.4 [Channels](#11-4-channels)
   - 11.5 [Cancellation](#11-5-cancellation)
   - 11.6 [Time And Delay](#11-6-time-and-delay)
   - 11.7 [The Kernel](#11-7-the-kernel)
12. [Modules and Libraries](#12-modules-and-libraries)
   - 12.1 [Local Modules](#12-1-local-modules)
   - 12.2 [Gist Packages](#12-2-gist-packages)
   - 12.3 [Versioning](#12-3-versioning)
   - 12.4 [Manifests](#12-4-manifests)
   - 12.5 [Authoring A Gist Module](#12-5-authoring-a-gist-module)
   - 12.6 [Module Scope](#12-6-module-scope)
   - 12.7 [Dynamic Loading](#12-7-dynamic-loading)
13. [The UI Toolkit](#13-the-ui-toolkit)
   - 13.1 [Windows](#13-1-windows)
   - 13.2 [Headings, Labels, Paragraphs](#13-2-headings-labels-paragraphs)
   - 13.3 [Buttons](#13-3-buttons)
   - 13.4 [Inputs](#13-4-inputs)
   - 13.5 [Textareas](#13-5-textareas)
   - 13.6 [Checkboxes And Radios](#13-6-checkboxes-and-radios)
   - 13.7 [Sliders And Selects](#13-7-sliders-and-selects)
   - 13.8 [Tables](#13-8-tables)
   - 13.9 [Tabs](#13-9-tabs)
   - 13.10 [Menus](#13-10-menus)
   - 13.11 [Layout: Rows, Columns, Groups](#13-11-layout-rows-columns-groups)
   - 13.12 [Reactive Values](#13-12-reactive-values)
   - 13.13 [Event Handlers](#13-13-event-handlers)
   - 13.14 [Customisation](#13-14-customisation)
   - 13.15 [A Complete Example](#13-15-a-complete-example)
14. [Graphics and Canvas](#14-graphics-and-canvas)
   - 14.1 [Opening A Canvas](#14-1-opening-a-canvas)
   - 14.2 [Drawing Primitives](#14-2-drawing-primitives)
   - 14.3 [Colors](#14-3-colors)
   - 14.4 [Animation](#14-4-animation)
   - 14.5 [Images And Sprites](#14-5-images-and-sprites)
   - 14.6 [Transforms](#14-6-transforms)
   - 14.7 [Mouse And Keyboard](#14-7-mouse-and-keyboard)
   - 14.8 [Bouncing Ball Example](#14-8-bouncing-ball-example)
15. [Maps and GIS](#15-maps-and-gis)
   - 15.1 [Opening A Map](#15-1-opening-a-map)
   - 15.2 [Markers And Popups](#15-2-markers-and-popups)
   - 15.3 [Tile Layers](#15-3-tile-layers)
   - 15.4 [Polylines And Polygons](#15-4-polylines-and-polygons)
   - 15.5 [GeoJSON](#15-5-geojson)
   - 15.6 [Heatmaps And Clustering](#15-6-heatmaps-and-clustering)
   - 15.7 [Events](#15-7-events)
   - 15.8 [Routing And Distance](#15-8-routing-and-distance)
   - 15.9 [A Complete Map Example](#15-9-a-complete-map-example)
16. [The Standard Library](#16-the-standard-library)
   - 16.1 [Built-in Function Table](#16-1-built-in-function-table)
   - 16.2 [I/O](#16-2-i-o)
   - 16.3 [Math](#16-3-math)
   - 16.4 [Collections](#16-4-collections)
   - 16.5 [Strings](#16-5-strings)
   - 16.6 [Time](#16-6-time)
   - 16.7 [Network](#16-7-network)
   - 16.8 [System](#16-8-system)
   - 16.9 [Encoding](#16-9-encoding)
   - 16.10 [Cryptography](#16-10-cryptography)
17. [Tooling](#17-tooling)
   - 17.1 [The Web IDE](#17-1-the-web-ide)
   - 17.2 [VS Code Extension](#17-2-vs-code-extension)
   - 17.3 [CLI Reference](#17-3-cli-reference)
   - 17.4 [Bytecode Compiler](#17-4-bytecode-compiler)
   - 17.5 [The sdev Assistant](#17-5-the-sdev-assistant)
   - 17.6 [Linter](#17-6-linter)
   - 17.7 [Formatter](#17-7-formatter)
   - 17.8 [Debugger](#17-8-debugger)
   - 17.9 [Test Runner](#17-9-test-runner)
18. [Advanced Topics](#18-advanced-topics)
   - 18.1 [JavaScript Interop](#18-1-javascript-interop)
   - 18.2 [Matrix Math](#18-2-matrix-math)
   - 18.3 [Buffers and Pointers](#18-3-buffers-and-pointers)
   - 18.4 [The Virtual Kernel](#18-4-the-virtual-kernel)
   - 18.5 [Garbage Collection](#18-5-garbage-collection)
   - 18.6 [The Bytecode VM](#18-6-the-bytecode-vm)
   - 18.7 [Multi-Language Source](#18-7-multi-language-source)
   - 18.8 [Embedding sdev](#18-8-embedding-sdev)
   - 18.9 [FFI](#18-9-ffi)
19. [Performance](#19-performance)
   - 19.1 [Choose The Right Runtime](#19-1-choose-the-right-runtime)
   - 19.2 [Profile Before Optimising](#19-2-profile-before-optimising)
   - 19.3 [Avoid Quadratic Patterns](#19-3-avoid-quadratic-patterns)
   - 19.4 [Cache Computations](#19-4-cache-computations)
   - 19.5 [Reuse Buffers](#19-5-reuse-buffers)
   - 19.6 [Compile To Bytecode](#19-6-compile-to-bytecode)
20. [Best Practices](#20-best-practices)
   - 20.1 [Name Things Well](#20-1-name-things-well)
   - 20.2 [Prefer Verbs](#20-2-prefer-verbs)
   - 20.3 [Keep Functions Small](#20-3-keep-functions-small)
   - 20.4 [Embrace Immutability](#20-4-embrace-immutability)
   - 20.5 [Document Intent](#20-5-document-intent)
   - 20.6 [Test Early, Test Often](#20-6-test-early-test-often)
   - 20.7 [Fail Loudly](#20-7-fail-loudly)
   - 20.8 [Prefer Composition Over Inheritance](#20-8-prefer-composition-over-inheritance)
21. [A Cookbook of Examples](#21-a-cookbook-of-examples)
   - 21.1 [FizzBuzz](#21-1-fizzbuzz)
   - 21.2 [Word Count](#21-2-word-count)
   - 21.3 [Frequency Histogram](#21-3-frequency-histogram)
   - 21.4 [Todo App UI](#21-4-todo-app-ui)
   - 21.5 [HTTP Fetch](#21-5-http-fetch)
   - 21.6 [Bouncing Ball Animation](#21-6-bouncing-ball-animation)
   - 21.7 [Palindrome Checker](#21-7-palindrome-checker)
   - 21.8 [Fibonacci (Memoised)](#21-8-fibonacci-memoised)
   - 21.9 [Calculator UI](#21-9-calculator-ui)
   - 21.10 [Web Scraper](#21-10-web-scraper)
   - 21.11 [Map Of Capitals](#21-11-map-of-capitals)
22. [Building A Real Application](#22-building-a-real-application)
   - 22.1 [Project Layout](#22-1-project-layout)
   - 22.2 [Storage Module](#22-2-storage-module)
   - 22.3 [Render Module](#22-3-render-module)
   - 22.4 [UI](#22-4-ui)
   - 22.5 [Wiring It Up](#22-5-wiring-it-up)
   - 22.6 [Adding Cloud Sync](#22-6-adding-cloud-sync)
   - 22.7 [Publishing](#22-7-publishing)
23. [Frequently Asked Questions](#23-frequently-asked-questions)
   - 23.1 [Is sdev fast?](#23-1-is-sdev-fast)
   - 23.2 [Can I use it in production?](#23-2-can-i-use-it-in-production)
   - 23.3 [Why not just use Python?](#23-3-why-not-just-use-python)
   - 23.4 [Why two runtimes?](#23-4-why-two-runtimes)
   - 23.5 [Where do I report bugs?](#23-5-where-do-i-report-bugs)
   - 23.6 [Can I contribute?](#23-6-can-i-contribute)
   - 23.7 [How do I keep my files between sessions?](#23-7-how-do-i-keep-my-files-between-sessions)
   - 23.8 [Why "forge" instead of "let"?](#23-8-why-forge-instead-of-let)
24. [Glossary](#24-glossary)
   - 24.1 [A–F](#24-1-a-f)
   - 24.2 [G–N](#24-2-g-n)
   - 24.3 [O–Z](#24-3-o-z)
25. [Design Notes](#25-design-notes)
   - 25.1 [Verbs Over Symbols](#25-1-verbs-over-symbols)
   - 25.2 [Why `end` And Not Indentation](#25-2-why-end-and-not-indentation)
   - 25.3 [Two Runtimes, One Language](#25-3-two-runtimes-one-language)
   - 25.4 [Why A UI Toolkit Is Built In](#25-4-why-a-ui-toolkit-is-built-in)
   - 25.5 [Multi-Language Source](#25-5-multi-language-source)
   - 25.6 [Inspirations](#25-6-inspirations)
26. [Appendices](#26-appendices)
   - 26.1 [A. Keyword Reference](#26-1-a-keyword-reference)
   - 26.2 [B. Operator Reference](#26-2-b-operator-reference)
   - 26.3 [C. Built-in Function Index](#26-3-c-built-in-function-index)
   - 26.4 [D. Source Languages](#26-4-d-source-languages)
   - 26.5 [E. Bytecode Opcodes](#26-5-e-bytecode-opcodes)
   - 26.6 [F. Syscall Table](#26-6-f-syscall-table)
   - 26.7 [G. Error Code Index](#26-7-g-error-code-index)
   - 26.8 [H. CLI Flag Reference](#26-8-h-cli-flag-reference)
   - 26.9 [I. Index of Examples](#26-9-i-index-of-examples)

---


## 1. Introduction

Welcome to **The sdev Book** — the definitive, comprehensive reference for the sdev programming language. sdev is a modern, expressive language with a uniquely human-readable syntax (`forge`, `be`, `speak`, `conjure`, `summon`) designed to make code feel like prose without sacrificing power, performance, or expressiveness.

This book is *long*. That is intentional. Programming languages are rich worlds, and sdev — with its readable syntax, dual runtimes, UI toolkit, kernel, bytecode VM, and 26-language source support — has more surface area than most. We want one document you can keep open and trust.


### 1.1 Why sdev?

sdev was created to bridge the gap between *talking about code* and *writing code*. Traditional languages force you into algebraic shorthand (`x = 1`, `def`, `var`). sdev replaces these with verbs and nouns that carry meaning: `forge x be 1`. The result is code that reads like a recipe, an essay, or a spell — depending on your style.

sdev also takes seriously the idea that **a language should ship with everything you need**: a UI toolkit, a graphics canvas, a mapping API, a kernel-style task scheduler, a bytecode VM, AI-aware tooling, and translations of the keywords into 26 spoken languages. You should not need to install five libraries before drawing a circle.


### 1.2 A Brief History

sdev started as an experiment in *prose-shaped* programming — could a language with `forge x be 1` feel as natural to read aloud as English? The first interpreter was a 400-line tree-walker. From there it grew into two parallel runtimes (JavaScript and Python), a bytecode compiler, a virtual kernel, and an in-browser IDE. Today sdev is used for teaching, scripting, prototyping interactive UIs, and producing maps and data visualisations.


### 1.3 Who Should Read This Book

This book is for everyone:

- **Complete beginners** learning to program for the first time. Chapters 1–6 are written gently, with annotated examples.
- **Professional developers** exploring an expressive new language. Skim the basics and dive into Chapters 11+ for concurrency, the kernel, and bytecode internals.
- **Educators** teaching computational thinking. The verb-based vocabulary maps cleanly onto English (and 25 other languages).
- **Language designers** studying alternative syntactic paradigms. Chapter 27 dissects design decisions.

Each chapter starts gentle and ramps up.


### 1.4 How To Use This Book

Read sequentially the first time. Skim later. Every example is runnable in the **online IDE** at https://s-dev.lovable.app or with the offline Python/JS interpreters available from the Downloads menu.

The single best way to learn sdev is to **type the examples** — do not just read them. Modify them. Break them on purpose. When something does not behave as expected, that is when you learn.


### 1.5 Conventions

Code blocks use the `sdev` syntax. Output is shown in `// =>` comments. Notes labeled **TIP**, **WARNING**, **DEEP DIVE**, and **HISTORY** signal important context. Bulgarian translations of every chapter are in `sdev-book-bg.md`.

We write `forge x be 1` rather than `forge x = 1` throughout. Both are valid; `be` is preferred because it reads aloud naturally.


### 1.6 A First Taste

```sdev
// A complete sdev program.
forge greet be conjure(name): "Hello, " + name end
speak(greet("world"))
// => Hello, world
```

If that looks unusual, good. Read on; in five chapters it will feel obvious.


## 2. Getting Started

In this chapter you will install sdev (or skip installation by using the web IDE), write your first program, and understand the moving parts of a project.


### 2.1 Installing sdev

There are several ways to run sdev:

1. **Web IDE** — no install, open https://s-dev.lovable.app/ide. Works on any modern browser.
2. **JavaScript runtime** — `node sdev-interpreter.js my-file.sdev`. A single ~120 KB file with no dependencies.
3. **Python runtime** — `python sdev-interpreter.py my-file.sdev`. Useful when embedding into Python tooling.
4. **VS Code extension** — `.vsix` from the Downloads menu. Adds syntax highlighting, snippets, and a Run command.
5. **Windows installer** — bundled batch installer with a tiny editor.

All runtimes share strict feature parity. A program that runs in one will run in the other, with the exception of host-only APIs (Leaflet maps require the JS runtime + a browser DOM).


### 2.2 Your First Program

Create a file `hello.sdev`:

```sdev
speak("Hello, world!")
```

Run it:

```bash
node sdev-interpreter.js hello.sdev
# => Hello, world!
```

Congratulations — you are an sdev programmer.


### 2.3 The REPL

Start the REPL with `python sdev-interpreter.py` (no arguments). Type expressions and they will be evaluated immediately:

```
sdev> forge x be 10
sdev> x * 2
20
sdev> :quit
```

Useful REPL meta-commands: `:quit`, `:reset`, `:load file.sdev`, `:save session.sdev`, `:type expr`.


### 2.4 Project Structure

A typical sdev project has:

- `main.sdev` — entry point
- `lib/` — your modules
- `assets/` — images, data files
- `README.md` — documentation
- `manifest.sdev` — optional package manifest for `summon`

There is no required layout. sdev is happy with a single file.


### 2.5 Running From the IDE

In the web IDE, press `Ctrl+Enter` (or `Cmd+Enter` on macOS) to run the active tab. The output panel shows printed text; the **App** panel shows UI windows; the **Canvas** panel shows graphics; the **Map** panel shows Leaflet output. The IDE auto-saves to your account if you are signed in.


### 2.6 Anatomy of a Program

An sdev source file is a sequence of statements. Statements include declarations, expressions, control structures, function and class definitions, and imports. Whitespace is significant only inside strings; indentation is for humans, `end` is for the parser.


### 2.7 Editor Setup

For non-IDE workflows, the VS Code extension bundles syntax + snippets. Vim users can drop the `sdev.vim` file into `~/.vim/syntax/`. Emacs users can use `sdev-mode.el` from the extension folder.


### 2.8 Common Pitfalls For Beginners

- Forgetting `end` after `if`, `while`, or `conjure`. The error message will tell you the line of the unmatched opener.
- Using `=` instead of `be` for assignment. Both work; `be` is canonical.
- Mixing `yes`/`no` with `true`/`false`. Both are accepted; pick one and stay consistent in a file.


## 3. Variables and Values

Every program manipulates data. In sdev you create variables with `forge` and bind them with `be`. Values are typed dynamically — sdev figures out the type at runtime, but you can inspect, convert, and constrain types as needed.


### 3.1 Forging Variables

```sdev
forge name be "Ada"
forge age be 36
forge alive be yes
```

The `forge` keyword introduces a *new* binding in the current scope. Re-assignment uses just the name:

```sdev
name be "Lovelace"
```

Reassignment without `forge` keeps the variable in its original scope. This rule prevents accidental shadowing of outer-scope variables.


### 3.2 The Six Primitive Types

sdev recognises six primitive types:

| Type | Examples | Notes |
|---|---|---|
| **number** | `42`, `3.14`, `-7` | One numeric type covers ints and floats. |
| **string** | `"hi"`, `'hi'` | Unicode by default. |
| **boolean** | `yes`, `no` (or `true`/`false`) | |
| **void** | `nothing` | The absence of a value. |
| **collection** | `[1,2]`, `{a: 1}` | Lists and dictionaries. |
| **function** | `conjure(): ... end` | First-class. |


### 3.3 Type Inspection

Use `essence(value)` to ask what type a value is.

```sdev
speak(essence(42))      // => "number"
speak(essence("hi"))    // => "string"
speak(essence(yes))     // => "boolean"
speak(essence([1,2]))   // => "collection"
speak(essence(speak))   // => "function"
```


### 3.4 Type Conversion (`morph`)

`morph(value, type_name)` converts between types when sensible.

```sdev
forge n be morph("42", "number")
speak(n + 1)  // => 43
forge s be morph(3.14, "string")
speak(s + " is pi")  // => "3.14 is pi"
```

If the conversion is impossible, `morph` raises a runtime error. Wrap with `attempt/rescue` to handle gracefully.


### 3.5 Constants (`eternal`)

Prefix with `eternal` to mark a binding immutable.

```sdev
eternal forge PI be 3.14159
PI be 4   // => error: cannot rebind eternal binding
```

**TIP**: use `eternal` liberally. Future readers (including your future self) benefit from knowing what does not change.


### 3.6 Naming Rules

Identifiers must begin with a letter or underscore and may contain letters, digits, and underscores. Reserved keywords cannot be used. snake_case is conventional for variables and functions; PascalCase for classes; SCREAMING_CASE for `eternal` constants.


### 3.7 Scope

sdev uses **lexical scoping**. A `forge` inside a block creates a new local binding that shadows outer bindings. The outer binding is restored when the block ends. Functions capture variables by reference, creating closures.


### 3.8 Nothing, Truthiness, Equality

`nothing` is the only value of type `void`. In boolean contexts, the falsy values are: `no`, `nothing`, `0`, `""`, and the empty collection `[]`/`{}`. Everything else is truthy.

`equals` (alias `==`) compares by value for primitives and by structure for collections. `same` compares by reference identity.


### 3.9 Numbers In Detail

Numbers are 64-bit floating point internally, with a transparent integer fast-path. Integer arithmetic preserves precision up to 2^53. Use `bigint(n)` to opt into arbitrary-precision integers.


### 3.10 Strings In Detail

Strings are immutable Unicode. Indexing returns a single-character string. Negative indices count from the end. Common operations: `upper`, `lower`, `trim`, `reverse`, `contains`, `replace`, `shatter`, `weave`. Triple-quoted strings preserve newlines.


## 4. Operators and Expressions

sdev supports the usual arithmetic, comparison, and logical operators, with English-word aliases for prose-style code.


### 4.1 Arithmetic

Standard symbols: `+`, `-`, `*`, `/`, `%` (modulo), `**` (exponent). Integer division uses `//`. Unary `-` negates.


### 4.2 Comparison

`==`, `!=`, `<`, `>`, `<=`, `>=`. The aliases `equals`, `differs`, `below`, `above`, `belowOr`, `aboveOr` are available for prose-style code:

```sdev
if age above 18 then speak("Adult") end
```


### 4.3 Logical

`and`, `or`, `not`. Short-circuit evaluation is guaranteed. The symbols `&&`, `||`, `!` also work but are less idiomatic.


### 4.4 String Operators

Concatenate with `+`. Repeat with `*`:

```sdev
speak("ha" * 3)  // => hahaha
```

Interpolation uses backticks:

```sdev
forge n be 7
speak(`There are ${n} cats`)
```


### 4.5 Membership

`x in coll` returns `yes` if `x` is in a collection, key in a dictionary, or substring in a string.


### 4.6 Pipelines (`|>`)

The pipeline operator passes a value as the first argument of the next function:

```sdev
"  Hello  " |> trim |> upper |> speak  // => HELLO
```


### 4.7 Operator Precedence

From tightest to loosest: `**`, unary `-`/`not`, `* / // %`, `+ -`, comparisons, `and`, `or`, `|>`, assignment. Parentheses always win.


### 4.8 Truthy Conversions

Boolean operators return *the value*, not a boolean: `forge x be value or "default"` is a common idiom for fallbacks.


## 5. Control Flow

sdev offers familiar control structures with an English-friendly twist.


### 5.1 If / Then / Else

```sdev
if score above 90 then
  speak("Excellent")
else if score above 70 then
  speak("Good")
else
  speak("Try again")
end
```


### 5.2 When (Pattern Match)

A multi-branch conditional that reads top-to-bottom:

```sdev
when:
  is x below 0 then speak("negative")
  is x equals 0 then speak("zero")
  is x above 0 then speak("positive")
  else speak("not a number")
end
```


### 5.3 While And Until

```sdev
while count below 10:
  speak(count)
  count be count + 1
end

until ready:
  poll()
end
```


### 5.4 For ... In

```sdev
for name in ["Ada", "Grace", "Linus"]:
  speak("Hi " + name)
end

for i in sequence(1, 10):
  speak(i)
end
```


### 5.5 Escape And Skip

`escape` exits the innermost loop; `skip` jumps to the next iteration.

```sdev
for n in sequence(1, 100):
  if n % 2 == 0 then skip end
  if n above 20 then escape end
  speak(n)
end
```


### 5.6 Labelled Loops

Prefix a loop with `label name:` and use `escape name` or `skip name` to break out of nested loops directly.


### 5.7 Match (Destructuring)

Extract from collections inline:

```sdev
forge [first, *rest] be [1, 2, 3, 4]
forge {name, age} be {name: "Ada", age: 36}
```


## 6. Functions

Functions are first-class values in sdev. Declare with `conjure`; pass them around like any other data.


### 6.1 Defining a Function

```sdev
conjure greet(name be "stranger"):
  speak("Hello, " + name)
end

greet()        // => Hello, stranger
greet("Ada")   // => Hello, Ada
```


### 6.2 Default and Keyword Arguments

Defaults attach with `be`. Callers may use positional or keyword form:

```sdev
conjure rect(width be 10, height be 5):
  return width * height
end
speak(rect(height: 8))  // => 80
```


### 6.3 Variadic Arguments

`*items` collects extra positional arguments. `**opts` collects keyword arguments.


### 6.4 Returning Values

Use `return value` to exit early. The last expression in a function is its implicit return value.


### 6.5 Anonymous Functions (Lambdas)

```sdev
forge double be (n) => n * 2
speak(double(7))  // => 14
```

Lambdas capture surrounding variables, forming closures.


### 6.6 Closures

```sdev
conjure counter():
  forge n be 0
  return () => { n be n + 1; return n }
end
forge tick be counter()
speak(tick())  // => 1
speak(tick())  // => 2
```


### 6.7 Higher-Order Functions

`each`, `sift`, `fold`, `seek`, `every`, `some` accept functions. They form the backbone of idiomatic data processing.


### 6.8 Recursion

sdev supports unbounded recursion (subject to the host stack). Use the `tailcall` modifier to enable tail-call optimisation:

```sdev
conjure tailcall sum_to(n, acc be 0):
  if n equals 0 then return acc end
  return sum_to(n - 1, acc + n)
end
```


### 6.9 Generators (`yield`)

Functions that `yield` produce iterators on demand:

```sdev
conjure naturals():
  forge n be 0
  while yes:
    yield n
    n be n + 1
  end
end
```


### 6.10 Decorators

A decorator wraps a function with extra behaviour. Apply with `@`:

```sdev
@logged
conjure work(): speak("doing work") end
```


## 7. Collections

Collections are how sdev programs store many values together. The two core kinds are **lists** and **dictionaries**.


### 7.1 Lists

```sdev
forge nums be [1, 2, 3]
speak(nums[0])             // => 1
speak(nums[-1])            // => 3
gather(nums, 4)            // [1,2,3,4]
forge head be pluck(nums, 0)
```


### 7.2 Dictionaries

```sdev
forge user be {name: "Ada", age: 36}
speak(user.name)          // => Ada
speak(user["age"])        // => 36
user.email be "ada@x.com"
```


### 7.3 Slicing

`portion(coll, start, end?)` returns a sub-collection. Negative indices count from the end. Omit `end` to slice to the end.


### 7.4 Map / Filter / Reduce

```sdev
forge squares be each([1,2,3,4], (n) => n * n)
forge evens be sift([1,2,3,4], (n) => n % 2 equals 0)
forge total be fold([1,2,3,4], 0, (a, b) => a + b)
```


### 7.5 Sets

Use `unique(coll)` to deduplicate. For frequent membership tests, `set(coll)` returns a hash-set wrapper.


### 7.6 Tuples

Immutable, fixed-length collections written `(a, b)`. Useful for returning multiple values:

```sdev
conjure divmod(a, b): return (a // b, a % b) end
forge (q, r) be divmod(17, 5)
```


### 7.7 Iteration Idioms

Use `for ... in`, `enumerate`, and `zip` to traverse collections. Generators are lazy; lists are eager.


### 7.8 Performance Notes

Lists are dynamic arrays; appends are amortised O(1). Dictionaries are open-address hash maps; lookup is amortised O(1). Avoid `pluck(coll, 0)` in hot loops — it is O(n). Use a deque (`deque()`) for fast front operations.


## 8. Strings In Depth

Strings get a chapter of their own because text is everywhere — input, output, file paths, network protocols, UI labels.


### 8.1 Literals

Single quotes (`'hi'`) and double quotes (`"hi"`) are equivalent. Triple quotes (`"""..."""`) preserve newlines. Backticks support `${interpolation}`.


### 8.2 Indexing And Slicing

Strings are indexable like lists. They are immutable; operations return new strings.


### 8.3 Searching

Use `contains(s, sub)`, `indexOf(s, sub)`, `lastIndexOf(s, sub)`. For regex, use `regex(pattern, s)`.


### 8.4 Manipulation

`upper`, `lower`, `trim`, `lstrip`, `rstrip`, `replace(s, find, with)`, `shatter(s, sep)`, `weave(coll, sep)`.


### 8.5 Encoding

`base64encode/decode`, `urlencode/decode`, `hexencode/decode`. All accept strings or byte buffers.


### 8.6 Formatting

Use backtick interpolation, or `format(template, args)` with `%s`, `%d`, `%.2f` style placeholders.


### 8.7 Regular Expressions

```sdev
forge m be regex("(\\w+)@(\\w+)", "ada@example")
speak(m.groups[0])  // => ada
```


### 8.8 Unicode And Locales

sdev strings are sequences of Unicode codepoints. `lower` and `upper` are locale-aware when a locale is set with `locale("bg_BG")`.


## 9. Object-Oriented Programming

sdev includes a full OOP system built on the keywords `essence` (define a class), `summon` (instantiate), `share` (declare instance/class fields), `extends` (inherit), `me` (this), and `ancestor` (super).


### 9.1 Defining a Class

```sdev
essence Dog:
  share name
  share breed be "mutt"

  conjure init(name, breed be "mutt"):
    me.name be name
    me.breed be breed
  end

  conjure bark():
    speak(me.name + " woofs!")
  end
end
```


### 9.2 Creating Instances

```sdev
forge rex be summon Dog(name: "Rex", breed: "Labrador")
rex.bark()
```


### 9.3 Inheritance

```sdev
essence Puppy extends Dog:
  conjure bark():
    ancestor.bark()
    speak("(tiny)")
  end
end
```


### 9.4 Class Methods And Fields

Prefix with `static` to attach to the class rather than instances:

```sdev
essence Counter:
  static share total be 0
  static conjure tick(): Counter.total be Counter.total + 1 end
end
```


### 9.5 Mixins (`weave`)

Include reusable methods from another module:

```sdev
essence Bird weave Flyable, Singable: end
```


### 9.6 Operator Overloading

Implement special methods like `__add__`, `__eq__`, `__str__` to customise built-in operators on your class.


### 9.7 Properties

Decorate a method with `@property` to expose it as a field. `@setter` makes it writable.


### 9.8 Abstract Classes And Interfaces

Mark a method `abstract conjure name()` to require subclasses to provide it. `interface` declares only signatures.


## 10. Error Handling

Programs fail. sdev gives you precise, ergonomic tools to handle failure.


### 10.1 Raising Errors

```sdev
raise "Out of fuel"
raise FuelError("Out of fuel", code: 42)
```


### 10.2 Attempt / Rescue / Finally

```sdev
attempt:
  forge data be readFile("missing.txt")
rescue err:
  speak("Could not read: " + err.message)
finally:
  speak("done")
end
```


### 10.3 Error Types

Built-in error types include `TypeError`, `ValueError`, `IOError`, `KeyError`, `IndexError`, `NetworkError`, `TimeoutError`, `SyntaxError`. Define your own by extending `essence Error`.


### 10.4 Multiple Rescues

A single `attempt` may have several `rescue` clauses, each matched by error type:

```sdev
attempt:
  doWork()
rescue NetworkError as e:
  retry()
rescue err:
  raise err
end
```


### 10.5 Re-raising

Inside a `rescue`, call `raise` with no argument to re-throw the current error. Useful for logging then propagating.


### 10.6 Stack Traces

Errors carry a `.trace` field — a list of frames with file, line, and function name. `speak(err.trace)` prints a formatted trace.


### 10.7 Assertions

Use `ensure(condition, "message")` to validate invariants. Failed assertions raise `AssertionError`.


### 10.8 Defensive Programming Idioms

Validate inputs at function boundaries with `ensure`. Use `attempt/rescue` only at boundaries you genuinely intend to recover at — not as silent error swallowers.


## 11. Concurrency

sdev embraces cooperative concurrency. Tasks share a single thread but yield to one another at well-defined points.


### 11.1 Async Functions

Any function may be `async`. Inside, use `await` to wait for an asynchronous result without blocking other tasks.


### 11.2 Dispatch And Await

```sdev
async conjure fetchUser(id):
  forge res be await fetch("/users/" + id)
  return jsondecode(res.body)
end

forge promise be dispatch fetchUser(7)
forge user be await promise
speak(user.name)
```


### 11.3 Parallel Composition

`await all([p1, p2])` waits for several promises in parallel. `await any([p1, p2])` returns the first to resolve. `await race([p1, p2])` returns the first settled (resolve or reject).


### 11.4 Channels

`channel()` creates a queue. `send(ch, v)` and `forge v be await receive(ch)` move values between tasks.


### 11.5 Cancellation

Promises support `cancel(p)`. Inside `attempt`, `rescue CancelledError` cleans up gracefully.


### 11.6 Time And Delay

`await delay(1000)` pauses for one second. `every(ms, fn)` schedules a repeating task.


### 11.7 The Kernel

Under the hood, all tasks live in a virtual kernel with its own scheduler. See Chapter 18 for syscalls and direct task spawning.


## 12. Modules and Libraries

Real programs span multiple files. sdev modules are simply other `.sdev` files. The `summon` keyword imports them, locally or from the network.


### 12.1 Local Modules

`summon "./utils.sdev" as u` makes `u.fnName` available. Symbols can be selectively imported: `summon "./utils.sdev" {add, mul}`.


### 12.2 Gist Packages

sdev uses **GitHub Gists** as a decentralised package registry. `summon "gist:abc123/util.sdev" as util` fetches and caches a gist on first use.


### 12.3 Versioning

Pin a gist to a specific revision: `summon "gist:abc123@v1.2.0/util.sdev"`. Without a version, the latest revision is used and cached for 24 hours.


### 12.4 Manifests

A `manifest.sdev` file may declare dependencies. Run `sdev install` to fetch them all upfront.


### 12.5 Authoring A Gist Module

Any file with public `conjure` and `essence` declarations is a valid module. Use `share private` to hide internals.


### 12.6 Module Scope

Each module has its own top-level scope. `summon` does not pollute the importer's globals unless you write `summon * from ...`.


### 12.7 Dynamic Loading

Use `loadModule(url)` to import at runtime. Useful for plugins.


## 13. The UI Toolkit

sdev ships with a complete declarative UI toolkit for building windows, forms, dashboards, and small apps. The same code runs in the IDE App panel and (via the JS interpreter + DOM) in the browser.


### 13.1 Windows

`window(title, width, height)` opens a window. End with `endwindow`. Width and height are CSS pixels.

```sdev
window("My App", 480, 600)
  heading("Welcome", 1)
  paragraph("Hello there.")
endwindow
```


### 13.2 Headings, Labels, Paragraphs

`heading(text, level=1)` for titles (levels 1–6). `label(text)` for short lines. `paragraph(text)` for body copy.


### 13.3 Buttons

```sdev
button("Click me", () => speak("clicked"), "primary")
```

Variants: `primary`, `secondary`, `ghost`, `destructive`, `link`. Pass an `icon:` keyword for an icon prefix.


### 13.4 Inputs

```sdev
input("name", "Your name")
input("age", "Age", "number")
input("password", "Password", "password")
```

The first argument is the *bind name* — read it later with `uiget("name")`.


### 13.5 Textareas

`textarea(bind, placeholder, rows)` for multi-line input.


### 13.6 Checkboxes And Radios

```sdev
checkbox("agree", "I agree")
radio("plan", "free", "Free")
radio("plan", "pro", "Pro")
```


### 13.7 Sliders And Selects

```sdev
slider("volume", 0, 100, 1)
select("country", ["BG", "US", "DE"], "Pick one")
```


### 13.8 Tables

```sdev
table(["Name", "Age"], [
  ["Ada", 36],
  ["Grace", 85],
])
```


### 13.9 Tabs

```sdev
tabs()
  tab("Home")
    paragraph("Welcome.")
  endtab
  tab("Settings")
    checkbox("dark", "Dark mode")
  endtab
endtabs
```


### 13.10 Menus

```sdev
menu("File")
  menuitem("New", () => newDoc())
  menuitem("Open", () => openDoc())
endmenu
```


### 13.11 Layout: Rows, Columns, Groups

Use `row()/endrow` for horizontal stacks, `column()/endcolumn` for vertical, `group("title")/endgroup` for bordered cards.


### 13.12 Reactive Values

All bound widgets read from and write to a reactive store. `uiget(name)` reads; `uiset(name, value)` writes and re-renders the window.


### 13.13 Event Handlers

Buttons, menu items, and many widgets accept a callback. The callback runs in the same scope as the program; closures over outer variables work as expected.


### 13.14 Customisation

Pass a final dictionary of options to most widgets:

```sdev
button("Open URL", () => {}, "primary", { url: "https://sdev.codes", icon: "external" })
image("/logo.png", 200, 100, "Logo")
```


### 13.15 A Complete Example

```sdev
forge todos be []
window("Todos", 360, 480)
  heading("My Todos", 2)
  input("new", "What to do?")
  button("Add", () => {
    gather(todos, uiget("new"))
    uiset("new", "")
  }, "primary")
  divider()
  for t in todos:
    row()
      checkbox("done_" + t, t)
    endrow
  end
endwindow
```


## 14. Graphics and Canvas

For drawing and animation, sdev provides a 2D canvas API.


### 14.1 Opening A Canvas

`canvas(width, height)` opens a drawing surface in the IDE Canvas panel.


### 14.2 Drawing Primitives

`fill(color)`, `stroke(color)`, `lineWidth(n)`, `rect(x,y,w,h)`, `circle(x,y,r)`, `line(x1,y1,x2,y2)`, `polygon([pts])`, `text(s,x,y)`.


### 14.3 Colors

Accept named CSS colors, `#rrggbb`, `rgb(r,g,b)`, `hsl(h,s,l)`, or `rgba(r,g,b,a)`.


### 14.4 Animation

`frame(fn)` calls `fn(t)` once per frame with the elapsed time. `requestStop()` halts the loop.


### 14.5 Images And Sprites

`loadImage(url)` returns a future image. `drawImage(img, x, y, w, h)` draws it.


### 14.6 Transforms

`translate(dx,dy)`, `rotate(rad)`, `scale(sx,sy)`. Save and restore state with `push()` / `pop()`.


### 14.7 Mouse And Keyboard

`onmouse((evt) => ...)`, `onkey((evt) => ...)`. Events carry `x`, `y`, `key`, `button`.


### 14.8 Bouncing Ball Example

```sdev
canvas(400, 400)
forge x be 200; forge y be 200; forge dx be 3; forge dy be 2
frame((t) => {
  fill("black"); rect(0, 0, 400, 400)
  fill("cyan"); circle(x, y, 20)
  x be x + dx; y be y + dy
  if x below 0 or x above 400 then dx be -dx end
  if y below 0 or y above 400 then dy be -dy end
})
```


## 15. Maps and GIS

sdev integrates with Leaflet for interactive maps. The mapping API is host-specific (browser only).


### 15.1 Opening A Map

`map(lat, lon, zoom)` opens a map centred on the given coordinates.


### 15.2 Markers And Popups

`marker(lat, lon, "label")` drops a marker. `popup(lat, lon, "html")` shows a popup.


### 15.3 Tile Layers

`tiles(url_template, opts)` switches the basemap. Built-in styles: `osm`, `dark`, `satellite`.


### 15.4 Polylines And Polygons

`polyline([[lat,lon], ...], "color")`. `polygon([[lat,lon], ...], "color")`.


### 15.5 GeoJSON

`geojson(url_or_object)` adds an entire GeoJSON feature collection.


### 15.6 Heatmaps And Clustering

`heatmap(points)` and `cluster(points)` visualise dense data.


### 15.7 Events

`onclick((lat, lon) => ...)` reacts to map clicks. `onzoom((z) => ...)` reacts to zoom changes.


### 15.8 Routing And Distance

`distance((lat1,lon1), (lat2,lon2))` returns metres. `route(from, to)` returns a polyline via OSRM.


### 15.9 A Complete Map Example

```sdev
map(42.6977, 23.3219, 12)
marker(42.6977, 23.3219, "Sofia")
polyline([[42.6, 23.3], [42.7, 23.4]], "cyan")
```


## 16. The Standard Library

A reference of the most-used built-in functions. The complete list is in `SDEV_DOCUMENTATION.md`.


### 16.1 Built-in Function Table

| Function | Description |
|---|---|
| `speak(value)` | Print a value followed by a newline. |
| `whisper(value)` | Print a value with no newline. |
| `shout(value)` | Print a value in uppercase, attention-grabbing form. |
| `ask(prompt)` | Read a line from the user (CLI) or prompt dialog (web). |
| `readFile(path)` | Read the entire contents of a text file as a string. |
| `writeFile(path, text)` | Write a string to a file, replacing previous contents. |
| `appendFile(path, text)` | Append a string to the end of a file. |
| `exists(path)` | Returns yes if the file or folder exists. |
| `delete(path)` | Removes a file or folder. |
| `listdir(path)` | Returns a collection of names inside a folder. |
| `essence(value)` | Returns the runtime type as a string. |
| `morph(value, type)` | Convert a value to another type. |
| `magnitude(value)` | Length of a string or collection; absolute value of a number. |
| `least(...)` | Smallest of the given values or collection. |
| `greatest(...)` | Largest of the given values or collection. |
| `root(n, k=2)` | k-th root of n; default square root. |
| `ground(n)` | Floor; round toward negative infinity. |
| `elevate(n)` | Ceiling; round toward positive infinity. |
| `around(n, digits=0)` | Round to a number of decimal digits. |
| `random()` | Random float in [0, 1). |
| `randint(a, b)` | Random integer in [a, b]. |
| `choose(coll)` | Random element from a collection. |
| `sin(x) / cos(x) / tan(x)` | Trigonometry in radians. |
| `asin/acos/atan/atan2` | Inverse trig. |
| `log(x, base=e)` | Logarithm. |
| `exp(x)` | Exponential e^x. |
| `pi / tau / e` | Math constants. |
| `gather(coll, value)` | Append a value to a collection in place. |
| `pluck(coll, index)` | Remove and return an element at index. |
| `portion(coll, start, end?)` | Slice a collection. |
| `each(coll, fn)` | Apply fn to each element. |
| `sift(coll, predicate)` | Filter a collection. |
| `fold(coll, init, fn)` | Reduce a collection to a single value. |
| `seek(coll, predicate)` | First element matching predicate. |
| `every(coll, predicate)` | Yes if all elements match. |
| `some(coll, predicate)` | Yes if any element matches. |
| `zip(a, b, ...)` | Pairs elements from multiple collections. |
| `enumerate(coll)` | Pairs of (index, element). |
| `sequence(start, end, step=1)` | A range of numbers. |
| `sort(coll, key?)` | Sort a collection ascending. |
| `reverse(coll)` | Reverse a collection or string. |
| `unique(coll)` | Distinct values, preserving order. |
| `shatter(s, sep)` | Split a string by separator. |
| `weave(coll, sep)` | Join a collection with a separator. |
| `upper(s) / lower(s) / trim(s)` | String case and whitespace. |
| `contains(haystack, needle)` | Substring/element membership. |
| `replace(s, find, with)` | Replace all occurrences. |
| `regex(pattern, s)` | Regular expression match. |
| `now()` | Current epoch milliseconds. |
| `today()` | Current local date as ISO string. |
| `delay(ms)` | Pause asynchronously for ms milliseconds. |
| `format(date, pattern)` | Format a date. |
| `env(name) / argv() / exit(code)` | Process and OS interaction. |
| `osinfo()` | Returns a dictionary about the host OS. |
| `base64encode/decode, hexencode/decode` | Binary encodings. |
| `jsonencode(v) / jsondecode(s)` | JSON serialization. |
| `fetch(url, opts?)` | Async HTTP request. |
| `matrix(rows) / matmul / inverse / transpose / det` | Linear algebra. |
| `buffer(size) / pointer(v) / deref(p)` | Low-level memory primitives. |
| `spawn(fn) / schedule() / syscall(name, args) / gc()` | Kernel / scheduler primitives. |
| `window(title, w, h)` | Open a window. End with endwindow. |
| `heading(text, level=1)` | A bold heading. |
| `label(text)` | A line of text. |
| `paragraph(text)` | A paragraph of body text. |
| `button(label, onclick, variant?)` | Clickable button. Variants: primary, secondary, ghost, destructive. |
| `input(bind, placeholder?, kind?)` | Text input bound by name. Kind: text, number, password, email, url. |
| `textarea(bind, placeholder?, rows?)` | Multi-line input. |
| `checkbox(bind, label)` | Boolean toggle with label. |
| `radio(bind, value, label)` | Radio button bound by name. |
| `slider(bind, min, max, step=1)` | Numeric slider. |
| `select(bind, options, placeholder?)` | Dropdown of options. |
| `image(src, w?, h?, alt?)` | Display an image. |
| `link(text, url, newtab=yes)` | Open a URL. |
| `progress(value, max=100)` | Determinate progress bar. |
| `divider() / spacer(size?)` | Visual layout helpers. |
| `row()/endrow, column()/endcolumn, group(title)/endgroup` | Layout containers. |
| `tabs()/endtabs, tab(title)/endtab` | Tabbed sections. |
| `table(headers, rows)` | A data table. |
| `menu(title)/endmenu, menuitem(title, onclick)` | Menus and items. |
| `uiget(name) / uiset(name, value)` | Read or write a reactive value. |


### 16.2 I/O

`speak`, `whisper`, `shout`, `ask`, `readFile`, `writeFile`, `appendFile`, `exists`, `delete`, `listdir`.


### 16.3 Math

`magnitude`, `least`, `greatest`, `root`, `ground`, `elevate`, `around`, `random`, `randint`, `choose`, `sin/cos/tan`, `log`, `exp`, `pi`, `tau`, `e`.


### 16.4 Collections

`gather`, `pluck`, `portion`, `each`, `sift`, `fold`, `seek`, `every`, `some`, `zip`, `enumerate`, `sequence`, `sort`, `reverse`, `unique`, `set`, `deque`.


### 16.5 Strings

`upper`, `lower`, `trim`, `reverse`, `contains`, `replace`, `shatter`, `weave`, `regex`, `format`.


### 16.6 Time

`now`, `today`, `delay`, `every`, `format`, `parseDate`, `timezone`.


### 16.7 Network

`fetch`, `websocket`, `download`.


### 16.8 System

`env`, `argv`, `exit`, `osinfo`, `cwd`, `cd`.


### 16.9 Encoding

`base64encode/decode`, `hexencode/decode`, `urlencode/decode`, `jsonencode/decode`, `csv`, `xml`.


### 16.10 Cryptography

`hash(s, alg="sha256")`, `hmac(key, msg, alg)`, `uuid()`, `randomBytes(n)`.


## 17. Tooling

Editors, linters, debuggers, and the bytecode compiler.


### 17.1 The Web IDE

A full-featured browser IDE at https://s-dev.lovable.app/ide. Includes a file tree, tabs, command palette, terminal, output, App preview, canvas, map, settings, and a chatbot.


### 17.2 VS Code Extension

Download `.vsix` from the Downloads menu. Provides syntax highlighting, snippets, and a Run command (`F5`).


### 17.3 CLI Reference

`node sdev-interpreter.js [opts] [file]`

- `--repl` start REPL
- `--compile file.sdev` produce `file.sdevc`
- `--exec file.sdevc` run bytecode
- `--lang bg` set source language
- `--ast` print parse tree
- `--time` print execution timing


### 17.4 Bytecode Compiler

Compile to `.sdevc` for faster startup: `node sdev-interpreter.js --compile main.sdev`. Run with `--exec main.sdevc`.


### 17.5 The sdev Assistant

In-IDE AI chatbot that explains code, generates examples, and debugs runtime errors via a self-test loop.


### 17.6 Linter

`sdev lint file.sdev` checks for unused variables, missing `end`s, suspicious comparisons, and shadowed `eternal` bindings.


### 17.7 Formatter

`sdev format file.sdev` rewrites a file in canonical style. Idempotent.


### 17.8 Debugger

Place `breakpoint()` in code; in the IDE, execution pauses at that line and the variables panel becomes inspectable. Step with F10.


### 17.9 Test Runner

`sdev test` discovers `*_test.sdev` files and runs every `conjure test_*` function. Use `expect(value).toBe(other)` for assertions.


## 18. Advanced Topics

Power-user features for systems, performance, embedding, and unusual workflows.


### 18.1 JavaScript Interop

Embed raw JS with the `js` keyword:

```sdev
js { console.log("native") }
```

Multi-line `js { ... }` blocks share scope with the surrounding sdev program. Values flow both ways.


### 18.2 Matrix Math

`matrix([[1,2],[3,4]])`, `matmul(a, b)`, `inverse(a)`, `transpose(a)`, `det(a)`. Useful for graphics, linear algebra, and ML toy projects.


### 18.3 Buffers and Pointers

`buffer(size)`, `pointer(value)`, `deref(p)`. For binary protocol work.


### 18.4 The Virtual Kernel

sdev includes a tiny virtual OS kernel. `spawn(fn)` creates a task; `schedule()` yields cooperatively; `syscall("name", args)` invokes a syscall (open, read, write, sleep, fork). The kernel offers a unified abstraction over the Node and browser hosts.


### 18.5 Garbage Collection

Mark-and-sweep GC runs automatically. Force a cycle with `gc()`. Inspect heap stats with `heapinfo()`.


### 18.6 The Bytecode VM

A stack-based VM executes `.sdevc` files. Opcodes include `LOAD_CONST`, `LOAD_NAME`, `STORE_NAME`, `CALL`, `JUMP`, `JUMP_IF_FALSE`, `RETURN`, `MAKE_FUNCTION`, `BUILD_LIST`, `BUILD_DICT`. The VM is ~3–5× faster than tree-walking.


### 18.7 Multi-Language Source

sdev source can be written in any of 26 languages. The translator normalises keywords at parse time. Set the source language with a `// lang: bg` directive at the top of the file, or `--lang bg` on the CLI.


### 18.8 Embedding sdev

Embed the JS interpreter in a web page with `import { run } from "sdev-interpreter.js"`. Embed the Python interpreter with `from sdev_interpreter import run`.


### 18.9 FFI

Call native libraries via `ffi.load("libm.so").func("sin", ["double"], "double")`. JavaScript host only.


## 19. Performance

sdev is fast enough for most scripts. When it is not, here is how to make it faster.


### 19.1 Choose The Right Runtime

Tree-walking interpreter: simplest, slowest. Bytecode VM: 3–5× faster. JS interop: native speed for hot loops.


### 19.2 Profile Before Optimising

Use `time` blocks: `time { work() }` prints elapsed milliseconds. Use `profile { work() }` to see a per-function breakdown.


### 19.3 Avoid Quadratic Patterns

Repeated `pluck(coll, 0)` or string concatenation in a loop is O(n²). Prefer `deque()` and `weave([...], "")` respectively.


### 19.4 Cache Computations

Memoise pure functions with `@memo`. Cache external fetches with `cache(ttl: 60)`.


### 19.5 Reuse Buffers

In tight loops, reuse a `buffer(N)` rather than allocating per iteration.


### 19.6 Compile To Bytecode

For long-running services, compile to `.sdevc`. Startup is faster and execution is faster.


## 20. Best Practices

Idioms and patterns that make sdev programs delightful to read and maintain.


### 20.1 Name Things Well

sdev rewards descriptive names. `forge n be 0` is fine for a counter inside a five-line loop; `forge customers_seen be 0` is better when shared across a function.


### 20.2 Prefer Verbs

Function names should be verbs (`compute`, `render`, `parse`); class names should be nouns (`Customer`, `Invoice`).


### 20.3 Keep Functions Small

Aim for under 20 lines. If a function does two things, split it.


### 20.4 Embrace Immutability

Use `eternal` liberally for values that should not change. Future readers will thank you.


### 20.5 Document Intent

Comments should explain *why*. The code already shows *what*.


### 20.6 Test Early, Test Often

Even one `expect(...)` per function pays for itself within a week.


### 20.7 Fail Loudly

Validate inputs at boundaries. Do not let bad data spread three layers deep before raising.


### 20.8 Prefer Composition Over Inheritance

Mixins (`weave`) and small classes outlast deep hierarchies.


## 21. A Cookbook of Examples

Short, complete programs that demonstrate idiomatic sdev. Type these in. Modify them. Break them.


### 21.1 FizzBuzz

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


### 21.2 Word Count

```sdev
forge text be readFile("essay.txt")
forge words be shatter(text, " ")
speak("Word count: " + magnitude(words))
```


### 21.3 Frequency Histogram

```sdev
forge counts be {}
for w in shatter(readFile("text.txt"), " "):
  counts[w] be (counts[w] or 0) + 1
end
for (k, v) in sort(enumerate(counts), key: (p) => -p[1]):
  speak(k + ": " + v)
end
```


### 21.4 Todo App UI

```sdev
forge todos be []
window("Todos", 360, 480)
  heading("My Todos", 2)
  input("new", "What to do?")
  button("Add", () => {
    gather(todos, uiget("new"))
    uiset("new", "")
  }, "primary")
  divider()
  for t in todos: label("• " + t) end
endwindow
```


### 21.5 HTTP Fetch

```sdev
async conjure main():
  forge res be await fetch("https://api.example.com/users")
  forge users be jsondecode(res.body)
  for u in users: speak(u.name) end
end
await main()
```


### 21.6 Bouncing Ball Animation

```sdev
canvas(400, 400)
forge x be 200; forge y be 200; forge dx be 3; forge dy be 2
frame((t) => {
  fill("black"); rect(0, 0, 400, 400)
  fill("cyan"); circle(x, y, 20)
  x be x + dx; y be y + dy
  if x below 0 or x above 400 then dx be -dx end
  if y below 0 or y above 400 then dy be -dy end
})
```


### 21.7 Palindrome Checker

```sdev
conjure palindrome(s):
  forge clean be lower(replace(s, " ", ""))
  return clean equals reverse(clean)
end
speak(palindrome("Race car"))  // => yes
```


### 21.8 Fibonacci (Memoised)

```sdev
@memo
conjure fib(n):
  if n below 2 then return n end
  return fib(n - 1) + fib(n - 2)
end
speak(fib(50))
```


### 21.9 Calculator UI

```sdev
window("Calc", 280, 320)
  input("a", "First number", "number")
  input("b", "Second number", "number")
  row()
    button("+", () => uiset("r", uiget("a") + uiget("b")))
    button("−", () => uiset("r", uiget("a") - uiget("b")))
    button("×", () => uiset("r", uiget("a") * uiget("b")))
    button("÷", () => uiset("r", uiget("a") / uiget("b")))
  endrow
  label("= " + (uiget("r") or "?"))
endwindow
```


### 21.10 Web Scraper

```sdev
async conjure scrape(url):
  forge html be (await fetch(url)).body
  forge titles be regex("<h2>(.*?)</h2>", html, all: yes)
  return each(titles, (m) => m.groups[0])
end
```


### 21.11 Map Of Capitals

```sdev
map(48.0, 10.0, 4)
for (city, lat, lon) in [("Sofia", 42.7, 23.3), ("Berlin", 52.5, 13.4), ("Paris", 48.9, 2.3)]:
  marker(lat, lon, city)
end
```


## 22. Building A Real Application

A full-length walkthrough: from blank file to a working Markdown notebook with cloud sync.


### 22.1 Project Layout

We will create:

- `main.sdev` — entry
- `lib/storage.sdev` — local + cloud storage
- `lib/render.sdev` — Markdown renderer
- `ui/notebook.sdev` — UI window


### 22.2 Storage Module

```sdev
// lib/storage.sdev
share conjure save(key, text):
  writeFile("notes/" + key + ".md", text)
end
share conjure load(key):
  return readFile("notes/" + key + ".md")
end
```


### 22.3 Render Module

Use a tiny regex-based Markdown converter, or `summon "gist:abc/markdown.sdev"` for a full one.


### 22.4 UI

```sdev
window("Notebook", 720, 600)
  heading("Notebook", 2)
  input("title", "Note title")
  textarea("body", "Write your note...", 12)
  button("Save", () => storage.save(uiget("title"), uiget("body")), "primary")
endwindow
```


### 22.5 Wiring It Up

`main.sdev` simply imports the modules and opens the window.


### 22.6 Adding Cloud Sync

When signed in, the workspace auto-syncs. Use `cloudSave("notes", todos)` for additional manual sync of arbitrary data.


### 22.7 Publishing

Export the project as a gist with `sdev publish` and share the URL.


## 23. Frequently Asked Questions

Real questions from real sdev users.


### 23.1 Is sdev fast?

For interpreted execution, performance is on par with Python. The bytecode compiler (`.sdevc`) gives a 3–5× speedup. For hot loops, drop into `js { ... }` interop.


### 23.2 Can I use it in production?

sdev is best suited for scripting, education, prototyping, internal tools, and embedded scenarios. Production web backends remain a stretch — but it is improving.


### 23.3 Why not just use Python?

Python is excellent. sdev exists for those who want a *more readable* alternative — closer to spoken English than algebraic shorthand — with a built-in UI toolkit, mapping, and 26-language source support.


### 23.4 Why two runtimes?

JavaScript runs everywhere a browser does — including the web IDE — and is great for UI/maps. Python is the default in scientific and pedagogic environments. Strict feature parity means you can pick either.


### 23.5 Where do I report bugs?

Open an issue on the GitHub repository linked from the website footer.


### 23.6 Can I contribute?

Yes! sdev is open source. Pull requests for new builtins, language features, and translations are welcome.


### 23.7 How do I keep my files between sessions?

Sign in. The IDE auto-syncs your entire workspace — files, folders, open tabs — to the cloud. Reload anywhere; pick up where you left off.


### 23.8 Why "forge" instead of "let"?

`forge` evokes creation. `let` evokes "permitting" — passive. Active verbs make code feel like *doing*, not *requesting*.


## 24. Glossary

Quick definitions of key terms.


### 24.1 A–F

**Anonymous function** — a function without a name, created with `=>`.
**Bind** — to associate a name with a value.
**Bytecode** — the compact instruction format produced by `--compile`.
**Closure** — a function that captures variables from its lexical scope.
**Conjure** — keyword to declare a function.
**Eternal** — modifier for immutable bindings.
**Forge** — keyword to declare a new variable.


### 24.2 G–N

**Gist** — a remote sdev module fetched via `summon`.
**Kernel** — the virtual OS layer providing tasks and syscalls.
**Lambda** — synonym for anonymous function.
**Memo** — decorator that caches function results.
**Module** — a `.sdev` file imported via `summon`.
**Morph** — built-in for type conversion.
**Mutation** — changing the value of a binding.


### 24.3 O–Z

**Object** — instance of a class.
**Promise** — a value that will arrive later.
**Reactive value** — a UI-bound value managed by `uiget`/`uiset`.
**Summon** — keyword to import a module or instantiate a class.
**Tail call** — a function call in tail position; optimised when the function is `tailcall`.
**VM** — the bytecode virtual machine.
**Yield** — produce a value from a generator.


## 25. Design Notes

Why sdev looks the way it looks. Skip if you only want to write code.


### 25.1 Verbs Over Symbols

Symbols read fast for experts and slow for newcomers. Verbs read pleasantly aloud. We chose verbs.


### 25.2 Why `end` And Not Indentation

Significant indentation is fragile across editors and chats. Explicit `end` survives copy-paste, AI prompts, and email.


### 25.3 Two Runtimes, One Language

JavaScript and Python cover most environments where sdev would land. We accepted the cost of duplicating work to keep both groups happy.


### 25.4 Why A UI Toolkit Is Built In

A language without a way to draw a button is a language for tutorials. A language with one is a language for tools.


### 25.5 Multi-Language Source

Programming should not be gated on English literacy. The translator is bidirectional and lossless.


### 25.6 Inspirations

Lua, Python, Smalltalk, Ruby, and AppleScript. Anti-inspirations: Brainfuck, Perl golf, and templating DSLs.


## 26. Appendices


### 26.1 A. Keyword Reference

Complete keyword list:

`forge`, `be`, `eternal`, `if`, `then`, `else`, `when`, `is`, `while`, `until`, `for`, `in`, `escape`, `skip`, `conjure`, `yield`, `return`, `essence`, `summon`, `share`, `extends`, `me`, `ancestor`, `attempt`, `rescue`, `finally`, `raise`, `dispatch`, `await`, `js`, `end`, `window`, `endwindow`, `row`, `endrow`, `column`, `endcolumn`, `tabs`, `endtabs`, `tab`, `endtab`, `group`, `endgroup`, `menu`, `endmenu`, `menuitem`


### 26.2 B. Operator Reference

`+ - * / % ** //`, `== != < > <= >=`, `and or not`, `equals differs above below`, `in`, `=>`, `|>`.


### 26.3 C. Built-in Function Index

See Chapter 17 (The Standard Library). The complete index is in `SDEV_DOCUMENTATION.md`.


### 26.4 D. Source Languages

sdev source files may be written in: English, Bulgarian, Russian, Spanish, French, German, Italian, Portuguese, Polish, Romanian, Ukrainian, Greek, Turkish, Arabic, Hebrew, Hindi, Chinese (Simplified), Chinese (Traditional), Japanese, Korean, Vietnamese, Thai, Indonesian, Dutch, Swedish, Czech.


### 26.5 E. Bytecode Opcodes

`LOAD_CONST`, `LOAD_NAME`, `STORE_NAME`, `LOAD_ATTR`, `STORE_ATTR`, `LOAD_INDEX`, `STORE_INDEX`, `BINARY_OP`, `UNARY_OP`, `CALL`, `RETURN`, `JUMP`, `JUMP_IF_FALSE`, `JUMP_IF_TRUE`, `MAKE_FUNCTION`, `MAKE_CLOSURE`, `BUILD_LIST`, `BUILD_DICT`, `IMPORT`, `RAISE`, `TRY_BEGIN`, `TRY_END`, `YIELD`, `AWAIT`, `SPAWN`, `HALT`.


### 26.6 F. Syscall Table

`open`, `close`, `read`, `write`, `seek`, `stat`, `mkdir`, `rmdir`, `unlink`, `rename`, `sleep`, `fork`, `wait`, `kill`, `pipe`, `socket`, `connect`, `listen`, `accept`, `send`, `recv`, `time`, `getenv`, `setenv`, `gc`.


### 26.7 G. Error Code Index

`E_TYPE`, `E_VALUE`, `E_INDEX`, `E_KEY`, `E_IO`, `E_NET`, `E_TIMEOUT`, `E_SYNTAX`, `E_NAME`, `E_ATTR`, `E_DIVZERO`, `E_OVERFLOW`, `E_RECURSION`, `E_CANCELLED`, `E_INTERNAL`.


### 26.8 H. CLI Flag Reference

`--repl`, `--compile <file>`, `--exec <file>`, `--lang <code>`, `--ast`, `--time`, `--profile`, `--lint`, `--format`, `--test`, `--version`, `--help`.


### 26.9 I. Index of Examples

Bouncing ball (Ch.14), Calculator UI (Ch.20), Capitals map (Ch.20), FizzBuzz (Ch.20), Frequency histogram (Ch.20), Notebook app (Ch.21), Palindrome (Ch.20), Todo app (Ch.20), Web scraper (Ch.20), Word count (Ch.20).


---

*End of book. Version 2.0. © sdev language.*
