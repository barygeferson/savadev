import { translateSource } from '../src/lang/translator';
import { execute } from '../src/lang/index';
const src = `есенция Кръг ::
  създай инит(себе_си, радиус) ::
    себе_си.радиус да бъде радиус
    ;;
  създай лице(себе_си) ::
    върни PI * себе_си.радиус ^ 2
    ;;
  ;;
създай кръгче да бъде нов Кръг(5)
кажи(кръгче.лице())`;
const t = translateSource(src, 'auto');
console.log('=== TRANSLATED ===');
console.log(t.translated);
console.log('=== LANG:', t.detectedLanguage);
const r = execute(src);
console.log('SUCCESS:', r.success, 'OUTPUT:', r.output, 'ERR:', r.error);
