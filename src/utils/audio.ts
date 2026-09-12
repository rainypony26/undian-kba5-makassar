// Advanced Web Audio API Sound Synthesizer - Ultra Festive & Grand Event Edition
// 100% offline, zero latency, zero external asset dependencies

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Mechanical clicking / wooden slot machine ratchet tick
 */
export function playTick(volume = 0.5, pitchMultiplier = 1) {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;

    // Crisp high click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450 * pitchMultiplier, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.035);

    gain.gain.setValueAtTime(volume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);

    // Subtle wooden resonant 'thunk'
    const thunk = ctx.createOscillator();
    const thunkGain = ctx.createGain();
    thunk.type = 'sine';
    thunk.frequency.setValueAtTime(180 * pitchMultiplier, t);
    thunk.frequency.exponentialRampToValueAtTime(40, t + 0.04);
    thunkGain.gain.setValueAtTime(volume * 0.3, t);
    thunkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    thunk.connect(thunkGain);
    thunkGain.connect(ctx.destination);
    thunk.start(t);
    thunk.stop(t + 0.045);
  } catch {
    // Autoplay policy fallback
  }
}

/**
 * High-tension suspense drumroll + rising bass sweep + heartbeat
 */
export function startFestiveDrumroll(volume = 0.6, durationSec = 5): () => void {
  try {
    const ctx = getAudioContext();
    let isRunning = true;
    let snareInterval: number | null = null;
    let heartbeatInterval: number | null = null;

    const startTime = Date.now();
    const totalMs = durationSec * 1000;

    // 1. Rising Tension Drone (Cinematic Shepard-like rising tone)
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'sawtooth';
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(900, ctx.currentTime + durationSec);

    droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(volume * 0.25, ctx.currentTime + durationSec * 0.8);
    droneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec + 0.1);

    droneOsc.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(ctx.destination);
    droneOsc.start();

    // 2. Rapid Snare Roll Generator
    const playSnareHit = (intensity: number) => {
      if (!isRunning) return;
      const bufferSize = ctx.sampleRate * 0.045;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const snareFilter = ctx.createBiquadFilter();
      snareFilter.type = 'bandpass';
      snareFilter.frequency.value = 1400 + intensity * 600;
      snareFilter.Q.value = 2.5;

      const gain = ctx.createGain();
      const currentVol = volume * (0.2 + intensity * 0.5);
      gain.gain.setValueAtTime(currentVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      noise.connect(snareFilter);
      snareFilter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    };

    let tickCount = 0;
    snareInterval = window.setInterval(() => {
      tickCount++;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalMs, 1);
      playSnareHit(progress);
    }, 40);

    // 3. Heartbeat Thump in final seconds (suspense)
    const playHeartbeat = () => {
      if (!isRunning) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(70, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
      g.gain.setValueAtTime(volume * 0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    };

    heartbeatInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > totalMs * 0.5) {
        playHeartbeat();
      }
    }, 450);

    return () => {
      isRunning = false;
      if (snareInterval) clearInterval(snareInterval);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      try {
        droneOsc.stop();
      } catch {
        // already stopped
      }
    };
  } catch {
    return () => {};
  }
}

/**
 * Play Grand Crash Cymbal + Deep Gong on winner reveal
 */
function playCymbalCrash(volume = 0.7) {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const dur = 1.8;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);

    // Deep Sub Bass Boom
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(130, t);
    sub.frequency.exponentialRampToValueAtTime(35, t + 0.7);
    subGain.gain.setValueAtTime(volume * 0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(t);
    sub.stop(t + 0.75);
  } catch {
    //
  }
}

/**
 * Realistic Audience Applause / Clapping simulation
 */
