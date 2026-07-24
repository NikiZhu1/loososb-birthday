const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px 80px' }
  );

  reveals.forEach((element) => observer.observe(element));
  document.documentElement.classList.add('animations-ready');
}

const form = document.querySelector('#password-form');
const password = document.querySelector('#password');
const message = document.querySelector('#form-message');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!password.value.trim()) {
    message.textContent = 'Сначала введи секретное слово.';
    password.focus();
    return;
  }

  message.textContent = 'Сигнал принят. Но время ещё не пришло.';
  password.value = '';
});

const showcase = document.querySelector('#model-showcase');
const modelCards = [...document.querySelectorAll('.model-card')];
const heroCopy = document.querySelector('#hero-copy');
const heroKicker = document.querySelector('#hero-kicker');
const heroTitle = document.querySelector('#hero-title');
const heroLead = document.querySelector('#hero-lead');
const showcaseCount = document.querySelector('#showcase-count');
const hero = document.querySelector('.hero');
const heroVideo = document.querySelector('.hero-video');
const heroVideoSources = {
  denis4: 'assets/videos/бой.mp4',
  chemical: 'assets/videos/охрана.mp4',
  cameraman: 'assets/videos/flight1.mp4',
};
const sectionGlitchTitles = [...document.querySelectorAll('.section-glitch-title')];
let sectionGlitchTimer;

const POINTER_TURN_X = -20;
const POINTER_TURN_Y = -5;
const SIDE_TURN = 10;
const modelOrbits = new Map();

modelCards.forEach((card) => {
  const viewer = card.querySelector('model-viewer');
  if (!viewer) return;

  const [theta = '0deg', phi = '75deg', radius = 'auto'] =
    viewer.getAttribute('camera-orbit')?.trim().split(/\s+/) ?? [];

  modelOrbits.set(viewer, {
    theta: Number.parseFloat(theta),
    phi: Number.parseFloat(phi),
    radius,
  });
});

const setCardOrbit = (card, thetaOffset = 0, phiOffset = 0) => {
  const viewer = card?.querySelector('model-viewer');
  const baseOrbit = modelOrbits.get(viewer);
  if (!viewer || !baseOrbit) return;

  viewer.setAttribute(
    'camera-orbit',
    `${baseOrbit.theta + thetaOffset}deg ${baseOrbit.phi + phiOffset}deg ${baseOrbit.radius}`
  );
};

const setOrbitForPosition = (card, position) => {
  const sideOffset = position === 'left' ? -SIDE_TURN : position === 'right' ? SIDE_TURN : 0;
  setCardOrbit(card, sideOffset);
};

document.querySelectorAll('model-viewer[data-model-source]').forEach((viewer) => {
  const source = window.MODEL_SOURCES?.[viewer.dataset.modelSource];
  if (source) viewer.setAttribute('src', source);
});

const modelContent = {
  denis4: {
    kicker: 'Роль 01 · Guests',
    title: '<span class="hero-title-line" data-text="ПРИГЛАШЁННЫЕ">ПРИГЛАШЁННЫЕ</span><br><span class="hero-character-name" data-text="ГОСТИ">ГОСТИ</span>',
    lead: 'Те, кому повезло обзавестись кодом испытаний<br/> на событие FISH EXECUTION',
  },
  cameraman: {
    kicker: 'Роль 02 · Cameraman',
    title: '<span class="hero-title-line" data-text="ВСЕ В КАДРЕ">ВСЕ В КАДРЕ</span><br><span class="hero-character-name" data-text="Камерамен">Камерамен</span>',
    lead: 'Глаза и уши стрима<br>Операторы не умирают.',
  },
  chemical: {
    kicker: 'Роль 03 · Security',
    title: '<span class="hero-title-line" data-text="ОПАСНАЯ ЗОНА">ОПАСНАЯ ЗОНА</span><br><span class="hero-character-name" data-text="ОХРАННИК">ОХРАННИК</span>',
    lead: 'Исполнительный орган.<br>Неразговорчивы...',
  },
};

let activeModel = 0;
let autoplayTimer;
let copyTimer;
let glitchTimer;
let randomGlitchTimer;

const playTitleGlitch = () => {
  const titleParts = [...(heroTitle?.querySelectorAll('[data-text]') ?? [])];
  const activeCard = modelCards[activeModel];
  if (!heroTitle || !titleParts.length) return;

  modelCards.forEach((card) => card.classList.remove('is-model-glitching'));
  titleParts.forEach((part) => {
    part.dataset.text = part.textContent;
    part.classList.remove('is-glitching');
  });
  heroTitle.classList.remove('is-glitching');
  void heroTitle.offsetWidth;
  heroTitle.classList.add('is-glitching');
  titleParts.forEach((part) => part.classList.add('is-glitching'));
  activeCard?.classList.add('is-model-glitching');

  window.clearTimeout(glitchTimer);
  glitchTimer = window.setTimeout(() => {
    heroTitle.classList.remove('is-glitching');
    titleParts.forEach((part) => part.classList.remove('is-glitching'));
    modelCards.forEach((card) => card.classList.remove('is-model-glitching'));
  }, 720);
};

