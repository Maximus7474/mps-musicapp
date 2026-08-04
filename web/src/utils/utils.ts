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

export const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const formatNumber = (value: number): string => {
  if (value >= 1_000_000) return `${Math.floor(value / 1_000_000)}M`;
  if (value >= 1_000) return `${Math.floor(value / 1_000)}k`;
  return `${value}`;
};

export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
