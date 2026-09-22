// Subtle Web Audio API ambient chime for spiritual verse revelation
let audioCtx: AudioContext | null = null;

export function playSpiritualChime(enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Harmonic warm chords (F# major chord frequencies: F#4, A#4, C#5, F#5)
    const notes = [369.99, 466.16, 554.37, 739.99];

    notes.forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.045 / (idx + 1), now + idx * 0.08 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 2.0);
    });
  } catch (err) {
    // Audio autoplay restrictions or unsupported
  }
}
