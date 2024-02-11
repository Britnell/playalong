import { useState } from "react";

export const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      asdas
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
    </div>
  );
};
