// 年份与暗色模式
document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());
const root = document.documentElement;
const btn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'dark') root.classList.add('dark');
btn && btn.addEventListener('click', () => {
  root.classList.toggle('dark');
  localStorage.setItem('theme', root.classList.contains('dark') ? 'dark':'light');
});
