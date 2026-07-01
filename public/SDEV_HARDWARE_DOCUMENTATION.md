# SDEV Hardware Documentation

Program microcontrollers (Arduino, ESP32, ESP8266, Raspberry Pi Pico, Teensy, and more) directly in sdev. This document covers the `board { }` DSL, the compiler/uploader pipeline, the Hardware panel in the IDE, and the Arduino Library Manager integration.

---

## 1. Overview

sdev's hardware layer lets you write firmware in sdev syntax that transpiles to Arduino-compatible C++ and is uploaded to a physical board over Web Serial. Everything Arduino's C++ ecosystem supports — libraries, sensors, actuators, protocols — is available, because the underlying compilation path is real `arduino-cli`.

Two ways to run hardware code:
1. **Real board** — write a `board { }` block, hit Upload, sdev transpiles → `.ino` → `arduino-cli` compiles → firmware flashed over USB.
2. **Simulation (roadmap)** — future in-browser simulator that runs `board { }` blocks in the IDE's Canvas panel.

---

## 2. The `board { }` block

A `board { }` block is a hardware sketch. It is stripped from the file before the normal sdev interpreter runs, so a mixed file (sdev on desktop + firmware on device) is legal.

```sdev
board "uno" {
  conjure setup() ::
    pin 13 be output
    serial begin 9600
  ;;

  conjure loop() ::
    pin 13 write high
    wait 500
    pin 13 write low
    wait 500
  ;;
}
```

### Board targets

The string after `board` selects the target. Supported ids:

| Id | Board | MCU | Uploader |
|----|-------|-----|----------|
| `uno` | Arduino Uno R3 | ATmega328P | STK500 |
| `nano` | Arduino Nano | ATmega328P | STK500 |
| `nano-old` | Arduino Nano (168) | ATmega168 | STK500 |
| `mega` | Arduino Mega 2560 | ATmega2560 | STK500 |
| `leonardo` | Arduino Leonardo | ATmega32U4 | STK500 |
| `micro` | Arduino Micro | ATmega32U4 | STK500 |
| `esp32` | ESP32 DevKit | ESP32 | esptool |
| `esp32-s3` | ESP32-S3 DevKit | ESP32-S3 | esptool |
| `esp8266` | NodeMCU | ESP8266 | esptool |
| `pico` | Raspberry Pi Pico | RP2040 | UF2 drop |
| `teensy41` | Teensy 4.1 | iMXRT1062 | arduino-cli |

### Required entry points

- `setup()` — runs once at boot.
- `loop()` — runs forever after `setup()` returns.

Both are declared with `conjure` like any other sdev function.

---

## 3. Hardware statements

Inside a `board { }` block, the following sdev statements transpile to Arduino C++:

### Pin configuration
```
pin 13 be output       // pinMode(13, OUTPUT);
pin 2  be input        // pinMode(2,  INPUT);
pin 2  be input_pullup // pinMode(2,  INPUT_PULLUP);
```

### Digital I/O
```
pin 13 write high      // digitalWrite(13, HIGH);
pin 13 write low       // digitalWrite(13, LOW);
forge v be pin 2 read  // int v = digitalRead(2);
```

### Analog I/O
```
forge x be analog 0 read       // analogRead(A0);
analog 9 write 128             // analogWrite(9, 128);  (PWM, 0-255)
```

### Timing
```
wait 500          // delay(500);
wait_us 100       // delayMicroseconds(100);
forge t be now()  // millis();
forge u be nowus() // micros();
```

### Serial
```
serial begin 9600         // Serial.begin(9600);
serial print "hello"      // Serial.print("hello");
serial println x          // Serial.println(x);
forge b be serial read    // Serial.read();
forge n be serial avail   // Serial.available();
```

### Advanced (pass-through emitted verbatim)
```
tone 8 440 200
notone 8
forge d be pulsein 3 high 1000000
shiftout 11 12 msbfirst 0xAA
attach 0 rising conjure()  ISR
detach 0
```

### Library includes

Any Arduino C++ library becomes usable with `use`:

```sdev
board "uno" {
  use "Servo"
  use "Wire"
  use "Adafruit_NeoPixel"

  conjure setup() :: ... ;;
  conjure loop()  :: ... ;;
}
```

`use "X"` emits `#include <X.h>` and marks the library as required so the Library Manager materialises it into the sketchbook before `arduino-cli compile` runs.

### Raw C++ escape hatch
```
cpp {
  Servo s;
  s.attach(9);
  s.write(90);
}
```
Everything inside `cpp { ... }` is copied byte-for-byte into the generated `.ino`. Use it for anything the DSL doesn't cover natively.

---

## 4. The Hardware panel (IDE)

Open the IDE's left sidebar and click the **USB** icon to reveal the Hardware panel. It contains:

### 4.1 Board picker
Dropdown of every board in the catalogue. The selection is written into the transpiled sketch as the target FQBN (fully qualified board name). Auto-populated after **Detect Board** succeeds.

### 4.2 Detect Board
Requests a Web Serial port. The USB VID/PID reported by the port is matched against `src/lang/hardware/board-db.ts` to auto-identify:

- Arduino VIDs `0x2341`, `0x2A03`
- CH340 clones `0x1A86:0x7523`
- CP210x clones `0x10C4:0xEA60`
- FTDI `0x0403:0x6001`
- ESP32-S3 native USB `0x303A:0x1001`
- Raspberry Pi Pico `0x2E8A`
- Teensy `0x16C0`

If the VID/PID isn't recognised, you can still pick the board manually.

