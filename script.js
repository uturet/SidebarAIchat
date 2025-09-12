const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const toggle = document.getElementById("theme-toggle");
if (toggle) {
  // Use an evenly balanced sun icon (absolute positions) to avoid drift
  const sunIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const moonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function applyTheme(dark) {
    document.body.classList.toggle("dark", dark);
    toggle.innerHTML = dark ? sunIcon : moonIcon;
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  const stored = localStorage.getItem("theme");
  applyTheme(stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);

  toggle.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark");
    applyTheme(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

const btns = document.querySelectorAll('button.code-toggle')
btns.forEach(btn => btn.addEventListener("click", () => {
  const code = document.querySelector(`pre[data-code="${btn.dataset.code}"]`)
  code.classList.toggle("code-hidden")
  btn.textContent = code.classList.contains("code-hidden") ? "Hide code" : "Show code";
}))

function flashHighlight(el) {
  const prev = el.style.outline;
  el.style.outline = '2px solid rgba(0,0,0,0.3)';
  setTimeout(() => { el.style.outline = prev || ''; }, 350);
}

async function copyCodeFor(btn) {
  const key = btn.dataset.code;
  const pre = document.querySelector(`pre[data-code="${key}"]`);
  const codeEl = pre ? pre.querySelector('code') : null;
  if (!codeEl) return;

  // Get exact code text (preserves newlines/indentation)
  const text = codeEl.textContent;

  // Optional: visually show selection feedback (no real selection needed)
  flashHighlight(codeEl);

  // Clipboard API copy (requires HTTPS or localhost, and a user gesture)
  await navigator.clipboard.writeText(text);

  // Button feedback
  const prev = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => { btn.textContent = prev; }, 1200);
}

// Attach listeners (feature-detect Clipboard API)
const copyBtns = document.querySelectorAll('button.code-copy');
copyBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        // If you need to support non-secure contexts or very old iOS,
        // there is no non-deprecated automatic copy path without execCommand.
        // Serve over HTTPS or run on localhost for this to work.
        throw new Error('Clipboard API unavailable in this context.');
      }
      await copyCodeFor(btn);
    } catch (err) {
      // Hard fail silently to avoid showing key-hints; keep UI clean
      console.error(err);
    }
  }, { passive: true });
});

// Detect OS and show default Nginx path for proxy file
(function setNginxDefaultPath() {
  const el = document.getElementById('nginx-default-path');
  if (!el) return;

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';

  const isWindows = /Win/.test(platform) || /Windows/.test(ua);
  const isMac = /Mac/.test(platform) || /Mac OS X/.test(ua);
  const isLinux = /Linux/.test(platform) && !/Android/.test(ua);

  let path = '/etc/nginx/sites-available/ollama-proxy'; // sensible default (Linux)

  if (isWindows) {
    path = 'C\\\\nginx\\\\conf\\\\servers\\\\ollama-proxy.conf';
  } else if (isMac) {
    // Homebrew nginx locations: Intel vs Apple Silicon
    path = '/usr/local/etc/nginx/servers/ollama-proxy.conf (or /opt/homebrew/etc/nginx/servers/ollama-proxy.conf)';
  } else if (isLinux) {
    path = '/etc/nginx/sites-available/ollama-proxy';
  }

  el.textContent = path;
})();
