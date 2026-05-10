
import { useState } from "react";

export default function App(){
  const [result,setResult]=useState("");

  const hitApi = async ()=>{
    try{
      const res = await fetch("http://localhost:5000/api/data");
      const data = await res.json();
      setResult(JSON.stringify(data));
    }catch(err){
      setResult("Blocked by rate limiter");
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>Redis Rate Limiting Demo</h2>
      <button onClick={hitApi}>Send Request</button>
      <p>{result}</p>
      <p>Max 5 requests per minute</p>
    </div>
  );
}
