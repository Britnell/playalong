import { spotifyLoginURL } from "../lib/spotify";

export default function Login() {
  return (
    <div>
      <div>
        <div>LOGIN to spotify to link with your current listening</div>
        <a href={spotifyLoginURL()}>Login</a>
      </div>
    </div>
  );
}
