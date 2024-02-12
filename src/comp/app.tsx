import { useEffect, useState } from "react";
import { type SongData, spotifyQuery } from "src/lib/spotify";
import Audio from "./audio";

export const App = () => {
  const [token] = useState(getHashToken);
  const [songid, setSongid] = useState("");
  const [autoscroll, setAutoscroll] = useState(true);
  const [state, setState] = useState<State>({
    playing: false,
  });
  const [data, setData] = useState<SongData | null>(null);

  if (!token)
    return (
      <div>
        <h2>No token ... </h2>
        <a href="/">Please log in first</a>
      </div>
    );

  useEffect(() => {
    // sync on load
    if (!token) return;
    getPlaybackStatus(token).then((st) => {
      if (st.id === songid) return;
      setSongid(st.id);
      setState(st);
    });
  }, []);

  useEffect(() => {
    // sync interval
    const intvl = setInterval(() => {
      if (!token) return;
      getPlaybackStatus(token).then((st) => {
        // update song if new
        if (st.id !== songid) {
          setSongid(st.id);
          setState(st);
          return;
        }
        if (!state.begin || !state.progress) return;
        // update after seeking
        const newadv = calcPlayback(st.begin, st.progress);
        const prevadv = calcPlayback(state.begin, state.progress);
        const timeDiff = Math.abs(newadv - prevadv);
        if (timeDiff < 0.7) return;
        setState(st);
      });
    }, 3 * 1000);
    return () => clearInterval(intvl);
  }, [state]);

  useEffect(() => {
    // get song data
    async function getSongData() {
      if (!songid || !token) return;
      const data = await spotifyQuery(`/audio-analysis/${songid}`, token);
      if (data.error) {
        console.log(data.error);
        return;
      }
      setData(data);
    }
    getSongData();
  }, [songid]);

  useEffect(() => {
    // scroll time sync
    const scrollUpdate = () => {
      if (!state.begin || !state.progress) return;
      const playbacktime = calcPlayback(state.begin, state.progress);
      const scrollPos = playbacktime * 100 - window.innerHeight / 2;
      window.scrollTo({
        top: scrollPos,
        left: 0,
        behavior: "auto",
      });
      frame = window.requestAnimationFrame(scrollUpdate);
    };
    let frame: number;
    if (!state.playing || !autoscroll) return;
    frame = window.requestAnimationFrame(scrollUpdate);
    return () => window.cancelAnimationFrame(frame);
  }, [state, autoscroll]);

  useEffect(() => {
    // keyboard ctrl
    const onkey = (ev: KeyboardEvent) => {
      if (ev.code === "Space") {
        ev.preventDefault();
        console.log("SPACE");
        setAutoscroll((sc) => !sc);
      }
    };
    window.addEventListener("keypress", onkey);
    return () => window.removeEventListener("keypress", onkey);
  }, [autoscroll]);

  return (
    <div>
      <Head state={state} />
      {data ? (
        <>
          <Audio data={data} />
          {autoscroll && (
            <>
              <div class=" w-full fixed top-0 bottom-[calc(50vh+200px)] bg-slate-700  bg-opacity-20 z-50"></div>
              <div class=" w-full fixed bottom-0 top-[calc(50vh+200px)] bg-slate-700  bg-opacity-20 z-50"></div>
            </>
          )}
        </>
      ) : (
        <main>[ ALL THESE BARS, NO POLICE ]</main>
      )}
    </div>
  );
};

const Head = ({ state }: { state: State }) => {
  return (
    <header class="fixed top-0  bg-black  z-10 py-2 px-4">
      {state.id && (
        <>
          <p>
            {state.title} - {state.artist}{" "}
          </p>
          <p>{state.playing ? " " : "paused"}</p>
        </>
      )}
      {!state.id && <h2>Play a song on spotify to get started</h2>}
    </header>
  );
};

export type State = {
  playing: boolean;
  id?: string;
  title?: string;
  artist?: string;
  progress?: number;
  begin?: number;
};

const getHashToken = () => {
  let hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.slice(1));
  return params.get("access_token");
};

const calcPlayback = (begin: number, progress: number) =>
  (Date.now() - begin + progress) / 1000;

const getPlaybackStatus = async (token: string) => {
  const before = new Date().getTime();
  const status = await spotifyQuery("/me/player", token);
  const after = new Date().getTime();
  const time = (before + after) / 2;

  const artist = status.item?.artists.map((art: any) => art.name).join(", ");

  return {
    id: status.item?.id,
    playing: status.is_playing,
    title: status.item?.name,
    artist,
    progress: status.progress_ms,
    begin: time,
  };
};
