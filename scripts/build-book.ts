// Generates the giant sdev Book in English and Bulgarian.
// Writes to public/sdev-book-en.md and public/sdev-book-bg.md
import fs from 'fs';
import path from 'path';

interface Section { title: string; body: string }
interface Chapter { title: string; intro: string; sections: Section[] }

const EN_CHAPTERS: Chapter[] = [
  {
    title: 'Introduction',
    intro: 'Welcome to **The sdev Book** — the comprehensive reference for the sdev programming language. sdev is a modern, expressive language with a uniquely human-readable syntax (`forge`, `be`, `speak`, `conjure`, `summon`) designed to make code feel like prose without sacrificing power.',
    sections: [
      { title: 'Why sdev?', body: 'sdev was created to bridge the gap between *talking about code* and *writing code*. Traditional languages force you into algebraic shorthand (`x = 1`, `def`, `var`). sdev replaces these with verbs and nouns that carry meaning: `forge x be 1`. The result is code that reads like a recipe, an essay, or a spell — depending on your style.' },
      { title: 'Who Should Read This Book', body: 'This book is for everyone: complete beginners learning to program for the first time, professional developers exploring an expressive new language, educators teaching computational thinking, and language designers studying alternative syntactic paradigms. Each chapter starts gentle and ramps up.' },
      { title: 'How To Use This Book', body: 'Read sequentially the first time. Skim later. Every example is runnable in the **online IDE** at https://s-dev.lovable.app or with the offline Python/JS interpreters available from the Downloads menu. Type the examples — do not just read them.' },
      { title: 'Conventions', body: 'Code blocks use the `sdev` syntax. Output is shown in `// =>` comments. Notes labeled **TIP**, **WARNING**, or **DEEP DIVE** signal important context. Bulgarian translations of every chapter are available in `sdev-book-bg.md`.' },
    ],
  },
  {
    title: 'Getting Started',
    intro: 'In this chapter you will install sdev (or skip installation entirely by using the web IDE), write your first program, and understand the moving parts of an sdev project.',
    sections: [
      { title: 'Installing sdev', body: 'There are three ways to run sdev:\n\n1. **Web IDE** — no install, open https://s-dev.lovable.app/ide.\n2. **JavaScript interpreter** — `node sdev-interpreter.js my-file.sdev`.\n3. **Python interpreter** — `python sdev-interpreter.py my-file.sdev`.\n\nWindows users can run the bundled installer batch file from the Downloads menu.' },
      { title: 'Your First Program', body: 'Create a file `hello.sdev`:\n\n```sdev\nspeak("Hello, world!")\n```\n\nRun it. You should see `Hello, world!` printed. Congratulations — you are an sdev programmer.' },
      { title: 'The REPL', body: 'Start the REPL with `python sdev-interpreter.py` (no arguments). Type expressions and they will be evaluated immediately. Type `:quit` or press Ctrl+D to exit.' },
      { title: 'Project Structure', body: 'A typical sdev project has:\n- `main.sdev` — entry point\n- `lib/` — your modules\n- `assets/` — images, data files\n- `README.md` — documentation\n\nThere is no required layout. sdev is happy with a single file.' },
      { title: 'Running From the IDE', body: 'In the web IDE, press `Ctrl+Enter` (or `Cmd+Enter` on macOS) to run the active tab. The output panel shows printed text; the App panel shows UI windows; the canvas shows graphics.' },
    ],
  },
  {
    title: 'Variables and Values',
    intro: 'Every program manipulates data. In sdev you create variables with `forge` and bind them with `be`. Values are typed dynamically — sdev figures it out at runtime.',
    sections: [
      { title: 'Forging Variables', body: '```sdev\nforge name be "Ada"\nforge age be 36\nforge alive be yes\n```\n\nThe `forge` keyword introduces a *new* binding. Re-assignment uses just the name:\n\n```sdev\nname be "Lovelace"\n```' },
      { title: 'The Five Primitive Types', body: 'sdev recognises five primitive types: **number** (integer or float), **string**, **boolean** (`yes`/`no`), **void** (the absence of a value), and **collection** (lists/dictionaries — covered in the next chapter).' },
      { title: 'Type Inspection', body: 'Use `essence(value)` to ask what type a value is.\n\n```sdev\nspeak(essence(42))      // => "number"\nspeak(essence("hi"))    // => "string"\nspeak(essence(yes))     // => "boolean"\n```' },
      { title: 'Type Conversion', body: 'Use `morph(value, "type")` to convert.\n\n```sdev\nforge n be morph("42", "number")\nspeak(n + 1)  // => 43\n```' },
      { title: 'Constants', body: 'Prefix with `eternal` to mark a value as immutable.\n\n```sdev\neternal forge PI be 3.14159\nPI be 4  // => error: cannot rebind eternal binding\n```' },
      { title: 'Naming Rules', body: 'Identifiers must begin with a letter or underscore and may contain letters, digits, and underscores. Reserved keywords (`forge`, `be`, `if`, etc.) cannot be used. snake_case is conventional.' },
    ],
  },
  {
    title: 'Operators and Expressions',
    intro: 'sdev supports the usual arithmetic, comparison, and logical operators, with English-word aliases for clarity.',
    sections: [
      { title: 'Arithmetic', body: 'Standard symbols: `+`, `-`, `*`, `/`, `%` (modulo), `**` (exponent). Integer division uses `//`.' },
      { title: 'Comparison', body: '`==`, `!=`, `<`, `>`, `<=`, `>=`. The aliases `equals`, `differs`, `below`, `above` are available for prose-style code:\n\n```sdev\nif age above 18 then speak("Adult")\n```' },
      { title: 'Logical', body: '`and`, `or`, `not`. Short-circuit evaluation is guaranteed. The symbols `&&`, `||`, `!` also work.' },
      { title: 'String Operators', body: 'Concatenate with `+`. Repeat with `*`:\n\n```sdev\nspeak("ha" * 3)  // => hahaha\n```' },
      { title: 'Membership', body: '`in` and `not in` test membership in collections and substrings in strings.\n\n```sdev\nif "lo" in "hello" then speak("found")\n```' },
      { title: 'Operator Precedence', body: 'From highest to lowest: unary minus / not, `**`, `*` `/` `%` `//`, `+` `-`, comparisons, `and`, `or`. Use parentheses freely; sdev never penalises clarity.' },
    ],
  },
  {
    title: 'Control Flow',
    intro: 'Branching and looping in sdev use natural-language keywords.',
    sections: [
      { title: 'If / Else', body: '```sdev\nif score above 90 then\n  speak("A")\nelse if score above 75 then\n  speak("B")\nelse\n  speak("C")\nend\n```' },
      { title: 'When (Pattern Match)', body: '`when` is a multi-branch matcher.\n\n```sdev\nwhen day:\n  is "mon" then speak("Monday blues")\n  is "fri" then speak("Almost weekend")\n  else speak("A regular day")\nend\n```' },
      { title: 'While Loops', body: '```sdev\nforge i be 0\nwhile i below 5:\n  speak(i)\n  i be i + 1\nend\n```' },
      { title: 'Until Loops', body: '`until` is the inverse of `while` — runs while the condition is false:\n\n```sdev\nuntil ready:\n  ready be checkStatus()\nend\n```' },
      { title: 'For-Each', body: '```sdev\nfor item in [1, 2, 3]:\n  speak(item)\nend\n```' },
      { title: 'Range Iteration', body: '```sdev\nfor i in sequence(1, 10):\n  speak(i)\nend\n```' },
      { title: 'Break and Continue', body: 'Use `escape` to break out of a loop and `skip` to jump to the next iteration.' },
    ],
  },
  {
    title: 'Functions',
    intro: 'Functions in sdev are declared with `conjure` and called by name with parentheses.',
    sections: [
      { title: 'Defining a Function', body: '```sdev\nconjure greet(name):\n  speak("Hello, " + name)\nend\n```' },
      { title: 'Returning Values', body: 'Use `yield` (or `return`) to produce a result.\n\n```sdev\nconjure square(x):\n  yield x * x\nend\nspeak(square(7))  // => 49\n```' },
      { title: 'Default Parameters', body: '```sdev\nconjure greet(name be "stranger"):\n  speak("Hello, " + name)\nend\n```' },
      { title: 'Variadic Functions', body: 'Use `...rest` to accept any number of arguments.\n\n```sdev\nconjure sumAll(...nums):\n  yield fold(nums, 0, (a, b) => a + b)\nend\n```' },
      { title: 'Anonymous Functions (Lambdas)', body: '```sdev\nforge double be (x) => x * 2\nspeak(double(5))  // => 10\n```' },
      { title: 'Higher-Order Functions', body: 'Functions are first-class values. Pass them around freely:\n\n```sdev\nforge nums be [1, 2, 3, 4]\nforge doubled be each(nums, (n) => n * 2)\n```' },
      { title: 'Closures', body: 'Inner functions capture variables from the enclosing scope.\n\n```sdev\nconjure makeCounter():\n  forge n be 0\n  yield () => { n be n + 1; yield n }\nend\n```' },
      { title: 'Recursion', body: 'sdev fully supports recursion. The classic factorial:\n\n```sdev\nconjure fact(n):\n  if n <= 1 then yield 1\n  yield n * fact(n - 1)\nend\n```' },
    ],
  },
  {
    title: 'Collections',
    intro: 'Lists and dictionaries are the workhorses of sdev. Both are dynamic and grow on demand.',
    sections: [
      { title: 'Lists', body: '```sdev\nforge nums be [1, 2, 3]\nspeak(nums[0])         // => 1\ngather(nums, 4)        // append\nspeak(magnitude(nums)) // length\n```' },
      { title: 'Dictionaries', body: '```sdev\nforge user be { name: "Ada", age: 36 }\nspeak(user.name)       // => Ada\nuser.age be 37\n```' },
      { title: 'List Operations', body: '`each(list, fn)` maps. `sift(list, predicate)` filters. `fold(list, init, fn)` reduces. `weave(list, sep)` joins to string. `shatter(string, sep)` splits.' },
      { title: 'Slicing', body: '```sdev\nforge xs be [10, 20, 30, 40, 50]\nspeak(portion(xs, 1, 3))  // => [20, 30]\n```' },
      { title: 'Searching', body: '`seek(list, predicate)` returns the first match. `every(list, predicate)` returns `yes` if all match. `some(list, predicate)` returns `yes` if any match.' },
      { title: 'Sets', body: 'Convert a list to a unique-only set with `unique(list)`. Set operations: `union`, `intersect`, `difference`.' },
    ],
  },
  {
    title: 'Strings',
    intro: 'Strings are immutable sequences of Unicode characters.',
    sections: [
      { title: 'Literals', body: 'Single or double quotes work identically. Triple quotes for multi-line:\n\n```sdev\nforge poem be """\n  Roses are red\n  Violets are blue\n"""\n```' },
      { title: 'Interpolation', body: 'Use `${...}` inside backtick strings.\n\n```sdev\nforge name be "Ada"\nspeak(`Hello, ${name}!`)\n```' },
      { title: 'Common Operations', body: '`upper`, `lower`, `trim`, `reverse`, `contains`, `replace`, `split` (alias `shatter`), `join` (alias `weave`), `length` (alias `magnitude`).' },
      { title: 'Regular Expressions', body: '```sdev\nforge re be regex("\\\\d+")\nforge nums be findAll(re, "abc 123 def 456")\n```' },
    ],
  },
  {
    title: 'Object-Oriented Programming',
    intro: 'sdev supports classes via the `essence` keyword and instance creation via `summon`.',
    sections: [
      { title: 'Defining a Class', body: '```sdev\nessence Dog:\n  forge name\n  forge breed\n  conjure bark():\n    speak(name + " says woof!")\n  end\nend\n```' },
      { title: 'Creating Instances', body: '```sdev\nforge rex be summon Dog(name: "Rex", breed: "Husky")\nrex.bark()\n```' },
      { title: 'Inheritance', body: '```sdev\nessence Puppy extends Dog:\n  conjure yip():\n    speak(name + " yips!")\n  end\nend\n```' },
      { title: 'Methods and Self', body: 'Methods automatically have access to instance fields by name. Use `me` for explicit reference (`me.name`).' },
      { title: 'Static Methods', body: 'Prefix with `shared`:\n\n```sdev\nessence Math:\n  shared conjure pi(): yield 3.14159 end\nend\nspeak(Math.pi())\n```' },
      { title: 'Polymorphism', body: 'Override methods freely in subclasses. Call the parent with `ancestor.method()`.' },
    ],
  },
  {
    title: 'Error Handling',
    intro: 'When things go wrong, sdev gives you tools to recover gracefully.',
    sections: [
      { title: 'Try / Catch', body: '```sdev\nattempt:\n  risky()\nrescue err:\n  speak("Failed: " + err.message)\nend\n```' },
      { title: 'Throwing Errors', body: '```sdev\nif age below 0 then\n  raise "Age cannot be negative"\nend\n```' },
      { title: 'Finally', body: '```sdev\nattempt:\n  openFile()\nrescue err:\n  speak(err)\nfinally:\n  closeFile()\nend\n```' },
      { title: 'Custom Error Types', body: '```sdev\nessence ValidationError extends Error:\n  forge field\nend\n```' },
    ],
  },
  {
    title: 'Concurrency',
    intro: 'sdev offers async/await-style concurrency with the keywords `dispatch` and `await`.',
    sections: [
      { title: 'Dispatch', body: '```sdev\nforge task be dispatch fetchData()\n```\nReturns a promise.' },
      { title: 'Await', body: '```sdev\nforge data be await task\n```' },
      { title: 'Parallel Tasks', body: '```sdev\nforge results be await all([dispatch fetch(a), dispatch fetch(b)])\n```' },
      { title: 'Channels', body: 'For producer/consumer patterns, use `channel()`, `send`, and `receive`.' },
    ],
  },
  {
    title: 'Modules and Libraries',
    intro: 'Use `summon` to bring in code from other files or remote gists.',
    sections: [
      { title: 'Local Imports', body: '```sdev\nsummon "lib/math.sdev"\n```' },
      { title: 'Gist Libraries', body: '```sdev\nsummon "gist:abc123"\n```\nFetches an sdev file from a GitHub Gist or the sdev gist registry.' },
      { title: 'Exporting', body: 'Use `share` to mark a value as exported.\n\n```sdev\nshare conjure add(a, b): yield a + b end\n```' },
    ],
  },
  {
    title: 'The UI Toolkit',
    intro: 'sdev includes a built-in declarative UI system. Build windows with buttons, inputs, sliders, tables, tabs, menus, and more — all from sdev code, rendered live in the IDE.',
    sections: [
      { title: 'Your First Window', body: '```sdev\nwindow("Hello App", 400, 300)\n  heading("Hello, world!", 1)\n  paragraph("This is an sdev UI app.")\n  button("Click me", () => alert("Hi!"))\nendwindow\n```\n\n`window(title, width, height)` opens a window. `endwindow` closes the definition.' },
      { title: 'Layouts: Row & Column', body: '```sdev\nrow\n  button("Left")\n  button("Right")\nendrow\n\ncolumn\n  label("Top")\n  label("Bottom")\nendcolumn\n```' },
      { title: 'Inputs', body: '```sdev\ninput("name", "Your name")\nbutton("Greet", () => alert("Hello " + uiget("name")))\n```\n\nThe first argument is the *bind name* — the variable that holds the input value. Read it with `uiget` and write it with `uiset`.' },
      { title: 'Checkboxes and Sliders', body: '```sdev\ncheckbox("agree", "I agree to terms")\nslider("volume", 0, 100, 1)\nlabel("Volume: " + uiget("volume"))\n```' },
      { title: 'Tabs and Groups', body: '```sdev\ntabs\n  tab("Profile")\n    input("name")\n  endtab\n  tab("Settings")\n    checkbox("notifications", "Enable notifications")\n  endtab\nendtabs\n```' },
      { title: 'Tables', body: '```sdev\ntable(["Name", "Age"], [["Ada", 36], ["Linus", 54]])\n```' },
      { title: 'Menus', body: '```sdev\nmenu("File")\n  menuitem("New", () => speak("new file"))\n  menuitem("Open", () => speak("open"))\nendmenu\n```' },
      { title: 'Customization', body: 'Buttons accept a third argument for variant: `"default"`, `"primary"`, `"destructive"`, `"ghost"`. Windows accept width and height as second and third arguments. Images accept width, height, and alt text.' },
      { title: 'Reactive Values', body: 'Every interactive widget binds to a name. Read the current value with `uiget("name")`. Programmatically update with `uiset("name", newValue)`. The UI redraws automatically.' },
    ],
  },
  {
    title: 'Graphics and Canvas',
    intro: 'For drawing pixels, lines, shapes, and animations, sdev provides a canvas API.',
    sections: [
      { title: 'Setting Up', body: '```sdev\ncanvas(800, 600)\n```' },
      { title: 'Drawing Shapes', body: '`circle(x, y, r)`, `rect(x, y, w, h)`, `line(x1, y1, x2, y2)`, `polygon(points)`.' },
      { title: 'Colors and Fills', body: '`color("red")`, `fill("#ff0080")`, `stroke("white", 2)`.' },
      { title: 'Text on Canvas', body: '`text("Hello", x, y, size)`.' },
      { title: 'Animation Loop', body: 'Use `frame((t) => { ... })` to animate. `t` is the elapsed time in seconds.' },
      { title: 'Mouse and Keyboard', body: '`onMouse((x, y) => ...)`, `onKey((key) => ...)`.' },
    ],
  },
  {
    title: 'Maps and GIS',
    intro: 'sdev integrates Leaflet for full mapping and geospatial features. See the dedicated `SDEV_LEAFLET_DOCUMENTATION.md` for the complete API.',
    sections: [
      { title: 'Quick Map', body: '```sdev\nmap(42.7, 23.3, 12)   // lat, lng, zoom\nmarker(42.7, 23.3, "Sofia")\n```' },
      { title: 'Layers and Tiles', body: '`tile("osm")`, `tile("satellite")`. Stack multiple layers.' },
      { title: 'GeoJSON', body: 'Load a GeoJSON file with `geojson(url)` and style features with a callback.' },
    ],
  },
  {
    title: 'The Standard Library',
    intro: 'A reference of the most-used built-in functions, grouped by purpose.',
    sections: [
      { title: 'I/O', body: '`speak`, `whisper`, `shout`, `ask` (read line), `readFile`, `writeFile`.' },
      { title: 'Math', body: '`magnitude`, `least`, `greatest`, `root`, `ground` (floor), `elevate` (ceil), `random`, `pi`, `sin`, `cos`, `tan`, `log`.' },
      { title: 'Strings', body: '`upper`, `lower`, `trim`, `reverse`, `contains`, `replace`, `shatter`, `weave`, `regex`, `findAll`, `match`.' },
      { title: 'Collections', body: '`gather`, `pluck`, `portion`, `each`, `sift`, `fold`, `seek`, `every`, `some`, `zip`, `enumerate`, `unique`, `sort`.' },
      { title: 'Time', body: '`now`, `delay`, `today`, `format`.' },
      { title: 'System', body: '`env`, `argv`, `exit`, `osinfo`.' },
      { title: 'Encoding', body: '`base64encode`, `base64decode`, `hexencode`, `hexdecode`, `jsonencode`, `jsondecode`.' },
    ],
  },
  {
    title: 'Tooling',
    intro: 'Editors, linters, and the bytecode compiler.',
    sections: [
      { title: 'Web IDE', body: 'Full-featured browser IDE at https://s-dev.lovable.app/ide. Includes file tree, tabs, command palette (`Ctrl+Shift+P`), terminal, and live App preview.' },
      { title: 'VS Code Extension', body: 'Download `.vsix` from the Downloads menu. Provides syntax highlighting, snippets, and a Run command (`Ctrl+Enter`).' },
      { title: 'Bytecode Compiler', body: 'Compile to `.sdevc` for faster startup: `node sdev-interpreter.js --compile main.sdev`. Run with `--exec main.sdevc`.' },
      { title: 'The sdev Assistant', body: 'In-IDE AI chatbot that explains code, generates examples, and debugs runtime errors via a self-test loop.' },
    ],
  },
  {
    title: 'Advanced Topics',
    intro: 'Power-user features for systems, performance, and embedding.',
    sections: [
      { title: 'JavaScript Interop', body: 'Embed raw JS with the `js` keyword:\n\n```sdev\njs { console.log("native") }\n```\nValues flow both ways via the shared scope.' },
      { title: 'Matrix Math', body: '`matrix([[1,2],[3,4]])`, `matmul`, `inverse`, `transpose`, `det`.' },
      { title: 'Buffers and Pointers', body: '`buffer(size)`, `pointer(value)`, `deref(p)`. For binary protocol work.' },
      { title: 'Kernel and Tasks', body: 'sdev includes a virtual OS kernel. `spawn(fn)` creates a task; `schedule()` yields cooperatively; `syscall("name", args)` invokes a syscall.' },
      { title: 'Garbage Collection', body: 'Mark-and-sweep GC runs automatically. Force a cycle with `gc()`.' },
      { title: 'Multi-Language Source', body: 'sdev source can be written in any of 26 languages. The translator normalises keywords at parse time. Set the source language with `// lang: bg`.' },
    ],
  },
  {
    title: 'Best Practices',
    intro: 'Idioms and patterns that make sdev programs delightful to read and maintain.',
    sections: [
      { title: 'Name Things Well', body: 'sdev rewards descriptive names. `forge n be 0` is fine for a counter; `forge customers_seen be 0` is better when shared.' },
      { title: 'Prefer Verbs', body: 'Function names should be verbs (`compute`, `render`, `parse`); class names should be nouns (`Customer`, `Invoice`).' },
      { title: 'Keep Functions Small', body: 'Aim for under 20 lines. If a function does two things, split it.' },
      { title: 'Embrace Immutability', body: 'Use `eternal` liberally for values that should not change. Future readers will thank you.' },
      { title: 'Document Intent, Not Mechanics', body: 'Comments should explain *why*. The code already shows *what*.' },
    ],
  },
  {
    title: 'A Cookbook of Examples',
    intro: 'Short, complete programs that demonstrate idiomatic sdev.',
    sections: [
      { title: 'FizzBuzz', body: '```sdev\nfor i in sequence(1, 100):\n  when:\n    is i % 15 == 0 then speak("FizzBuzz")\n    is i % 3 == 0 then speak("Fizz")\n    is i % 5 == 0 then speak("Buzz")\n    else speak(i)\n  end\nend\n```' },
      { title: 'Word Count', body: '```sdev\nforge text be readFile("essay.txt")\nforge words be shatter(text, " ")\nspeak("Word count: " + magnitude(words))\n```' },
      { title: 'Todo App UI', body: '```sdev\nforge todos be []\nwindow("Todos", 360, 480)\n  input("new", "What to do?")\n  button("Add", () => {\n    gather(todos, uiget("new"))\n    uiset("new", "")\n  })\n  for t in todos:\n    label(t)\n  end\nendwindow\n```' },
      { title: 'HTTP Fetch', body: '```sdev\nforge res be await fetch("https://api.example.com/users")\nforge users be jsondecode(res.body)\nfor u in users: speak(u.name) end\n```' },
      { title: 'Bouncing Ball', body: '```sdev\ncanvas(400, 400)\nforge x be 200; forge y be 200; forge dx be 3; forge dy be 2\nframe((t) => {\n  fill("black"); rect(0, 0, 400, 400)\n  fill("cyan"); circle(x, y, 20)\n  x be x + dx; y be y + dy\n  if x < 0 or x > 400 then dx be -dx end\n  if y < 0 or y > 400 then dy be -dy end\n})\n```' },
    ],
  },
  {
    title: 'Frequently Asked Questions',
    intro: 'Real questions from real sdev users.',
    sections: [
      { title: 'Is sdev fast?', body: 'For interpreted execution, performance is on par with Python. The bytecode compiler (`.sdevc`) gives a 3–5× speedup. For hot loops, drop into `js { ... }` interop.' },
      { title: 'Can I use it in production?', body: 'sdev is best suited for scripting, education, prototyping, and embedded scenarios. Production web backends remain a stretch — but it is improving.' },
      { title: 'Why not just use Python?', body: 'Python is excellent. sdev exists for those who want a *more readable* alternative — closer to spoken English than algebraic shorthand.' },
      { title: 'Where do I report bugs?', body: 'Open an issue on the GitHub repository linked from the website footer.' },
      { title: 'Can I contribute?', body: 'Yes! sdev is open source. Pull requests for new builtins, language features, and translations are welcome.' },
    ],
  },
  {
    title: 'Glossary',
    intro: 'Quick definitions of key terms.',
    sections: [
      { title: 'A–F', body: '**Anonymous function** — a function without a name, created with `=>`.\n**Bind** — to associate a name with a value.\n**Closure** — a function that captures variables from its lexical scope.\n**Conjure** — keyword to declare a function.\n**Eternal** — modifier for immutable bindings.\n**Forge** — keyword to declare a new variable.' },
      { title: 'G–N', body: '**Gist** — a remote sdev module fetched via `summon`.\n**Lambda** — synonym for anonymous function.\n**Morph** — built-in for type conversion.\n**Mutation** — changing the value of a binding.' },
      { title: 'O–Z', body: '**Object** — instance of a class.\n**Promise** — a value that will arrive later.\n**Summon** — keyword to import or instantiate.\n**VM** — the bytecode virtual machine.\n**Yield** — return a value from a function.' },
    ],
  },
  {
    title: 'Appendices',
    intro: '',
    sections: [
      { title: 'A. Keyword Reference', body: '`forge`, `be`, `eternal`, `if`, `then`, `else`, `when`, `is`, `while`, `until`, `for`, `in`, `escape`, `skip`, `conjure`, `yield`, `return`, `essence`, `summon`, `share`, `extends`, `me`, `ancestor`, `attempt`, `rescue`, `finally`, `raise`, `dispatch`, `await`, `js`, `end`.' },
      { title: 'B. Operator Reference', body: '`+ - * / % ** //`, `== != < > <= >=`, `and or not`, `equals differs above below`, `in`, `=>`.' },
      { title: 'C. Built-in Function Index', body: 'See Chapter 16 (The Standard Library). The complete index is in `SDEV_DOCUMENTATION.md`.' },
      { title: 'D. Source Languages', body: 'sdev source files may be written in: English, Bulgarian, Russian, Spanish, French, German, Italian, Portuguese, Polish, Romanian, Ukrainian, Greek, Turkish, Arabic, Hebrew, Hindi, Chinese (Simplified), Chinese (Traditional), Japanese, Korean, Vietnamese, Thai, Indonesian, Dutch, Swedish, Czech.' },
    ],
  },
];

