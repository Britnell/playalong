import React from "react";

const client_id = import.meta.env.client_id;
const redirect_uri = import.meta.env.redirect_uri;

const scopes = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
];

function spotifyLoginURL() {
  return (
    "https://accounts.spotify.com/authorize" +
    "?client_id=" +
    clientId +
    "&response_type=token" +
    "&redirect_uri=" +
    encodeURIComponent(redirectURI) +
    "&scope=" +
    scopes.join("%20") +
    "&state=listening-101"
  );
}

function checkUrlToken() {
  let hash = window.location.hash,
    i;
  if (hash.length === 0) return;
  i = hash.indexOf("access_token");
  if (i === -1) return;
  let beg = hash.indexOf("=", i) + 1;
  let end = hash.indexOf("&", beg);
  if (beg === -1 || end === -1) return;
  return hash.slice(beg, end);
}

function useSpotifApi() {
  const [token] = React.useState(() => checkUrlToken());

  const getter = React.useCallback(
    (url) => {
      return fetch("https://api.spotify.com/v1" + url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).then((resp) => {
        if (resp.status === 401) {
          // TOKEN EXPIRED
        } else if (resp.status === 403) {
          // Bad OAuth request
        } else if (resp.status === 429) {
          // exceeded rate limits
        }
        // else return resp;
        if (resp.status === 200) return resp.json();
        else return;
      });
    },
    [token]
  );

  const getPlayback = () => {
    return getter("/me/player");
  };

  const getTrack = (id) => {
    return getter(`/audio-analysis/${id}`);
  };

  return [token, { getPlayback, getTrack }];
}

export { spotifyLoginURL, useSpotifApi };
