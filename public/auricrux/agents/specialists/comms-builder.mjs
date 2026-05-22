import fs from "fs";

export function build() {
  fs.mkdirSync("src/components", { recursive: true });
  const p = "src/components/AuricruxDock.jsx";
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, `import {useState} from "react";
export default function AuricruxDock(){
  const [text,setText]=useState("");
  const [log,setLog]=useState([]);
  function send(){
    if(!text.trim()) return;
    setLog([{t:new Date().toISOString(),m:text},...log]);
    setText("");
  }
  function speak(){
    if(!("speechSynthesis" in window)) return;
    const u=new SpeechSynthesisUtterance("Auricrux is online.");
    window.speechSynthesis.speak(u);
  }
  async function video(){
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      s.getTracks().forEach(tr=>tr.stop());
      alert("Video capability available (capture test passed).");
    }catch(e){
      alert("Video capability blocked by browser policy or permissions.");
    }
  }
  return (
    <div style={{position:"fixed",right:16,bottom:16,width:320,background:"#fff",border:"1px solid #ddd",borderRadius:12,padding:12,boxShadow:"0 10px 30px rgba(0,0,0,.12)"}}>
      <div style={{fontWeight:700,marginBottom:8}}>Auricrux™</div>
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={speak}>Voice</button>
        <button onClick={video}>Video</button>
      </div>
      <div style={{display:"flex",gap:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Message Auricrux…" style={{flex:1}}/>
        <button onClick={send}>Send</button>
      </div>
      <div style={{marginTop:8,maxHeight:160,overflow:"auto",fontSize:12}}>
        {log.map((x,i)=>(<div key={i} style={{borderTop:"1px solid #eee",paddingTop:6,marginTop:6}}><div style={{opacity:.6}}>{x.t}</div><div>{x.m}</div></div>))}
      </div>
    </div>
  );
}`);
  }
}