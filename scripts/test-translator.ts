import { translateSource } from '../src/lang/translator';
import { execute } from '../src/lang/index';

const cases: [string, string, string][] = [
  ['Bulgarian', 'нека х бъде 5\nкажи(х)', 'forge х be 5\nspeak(х)'],
  ['Spanish',   'forjar x ser 10\nhablar(x)', 'forge x be 10\nspeak(x)'],
  ['Russian',   'создать y быть 7\nсказать(y)', 'forge y be 7\nspeak(y)'],
  ['Bulgarian-multiword', 'ако x равно 5 ::\n  кажи("yes")\n;;', 'ponder x equals 5 ::'],
  ['String-preserved', 'кажи("ако казва нещо")', 'speak("ако казва нещо")'],
  ['Comment-preserved',  'кажи("hi") # това е коментар', '# това е коментар'],
];

let pass = 0, fail = 0;
for (const [name, src, expectFragment] of cases) {
  const { translated, detectedLanguage } = translateSource(src, 'auto');
  const ok = translated.includes(expectFragment);
  console.log(`${ok ? '✓' : '✗'} [${name}] detected=${detectedLanguage}`);
  console.log(`   in:  ${JSON.stringify(src)}`);
  console.log(`   out: ${JSON.stringify(translated)}`);
  if (ok) pass++; else fail++;
}

console.log('\n--- end-to-end execute() ---');
const programs: [string, string, string][] = [
  ['Bulgarian', 'нека х бъде 5\nкажи("резултат:", х * 2)', 'резултат: 10'],
  ['Spanish',   'forjar saludo ser "Hola"\nhablar(saludo)', 'Hola'],
  ['Russian',   'создать n быть 3\nцикл n > 0 ::\n  сказать(n)\n  n быть n - 1\n;;', '3'],
  ['English-pass-through', 'forge x be 42\nspeak(x)', '42'],
];
for (const [name, src, expect] of programs) {
  const r = execute(src);
  const out = r.output.join('\n');
  const ok = r.success && out.includes(expect);
  console.log(`${ok ? '✓' : '✗'} [${name}] detected=${r.detectedLanguage}`);
  console.log(`   output: ${JSON.stringify(out)}`);
  if (r.error) console.log(`   ERROR: ${r.error}`);
  if (ok) pass++; else fail++;
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
