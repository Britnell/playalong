import { useEffect, useRef } from "preact/hooks";
import { State } from "../app";
import { playbacktime } from "../lib";

export const Header = ({ state }: { state: State }) => {
  const ref = useRef<HTMLDivElement>(null);
  if (!state.id)
    return (
      <header>
        <h2>Nothing playing</h2>
      </header>
    );

  useEffect(() => {
    const intvl = setInterval(() => {
      if (!state.begin || !state.progress || !state.playing) return;

      const t = playbacktime(state.begin, state.progress);
      const min = Math.floor(t / 60);
      const sec = Math.floor(t % 60);

      if (ref.current) ref.current.textContent = `${min}:${sec}`;
    }, 1000);
    return () => clearInterval(intvl);
  }, [state, ref]);

  return (
    <header class={" fixed top-0 bg-black "}>
      <div>
        <div className="">
          <div>
            <div>
              {state.playing ? ">" : "x"}
              <span ref={ref}></span>
            </div>
            <p>
              <a href={`#${state.id}`}>
                Playing : {state.name} - {state.artist}
              </a>
            </p>
          </div>
          <div></div>
        </div>
      </div>
    </header>
  );
};
