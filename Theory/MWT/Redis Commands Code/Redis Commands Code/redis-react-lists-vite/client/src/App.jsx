
import { useState } from "react";

export default function App(){
  const [key,setKey]=useState("");
  const [value,setValue]=useState("");
  const [extra,setExtra]=useState("");
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
      <h2>Redis LIST Commands (Vite)</h2>

      <input placeholder="Key" onChange={e=>setKey(e.target.value)}/>
      <input placeholder="Value(s) / Pivot" onChange={e=>setValue(e.target.value)}/>
      <input placeholder="Extra (index / BEFORE|AFTER)" onChange={e=>setExtra(e.target.value)}/>

      <br/><br/>

      <button onClick={()=>call("/redis/lpush","POST",{key,values:value.split(",")})}>LPUSH</button>
      <button onClick={()=>call("/redis/rpush","POST",{key,values:value.split(",")})}>RPUSH</button>
      <button onClick={()=>call(`/redis/lrange/${key}?start=0&end=-1`)}>LRANGE</button>
      <button onClick={()=>call(`/redis/lpop/${key}`,"POST")}>LPOP</button>
      <button onClick={()=>call(`/redis/rpop/${key}`,"POST")}>RPOP</button>
      <button onClick={()=>call(`/redis/llen/${key}`)}>LLEN</button>
      <button onClick={()=>call(`/redis/lindex/${key}/${extra}`)}>LINDEX</button>
      <button onClick={()=>call("/redis/lset","POST",{key,index:extra,value})}>LSET</button>
      <button onClick={()=>call("/redis/lpushx","POST",{key,value})}>LPUSHX</button>
      <button onClick={()=>call("/redis/linsert","POST",{key,position:extra,pivot:value,value:"NEW"})}>LINSERT</button>

      <pre>{out}</pre>
    </div>
  );
}
