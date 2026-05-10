
import { useState } from "react";

export default function App(){
  const [key,setKey]=useState("");
  const [field,setField]=useState("");
  const [value,setValue]=useState("");
  const [out,setOut]=useState("");

  const call = async (url,method="GET",body)=>{
    const res = await fetch("http://localhost:5000"+url,{
      method,
      headers:{'Content-Type':'application/json'},
      body: body ? JSON.stringify(body) : null
    });
    const data = await res.json();
    setOut(JSON.stringify(data,null,2));
  };

  return (
    <div style={{padding:20}}>
      <h2>Redis HASH Commands (Vite)</h2>

      <input placeholder="Key" onChange={e=>setKey(e.target.value)}/>
      <input placeholder="Field" onChange={e=>setField(e.target.value)}/>
      <input placeholder="Value" onChange={e=>setValue(e.target.value)}/>

      <br/><br/>

      <button onClick={()=>call("/redis/hset","POST",{key,field,value})}>HSET</button>
      <button onClick={()=>call(`/redis/hget/${key}/${field}`)}>HGET</button>
      <button onClick={()=>call(`/redis/hgetall/${key}`)}>HGETALL</button>
      <button onClick={()=>call(`/redis/hlen/${key}`)}>HLEN</button>
      <button onClick={()=>call(`/redis/hexists/${key}/${field}`)}>HEXISTS</button>
      <button onClick={()=>call(`/redis/hdel/${key}/${field}`,"DELETE")}>HDEL</button>
      <button onClick={()=>call(`/redis/hkeys/${key}`)}>HKEYS</button>
      <button onClick={()=>call(`/redis/hvals/${key}`)}>HVALS</button>

      <pre>{out}</pre>
    </div>
  );
}
