import { useEffect, useState } from "react";
import { spotifyQuery, tokenInit } from "src/lib/spotify";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { ErrorBoundary } from "react-error-boundary";

type Track = {
  id: string;
  name: string;
  popularity: number;
  external_urls: {
    spotify: string;
  };
  artists: {
    name: string;
  }[];
  album: {
    name: string;
    album_type: string;
    release_date: string;
    release_date_precision: string;
    images: Img[];
  };
};

type Img = {
  height: number;
  width: number;
  url: string;
};

type Artist = {
  id: string;
  name: string;
  popularity: number;
  images: Img[];
  genres: string[];
  followers: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
};

type Album = {
  name: string;
  album_type: string;
  label: string;
  popularity: number;
  release_date: string;
  release_date_precision: string;
  images: Img[];
  artists: {
    name: string;
  }[];
  external_urls: {
    spotify: string;
  };
};

type Types = "artists" | "tracks" | "albums";
type TimeRange = "short_term" | "medium_term" | "long_term";

const cacheAge = 60 * 60 * 24;

export default function Page() {
  const [token] = useState(() => tokenInit());
  const [type, setType] = useState<Types>("artists");
  const [time_range, setTime_range] = useState<TimeRange>("long_term");

  if (!token)
    return (
      <div>
        <h2>Your Spotify Charts</h2>
        <p>See your top artists & track</p>
        <p>Woops - youre not logged in</p>
      </div>
    );

  return (
    <div>
      <header class=" px-6 ">
        <div className="flex justify-between py-2">
          <h2 class=" text-2xl">Your Spotify Charts</h2>
          <a href="/app">Back</a>
        </div>
        <div className=" mt-2 mb-8 flex justify-evenly gap-x-12 gap-y-4 flex-wrap">
          <div class="flex flex-col sm:flex-row gap-y-2 items-center ">
            <p class=" mr-8 " id="artist-label">
              See your
            </p>
            <ToggleGroup.Root
              type="single"
              value={type}
              onValueChange={(value: any) => value && setType(value)}
              class=" flex flex-row gap-2 flex-wrap"
            >
              {Object.entries({
                artists: "top artists",
                tracks: "top tracks",
                albums: "saved albums",
              }).map(([key, val]) => (
                <ToggleGroup.Item
                  class={
                    " py-1 px-2 " +
                    (key === type ? " bg-gray-600" : " bg-gray-900")
                  }
                  value={key}
                  aria-aria-describedby="artist-label"
                >
                  {val}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup.Root>
          </div>
          <div
            className={
              "flex flex-col sm:flex-row gap-y-2 items-center " +
              (type === "albums" ? " invisible" : "")
            }
          >
            <p class=" mr-8 " id="time-label">
              Of the last:{" "}
            </p>
            <ToggleGroup.Root
              type="single"
              value={time_range}
              onValueChange={(value: any) => value && setTime_range(value)}
              class=" flex flex-row gap-2 flex-wrap"
            >
              {Object.entries({
                short_term: "4 weeks",
                medium_term: "6 months",
                long_term: "years",
              }).map(([key, val]) => (
                <ToggleGroup.Item
                  class={
                    " py-1 px-2 " +
                    (key === time_range ? " bg-slate-500" : " bg-slate-900")
                  }
                  value={key}
                  aria-aria-describedby="time-label"
                >
                  {val}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup.Root>
          </div>
        </div>
      </header>

      <main class=" px-4 md:px-8">
        <ErrorBoundary fallback={<ErrorComp />}>
          {type === "artists" && (
            <Artists token={token} time_range={time_range} />
          )}
          {type === "tracks" && (
            <Tracks token={token} time_range={time_range} />
          )}
          {type === "albums" && <Albums token={token} />}
        </ErrorBoundary>
      </main>
    </div>
  );
}

const ErrorComp = () => {
  useEffect(() => {
    // Error occured, probably from rendering local storage, lets clear it
    window.localStorage.clear();
  }, []);
  return (
    <div>
      <p>Woops - something went wrong</p>
      <button onClick={() => window.location.reload()}>restart</button>
    </div>
  );
};

function Artists({
  token,
  time_range,
}: {
  token: string;
  time_range: TimeRange;
}) {
  const [data, setData] = useState<Artist[]>([]);
  const key = `top-artists-${time_range}`;

  useEffect(() => {
    // get Artists
    async function load() {
      if (!token) {
        window.location.href = "/";
        return;
      }
      const local = getLocal(key);
      if (local) {
        setData(local);
        return;
      }
      const { items } = await getTopArtists(token, time_range);
      if (!items) return;
      setLocal(key, items, cacheAge);
      setData(items);
    }
    load();
  }, [time_range]);

  return (
    <section>
      <h2>Your Top Artists</h2>
      <div class=" grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-10 ">
        {data.map((artist, i) => (
          <div class="  relative" key={i}>
            <div class=" aspect-square relative">
              <img
                src={artist.images[0]?.url}
                alt="album cover"
                class=" w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
            <span className=" absolute top-0 left-0 pl-3 pt-3 pr-8 pb-8  bg-[radial-gradient(ellipse_at_top_left,rgba(0,0,0,0.7),transparent_70%)] ">
              <span className=" text-[2rem] mono leading-none">{i + 1} </span>
            </span>
            <h3>{artist.name}</h3>
            <p>Popularity {artist.popularity}</p>
            {artist.genres?.length > 0 && (
              <details class=" mono text-opacity-50">
                <summary>Genres</summary>
                <p>{artist.genres.join(", ")}</p>
              </details>
            )}
            <p class="  flex flex-wrap gap-2 text-sm">
              <a
                href={artist.external_urls.spotify}
                class=" rounded-lg px-2 py-1   text-black font-bold bg-green-700"
                target="_blank"
                rel="noreferrer"
              >
                open on spotify
              </a>
              <a
                href={`https://bandcamp.com/search?item_type=b&q=${artist.name}`}
                target="_blank"
                rel="noreferrer noopener"
                class=" rounded-lg px-2 py-1  text-black font-bold bg-[#42a0bd] "
              >
                bandcamp
              </a>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Tracks({ token, time_range }: { token: string; time_range: string }) {
  const [tracks, setData] = useState<Track[]>([]);

  const key = `top-tracks-${time_range}`;
  useEffect(() => {
    // get tracks
    async function load() {
      if (!token) {
        window.location.href = "/";
        return;
      }
      const local = getLocal(key);

      if (local) {
        setData(local);
        return;
      }
      const { items } = await getTopTracks(token, time_range);
      if (!items) return;
      setLocal(key, items, cacheAge);
      setData(items);
    }
    load();
  }, [time_range]);

  return (
    <section>
      <h2>Your Top Tracks</h2>
      <div class=" grid md:grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))] gap-4 justify-center  ">
        {tracks.map((track, i) => (
          <div
            class=" group relative [clip-path:inset(0px_0px_0px_0px_round_0px)] hover:[clip-path:inset(6px_6px_6px_6px_round_20px)] transition-all "
            key={i}
          >
            <img
              src={track.album.images[0].url}
              alt="album cover"
              loading="lazy"
            />
            <div className=" opacity-0 group-hover:opacity-100 transition-opacity dur duration-[.4s] absolute inset-0 bg-gray-900 bg-opacity-70 p-6 py-8  flex flex-col text-lg">
              <h3 class=" text-2xl ">
                #{i + 1} - {track.name}
              </h3>
              <p class=" text-xl">
                By {track.artists.map((a) => a.name).join(", ")}
              </p>
              <p class=" my-12 ">Popularity {track.popularity}</p>
              <p class=" flex flex-wrap gap-2 text-sm">
                <a
                  href={track.external_urls.spotify}
                  class=" rounded-lg px-2 py-1   text-black font-bold bg-green-700"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  open on spotify
                </a>
                <a
                  href={`https://bandcamp.com/search?item_type=b&item_type=a&q=${encodeURIComponent(
                    [track.album.name, track.artists[0]?.name].join(" ")
                  )}`}
                  class=" rounded-lg px-2 py-1  text-black font-bold bg-[#42a0bd] "
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  bandcamp
                </a>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Albums({ token }: { token: string }) {
  const [data, setData] = useState([]);

  const key = "saved-albums";
  useEffect(() => {
    async function load() {
      if (!token) {
        window.location.href = "/";
        return;
      }
      const local = getLocal(key);
      if (local) {
        setData(local);
        return;
      }

      const { items } = await getAlbums(token);
      if (!items) return;

      setLocal(key, items, cacheAge);
      setData(items);
    }
    load();
  }, []);

  return (
    <section>
      <div class=" grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
        {data.map(({ album }: { album: Album }, i) => (
          <div key={i}>
            <img src={album.images[0].url} alt="album cover" loading="lazy" />
            <h3>
              #{i + 1} - {album.name}
            </h3>
            <p>By {album.artists.map((a) => a.name).join(", ")}</p>
            <p>Popularity {album.popularity}</p>
            <p class=" flex flex-wrap gap-2 text-sm">
              <a
                href={album.external_urls.spotify}
                class=" rounded-lg px-2 py-1   text-black font-bold bg-green-700"
                target="_blank"
                rel="noreferrer noopener"
              >
                open on spotify
              </a>
              <a
                href={`https://bandcamp.com/search?item_type=b&item_type=a&q=${album.name}`}
                class=" rounded-lg px-2 py-1  text-black font-bold bg-[#42a0bd] "
                target="_blank"
                rel="noreferrer noopener"
              >
                bandcamp
              </a>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const getTopTracks = (
  token: string,
  time_range: string
): Promise<{ items: Track[] }> => {
  const params = new URLSearchParams();
  params.set("time_range", time_range);
  params.set("limit", "50");
  return spotifyQuery(`/me/top/tracks?${params.toString()}`, token);
};

const getTopArtists = (
  token: string,
  time_range: string
): Promise<{ items: Artist[] }> => {
  const params = new URLSearchParams();
  params.set("time_range", time_range);
  params.set("limit", "50");
  return spotifyQuery(`/me/top/artists?${params.toString()}`, token);
};

const getAlbums = (token: string) => {
  const params = new URLSearchParams();
  params.set("limit", "50");
  return spotifyQuery(`/me/albums?${params.toString()}`, token);
};

const setLocal = (key: string, val: any, maxage?: number) => {
  const data: { data: any; expires?: number } = {
    data: val,
  };
  if (maxage) data.expires = Date.now() + maxage * 1000;
  window.localStorage.setItem(key, JSON.stringify(data));
};

const getLocal = (key: string) => {
  const str = window.localStorage.getItem(key);
  if (!str) return null;
  try {
    const { data, expires } = JSON.parse(str);
    if (!data || !expires) throw new Error("parse error");
    if (Date.now() > expires) throw new Error("expired");
    return data;
  } catch (e: any) {
    window.localStorage.removeItem(key);
    return null;
  }
};
