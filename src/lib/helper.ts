export const linear = (
  x: number,
  min: number,
  max: number,
  ymin: number,
  ymax: number
) => ymin + ((x - min) / (max - min)) * (ymax - ymin);
