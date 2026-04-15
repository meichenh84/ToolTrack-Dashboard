import { useRef } from "react";
import { SITES } from "../data/rankings.js";

export function getVisualWidth(str){
  let w=0;
  for(const ch of str){const c=ch.codePointAt(0);if((c>=0x4E00&&c<=0x9FFF)||(c>=0x3400&&c<=0x4DBF)||(c>=0xF900&&c<=0xFAFF)||(c>=0xFF01&&c<=0xFF60)||(c>=0xFFE0&&c<=0xFFE6)||(c>=0x3000&&c<=0x303F)||(c>=0x3040&&c<=0x309F)||(c>=0x30A0&&c<=0x30FF)||(c>=0xAC00&&c<=0xD7AF)||(c>=0x20000&&c<=0x2A6DF))w+=2;else w+=1;}
  return w;
}

const CharHint=({value="",max})=>{
  const left=max-(value||"").length;
  return <span className="char-hint" style={left<=Math.ceil(max*0.1)?{color:"var(--accent-red)"}:undefined}>{left}/{max}</span>;
};

const DateEN=({value,onChange})=>{
  const ref=useRef();
  return(
    <div style={{position:"relative",width:"100%"}}>
      <input className="form-input" type="text" readOnly value={value||""} placeholder="YYYY-MM-DD" onClick={()=>ref.current?.showPicker?.()} style={{width:"100%",cursor:"pointer",boxSizing:"border-box"}}/>
      <input ref={ref} type="date" value={value||""} onChange={onChange} tabIndex={-1} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0,pointerEvents:"none"}}/>
    </div>
  );
};

const VisualWidthHint=({value="",maxVisual=30})=>{
  const vw=getVisualWidth(value||"");
  const left=maxVisual-vw;
  return <span className="char-hint" style={left<=Math.ceil(maxVisual*0.1)?{color:"var(--accent-red)"}:undefined}>{vw}/{maxVisual}</span>;
};

export default function ToolFormModal({editingTool,toolForm,setToolForm,onSave,onClose}){
  return(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{width:560}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{editingTool?"Edit Tool":"Add New Tool"}</div>
            <div className="modal-sub">{editingTool?`Editing ${editingTool.name}`:"Fill in tool details"}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="form-label" style={{marginBottom:10}}>Full Name
            <input className="form-input" value={`${toolForm.dev_site}_${toolForm.cat}_${toolForm.name}`} readOnly style={{background:"var(--bg-secondary)",cursor:"default"}}/>
          </label>
          <div className="form-grid">
            <label className="form-label">Tool Name *
              <input className="form-input" value={toolForm.name} onChange={e=>setToolForm(p=>({...p,name:e.target.value}))} placeholder="e.g. TPE Tool 11" maxLength={50} required/>
              <VisualWidthHint value={toolForm.name} maxVisual={30}/>
            </label>
            <label className="form-label">Version
              <input className="form-input" value={toolForm.v} onChange={e=>setToolForm(p=>({...p,v:e.target.value}))} placeholder="1.0.0" maxLength={30}/>
              <CharHint value={toolForm.v} max={30}/>
            </label>
            <label className="form-label">Type
              <select className="form-input" value={toolForm.cat} onChange={e=>setToolForm(p=>({...p,cat:e.target.value}))}>
                <option value="HW">HW</option><option value="SW">SW</option>
              </select>
            </label>
            <label className="form-label">Dev Site
              <select className="form-input" value={toolForm.dev_site} onChange={e=>setToolForm(p=>({...p,dev_site:e.target.value}))}>
                {SITES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="form-label">Dev Unit
              <input className="form-input" value={toolForm.dev_unit} onChange={e=>setToolForm(p=>({...p,dev_unit:e.target.value}))} placeholder="e.g. Monitor" maxLength={50}/>
              <CharHint value={toolForm.dev_unit} max={50}/>
            </label>
            <label className="form-label">Service Start
              <DateEN value={toolForm.finish_date} onChange={e=>setToolForm(p=>({...p,finish_date:e.target.value}))}/>
            </label>
            <label className="form-label">Service End Date
              <DateEN value={toolForm.service_end_date} onChange={e=>setToolForm(p=>({...p,service_end_date:e.target.value}))}/>
            </label>
            <label className="form-label">Developer
              <input className="form-input" value={toolForm.devName} onChange={e=>setToolForm(p=>({...p,devName:e.target.value}))} placeholder="Name" maxLength={50}/>
              <CharHint value={toolForm.devName} max={50}/>
            </label>
            <label className="form-label">Email
              <input className="form-input" type="email" value={toolForm.devEmail} onChange={e=>setToolForm(p=>({...p,devEmail:e.target.value}))} placeholder="developer@tpv-tech.com" maxLength={100}/>
              <CharHint value={toolForm.devEmail} max={100}/>
            </label>
            <label className="form-label">Ext
              <input className="form-input" value={toolForm.devExt} onChange={e=>setToolForm(p=>({...p,devExt:e.target.value}))} placeholder="82-8888" maxLength={20}/>
              <CharHint value={toolForm.devExt} max={20}/>
            </label>
          </div>
          <div className="form-actions">
            <button className="crud-btn cancel-btn" onClick={onClose}>Cancel</button>
            <button className="crud-btn save-btn" onClick={onSave}>{editingTool?"Save Changes":"Add Tool"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
