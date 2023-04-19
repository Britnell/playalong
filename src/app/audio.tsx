import { Accessor, createEffect, For } from "solid-js";
import { linear } from "../lib/helper";
import { SongData, Segment, notes } from "../lib/spotify";

export default function Audio({
  data,
}: {
  data: Accessor<SongData | undefined>;
}) {
  if (data()) return <main>[ ALL THESE BARS, NO POLICE ]</main>;

  createEffect(() => {
    // console.log(data()?.segments);
  });

  return (
    <main>
      <div class=" max-w-[1000px] mx-auto ">
        <For each={data()?.segments}>{(seg) => <Row data={seg} />}</For>
      </div>
    </main>
  );
}

const Row = ({ data }: { data: Segment }) => {
  const height = data.duration * 100;
  const one = data.pitches.findIndex((p) => p === 1);

  return (
    <div class="row" style={{ height: `${height}px` }}>
      <div class="absolute left-0">{notes[one]}</div>
      <div class="flex h-full">
        {data.pitches.map((pitch, p) => {
          const show = pitch > 0.4;
          const conf = show ? pitch * data.confidence : 0;
          const color = highlight(conf);
          return (
            <div class={` key${p} `}>
              <div style={{ "background-color": color }}>
                {/* {pitch} */}
                {show ? notes[p] : " "}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const highlight = (perc: number) => {
  let val = 0;
  if (perc > 0.9) val = 1;
  else val = linear(perc, 0, 0.9, 0, 1);
  return `hsl(120deg 100% 50% / ${val})`;
};
