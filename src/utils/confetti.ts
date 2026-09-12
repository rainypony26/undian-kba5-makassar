import confetti from 'canvas-confetti';

/**
 * Trigger grand festive celebration confetti blast
 */
export function fireGrandConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Multi-tiered confetti bursts
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#FFD700', '#FFA500', '#FF4500'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#00F0FF', '#7928CA', '#FF0080'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });

  // Left & right cannons
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      zIndex: 9999,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      zIndex: 9999,
    });
  }, 250);
}

/**
 * Fire gold shower confetti for grand prizes
 */
export function fireGoldShower() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#F59E0B', '#FBBF24', '#FFFFFF'],
      zIndex: 9999,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#F59E0B', '#FBBF24', '#FFFFFF'],
      zIndex: 9999,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}
