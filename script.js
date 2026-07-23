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
    kicker: 'Персонаж 01 · Denis4',
    title: '<span class="hero-title-line" data-text="ГЛАВНЫЙ ИГРОК">ГЛАВНЫЙ ИГРОК</span><br><span class="hero-character-name" data-text="Денис">Денис</span>',
    lead: 'Здесь будет короткая история Дениса.<br>Пока это текст-заглушка для первой модели.',
  },
  cameraman: {
    kicker: 'Персонаж 02 · Cameraman',
    title: '<span class="hero-title-line" data-text="ВСЁ В КАДРЕ">ВСЁ В КАДРЕ</span><br><span class="hero-character-name" data-text="Камерамен">Камерамен</span>',
    lead: 'Он замечает то, что пропускают другие.<br>Здесь появится описание второй модели.',
  },
  chemical: {
    kicker: 'Персонаж 03 · Chemical',
    title: '<span class="hero-title-line" data-text="ОПАСНАЯ ЗОНА">ОПАСНАЯ ЗОНА</span><br><span class="hero-character-name" data-text="Химик">Химик</span>',
    lead: 'Броня, реактивы и неизвестная миссия.<br>Это временный текст для третьей модели.',
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
  autoplayTimer = window.setInterval(() => setActiveModel(activeModel + 1, false), 10000000000000);
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
