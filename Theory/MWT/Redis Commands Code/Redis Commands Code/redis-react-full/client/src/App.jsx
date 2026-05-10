import { useState } from "react";

export default function App() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [output, setOutput] = useState("");

  const call = async (url, method = "GET", body) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json();
    setOutput(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Redis Commands UI</h2>

      <input placeholder="Key" onChange={e => setKey(e.target.value)} />
      <input placeholder="Value" onChange={e => setValue(e.target.value)} />

      <br /><br />

      <button onClick={() => call("http://localhost:5000/redis/set", "POST", { key, value })}>SET</button>
      <button onClick={() => call(`http://localhost:5000/redis/get/${key}`)}>GET</button>
      <button onClick={() => call(`http://localhost:5000/redis/incr/${key}`, "POST")}>INCR</button>
      <button onClick={() => call(`http://localhost:5000/redis/decr/${key}`, "POST")}>DECR</button>
      <button onClick={() => call(`http://localhost:5000/redis/del/${key}`, "DELETE")}>DEL</button>
      <button onClick={() => call("http://localhost:5000/redis/keys")}>KEYS</button>
      <button onClick={() => call("http://localhost:5000/redis/flushall", "DELETE")}>FLUSHALL</button>

      <pre>{output}</pre>
    </div>
  );
}
