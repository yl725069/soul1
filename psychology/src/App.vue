<script>
import { useSettingsStore } from './store/settings'
import { inject } from '@vercel/analytics'

export default {
  onLaunch: function() {
    const settings = useSettingsStore()
    settings.load()
    inject()
  }
}
</script>

<style>
/* ===== CSS Custom Properties (Light) ===== */
:root {
  --bg-primary: #f6faf7;
  --bg-card: #ffffff;
  --bg-elevated: #ffffff;
  --text-primary: #14532d;
  --text-secondary: #4b7a5a;
  --text-muted: #9ab8a4;
  --border-color: #d1e8d9;
  --shadow-sm: 0 1px 3px rgba(22,163,74,0.05), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(22,163,74,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 8px 24px rgba(22,163,74,0.12);
  --accent: #16a34a;
  --accent-secondary: #059669;
  --accent-light: #dcfce7;
  --accent-border: #bbf7d0;
  --accent-gradient: linear-gradient(135deg, #16a34a 0%, #059669 100%);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --font-mono: 'SF Mono', 'Fira Code', monospace;
}

/* ===== Dark Mode Overrides ===== */
.dark {
  --bg-primary: #0d1f12;
  --bg-card: #152a1a;
  --bg-elevated: #1e3a24;
  --text-primary: #d1fae5;
  --text-secondary: #86efac;
  --text-muted: #4ade80;
  --border-color: #1e3a24;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
  --accent-light: rgba(22,163,74,0.15);
  --accent-border: rgba(22,163,74,0.3);
}

/* ===== Global Resets ===== */
page { background: var(--bg-primary); color: var(--text-primary); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
view, text { box-sizing: border-box; }


/* ===== Utility Classes ===== */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.card:hover { box-shadow: var(--shadow-md); }
</style>
