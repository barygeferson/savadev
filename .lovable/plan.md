# Plan — Hardware/Arduino Support for sdev

Big task, so split into 3 phases. Phase 1 is a prerequisite (you said the compiler is incomplete); phase 2 and 3 are the actual hardware features. Each phase ends with a test pass before moving on.

---

## Phase 1 — Finish the bytecode compiler (parity with interpreter)

Goal: the compiler/VM can run every documented sdev program the interpreter runs. Right now several language features compile to `NOP` or aren't emitted at all (loops with `break`/`continue`, `for ... in`, `try/catch/throw`, classes, `summon`/`link`, `js { }`, dictionaries-as-l-values, spread, pattern matching, async/`task`, channels, `defer`, `with`/context blocks, string interpolation, slicing).

Approach:
1. **Audit pass.** Walk every AST node kind in `src/lang/ast.ts` and every documented construct in `public/SDEV_DOCUMENTATION.md` + `SDEV_LEAFLET_DOCUMENTATION.md`. Produce a coverage table: node → compiler emit → VM op.
2. **Add missing opcodes** to `src/lang/bytecode.ts`: `FOR_ITER`, `BREAK`/`CONTINUE` patch points, `THROW`, `TRY_PUSH`/`TRY_POP`, `CLASS_DEF`, `NEW`, `METHOD_CALL`, `IMPORT`, `SPREAD`, `SLICE`, `STR_FORMAT`, `AWAIT`, `CHAN_SEND`/`CHAN_RECV`, `DEFER_PUSH`.
3. **Implement them** in `src/lang/compiler.ts` and `src/lang/vm.ts`. Reuse interpreter helpers (`graphics`, `web`, `kernel`, `matrix`, `builtins`) by exposing builtin calls through `SYSCALL` so the VM doesn't re-implement them.
4. **Snapshot test harness.** New `scripts/test-compiler-parity.ts` that takes every `.sdev` example in `public/`, `scripts/test-*`, and the docs' code fences, runs it through both the interpreter and the VM, and diffs stdout. Phase 1 is done when the diff is empty.
5. Update `scripts/_compiler-entry.ts` so the CLI's `run --vm` no longer needs the silent interpreter fallback.

## Phase 2 — `board { }` hardware DSL in sdev

Goal: write Arduino-style sketches in sdev syntax and compile them to firmware that runs on a real board.

New module `src/lang/board.ts` exposing the same surface Arduino sketches use, but with sdev keywords:

```
board "uno" {
  conjure setup() {
    pin 13 be output
    serial begin 9600
  }
  conjure loop() {
    pin 13 write high
    wait 500
    pin 13 write low
    wait 500
  }
}
```

Builtins added (mirrors the full Arduino core API):
- Digital: `pinMode`, `digitalWrite`, `digitalRead`
- Analog: `analogRead`, `analogWrite`, `analogReference`
- Time: `delay`, `delayMicroseconds`, `millis`, `micros`
- Serial: `Serial.begin/print/println/read/available/write`
- Advanced: `tone`/`noTone`, `pulseIn`, `shiftIn`/`shiftOut`, `attachInterrupt`/`detachInterrupt`, `EEPROM.read/write`, `Wire` (I²C), `SPI`
- Board targets: Uno, Nano, Mega, Leonardo, ESP32, ESP8266, RP2040 (Pico), Teensy

Two compilation paths (both produced by the same `board { }` block):

a. **Native firmware via arduino-cli.** A new edge function `supabase/functions/compile-firmware/index.ts` accepts the sdev source, transpiles `board { }` to a valid `.ino` (the sdev→C++ mapping lives in `src/lang/board-emitter.ts`), shells out to `arduino-cli compile --fqbn <board> --output-dir /tmp` inside the function's container, and returns the resulting `.hex`/`.bin`. This is the path that supports the full Arduino library ecosystem unchanged — libraries stay C++, sdev is just the source language.
b. **Simulation in the IDE.** A pure-JS interpreter for `board { }` so users can test sketches in the browser without a board (drives the existing `CanvasPanel` with an LED/breadboard widget). Useful for the docs/playground.

## Phase 3 — IDE integration (detect board, upload, manage libraries)

New panel `src/components/ide/HardwarePanel.tsx` next to the existing terminal:

1. **Detect Board** button — uses the **Web Serial API** (`navigator.serial.requestPort()`) to list connected devices. Parses USB VID/PID against a bundled table (`src/lang/hardware/board-db.ts` — Arduino VIDs `0x2341`, `0x2A03`, ESP `0x10C4`/`0x1A86`, etc.) to auto-identify the board and pre-select the FQBN. Falls back to a manual board picker.
2. **Upload to Board** button — calls `compile-firmware`, receives the `.hex`, then flashes it from the browser using a Web Serial port:
   - AVR (Uno/Nano/Mega) → bundled JS port of `avrdude`'s STK500 protocol (`src/lang/hardware/stk500.ts`).
   - ESP32/ESP8266 → bundled `esptool-js` (already an npm package, MIT-licensed).
   - RP2040 → UF2 drag-drop helper (download the `.uf2`, show "drop on RPI-RP2 drive").
3. **Serial Monitor** tab — opens the same Web Serial port post-upload, streams I/O into the terminal at the chosen baud rate. Includes a send-line input and a baud selector.
4. **Library Manager** dialog:
   - Backed by Arduino's public library index JSON (`https://downloads.arduino.cc/libraries/library_index.json`). Mirrored once into Supabase storage (`hardware-libraries` bucket) and refreshed daily by a cron edge function so the IDE doesn't hit Arduino's CDN per user.
   - Search, install, uninstall, version pin. Installed libraries are stored per-user in the existing cloud-files table under `~/libraries/<name>@<version>/`.
   - At compile time, `compile-firmware` materialises the selected library set into `arduino-cli`'s sketchbook before invoking it. No translation — Arduino's C++ libraries work as-is because the firmware path is real C++.
   - For the in-browser simulator, only libraries we explicitly shim are available; library manager flags simulator support per library.
5. Settings panel additions: default board, default port, upload speed, auto-detect on focus.

## Out of scope for this round
- Bluetooth/BLE flashing (Web Bluetooth on AVR is unreliable). Web Serial only.
- Cloud-side firmware caching (build per upload).
- Mobile IDE — Web Serial is Chromium-desktop-only; we'll show a graceful "unsupported browser" notice.

## Technical Notes
- **No new runtime dependencies in the frontend bundle beyond `esptool-js`.** The STK500 implementation is ~400 lines, written in TS, no deps.
- **`arduino-cli` in the edge function:** baked into the function's Docker image; first cold start ~3s. If that's too slow we can move firmware compilation to a small dedicated VM and call it from the edge function.
- **Security:** Web Serial requires user gesture + per-origin permission; uploads only run after the user clicks "Upload" each session unless they tick "remember this port".
- **Docs:** new `public/SDEV_HARDWARE_DOCUMENTATION.md` written alongside the code so the AI assistants index it (per existing memory rule on doc parity).

---

I'll execute the phases strictly in order and not move on until each phase's tests pass. Ready to start Phase 1 on approval — say the word and I'll begin the compiler audit.
