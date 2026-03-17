export default function NotificationToast({message}){
  if(!message)return null;
  return(
    <div style={{position:"fixed",bottom:24,right:24,background:"#0d1620",border:"1px solid var(--accent-teal)",borderRadius:8,padding:"12px 18px",color:"var(--accent-teal)",fontFamily:"'DM Mono',monospace",fontSize:12,zIndex:9999,animation:"fadeIn .3s ease",boxShadow:"0 0 20px rgba(0,184,148,0.2)"}}>{message}</div>
  );
}
