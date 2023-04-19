import { useCallback, useEffect, useState } from "preact/hooks";

const client_id = import.meta.env.VITE_CLIENT_ID;
const redirect_uri = import.meta.env.VITE_REDIRECT_URI;

const scopes = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
];

export function spotifyLoginURL(): string {
  return (
    "https://accounts.spotify.com/authorize" +
    "?client_id=" +
    client_id +
    "&response_type=token" +
    "&redirect_uri=" +
    encodeURIComponent(redirect_uri) +
    "&scope=" +
    scopes.join("%20") +
    "&state=listening-101"
  );
}

export function loadHashToken() {
  let hash = window.location.hash,
    i;
  if (!hash) return "";
  i = hash.indexOf("access_token");
  if (i === -1) return "";
  let beg = hash.indexOf("=", i) + 1;
  let end = hash.indexOf("&", beg);
  if (beg === -1 || end === -1) return "";
  return hash.slice(beg, end);
}

export function useSpotify(): [string, any] {
  const [token] = useState<string>(loadHashToken);

  const query = useCallback(
    (url: string): Promise<any> => {
      return fetch("https://api.spotify.com/v1" + url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).then((resp) => {
        if (resp.status === 200) return resp.json();
        console.log(" err ", resp.status);
        if (resp.status === 401) {
          // TOKEN EXPIRED
          window.location.href = spotifyLoginURL();
        }
        if (resp.status === 403) {
          // Bad OAuth request
        }
        if (resp.status === 429) {
          // exceeded rate limits
        }
        return { error: resp.status };
      });
    },
    [token]
  );

  return [token, query];
}

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

export function findSecSeg(list: Section[], start: number, end: number) {
  let sects = [];

  for (let x = 0; x < list.length; x++) {
    const sec = list[x];

    if (sec.start < end && sec.start + sec.duration > start) sects.push(sec);
    else if (sec.start > end) break;
  }
  return sects;
}
