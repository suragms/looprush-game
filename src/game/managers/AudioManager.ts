/**
 * AudioManager — procedural WebAudio sound synthesis.
 * No asset files needed. Creates short tones/sfx using OscillatorNode.
 */
let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _musicGain: GainNode | null = null;
let _sfxGain: GainNode | null = null;
let _volume = 0.7;
let _musicEnabled = true;
let _sfxEnabled = true;
let _musicOsc: OscillatorNode | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new AudioContext();
    _masterGain = _ctx.createGain();
    _masterGain.gain.value = _volume;
    _masterGain.connect(_ctx.destination);

    _musicGain = _ctx.createGain();
    _musicGain.gain.value = 0.15;
    _musicGain.connect(_masterGain);

    _sfxGain = _ctx.createGain();
    _sfxGain.gain.value = 0.5;
    _sfxGain.connect(_masterGain);
  }
  if (_ctx.state === 'suspended') {
    _ctx.resume();
  }
  return _ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
  detune: number = 0,
): void {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(_sfxGain!);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + 0.05);
}

function playMultiTone(
  tones: Array<{ freq: number; delay: number; duration: number; type?: OscillatorType; volume?: number }>,
): void {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  for (const t of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = t.type ?? 'sine';
    osc.frequency.value = t.freq;
    gain.gain.setValueAtTime(t.volume ?? 0.2, ctx.currentTime + t.delay);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + t.delay + t.duration,
    );
    osc.connect(gain);
    gain.connect(_sfxGain!);
    osc.start(ctx.currentTime + t.delay);
    osc.stop(ctx.currentTime + t.delay + t.duration + 0.05);
  }
}

export const AudioManager = {
  init(): void {
    getCtx();
  },

  setVolume(v: number): void {
    _volume = v;
    if (_masterGain) _masterGain.gain.value = v;
  },

  setMusicEnabled(b: boolean): void {
    _musicEnabled = b;
    if (_musicGain) _musicGain.gain.value = b ? 0.15 : 0;
  },

  setSfxEnabled(b: boolean): void {
    _sfxEnabled = b;
  },

  playCollect(): void {
    playTone(880, 0.12, 'sine', 0.25);
    playTone(1320, 0.08, 'sine', 0.15, 50);
  },

  playComboUp(tier: number): void {
    const freq = 440 + tier * 110;
    playTone(freq, 0.15, 'triangle', 0.3);
    playTone(freq * 1.5, 0.1, 'sine', 0.2, tier * 20);
  },

  playDash(): void {
    playTone(200, 0.1, 'sawtooth', 0.2);
    playTone(400, 0.15, 'square', 0.1);
  },

  playNearMiss(): void {
    playTone(1200, 0.08, 'sine', 0.15);
    playTone(1600, 0.06, 'sine', 0.1, 100);
  },

  playHit(): void {
    playTone(150, 0.3, 'sawtooth', 0.4);
    playTone(80, 0.4, 'square', 0.3);
  },

  playGameOver(): void {
    playMultiTone([
      { freq: 440, delay: 0, duration: 0.3, type: 'sine', volume: 0.3 },
      { freq: 330, delay: 0.2, duration: 0.3, type: 'sine', volume: 0.25 },
      { freq: 220, delay: 0.4, duration: 0.5, type: 'sine', volume: 0.3 },
      { freq: 165, delay: 0.7, duration: 0.6, type: 'triangle', volume: 0.2 },
    ]);
  },

  playLevelUp(): void {
    playMultiTone([
      { freq: 523, delay: 0, duration: 0.15, type: 'square', volume: 0.2 },
      { freq: 659, delay: 0.1, duration: 0.15, type: 'square', volume: 0.2 },
      { freq: 784, delay: 0.2, duration: 0.25, type: 'square', volume: 0.25 },
    ]);
  },

  playPowerUp(): void {
    playMultiTone([
      { freq: 660, delay: 0, duration: 0.1, type: 'sine', volume: 0.25 },
      { freq: 880, delay: 0.08, duration: 0.1, type: 'sine', volume: 0.25 },
      { freq: 1100, delay: 0.16, duration: 0.2, type: 'triangle', volume: 0.2 },
    ]);
  },

  playEvent(): void {
    playTone(330, 0.2, 'triangle', 0.25);
    playTone(440, 0.2, 'triangle', 0.2, 30);
    playTone(550, 0.3, 'triangle', 0.25, 60);
  },

  startMusic(): void {
    if (_musicOsc) return;
    const ctx = getCtx();
    if (!_musicEnabled) return;

    // Simple ambient drone loop
    _musicOsc = ctx.createOscillator();
    _musicOsc.type = 'sine';
    _musicOsc.frequency.value = 110;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(_musicOsc.frequency);

    _musicOsc.connect(_musicGain!);
    _musicOsc.start();
    lfo.start();

    // Store reference for stopping
    (_musicOsc as OscillatorNode & { _lfo?: OscillatorNode })._lfo = lfo;
  },

  stopMusic(): void {
    if (_musicOsc) {
      const lfo = (_musicOsc as OscillatorNode & { _lfo?: OscillatorNode })._lfo;
      if (lfo) lfo.stop();
      _musicOsc.stop();
      _musicOsc = null;
    }
  },

  destroy(): void {
    AudioManager.stopMusic();
    if (_ctx) {
      _ctx.close();
      _ctx = null;
      _masterGain = null;
      _musicGain = null;
      _sfxGain = null;
    }
  },
};