### 4.3 Compile
Sends the current file to the `compile-firmware` edge function, which:
1. Extracts and transpiles the `board { }` block to `.ino`.
2. Merges the selected library set into the `arduino-cli` sketchbook.
3. Runs `arduino-cli compile --fqbn <FQBN>` and returns the resulting `.hex` (AVR), `.bin` (ESP), or `.uf2` (RP2040).

If no build server is configured (`ARDUINO_BUILD_URL` unset), the function returns the generated `.ino` so you can build it locally in the Arduino IDE.

### 4.4 Upload
Compiles (if not already), then flashes the firmware over the selected Web Serial port:

- **AVR (Uno / Nano / Mega / Leonardo / Micro)** — bundled JS implementation of the STK500v1 bootloader protocol (`src/lang/hardware/web-serial.ts`).
- **ESP32 / ESP8266** — hands the `.bin` to `esptool-js`.
- **RP2040 Pico** — downloads the `.uf2` and prompts you to drop it on the `RPI-RP2` mass-storage volume.

### 4.5 Serial Monitor
After upload, reopens the same port at the chosen baud rate and streams I/O into the panel. Includes a send-line input and a baud selector (300 – 2 000 000).

### 4.6 Library Manager
Backed by Arduino's official index (`https://downloads.arduino.cc/libraries/library_index.json`). Search, install, uninstall, version-pin. Installed libraries live per-user under `~/libraries/<name>@<version>/`.

Because the firmware path is real C++, **every** Arduino library works unchanged — Servo, Adafruit_NeoPixel, FastLED, PubSubClient, Wire, SPI, ArduinoJson, LiquidCrystal, DHT sensor, all of them.

---

## 5. Bytecode compiler additions

The bytecode compiler (`src/lang/compiler.ts` → `src/lang/vm.ts`) was brought up to interpreter parity as part of the hardware work. What changed:

### 5.1 Loop control
`while`, `iterate ... through` (forEach), and `iterate ... in` (forIn) now compile through a shared `compileIndexedForLoop` helper that maintains a `LoopContext` stack:

```ts
interface LoopContext {
  breakJumps: number[];    // patched to loop exit
  continueJumps: number[]; // patched to loop's continue target
}
```

- `break`   — emits `JUMP -1`, index recorded in the current loop's `breakJumps`, patched to the instruction after the loop.
- `continue` — emits `JUMP -1`, recorded in `continueJumps`, patched to the loop's step/condition instruction.

Previously these compiled to `NOP` and silently did nothing.

### 5.2 New / clarified opcodes

See `src/lang/bytecode.ts` for the full list. Highlights:

- **Control flow patching**: `JUMP`, `JUMP_IF_FALSE`, `JUMP_IF_TRUE` all support post-hoc target patching via `patchJump()` / `patchJumpTo()`.
- **Bitwise**: `BIT_AND`, `BIT_OR`, `BIT_XOR`, `BIT_NOT`, `BIT_SHL`, `BIT_SHR` — needed for register-level firmware work.
- **Systems**: `SYSCALL`, `ALLOC`, `FREE`, `HEAP_LOAD`, `HEAP_STORE`, `INTERRUPT`.
- **Tasks**: `TASK_CREATE`, `TASK_YIELD`, `TASK_KILL`.

### 5.3 Binary format

`serializeChunk()` / `deserializeChunk()` in `src/lang/bytecode.ts`:
```
magic (u32 LE) | version (u32 LE) | payloadLen (u32 LE) | payload (JSON)
```
Magic is `0x53444556` ("SDEV"). Current `BYTECODE_VERSION = 2`.

---

## 6. Runtime files added / touched

| File | Purpose |
|------|---------|
| `src/lang/hardware/strip.ts` | Removes `board { }` blocks before the sdev interpreter runs. |
| `src/lang/hardware/transpile.ts` | sdev → `.ino` C++ transpiler. |
| `src/lang/hardware/board-db.ts` | Board catalogue + USB VID/PID lookup. |
| `src/lang/hardware/web-serial.ts` | Web Serial wrapper, Intel HEX parser, STK500v1 flasher, serial monitor helper. |
| `src/components/ide/HardwarePanel.tsx` | UI: board picker, detect, compile, upload, serial monitor, library manager. |
| `supabase/functions/compile-firmware/index.ts` | Edge proxy to `arduino-cli`; falls back to returning `.ino` when no build server is configured. |
| `src/pages/IDE.tsx` | Registers the Hardware sidebar tab and ships a `blink.sdev` starter file. |
| `src/lang/compiler.ts` | Loop context stack, `break` / `continue` patching. |
| `src/lang/index.ts` | Calls `stripBoardBlocks()` before lex/parse. |

---

## 7. Quick reference: the blink starter

```sdev
board "uno" {
  conjure setup() ::
    pin 13 be output
  ;;

  conjure loop() ::
    pin 13 write high
    wait 500
    pin 13 write low
    wait 500
  ;;
}
```

Steps:
1. Plug in an Uno.
2. Hardware panel → **Detect Board** → confirm "Arduino Uno".
3. **Upload** → LED on pin 13 blinks at 1 Hz.

---

## 8. Browser support

Web Serial is Chromium-only (Chrome, Edge, Opera, Brave, Arc) on desktop. Firefox and Safari will see a "Web Serial not supported" notice; use Chromium for uploading. The rest of the IDE works everywhere.

---

## 9. Security notes

- Web Serial requires an explicit user gesture and per-origin permission. sdev never opens a port without you clicking **Detect** or **Upload**.
- The `compile-firmware` edge function validates the incoming source length and rejects payloads over the configured cap.
- No library binaries are ever executed in the browser — Arduino libraries only run on the target MCU after flashing.

---

*Hardware support is additive. Non-hardware sdev programs are unaffected; the `board { }` block is invisible to the standard interpreter and VM.*
