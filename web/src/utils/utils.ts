export const devMode = !window?.['invokeNative'];

const GRADIENT_PALETTES = [
  '135deg, #a259ff, #6366f1',
  '135deg, #f43f5e, #fb923c',
  '135deg, #06b6d4, #3b82f6',
  '135deg, #10b981, #06b6d4',
  '135deg, #8b5cf6, #ec4899',
  '135deg, #f59e0b, #ef4444',
];

export const generateGradient = (id: number | string): string => {
  const index =
    typeof id === 'number'
      ? id % GRADIENT_PALETTES.length
      : [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0) % GRADIENT_PALETTES.length;

  return GRADIENT_PALETTES[Math.abs(index)];
};
