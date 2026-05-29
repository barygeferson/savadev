// Localized strings for the launch countdown. Falls back to English.
type Strings = {
  title: string;
  subtitle: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  signIn: string;
  earlyAccess: string;
  launched: string;
  enter: string;
  launchLine: (date: string) => string;
};

const TABLE: Record<string, Strings> = {
  en: {
    title: 'sdev launches',
    subtitle: 'A new programming language for the modern web.',
    days: 'days', hours: 'hours', minutes: 'minutes', seconds: 'seconds',
    signIn: 'Sign in for early access',
    earlyAccess: 'Have early access?',
    launched: "We're live!",
    enter: 'Enter sdev',
    launchLine: (d) => `Official launch · ${d}`,
  },
  bg: {
    title: 'sdev стартира',
    subtitle: 'Нов програмен език за модерния уеб.',
    days: 'дни', hours: 'часа', minutes: 'минути', seconds: 'секунди',
    signIn: 'Влез за ранен достъп',
    earlyAccess: 'Имаш ранен достъп?',
    launched: 'Стартирахме!',
    enter: 'Влез в sdev',
    launchLine: (d) => `Официално откриване · ${d}`,
  },
  de: {
    title: 'sdev startet',
    subtitle: 'Eine neue Programmiersprache für das moderne Web.',
    days: 'Tage', hours: 'Stunden', minutes: 'Minuten', seconds: 'Sekunden',
    signIn: 'Anmelden für frühen Zugang',
    earlyAccess: 'Hast du frühen Zugang?',
    launched: 'Wir sind online!',
    enter: 'sdev öffnen',
    launchLine: (d) => `Offizieller Start · ${d}`,
  },
  fr: {
    title: 'sdev arrive',
    subtitle: 'Un nouveau langage de programmation pour le web moderne.',
    days: 'jours', hours: 'heures', minutes: 'minutes', seconds: 'secondes',
    signIn: 'Se connecter pour un accès anticipé',
    earlyAccess: 'Accès anticipé ?',
    launched: 'Nous sommes en ligne !',
    enter: 'Entrer dans sdev',
    launchLine: (d) => `Lancement officiel · ${d}`,
  },
  es: {
    title: 'sdev se lanza',
    subtitle: 'Un nuevo lenguaje de programación para la web moderna.',
    days: 'días', hours: 'horas', minutes: 'minutos', seconds: 'segundos',
    signIn: 'Inicia sesión para acceso anticipado',
    earlyAccess: '¿Tienes acceso anticipado?',
    launched: '¡Estamos en línea!',
    enter: 'Entrar a sdev',
    launchLine: (d) => `Lanzamiento oficial · ${d}`,
  },
  it: {
    title: 'sdev sta arrivando',
    subtitle: 'Un nuovo linguaggio di programmazione per il web moderno.',
    days: 'giorni', hours: 'ore', minutes: 'minuti', seconds: 'secondi',
    signIn: 'Accedi per anteprima',
    earlyAccess: 'Hai accesso anticipato?',
    launched: 'Siamo online!',
    enter: 'Entra in sdev',
    launchLine: (d) => `Lancio ufficiale · ${d}`,
  },
  pt: {
    title: 'sdev será lançado',
    subtitle: 'Uma nova linguagem de programação para a web moderna.',
    days: 'dias', hours: 'horas', minutes: 'minutos', seconds: 'segundos',
    signIn: 'Entrar para acesso antecipado',
    earlyAccess: 'Tem acesso antecipado?',
    launched: 'Estamos no ar!',
    enter: 'Entrar no sdev',
    launchLine: (d) => `Lançamento oficial · ${d}`,
  },
  ru: {
    title: 'sdev запускается',
    subtitle: 'Новый язык программирования для современного веба.',
    days: 'дней', hours: 'часов', minutes: 'минут', seconds: 'секунд',
    signIn: 'Войти для раннего доступа',
    earlyAccess: 'Есть ранний доступ?',
    launched: 'Мы запустились!',
    enter: 'Войти в sdev',
    launchLine: (d) => `Официальный запуск · ${d}`,
  },
  uk: {
    title: 'sdev запускається',
    subtitle: 'Нова мова програмування для сучасного вебу.',
    days: 'днів', hours: 'годин', minutes: 'хвилин', seconds: 'секунд',
    signIn: 'Увійти для раннього доступу',
    earlyAccess: 'Маєш ранній доступ?',
    launched: 'Ми онлайн!',
    enter: 'Увійти в sdev',
    launchLine: (d) => `Офіційний запуск · ${d}`,
  },
  pl: {
    title: 'sdev startuje',
    subtitle: 'Nowy język programowania dla nowoczesnego weba.',
    days: 'dni', hours: 'godzin', minutes: 'minut', seconds: 'sekund',
    signIn: 'Zaloguj się dla wczesnego dostępu',
    earlyAccess: 'Masz wczesny dostęp?',
    launched: 'Już działamy!',
    enter: 'Wejdź do sdev',
    launchLine: (d) => `Oficjalne uruchomienie · ${d}`,
  },
  tr: {
    title: 'sdev yayında',
    subtitle: 'Modern web için yeni bir programlama dili.',
    days: 'gün', hours: 'saat', minutes: 'dakika', seconds: 'saniye',
    signIn: 'Erken erişim için giriş yap',
    earlyAccess: 'Erken erişimin var mı?',
    launched: 'Yayındayız!',
    enter: "sdev'e gir",
    launchLine: (d) => `Resmi lansman · ${d}`,
  },
  ja: {
    title: 'sdev 公開',
    subtitle: 'モダンウェブのための新しいプログラミング言語。',
    days: '日', hours: '時間', minutes: '分', seconds: '秒',
    signIn: '早期アクセスでログイン',
    earlyAccess: '早期アクセスをお持ちですか？',
    launched: '公開しました！',
    enter: 'sdev に入る',
    launchLine: (d) => `公式リリース · ${d}`,
  },
  zh: {
    title: 'sdev 即将发布',
    subtitle: '为现代网络打造的新编程语言。',
    days: '天', hours: '小时', minutes: '分', seconds: '秒',
    signIn: '登录以获得抢先体验',
    earlyAccess: '有抢先体验权限？',
    launched: '我们上线了！',
    enter: '进入 sdev',
    launchLine: (d) => `正式发布 · ${d}`,
  },
};

export function getCountdownStrings(): Strings {
  if (typeof navigator === 'undefined') return TABLE.en;
  const lang = (navigator.language || 'en').toLowerCase().split('-')[0];
  return TABLE[lang] || TABLE.en;
}

export function formatLaunchDate(d: Date): string {
  if (typeof navigator === 'undefined') return d.toISOString();
  try {
    return new Intl.DateTimeFormat(navigator.language, {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return d.toString();
  }
}
