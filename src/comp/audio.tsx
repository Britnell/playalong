import { expon, notes, type Segment, type SongData } from "src/lib/spotify";

export default function Audio({ data }: { data: SongData }) {
  return (
    <main class=" max-w-[1000px] mx-auto ">
      {data.segments.map((seg: Segment) => (
        <Row data={seg} />
      ))}
    </main>
  );
}

const Row = ({ data }: { data: Segment }) => {
  const height = data.duration * 100;
  const total = data.pitches.reduce((t, x) => t + x, 0);

  const thinRow = height < 16;
  return (
    <div class={"row h-full "} style={{ height: `${height}px` }}>
      {data.pitches.map((pitch, p) => {
        const conf = (data.confidence * pitch) / total;
        const min = 0.08;
        return (
          <div class={` key${p} `}>
            {conf > min && (
              <div
                class=" note "
                style={{
                  "background-color": exphigh(conf, 0.5),
                }}
              >
                {!thinRow && notes[p]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const exphigh = (perc: number, max: number) => {
  let val = 0;
  if (perc >= max) val = 1;
  else val = expon(perc, 0, max, 0, 1);
  return `hsl(120deg 100% 50% / ${val})`;
};
