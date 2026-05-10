
import { useState } from "react";

export default function App(){
  const [key,setKey]=useState("");
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
      <h2>Redis SET Commands (Vite)</h2>

      <input placeholder="Key" onChange={e=>setKey(e.target.value)}/>
      <input placeholder="Value(s) comma separated" onChange={e=>setValue(e.target.value)}/>

      <br/><br/>

      <button onClick={()=>call("/redis/sadd","POST",{key,values:value.split(",")})}>SADD</button>
      <button onClick={()=>call(`/redis/smembers/${key}`)}>SMEMBERS</button>
      <button onClick={()=>call("/redis/srem","POST",{key,values:value.split(",")})}>SREM</button>
      <button onClick={()=>call(`/redis/scard/${key}`)}>SCARD</button>
      <button onClick={()=>call(`/redis/sismember/${key}/${value}`)}>SISMEMBER</button>
      <button onClick={()=>call(`/redis/srandmember/${key}`)}>SRANDMEMBER</button>
      <button onClick={()=>call(`/redis/spop/${key}`)}>SPOP</button>

      <pre>{out}</pre>
    </div>
  );
}