export function playCrowdApplause(volume = 0.65, durationSec = 3.5) {
  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime;
    const clapCount = 140;

    // Staggered randomized handclaps
    for (let i = 0; i < clapCount; i++) {
      const delay = Math.random() * durationSec;
      const t = startTime + delay;

      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.value = Math.random() * 1.8 - 0.9;
      }

      // Handclap impulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.025);

      const decayFactor = Math.max(0.2, 1 - delay / durationSec);
      gain.gain.setValueAtTime(volume * (0.2 + Math.random() * 0.3) * decayFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start(t);
      osc.stop(t + 0.035);
    }

    // Crowd Roar / Cheering Formants ("HUUUUURRAAAYYY!")
    const roarDur = 3.0;
    const roarBuffer = ctx.createBuffer(1, ctx.sampleRate * roarDur, ctx.sampleRate);
    const roarData = roarBuffer.getChannelData(0);
    for (let i = 0; i < roarData.length; i++) {
      roarData[i] = (Math.random() * 2 - 1);
    }

    const roarSource = ctx.createBufferSource();
    roarSource.buffer = roarBuffer;

    const formant1 = ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.setValueAtTime(650, startTime + 0.1);
    formant1.frequency.linearRampToValueAtTime(900, startTime + 1.2);
    formant1.Q.value = 4;

    const roarGain = ctx.createGain();
    roarGain.gain.setValueAtTime(0.001, startTime);
    roarGain.gain.linearRampToValueAtTime(volume * 0.45, startTime + 0.4);
    roarGain.gain.exponentialRampToValueAtTime(0.001, startTime + roarDur);

    roarSource.connect(formant1);
    formant1.connect(roarGain);
    roarGain.connect(ctx.destination);
    roarSource.start(startTime);
  } catch {
    //
  }
}

/**
 * Party Horn / Trompet Pesta ("Tuuuut-tutu-tuuuut!")
 */
export function playPartyHorn(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime + 0.2;

    const notes = [
      { f: 587.33, start: 0, dur: 0.12 }, // D5
      { f: 783.99, start: 0.13, dur: 0.12 }, // G5
      { f: 987.77, start: 0.26, dur: 0.45 }, // B5
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, t + n.start);
      // vibrato / glissando bend
      osc.frequency.linearRampToValueAtTime(n.f * 1.03, t + n.start + n.dur);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, t + n.start);
      filter.Q.value = 3;

      gain.gain.setValueAtTime(volume * 0.35, t + n.start);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + n.start);
      osc.stop(t + n.start + n.dur + 0.05);
    });
  } catch {
    //
  }
}

/**
 * Shimmering Jackpot / Sparkle Chimes
 */
export function playSparkleChimes(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0]; // C Major upward sparkle

    arpeggio.forEach((freq, idx) => {
      const noteTime = t + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(volume * 0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  } catch {
    //
  }
}

/**
 * Grand Victory Fanfare (Multi-instrument triumphant orchestra brass chords)
 */
export function playFestiveFanfare(volume = 0.75) {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;

    // 1. Initial Impact Boom & Cymbal
    playCymbalCrash(volume);

    // 2. Chords melody (C -> F -> G -> High Triumphant C Power Chord)
    const melody = [
      // Beat 1: C Major (Short punchy)
      { freqs: [261.63, 329.63, 523.25], start: 0.0, dur: 0.22 },
      // Beat 2: F Major (Short punchy)
      { freqs: [349.23, 440.0, 698.46], start: 0.25, dur: 0.22 },
      // Beat 3: G Major (Suspense)
      { freqs: [392.0, 493.88, 783.99], start: 0.5, dur: 0.3 },
      // Beat 4: Grand High C Major Forte (Full triumphant brass chord!)
      { freqs: [261.63, 523.25, 659.25, 783.99, 1046.5, 1318.51], start: 0.82, dur: 1.8 },
    ];

    melody.forEach((chord) => {
      chord.freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + chord.start);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, t + chord.start);

        const noteStart = t + chord.start;
        const noteEnd = noteStart + chord.dur;

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(volume * 0.35, noteStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteEnd + 0.05);
      });
    });

    // 3. Sparkle chimes after chord settles
    setTimeout(() => {
      playSparkleChimes(volume * 0.8);
    }, 900);

    // 4. Simultaneous Crowd Applause & Cheering!
    setTimeout(() => {
      playCrowdApplause(volume * 0.9, 3.8);
      playPartyHorn(volume * 0.7);
    }, 250);
  } catch {
    //
  }
}
