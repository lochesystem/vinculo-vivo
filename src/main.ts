import './styles/main.css';
import { app } from './ui/app';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/';
    navigator.serviceWorker.register(`${base}sw.js`).catch(() => {});
  });
}

app.init().catch(console.error);