const scheduleNextGlitch = () => {
  window.clearTimeout(randomGlitchTimer);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const delay = 6000 + Math.random() * 5000;
  randomGlitchTimer = window.setTimeout(() => {
    playTitleGlitch();
    scheduleNextGlitch();
  }, delay);
};

const playSectionGlitch = () => {
  sectionGlitchTitles.forEach((title) => {
    const parts = [...title.querySelectorAll('.section-glitch')];
    title.classList.remove('is-glitching');
    parts.forEach((part) => part.classList.remove('is-glitching'));
    void title.offsetWidth;
    title.classList.add('is-glitching');
    parts.forEach((part) => part.classList.add('is-glitching'));
  });

  window.setTimeout(() => {
    sectionGlitchTitles.forEach((title) => {
      title.classList.remove('is-glitching');
      title.querySelectorAll('.section-glitch').forEach((part) => part.classList.remove('is-glitching'));
    });
  }, 720);
};

const scheduleSectionGlitch = () => {
  window.clearTimeout(sectionGlitchTimer);
  if (!sectionGlitchTitles.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  sectionGlitchTimer = window.setTimeout(() => {
    playSectionGlitch();
    scheduleSectionGlitch();
  }, 7000 + Math.random() * 5000);
};

if (sectionGlitchTitles.length) {
  scheduleSectionGlitch();
}

const setHeroVideo = (modelName) => {
  const source = heroVideoSources[modelName];
  if (!heroVideo || !source || heroVideo.dataset.source === source) return;

  heroVideo.dataset.source = source;
  heroVideo.classList.add('is-changing');
  heroVideo.src = source;
  heroVideo.load();
  heroVideo.play().catch(() => {});
};

heroVideo?.addEventListener('canplay', () => heroVideo.classList.remove('is-changing'));

const setActiveModel = (nextIndex, resetAutoplay = true) => {
  if (!modelCards.length) return;

  activeModel = (nextIndex + modelCards.length) % modelCards.length;

  modelCards.forEach((card, index) => {
    const relativeIndex = (index - activeModel + modelCards.length) % modelCards.length;
    const position = relativeIndex === 0 ? 'center' : relativeIndex === 1 ? 'right' : 'left';
    const isActive = position === 'center';
    card.dataset.position = position;
    card.setAttribute('aria-current', isActive ? 'true' : 'false');
    card.tabIndex = isActive ? -1 : 0;
    setOrbitForPosition(card, position);
  });

  const activeCard = modelCards[activeModel];
  const content = modelContent[activeCard.dataset.model];
  setHeroVideo(activeCard.dataset.model);
  heroCopy?.classList.add('is-changing');
  window.clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => {
    if (heroKicker) heroKicker.textContent = content.kicker;
    if (heroTitle) heroTitle.innerHTML = content.title;
    if (heroLead) heroLead.innerHTML = content.lead;
    if (showcaseCount) showcaseCount.textContent = `${String(activeModel + 1).padStart(2, '0')} / ${String(modelCards.length).padStart(2, '0')}`;
    heroCopy?.classList.remove('is-changing');
    playTitleGlitch();
    scheduleNextGlitch();
  }, 180);

  if (resetAutoplay) startAutoplay();
};

const startAutoplay = () => {
  window.clearInterval(autoplayTimer);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  autoplayTimer = window.setInterval(() => setActiveModel(activeModel + 1, false), 30000);
};

modelCards.forEach((card, index) => {
  card.addEventListener('click', () => {
    if (index !== activeModel) setActiveModel(index);
  });
});

showcase?.addEventListener('pointerenter', () => window.clearInterval(autoplayTimer));
showcase?.addEventListener('pointerleave', startAutoplay);
showcase?.addEventListener('focusin', () => window.clearInterval(autoplayTimer));
showcase?.addEventListener('focusout', (event) => {
  if (!showcase.contains(event.relatedTarget)) startAutoplay();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    window.clearInterval(autoplayTimer);
    window.clearTimeout(randomGlitchTimer);
  } else {
    startAutoplay();
    scheduleNextGlitch();
  }
});

setActiveModel(0);

let orbitFrame;

hero?.addEventListener('pointermove', (event) => {
  if (event.pointerType && event.pointerType !== 'mouse') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;

  window.cancelAnimationFrame(orbitFrame);
  orbitFrame = window.requestAnimationFrame(() => {
    setCardOrbit(modelCards[activeModel], x * POINTER_TURN_X, y * POINTER_TURN_Y);
  });
});

hero?.addEventListener('pointerleave', () => {
  window.cancelAnimationFrame(orbitFrame);
  setCardOrbit(modelCards[activeModel]);
});

const donationWidget = document.querySelector('#donation-widget');
const donationValue = document.querySelector('#donation-total-value');
const donationCurrency = document.querySelector('#donation-total-currency');
const donationOtherTotals = document.querySelector('#donation-other-totals');
const donationStatus = document.querySelector('#donation-status');

