import { linear, notes, type Segment, type SongData } from "src/lib/spotify";

export default function Audio({ data }: { data: SongData }) {
  return (
    <main>
      <div class=" w-full h-1 fixed top-1/2 bg-red-500  bg-opacity-40 z-50"></div>
      <div class=" max-w-[1000px] mx-auto ">
        {data.segments.map((seg: Segment) => (
          <Row data={seg} />
        ))}
      </div>
    </main>
  );
}

const Row = ({ data }: { data: Segment }) => {
  const height = data.duration * 100;
  const one = data.pitches.findIndex((p) => p === 1);

  return (
    <div class="row" style={{ height: `${height}px` }}>
      <div class="absolute left-0">
        {/* {notes[one]} */}
        <span class=" text-[0.8em]">
          {Math.floor(data.confidence * 10) / 10}
        </span>

        {/* {data.start} */}
      </div>
      <div class="flex h-full">
        {data.pitches.map((pitch, p) => {
          const show = pitch > 0.4;
          const conf = show ? pitch * data.confidence : 0;
          const color = highlight(conf);
          return (
            <div class={` key${p} `}>
              <div style={{ "background-color": color }}>
                <span class=" text-[0.8em]">
                  {"   "}
                  {Math.floor(pitch * 10) / 10}
                </span>
                {/* {show ? notes[p] : " "} */}
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
