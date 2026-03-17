import { useState, useEffect } from "react";

export default function CountUp({target,suffix=""}){
  const[v,setV]=useState(0);
  useEffect(()=>{let c=0;const s=Math.max(1,Math.ceil(target/40));const t=setInterval(()=>{c=Math.min(c+s,target);setV(c);if(c>=target)clearInterval(t)},30);return()=>clearInterval(t)},[target]);
  return<>{v}{suffix}</>;
}