const formatDonationAmount = (amount) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(amount);

const loadDonationTotal = async () => {
  if (!donationWidget) return false;

  const endpoint = donationWidget.dataset.endpoint || '';
  if (!endpoint || endpoint.includes('YOUR_SUBDOMAIN')) {
    donationWidget.dataset.state = 'warning';
    donationStatus.textContent = 'Укажите адрес Cloudflare Worker в index.html';
    return false;
  }

  try {
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);

    donationValue.textContent = formatDonationAmount(result.primary.amount);
    donationCurrency.textContent = result.primary.currency;

    const secondaryTotals = Object.entries(result.totals || {})
      .filter(([currency]) => currency !== result.primary.currency)
      .map(([currency, amount]) => `${formatDonationAmount(amount)} ${currency}`);
    donationOtherTotals.textContent = secondaryTotals.join(' · ');

    if (result.complete) {
      donationWidget.dataset.state = 'ready';
      donationStatus.textContent = `Учтено донатов: ${result.processedDonations}`;
    } else {
      donationWidget.dataset.state = 'warning';
      donationStatus.textContent = `Учтено ${result.processedDonations} из ${result.availableDonations}`;
    }
    return true;
  } catch (error) {
    donationWidget.dataset.state = 'error';
    donationStatus.textContent =
      error.message === 'not_connected'
        ? 'Подключите аккаунт через /admin/connect'
        : 'Не удалось получить сумму донатов';
    return false;
  }
};

loadDonationTotal();
if (
  donationWidget?.dataset.endpoint &&
  !donationWidget.dataset.endpoint.includes('YOUR_SUBDOMAIN')
) {
  window.setInterval(loadDonationTotal, 60_000);
}

document.addEventListener('DOMContentLoaded', function() {
  // Устанавливаем целевую дату (15 августа 2026 года)
  const targetDate = new Date('2026-08-15T00:00:00').getTime();
  const timerElement = document.getElementById('timer');

  // Функция для правильного склонения слов
  function declension(number, words) {
    // words = [одна, две, пять]
    // Например: declension(3, ['день', 'дня', 'дней']) → 'дня'
    const cases = [2, 0, 1, 1, 1, 2];
    const index = (number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)];
    return words[index];
  }

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      timerElement.textContent = '00:00:00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Правильные склонения
    const daysWord = declension(days, ['день', 'дня', 'дней']);
    const hoursWord = declension(hours, ['час', 'часа', 'часов']);
    const minutesWord = declension(minutes, ['минута', 'минуты', 'минут']);
    const secondsWord = declension(seconds, ['секунда', 'секунды', 'секунд']);

    // Формат ЧЧ:ММ:СС
    const formatted = 
      String(days).padStart(2, '0') + ' ' + daysWord + ' ' +
      String(hours).padStart(2, '0') + ' ' + hoursWord + ' ' +
      String(minutes).padStart(2, '0') + ' ' + minutesWord + ' ' +
      String(seconds).padStart(2, '0') + ' ' + secondsWord;

    timerElement.textContent = formatted;
  }

  // Запускаем таймер
  updateTimer();
  setInterval(updateTimer, 1000);
});

const flightCarousel = document.querySelector('.flight-carousel');

if (flightCarousel) {
  const flightVideo = flightCarousel.querySelector('.flight-video');
  const flightProgress = flightCarousel.querySelector('.flight-progress');
  const flightSteps = [...flightProgress.querySelectorAll('span')];
  const videos = flightCarousel.dataset.videos.split(',');
  let activeVideo = 0;
  let glitchTimer;

  const showFlightGlitch = () => {
    flightCarousel.classList.remove('is-switching');
    void flightCarousel.offsetWidth;
    flightCarousel.classList.add('is-switching');
    window.clearTimeout(glitchTimer);
    glitchTimer = window.setTimeout(() => flightCarousel.classList.remove('is-switching'), 450);
  };

  const updateFlightVideo = (nextIndex) => {
    activeVideo = (nextIndex + videos.length) % videos.length;
    showFlightGlitch();
    flightVideo.classList.add('is-switching');
    flightVideo.src = videos[activeVideo];
    flightVideo.load();
    flightVideo.play().catch(() => {});

    flightSteps.forEach((step, index) => step.classList.toggle('is-active', index === activeVideo));
    flightProgress.setAttribute('aria-valuenow', activeVideo + 1);
    flightProgress.setAttribute('aria-label', `Видео ${activeVideo + 1} из ${videos.length}`);
  };

  flightVideo.addEventListener('canplay', () => flightVideo.classList.remove('is-switching'));
  flightVideo.addEventListener('ended', () => updateFlightVideo(activeVideo + 1));
  flightCarousel.querySelector('.flight-control-prev').addEventListener('click', () => updateFlightVideo(activeVideo - 1));
  flightCarousel.querySelector('.flight-control-next').addEventListener('click', () => updateFlightVideo(activeVideo + 1));
}
