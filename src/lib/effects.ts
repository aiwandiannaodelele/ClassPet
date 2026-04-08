import confetti from 'canvas-confetti';

export const triggerLevelUpEffect = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

export const triggerScoreUpEffect = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#22c55e', '#4ade80', '#86efac'] // Green shades
  });
};

export const triggerScoreDownEffect = () => {
  confetti({
    particleCount: 40,
    spread: 100,
    startVelocity: 15,
    gravity: 1.5,
    origin: { y: 0.1 },
    colors: ['#ef4444', '#f87171', '#fca5a5'], // Red shades
    shapes: ['circle']
  });
};