const BG_CHAPTERS: Chapter[] = [
  { title: 'Въведение', intro: 'Добре дошли в **Книгата за sdev** — изчерпателен наръчник за програмния език sdev. sdev е модерен, изразителен език с уникално четим синтаксис (`forge`, `be`, `speak`, `conjure`, `summon`), създаден така, че кодът да изглежда като проза, без да жертва мощта си.', sections: [
    { title: 'Защо sdev?', body: 'sdev е създаден, за да преодолее пропастта между *говоренето за код* и *писането на код*. Класическите езици използват алгебрични съкращения (`x = 1`, `def`, `var`). sdev ги заменя с глаголи и съществителни, които носят смисъл: `forge x be 1`. Резултатът е код, който се чете като рецепта или есе.' },
    { title: 'За кого е тази книга', body: 'Тази книга е за всички: пълни начинаещи, професионални програмисти, преподаватели и дизайнери на езици. Всяка глава започва меко и постепенно усложнява материала.' },
    { title: 'Как да използвате книгата', body: 'Прочетете я последователно първия път. Всеки пример може да бъде стартиран в **онлайн IDE** на https://s-dev.lovable.app или с офлайн интерпретатори. Пишете примерите — не само ги четете.' },
    { title: 'Конвенции', body: 'Кодовите блокове използват синтаксиса `sdev`. Изходът е показан в `// =>` коментари. Бележките **СЪВЕТ**, **ВНИМАНИЕ** и **ЗАДЪЛБОЧЕНО** маркират важна информация.' },
  ]},
  { title: 'Първи стъпки', intro: 'В тази глава ще инсталирате sdev (или ще пропуснете инсталацията, използвайки уеб IDE), ще напишете първата си програма и ще разберете компонентите на sdev проект.', sections: [
    { title: 'Инсталация на sdev', body: 'Има три начина за стартиране на sdev:\n1. **Уеб IDE** — без инсталация, отворете https://s-dev.lovable.app/ide.\n2. **JavaScript интерпретатор** — `node sdev-interpreter.js моят-файл.sdev`.\n3. **Python интерпретатор** — `python sdev-interpreter.py моят-файл.sdev`.' },
    { title: 'Вашата първа програма', body: 'Създайте файл `hello.sdev`:\n\n```sdev\nspeak("Здравей, свят!")\n```\n\nСтартирайте го. Поздравления — вие сте sdev програмист.' },
    { title: 'REPL', body: 'Стартирайте REPL с `python sdev-interpreter.py` без аргументи. Въвеждайте изрази и те ще бъдат изчислявани веднага.' },
    { title: 'Структура на проекта', body: 'Типичен sdev проект има `main.sdev`, папка `lib/` и `README.md`. sdev е щастлив и с един файл.' },
    { title: 'Стартиране от IDE', body: 'В уеб IDE натиснете `Ctrl+Enter` за да стартирате активния таб. Изходният панел показва текста; App панелът показва UI прозорци.' },
  ]},
  { title: 'Променливи и стойности', intro: 'Всяка програма манипулира данни. В sdev създавате променливи с `forge` и ги обвързвате с `be`.', sections: [
    { title: 'Създаване на променливи', body: '```sdev\nforge name be "Ада"\nforge age be 36\nforge alive be yes\n```\n\nКлючовата дума `forge` въвежда *ново* обвързване. Преприсвояването използва само името: `name be "Лъвлейс"`.' },
    { title: 'Петте примитивни типа', body: 'sdev разпознава пет примитивни типа: **число**, **низ**, **булева** (`yes`/`no`), **празно** и **колекция**.' },
    { title: 'Проверка на тип', body: 'Използвайте `essence(value)`, за да попитате за типа.' },
    { title: 'Конверсия на тип', body: 'Използвайте `morph(value, "type")` за конверсия.' },
    { title: 'Константи', body: 'Префикс `eternal` маркира стойност като неизменна.' },
    { title: 'Правила за именуване', body: 'Идентификаторите трябва да започват с буква или долна черта. Резервирани думи не могат да се използват.' },
  ]},
  { title: 'Оператори и изрази', intro: 'sdev поддържа обичайните аритметични, сравнителни и логически оператори, с английски думи-псевдоними.', sections: [
    { title: 'Аритметични', body: 'Стандартни символи: `+`, `-`, `*`, `/`, `%`, `**`. Целочислено деление: `//`.' },
    { title: 'Сравнителни', body: '`==`, `!=`, `<`, `>`, `<=`, `>=`. Псевдоними: `equals`, `differs`, `below`, `above`.' },
    { title: 'Логически', body: '`and`, `or`, `not`. Гарантирана е оценка с прекъсване.' },
    { title: 'Низови оператори', body: 'Конкатенация с `+`, повторение с `*`.' },
    { title: 'Принадлежност', body: '`in` и `not in` проверяват принадлежност.' },
    { title: 'Приоритет на оператори', body: 'От най-висок към най-нисък: унарен минус, `**`, мултипликативни, адитивни, сравнения, `and`, `or`.' },
  ]},
  { title: 'Контрол на потока', intro: 'Разклоняване и циклиране в sdev използват ключови думи на естествен език.', sections: [
    { title: 'If / Else', body: '```sdev\nif score above 90 then\n  speak("A")\nelse\n  speak("Друго")\nend\n```' },
    { title: 'When', body: '`when` е многоклонов сравнител с `is ... then` клонове.' },
    { title: 'While цикли', body: '```sdev\nwhile i below 5:\n  speak(i); i be i + 1\nend\n```' },
    { title: 'Until цикли', body: '`until` е обратното на `while`.' },
    { title: 'For-Each', body: '```sdev\nfor item in [1,2,3]: speak(item) end\n```' },
    { title: 'Range итерация', body: '```sdev\nfor i in sequence(1, 10): speak(i) end\n```' },
    { title: 'Прекъсване и продължаване', body: '`escape` за break, `skip` за continue.' },
  ]},
  { title: 'Функции', intro: 'Функциите в sdev се декларират с `conjure` и се извикват по име с скоби.', sections: [
    { title: 'Дефиниране', body: '```sdev\nconjure greet(name): speak("Здравей, " + name) end\n```' },
    { title: 'Връщане на стойности', body: 'Използвайте `yield` (или `return`).' },
    { title: 'Параметри по подразбиране', body: '`conjure greet(name be "приятел"): ... end`' },
    { title: 'Variadic функции', body: 'Използвайте `...rest`.' },
    { title: 'Анонимни функции', body: '`forge double be (x) => x * 2`' },
    { title: 'Функции от висш ред', body: 'Функциите са първокласни стойности и се предават свободно.' },
    { title: 'Затваряния', body: 'Вътрешните функции хващат променливи от обхващащия обхват.' },
    { title: 'Рекурсия', body: 'sdev напълно поддържа рекурсия — например факториел.' },
  ]},
  { title: 'Колекции', intro: 'Списъци и речници са работните коне на sdev.', sections: [
    { title: 'Списъци', body: '```sdev\nforge nums be [1,2,3]\ngather(nums, 4)\n```' },
    { title: 'Речници', body: '```sdev\nforge user be { name: "Ада", age: 36 }\n```' },
    { title: 'Списъчни операции', body: '`each`, `sift`, `fold`, `weave`, `shatter`.' },
    { title: 'Срезове', body: '`portion(xs, начало, край)`.' },
    { title: 'Търсене', body: '`seek`, `every`, `some`.' },
    { title: 'Множества', body: '`unique(list)`, `union`, `intersect`, `difference`.' },
  ]},
  { title: 'Низове', intro: 'Низовете са неизменни последователности от Unicode символи.', sections: [
    { title: 'Литерали', body: 'Едноредови или многоредови с тройни кавички.' },
    { title: 'Интерполация', body: 'Използвайте `${...}` в backtick низове.' },
    { title: 'Чести операции', body: '`upper`, `lower`, `trim`, `reverse`, `contains`, `replace`.' },
    { title: 'Регулярни изрази', body: '`regex("\\\\d+")` и `findAll`.' },
  ]},
  { title: 'Обектно ориентирано програмиране', intro: 'sdev поддържа класове чрез `essence` и създаване на инстанции чрез `summon`.', sections: [
    { title: 'Дефиниране на клас', body: '```sdev\nessence Dog:\n  forge name\n  conjure bark(): speak(name + " лае!") end\nend\n```' },
    { title: 'Създаване на инстанции', body: '`forge rex be summon Dog(name: "Рекс")`' },
    { title: 'Наследяване', body: '`essence Puppy extends Dog: ... end`' },
    { title: 'Методи и self', body: 'Методите имат достъп до полетата по име. Използвайте `me` за изричност.' },
    { title: 'Статични методи', body: 'Префикс `shared`.' },
    { title: 'Полиморфизъм', body: 'Презаписвайте методи свободно. Извиквайте родителя с `ancestor.method()`.' },
  ]},
  { title: 'Обработка на грешки', intro: 'Когато нещата се объркат, sdev предоставя инструменти за грациозно възстановяване.', sections: [
    { title: 'Try / Catch', body: '`attempt: ... rescue err: ... end`' },
    { title: 'Хвърляне на грешки', body: '`raise "Възрастта не може да е отрицателна"`' },
    { title: 'Finally', body: '`attempt: ... rescue ... finally: ... end`' },
    { title: 'Потребителски типове грешки', body: '`essence ValidationError extends Error: ... end`' },
  ]},
  { title: 'Конкурентност', intro: 'sdev предлага async/await-стил конкурентност с `dispatch` и `await`.', sections: [
    { title: 'Dispatch', body: '`forge task be dispatch fetchData()` връща обещание.' },
    { title: 'Await', body: '`forge data be await task`' },
    { title: 'Паралелни задачи', body: '`await all([dispatch a(), dispatch b()])`' },
    { title: 'Канали', body: 'За producer/consumer — `channel()`, `send`, `receive`.' },
  ]},
  { title: 'Модули и библиотеки', intro: 'Използвайте `summon` за внасяне на код от други файлове или отдалечени gist-ове.', sections: [
    { title: 'Локални импорти', body: '`summon "lib/math.sdev"`' },
    { title: 'Gist библиотеки', body: '`summon "gist:abc123"`' },
    { title: 'Експортиране', body: '`share conjure add(a, b): yield a + b end`' },
  ]},
  { title: 'UI инструментариум', intro: 'sdev включва вградена декларативна UI система. Изграждайте прозорци с бутони, входни полета, плъзгачи, таблици, табове и менюта — всичко от sdev код.', sections: [
    { title: 'Първият ви прозорец', body: '```sdev\nwindow("Hello App", 400, 300)\n  heading("Здравей, свят!", 1)\n  button("Натисни ме", () => alert("Здрасти!"))\nendwindow\n```' },
    { title: 'Layout: Row & Column', body: '`row ... endrow` за хоризонтално; `column ... endcolumn` за вертикално подреждане.' },
    { title: 'Входни полета', body: '`input("name", "Вашето име")` — четете стойността с `uiget("name")`.' },
    { title: 'Чекбоксове и плъзгачи', body: '`checkbox("agree", "Съгласен съм")`, `slider("vol", 0, 100, 1)`.' },
    { title: 'Табове и групи', body: '`tabs ... tab("Профил") ... endtab ... endtabs`' },
    { title: 'Таблици', body: '`table(["Име","Възраст"], [["Ада",36]])`' },
    { title: 'Менюта', body: '`menu("File") menuitem("New", () => ...) endmenu`' },
    { title: 'Персонализация', body: 'Бутоните приемат вариант като трети аргумент: `default`, `primary`, `destructive`, `ghost`. Прозорците приемат ширина и височина.' },
    { title: 'Реактивни стойности', body: '`uiget("име")` чете, `uiset("име", стойност)` записва. UI се пречертава автоматично.' },
  ]},
  { title: 'Графика и Canvas', intro: 'За рисуване на пиксели, линии, форми и анимации, sdev предоставя canvas API.', sections: [
    { title: 'Настройка', body: '`canvas(800, 600)`' },
    { title: 'Рисуване на форми', body: '`circle`, `rect`, `line`, `polygon`.' },
    { title: 'Цветове', body: '`color`, `fill`, `stroke`.' },
    { title: 'Текст върху canvas', body: '`text("Здравей", x, y, размер)`' },
    { title: 'Анимационен цикъл', body: '`frame((t) => { ... })`' },
    { title: 'Мишка и клавиатура', body: '`onMouse`, `onKey`.' },
  ]},
  { title: 'Карти и ГИС', intro: 'sdev интегрира Leaflet за пълна поддръжка на карти.', sections: [
    { title: 'Бърза карта', body: '`map(42.7, 23.3, 12); marker(42.7, 23.3, "София")`' },
    { title: 'Слоеве и тайлове', body: '`tile("osm")`, `tile("satellite")`.' },
    { title: 'GeoJSON', body: '`geojson(url)`' },
  ]},
  { title: 'Стандартна библиотека', intro: 'Справочник за най-използваните вградени функции.', sections: [
    { title: 'Вход/Изход', body: '`speak`, `whisper`, `shout`, `ask`, `readFile`, `writeFile`.' },
    { title: 'Математика', body: '`magnitude`, `least`, `greatest`, `root`, `ground`, `elevate`, `random`, `pi`, `sin`, `cos`.' },
    { title: 'Низове', body: '`upper`, `lower`, `trim`, `reverse`, `contains`, `replace`, `shatter`, `weave`.' },
    { title: 'Колекции', body: '`gather`, `pluck`, `portion`, `each`, `sift`, `fold`, `seek`, `every`, `some`.' },
    { title: 'Време', body: '`now`, `delay`, `today`, `format`.' },
    { title: 'Система', body: '`env`, `argv`, `exit`, `osinfo`.' },
    { title: 'Кодиране', body: '`base64encode`, `hexencode`, `jsonencode`.' },
  ]},
  { title: 'Инструменти', intro: 'Редактори, линтери и компилатор на байткод.', sections: [
    { title: 'Уеб IDE', body: 'Пълнофункционално IDE на https://s-dev.lovable.app/ide.' },
    { title: 'VS Code разширение', body: 'Изтеглете `.vsix` от менюто Downloads.' },
    { title: 'Bytecode компилатор', body: '`node sdev-interpreter.js --compile main.sdev` — стартирайте с `--exec main.sdevc`.' },
    { title: 'sdev асистент', body: 'Вграден AI чатбот, който обяснява код и дебъгва грешки.' },
  ]},
  { title: 'Напреднали теми', intro: 'Функции за опитни потребители.', sections: [
    { title: 'JavaScript Interop', body: 'Вграждайте суров JS с `js { console.log("native") }`.' },
    { title: 'Матрична математика', body: '`matrix`, `matmul`, `inverse`, `transpose`, `det`.' },
    { title: 'Буфери и указатели', body: '`buffer(размер)`, `pointer(стойност)`, `deref(p)`.' },
    { title: 'Ядро и задачи', body: '`spawn(fn)`, `schedule()`, `syscall("име", args)`.' },
    { title: 'Сметоизхвърляне', body: 'Mark-and-sweep GC се изпълнява автоматично. Принудете цикъл с `gc()`.' },
    { title: 'Многоезичен код', body: 'sdev код може да бъде написан на 26 езика. Задайте езика с `// lang: bg`.' },
  ]},
  { title: 'Добри практики', intro: 'Идиоми и шаблони, които правят sdev програмите приятни за четене.', sections: [
    { title: 'Именувайте добре', body: 'sdev възнаграждава описателните имена.' },
    { title: 'Предпочитайте глаголи', body: 'Имена на функции = глаголи; имена на класове = съществителни.' },
    { title: 'Малки функции', body: 'Стремете се към под 20 реда.' },
    { title: 'Прегърнете неизменността', body: 'Използвайте `eternal` често.' },
    { title: 'Документирайте намерението', body: 'Коментарите трябва да обясняват *защо*.' },
  ]},
  { title: 'Готварска книга с примери', intro: 'Кратки, пълни програми, демонстриращи идиоматичен sdev.', sections: [
    { title: 'FizzBuzz', body: '```sdev\nfor i in sequence(1, 100):\n  when:\n    is i % 15 == 0 then speak("FizzBuzz")\n    is i % 3 == 0 then speak("Fizz")\n    is i % 5 == 0 then speak("Buzz")\n    else speak(i)\n  end\nend\n```' },
    { title: 'Брояч на думи', body: '`forge text be readFile("essay.txt"); speak(magnitude(shatter(text, " ")))`' },
    { title: 'Todo приложение', body: '```sdev\nforge todos be []\nwindow("Todos", 360, 480)\n  input("new", "Какво да направя?")\n  button("Добави", () => { gather(todos, uiget("new")); uiset("new", "") })\n  for t in todos: label(t) end\nendwindow\n```' },
    { title: 'HTTP заявка', body: '`forge res be await fetch(url); forge data be jsondecode(res.body)`' },
    { title: 'Подскачаща топка', body: '```sdev\ncanvas(400, 400)\nforge x be 200; forge y be 200; forge dx be 3; forge dy be 2\nframe((t) => { fill("black"); rect(0,0,400,400); fill("cyan"); circle(x,y,20); x be x+dx; y be y+dy; if x<0 or x>400 then dx be -dx end; if y<0 or y>400 then dy be -dy end })\n```' },
  ]},
  { title: 'Често задавани въпроси', intro: 'Реални въпроси от реални sdev потребители.', sections: [
    { title: 'Бърз ли е sdev?', body: 'За интерпретирано изпълнение производителността е сравнима с Python. Bytecode компилаторът дава 3–5× ускорение.' },
    { title: 'Мога ли да го използвам в продукция?', body: 'sdev е най-подходящ за скриптове, образование и прототипи.' },
    { title: 'Защо не Python?', body: 'sdev съществува за тези, които искат *по-четим* алтернативен синтаксис.' },
    { title: 'Къде да докладвам бъгове?', body: 'Отворете issue в GitHub хранилището.' },
    { title: 'Мога ли да допринеса?', body: 'Да! sdev е с отворен код.' },
  ]},
  { title: 'Речник', intro: 'Бързи дефиниции на ключови термини.', sections: [
    { title: 'А–Й', body: '**Анонимна функция** — функция без име.\n**Затваряне** — функция, която улавя променливи от лексикалния си обхват.\n**Вечен** — модификатор за неизменими обвързвания.' },
    { title: 'К–Р', body: '**Колекция** — списък или речник.\n**Ламбда** — синоним за анонимна функция.\n**Морф** — вградена за конверсия на типове.' },
    { title: 'С–Я', body: '**Обект** — инстанция на клас.\n**Обещание** — стойност, която ще пристигне по-късно.\n**ВМ** — байткод виртуалната машина.' },
  ]},
  { title: 'Приложения', intro: '', sections: [
    { title: 'A. Справочник на ключови думи', body: '`forge`, `be`, `eternal`, `if`, `then`, `else`, `when`, `is`, `while`, `until`, `for`, `in`, `escape`, `skip`, `conjure`, `yield`, `return`, `essence`, `summon`, `share`, `extends`, `me`, `ancestor`, `attempt`, `rescue`, `finally`, `raise`, `dispatch`, `await`, `js`, `end`.' },
    { title: 'B. Справочник на оператори', body: '`+ - * / % ** //`, `== != < > <= >=`, `and or not`, `equals differs above below`, `in`, `=>`.' },
    { title: 'C. Индекс на вградени функции', body: 'Виж глава 16. Пълен индекс в `SDEV_DOCUMENTATION.md`.' },
    { title: 'D. Изходни езици', body: '26 езика са поддържани, включително български, английски, испански, френски, немски, руски, китайски, японски, корейски и арабски.' },
  ]},
];

