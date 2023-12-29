import {
  createEffect,
  createSignal,
  For,
  JSXElement,
  onCleanup,
  Show,
} from "solid-js";
import { createStore } from "solid-js/store";

import { loadHashToken, SongData, spotifyQuery } from "../lib/spotify";
import Audio from "./audio";

let token: string = "";

export type State = {
  playing: boolean;
  id?: string;
  title?: string;
  artist?: string;
  progress?: number;
  begin?: number;
};

const [state, setState] = createStore<State>({ playing: false });
const [data, setData] = createSignal<SongData>();

const getListeningStatus = () => spotifyQuery("/me/player", token);
const getSongData = () => spotifyQuery(`/audio-analysis/${state.id}`, token);

export const playbacktime = (begin: number, progress: number) => {
  return (Date.now() - begin + progress) / 1000;
};

export const timeToScroll = (t: number) => t * 100 - window.innerHeight / 2;

export default function App() {
  createEffect(() => {
    // console.log(state());
  });

  const intvl = setInterval(() => {
    if (!state.begin || !state.progress || !state.playing) return;
    const t = playbacktime(state.begin, state.progress);
    const y = timeToScroll(t);
    const behavior = Math.abs(window.scrollY - y) > 300 ? "auto" : "smooth";

    // console.log(t);

    window.scrollTo({
      top: y,
      left: 0,
      behavior,
    });
  }, 60);
  onCleanup(() => {
    clearInterval(intvl);
  });

  return (
    <div>
      <Listening>
        <Head state={state} />
        <Audio data={data} />
        {/* <Show when={!data}>
          <div>
            <h3>No data</h3>
          </div>
        </Show> */}
        {/* <Show when={data}>
          <For each={data.segments}>{(seg) => <div class="row">x</div>}</For>
        </Show> */}
      </Listening>
    </div>
  );
}

const Listening = ({ children }: { children: JSXElement }) => {
  token = loadHashToken();

  listeningStatus();

  function listeningStatus() {
    const update = async () => {
      const before = new Date().getTime();
      const status = await getListeningStatus();
      const after = new Date().getTime();

      if (status.error) {
        console.log("Err ", status.error);
        return;
      }

      const time = (before + after) / 2;

      const artist = status.item?.artists
        .map((art: any) => art.name)
        .join(", ");

      setState({
        id: status.item?.id,
        playing: status.is_playing,
        title: status.item?.name,
        artist,
        progress: status.progress_ms,
        begin: time,
      });
    };
    update();
    const intvl = setInterval(update, 8000);

    onCleanup(() => clearInterval(intvl));
  }

  createEffect(async () => {
    if (!state.id) return;

    console.log(" new song ", state.id);
    const data = await getSongData();

    if (data.error) {
      console.log(data.error);
      return;
    }

    setData(data);
  });

  return <div>{children}</div>;
};

const Head = ({ state }: { state: State }) => {
  console.log({ b: state.begin, p: state.progress });

  return (
    <header class="fixed top-0  bg-black  z-10 py-2 px-4">
      {state.id && (
        <>
          <p>
            Song : {state.title} - {state.artist}{" "}
          </p>
          <p>{state.playing ? "play" : "paused"}</p>
        </>
      )}
      {!state.id && <h2>Play a song on spotify to get started</h2>}
    </header>
  );
};
