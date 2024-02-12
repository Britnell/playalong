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
  // const one = data.pitches.findIndex((p) => p === 1);
  const total = data.pitches.reduce((t, x) => t + x, 0);

  return (
    <div class="row" style={{ height: `${height}px` }}>
      {/* <div class="absolute left-0">
        {notes[one]}
        <span class=" text-[0.8em]">{notes[one]}</span>
        <span class=" text-[0.8em]">{dec(data.confidence)}</span>
        {data.start}
      </div> */}
      <div class="flex h-full">
        {data.pitches.map((pitch, p) => {
          // const conf = pitch > 0.4 ? data.confidence * pitch : 0;
          const conf = (data.confidence * pitch) / total;
          const min = 0.08;
          return (
            <div class={` key${p} `}>
              <div
                class=" rounded-sm"
                style={{ "background-color": highlight(conf, min) }}
              >
                {/* <span class=" text-[0.8em]">
                  {dec(conf)}
                  {dec(pitch)}
                </span> */}
                {conf > min ? notes[p] : " "}
                {/* {show ? notes[p] : " "} */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const highlight = (perc: number, min: number = 0.1, max: number = 0.6) => {
  let val = 0;
  if (perc < min) val = 0;
  else if (perc > max) val = 1;
  else val = linear(perc, min, max, 0.2, 1);
  return `hsl(120deg 100% 50% / ${val})`;
};

// const dec = (x: number, digits: number = 10) => Math.floor(x * digits) / digits;
