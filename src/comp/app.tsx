import { useEffect, useState } from "react";
import { type SongData, spotifyQuery } from "src/lib/spotify";
import Audio from "./audio";

export const App = () => {
  const [token] = useState(getHashToken);
  const [state, setState] = useState<State>({ playing: false });
  const [data, setData] = useState<SongData | null>(null);

  if (!token)
    return (
      <div>
        <h2>No token ... </h2>
        <a href="/">Please log in first</a>
      </div>
    );

  useEffect(() => {
    async function playbackSync() {
      if (!token) return;

      const before = new Date().getTime();
      const status = await spotifyQuery("/me/player", token);
      const after = new Date().getTime();
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
    }

    playbackSync();
  }, []);

  useEffect(() => {
    async function getSongData() {
      if (!state.id || !token) return;

      const data = await spotifyQuery(`/audio-analysis/${state.id}`, token);
      // console.log(state.id, data);

      if (data.error) {
        console.log(data.error);
        return;
      }
      setData(data);
    }
    getSongData();
  }, [state]);
  return (
    <div>
      <Head state={state} />
      <Audio data={data} />
    </div>
  );
};

const getHashToken = () => {
  let hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.slice(1));
  return params.get("access_token");
};

export type State = {
  playing: boolean;
  id?: string;
  title?: string;
  artist?: string;
  progress?: number;
  begin?: number;
};

const Head = ({ state }: { state: State }) => {
  return (
    <header class="fixed top-0  bg-black  z-10 py-2 px-4">
      {state.id && (
        <>
          <p>
            Song : {state.title} - {state.artist}{" "}
          </p>
          <p>{state.playing ? " " : "paused"}</p>
        </>
      )}
      {!state.id && <h2>Play a song on spotify to get started</h2>}
    </header>
  );
};
