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

document.addEventListener('pointermove', (event) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const world = document.querySelector('.world');
  if (!world) return;
  const x = (event.clientX / window.innerWidth - 0.5) * 10;
  const y = (event.clientY / window.innerHeight - 0.5) * 10;
  world.style.translate = `${x}px ${y}px`;
});
