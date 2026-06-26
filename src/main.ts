import './styles/main.css';

const params = new URLSearchParams(window.location.search);
const debug = params.get('debug');

if (debug === 'sprites') {
  import('./ui/debug-sprites').then(({ mountSpriteDebugPage }) => {
    mountSpriteDebugPage();
  });
} else if (debug === 'habitat') {
  import('./ui/debug-habitat').then(({ mountHabitatDebugPage }) => {
    mountHabitatDebugPage();
  });
} else {
  import('./ui/app').then(({ app }) => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const base = import.meta.env.BASE_URL || '/';
        navigator.serviceWorker.register(`${base}sw.js`).catch(() => {});
      });
    }
    app.init().catch(console.error);
  });
}
