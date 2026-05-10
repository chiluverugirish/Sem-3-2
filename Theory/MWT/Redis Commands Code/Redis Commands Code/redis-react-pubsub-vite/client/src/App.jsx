
import { useState } from "react";

export default function App(){
  const [msg,setMsg]=useState("");
  const [status,setStatus]=useState("");

  const publish = async ()=>{
    const res = await fetch("http://localhost:5000/publish",{
      method:"POST",
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({message:msg})
    });
    const data = await res.json();
    setStatus(data.status);
  };

  return (
    <div style={{padding:20}}>
      <h2>Redis Pub/Sub Demo</h2>
      <input placeholder="Message" onChange={e=>setMsg(e.target.value)} />
      <button onClick={publish}>PUBLISH</button>
      <p>{status}</p>
      <p>Check backend console for received messages</p>
    </div>
  );
}
