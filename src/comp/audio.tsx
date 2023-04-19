import { useEffect, useRef } from "preact/hooks";
import { State } from "../app";
import { autoScroll, linear, playbacktime, timeToScroll } from "../lib";
import { Segment, SongData } from "../lib/spotify";

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const highlight = (perc: number) => {
  let val = 0;
  if (perc > 0.9) val = 1;
  else val = linear(perc, 0, 0.9, 0, 1);
  return `hsl(120deg 100% 50% / ${val})`;
};

export default function Audio({
  data,
  state,
}: {
  data: SongData;
  state: State;
}) {
  useEffect(() => {
    let intvl = setInterval(() => {
      autoScroll(state);
    }, 100);
    return () => clearInterval(intvl);
  }, [state]);

  if (!data) return <div>[ ALL THESE BARS, NO POLICE ]</div>;

  return (
    <div class=" max-w-[1000px] mx-auto ">
      {data.segments.map((seg, s) => (
        <Row data={seg} key={s} />
      ))}
    </div>
  );
}

const Row = ({ data }: { data: Segment }) => {
  const confidence = data.confidence;
  const height = data.duration * 100;
  const avrg = data.pitches.reduce((t, x) => t + x, 0) / 12;
  const one = data.pitches.findIndex((p) => p === 1);

  return (
    <div class="" style={{ height }}>
      <div class="absolute left-0">{notes[one]}</div>
      <div class=" h-full flex ">
        {data.pitches.map((pitch, p) => {
          const show = pitch > avrg;
          const conf = show ? pitch * confidence : 0;
          const color = highlight(conf);
          return (
            <div className={` key${p} `} key={p}>
              <div style={{ backgroundColor: color }}>
                {show ? notes[p] : "_"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
