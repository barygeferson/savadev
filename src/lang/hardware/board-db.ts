// ============================================================
// sdev hardware — board catalogue
// ============================================================
// FQBN (Fully Qualified Board Name) matches arduino-cli conventions.

export interface BoardDescriptor {
  id: string;            // sdev short id ("uno", "nano", "esp32", ...)
  label: string;         // human-readable
  fqbn: string;          // arduino-cli FQBN
  vendor: string;
  mcu: string;
  flashKb: number;
  ramKb: number;
  uploader: 'avrdude-stk500' | 'esptool' | 'uf2' | 'arduino-cli';
  // USB ids reported by the bootloader / built-in USB-serial bridge.
  usb: { vid: number; pid: number; note?: string }[];
}

export const BOARDS: BoardDescriptor[] = [
  {
    id: 'uno',
    label: 'Arduino Uno (R3)',
    fqbn: 'arduino:avr:uno',
    vendor: 'Arduino',
    mcu: 'ATmega328P',
    flashKb: 32, ramKb: 2,
    uploader: 'avrdude-stk500',
    usb: [
      { vid: 0x2341, pid: 0x0043 },
      { vid: 0x2341, pid: 0x0001 },
      { vid: 0x2A03, pid: 0x0043 },
      { vid: 0x1A86, pid: 0x7523, note: 'CH340 clone' },
      { vid: 0x10C4, pid: 0xEA60, note: 'CP210x clone' },
    ],
  },
  {
    id: 'nano',
    label: 'Arduino Nano (ATmega328P)',
    fqbn: 'arduino:avr:nano:cpu=atmega328',
    vendor: 'Arduino',
    mcu: 'ATmega328P',
    flashKb: 32, ramKb: 2,
    uploader: 'avrdude-stk500',
    usb: [
      { vid: 0x0403, pid: 0x6001, note: 'FTDI' },
      { vid: 0x1A86, pid: 0x7523, note: 'CH340' },
    ],
  },
  {
    id: 'nano-old',
    label: 'Arduino Nano (ATmega168, old bootloader)',
    fqbn: 'arduino:avr:nano:cpu=atmega168',
    vendor: 'Arduino',
    mcu: 'ATmega168',
    flashKb: 16, ramKb: 1,
    uploader: 'avrdude-stk500',
    usb: [{ vid: 0x1A86, pid: 0x7523 }],
  },
  {
    id: 'mega',
    label: 'Arduino Mega 2560',
    fqbn: 'arduino:avr:mega:cpu=atmega2560',
    vendor: 'Arduino',
    mcu: 'ATmega2560',
    flashKb: 256, ramKb: 8,
    uploader: 'avrdude-stk500',
    usb: [
      { vid: 0x2341, pid: 0x0042 },
      { vid: 0x2341, pid: 0x0010 },
      { vid: 0x2A03, pid: 0x0042 },
    ],
  },
  {
    id: 'leonardo',
    label: 'Arduino Leonardo',
    fqbn: 'arduino:avr:leonardo',
    vendor: 'Arduino',
    mcu: 'ATmega32U4',
    flashKb: 32, ramKb: 2.5,
    uploader: 'avrdude-stk500',
    usb: [
      { vid: 0x2341, pid: 0x8036 },
      { vid: 0x2341, pid: 0x0036 },
    ],
  },
  {
    id: 'micro',
    label: 'Arduino Micro',
    fqbn: 'arduino:avr:micro',
    vendor: 'Arduino',
    mcu: 'ATmega32U4',
    flashKb: 32, ramKb: 2.5,
    uploader: 'avrdude-stk500',
    usb: [{ vid: 0x2341, pid: 0x8037 }],
  },
  {
    id: 'esp32',
    label: 'ESP32 DevKit (generic)',
    fqbn: 'esp32:esp32:esp32',
    vendor: 'Espressif',
    mcu: 'ESP32',
    flashKb: 4096, ramKb: 520,
    uploader: 'esptool',
    usb: [
      { vid: 0x10C4, pid: 0xEA60, note: 'CP2102' },
      { vid: 0x1A86, pid: 0x7523, note: 'CH340' },
      { vid: 0x1A86, pid: 0x55D4, note: 'CH9102' },
    ],
  },
  {
    id: 'esp32-s3',
    label: 'ESP32-S3 DevKit',
    fqbn: 'esp32:esp32:esp32s3',
    vendor: 'Espressif',
    mcu: 'ESP32-S3',
    flashKb: 8192, ramKb: 512,
    uploader: 'esptool',
    usb: [{ vid: 0x303A, pid: 0x1001 }],
  },
  {
    id: 'esp8266',
    label: 'ESP8266 NodeMCU',
    fqbn: 'esp8266:esp8266:nodemcuv2',
    vendor: 'Espressif',
    mcu: 'ESP8266',
    flashKb: 4096, ramKb: 80,
    uploader: 'esptool',
    usb: [
      { vid: 0x1A86, pid: 0x7523, note: 'CH340' },
      { vid: 0x10C4, pid: 0xEA60, note: 'CP2102' },
    ],
  },
  {
    id: 'pico',
    label: 'Raspberry Pi Pico (RP2040)',
    fqbn: 'rp2040:rp2040:rpipico',
    vendor: 'Raspberry Pi',
    mcu: 'RP2040',
    flashKb: 2048, ramKb: 264,
    uploader: 'uf2',
    usb: [
      { vid: 0x2E8A, pid: 0x0003, note: 'RPI-RP2 bootloader' },
      { vid: 0x2E8A, pid: 0x000A },
    ],
  },
  {
    id: 'teensy41',
    label: 'Teensy 4.1',
    fqbn: 'teensy:avr:teensy41',
    vendor: 'PJRC',
    mcu: 'iMXRT1062',
    flashKb: 8192, ramKb: 1024,
    uploader: 'arduino-cli',
    usb: [{ vid: 0x16C0, pid: 0x0478 }],
  },
];

export function findBoardById(id: string): BoardDescriptor | undefined {
  return BOARDS.find(b => b.id === id);
}

export function detectBoardByUsb(vid: number, pid: number): BoardDescriptor | undefined {
  // Exact vid+pid first, then vid-only fallback for shared USB-serial bridges.
  let exact = BOARDS.find(b => b.usb.some(u => u.vid === vid && u.pid === pid));
  if (exact) return exact;
  return BOARDS.find(b => b.usb.some(u => u.vid === vid));
}
