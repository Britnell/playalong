import { State } from "../app";

export const playbacktime = (begin: number, progress: number) => {
  return (Date.now() - begin + progress) / 1000;
};

export const timeToScroll = (t: number) => t * 100 - window.innerHeight / 2;

export const linear = (
  x: number,
  min: number,
  max: number,
  ymin: number,
  ymax: number
) => ymin + ((x - min) / (max - min)) * (ymax - ymin);

export const autoScroll = (state: State) => {
  if (!state.begin || !state.progress || !state.playing) return;
  const t = playbacktime(state.begin, state.progress);
  const y = timeToScroll(t);
  const behavior = Math.abs(window.scrollY - y) > 300 ? "auto" : "smooth";

  window.scrollTo({
    top: y,
    left: 0,
    behavior,
  });
};
