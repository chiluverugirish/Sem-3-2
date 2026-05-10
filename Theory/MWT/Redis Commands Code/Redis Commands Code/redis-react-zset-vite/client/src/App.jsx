
import { useState } from "react";

export default function App(){
  const [key,setKey]=useState("");
  const [member,setMember]=useState("");
  const [score,setScore]=useState("");
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
      <h2>Redis SORTED SET (ZSET) Commands</h2>

      <input placeholder="Key" onChange={e=>setKey(e.target.value)}/>
      <input placeholder="Member" onChange={e=>setMember(e.target.value)}/>
      <input placeholder="Score" onChange={e=>setScore(e.target.value)}/>

      <br/><br/>

      <button onClick={()=>call("/redis/zadd","POST",{key,score,member})}>ZADD</button>
      <button onClick={()=>call(`/redis/zrange/${key}`)}>ZRANGE</button>
      <button onClick={()=>call(`/redis/zrevrange/${key}`)}>ZREVRANGE</button>
      <button onClick={()=>call(`/redis/zscore/${key}/${member}`)}>ZSCORE</button>
      <button onClick={()=>call(`/redis/zrank/${key}/${member}`)}>ZRANK</button>
      <button onClick={()=>call(`/redis/zrevrank/${key}/${member}`)}>ZREVRANK</button>
      <button onClick={()=>call(`/redis/zcard/${key}`)}>ZCARD</button>
      <button onClick={()=>call("/redis/zrem","POST",{key,member})}>ZREM</button>

      <pre>{out}</pre>
    </div>
  );
}
