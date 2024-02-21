const client_id = import.meta.env.SPOTIFY_CLIENT_ID;
const redirect_uri = import.meta.env.SPOTIFY_REDIRECT_URI;

export type Section = {
  start: number;
  end: number;
  duration: number;
  confidence: number;
  tempo: number;
  key: number;
};

export type Bar = {
  start: number;
  duration: number;
  confidence: number;
};

export type Segment = {
  duration: number;
  start: number;
  confidence: number;
  pitches: number[];
};

export type SongData = {
  meta: {
    timestamp: number;
  };
  track: {
    time_signature: number;
    tempo: number;
  };
  bars: Bar[];
  sections: Section[];
  segments: Segment[];
};

const scopes = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-top-read",
  "user-library-read",
];

export const spotifyLoginURL = (path: string) =>
  "https://accounts.spotify.com/authorize" +
  `?client_id=${client_id}` +
  "&response_type=token" +
  `&redirect_uri=${encodeURIComponent(`${redirect_uri}/app/${path}`)}` +
  `&scope=${scopes.join("%20")}` +
  "&state=listening-101";

export const getHashToken = () => {
  let hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.slice(1));
  return params.get("access_token");
};

export const tokenInit = () => {
  const hash = getHashToken();
  const local = getLocalToken();
  if (!hash) return local;

  setLocalToken(hash);
  return hash;
};

const localkey = "spotifytoken";
export const getLocalToken = () => window.localStorage.getItem(localkey);
export const setLocalToken = (value: string) =>
  window.localStorage.setItem(localkey, value);

export function spotifyQuery(url: string, token: string) {
  return fetch("https://api.spotify.com/v1" + url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then((resp) => {
    if (resp.status === 200) return resp.json();

    if (resp.status === 204) return { error: "silence" };

    console.error(" err ", resp.status);
    if (resp.status === 401) {
      window.location.href = "/";
      return { error: "expired" };
    }
    if (resp.status === 403) {
      // Bad OAuth request
      return { error: "auth" };
    }
    if (resp.status === 429) {
      // exceeded rate limits
      return { error: "rate" };
    }
    return { error: resp.status };
  });
}

export const notes = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const linear = (
  x: number,
  min: number,
  max: number,
  ymin: number,
  ymax: number
) => ymin + ((x - min) / (max - min)) * (ymax - ymin);

export const expon = (
  x: number,
  min: number,
  max: number,
  ymin: number,
  ymax: number
) => {
  const prop = (x - min) / (max - min);
  return ymin + prop * prop * (ymax - ymin);
};

export const round = (x: number, digits: number = 10) =>
  Math.floor(x * digits) / digits;
