export const formatPercent = (value: number): string => {
  const formatted = Math.abs(value).toFixed(1);
  return `${formatted}%`;
};
