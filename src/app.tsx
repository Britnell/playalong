import { useEffect, useState } from "preact/hooks";
import Login from "./comp/login";
import { useSpotify } from "./lib/spotify";
import "./app.css";
import { Header } from "./comp/header";
import Audio from "./comp/audio";
import { autoScroll, playbacktime, timeToScroll } from "./lib";

export type State = {
  playing: boolean;
  id?: string;
  name?: string;
  artist?: string;
  progress?: number;
  begin?: number;
};

export function App() {
  const [token, query] = useSpotify();
  const [state, setState] = useState<State>({
    playing: false,
    id: "",
  });
  const [data, setData] = useState<any>(null);

  if (!token) return <Login />;

  useEffect(() => {
    // update currently playing song
    if (!token) return;

    const update = async () => {
      const before = new Date().getTime();
      const playback = await query("/me/player");
      const after = new Date().getTime();

      if (playback.error) return;
      if (!playback.is_playing) {
        if (state.playing) setState((st) => ({ ...st, playing: false }));
        return;
      }
      if (state.id === playback.item.id) {
        return;
      }
      const artists = playback.item.artists
        .map((art: any) => art.name)
        .join(", ");

      const time = (before + after) / 2;

      setState({
        id: playback.item.id,
        playing: true,
        name: playback.item.name,
        artist: artists,
        progress: playback.progress_ms,
        begin: time,
      });
    };
    update();

    const intvl = setInterval(update, 3 * 1000);
    return () => clearInterval(intvl);
  }, [token, state]);

  useEffect(() => {
    if (!state.id) return;
    const load = async () => {
      const data = await query(`/audio-analysis/${state.id}`);
      if (data.error) {
        console.log(" err ", data);
        return;
      }
      setData(data);
    };
    load();
  }, [state, state]);

  return (
    <div>
      <Header state={state} />
      <Audio data={data} state={state} />
    </div>
  );
}
