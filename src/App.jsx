import React, { useState } from "react";

export function App({ url }) {
  const [count, setCount] = useState(0);
  return (
    <main>
      React app for {url}
      <div>
        Count: {count}
        <button onClick={() => setCount((n) => n - 1)}>-</button>
        <button onClick={() => setCount((n) => n + 1)}>+</button>
      </div>
    </main>
  );
}