function render(chapters: Chapter[], title: string, lang: 'en'|'bg'): string {
  const lines: string[] = [];
  lines.push(`# ${title}\n`);
  lines.push(lang === 'bg'
    ? '_Изчерпателен наръчник за програмния език sdev._\n'
    : '_The comprehensive reference for the sdev programming language._\n');
  lines.push('---\n');
  lines.push(lang === 'bg' ? '## Съдържание\n' : '## Table of Contents\n');
  chapters.forEach((c, i) => {
    lines.push(`${i+1}. [${c.title}](#${i+1}-${c.title.toLowerCase().replace(/[^a-zа-я0-9]+/gi,'-')})`);
  });
  lines.push('\n---\n');
  chapters.forEach((c, i) => {
    lines.push(`\n## ${i+1}. ${c.title}\n`);
    if (c.intro) lines.push(`${c.intro}\n`);
    c.sections.forEach((s, j) => {
      lines.push(`\n### ${i+1}.${j+1} ${s.title}\n`);
      lines.push(`${s.body}\n`);
    });
  });
  lines.push('\n---\n');
  lines.push(lang === 'bg'
    ? '*Край на книгата. Версия 1.0. © sdev език.*\n'
    : '*End of book. Version 1.0. © sdev language.*\n');
  return lines.join('\n');
}

const en = render(EN_CHAPTERS, 'The sdev Book', 'en');
const bg = render(BG_CHAPTERS, 'Книгата за sdev', 'bg');

fs.writeFileSync(path.join('public', 'sdev-book-en.md'), en);
fs.writeFileSync(path.join('public', 'sdev-book-bg.md'), bg);
console.log(`EN: ${en.length} chars, BG: ${bg.length} chars`);
