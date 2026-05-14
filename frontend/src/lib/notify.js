// ── Sound ──────────────────────────────────────────────────
export function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);

    const tone = (freq, start, dur, type = 'sine') => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(master);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(1, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.start(start);
      osc.stop(start + dur);
    };

    const t = ctx.currentTime;
    tone(1318.51, t,        0.18); // E6
    tone(1046.50, t + 0.09, 0.28); // C6
    tone(1174.66, t + 0.18, 0.22); // D6
  } catch (_) {}
}

// ── Browser notification ───────────────────────────────────
export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

export function showNotification(title, body, icon) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!document.hidden) return; // only when tab is in background
  try {
    new Notification(title, { body, icon: icon || '/icon.svg', silent: true });
  } catch (_) {}
}
