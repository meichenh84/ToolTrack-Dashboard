import { useRef, useState, useCallback } from "react";
import { SITES } from "../data/rankings.js";

const BLOCKED_RE=/[<>&"'`\s]/g;
const HOVER_TIP='中文字佔2，英文與半形符號佔1\n以下符號不可使用： < > & " \' `';
const EMAIL_RE=/[^a-zA-Z0-9@._-]/g;
const EMAIL_TIP='預設帶入 @tpv-tech.com\n允許符號： @  .  _  -\n其餘特殊符號與空格皆不可使用';

const HintTip=({text})=>{
  const[pos,setPos]=useState(null);
  const show=useCallback(e=>{const r=e.currentTarget.getBoundingClientRect();setPos({left:r.left+r.width/2,top:r.top-8})},[]);
  const hide=useCallback(()=>setPos(null),[]);
  return<><span className="hint-tip" onMouseEnter={show} onMouseLeave={hide}>(?)</span>{pos&&<div className="hint-tip-popup" style={{left:pos.left,top:pos.top,transform:"translateX(-50%) translateY(-100%)"}}>{text}</div>}</>;
};

export function getVisualWidth(str){
  let w=0;
  for(const ch of str){const c=ch.codePointAt(0);if((c>=0x4E00&&c<=0x9FFF)||(c>=0x3400&&c<=0x4DBF)||(c>=0xF900&&c<=0xFAFF)||(c>=0xFF01&&c<=0xFF60)||(c>=0xFFE0&&c<=0xFFE6)||(c>=0x3000&&c<=0x303F)||(c>=0x3040&&c<=0x309F)||(c>=0x30A0&&c<=0x30FF)||(c>=0xAC00&&c<=0xD7AF)||(c>=0x20000&&c<=0x2A6DF))w+=2;else w+=1;}
  return w;
}

const CharHint=({value="",max})=>{
  const left=max-(value||"").length;
  return <span className="char-hint" style={left<=Math.ceil(max*0.1)?{color:"var(--accent-red)"}:undefined}>{left}/{max}</span>;
};

const DateEN=({value,onChange,disabled})=>{
  const ref=useRef();
  return(
    <div style={{position:"relative",width:"100%",opacity:disabled?.4:1}}>
      <input className="form-input" type="text" readOnly value={value||""} placeholder="YYYY-MM-DD" onClick={()=>!disabled&&ref.current?.showPicker?.()} style={{width:"100%",cursor:disabled?"not-allowed":"pointer",boxSizing:"border-box",background:disabled?"var(--bg-secondary)":undefined}}/>
      <input ref={ref} type="date" value={value||""} onChange={onChange} tabIndex={-1} disabled={disabled} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0,pointerEvents:"none"}}/>
    </div>
  );
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
          <label className="form-label" style={{marginBottom:10}}><span>Full Name<span style={{fontSize:9,color:"var(--text-muted)",marginLeft:6,fontWeight:400}}>(由 Dev Site + Type + Tool Name 自動組合)</span></span>
            <input className="form-input" value={`${toolForm.dev_site}_${toolForm.cat}_${toolForm.name}`} readOnly style={{background:"var(--bg-secondary)",cursor:"default"}}/>
          </label>
          <div className="form-grid">
            <label className="form-label">Tool Name *
              <input className="form-input" value={toolForm.name} onChange={e=>{const v=e.target.value.replace(BLOCKED_RE,'');if(getVisualWidth(v)<=30)setToolForm(p=>({...p,name:v}))}} placeholder="Auto_Run_Test_Tool" maxLength={30} required/>
              <span className="char-hint" style={(30-getVisualWidth(toolForm.name))<=3?{color:"var(--accent-red)"}:undefined}>{getVisualWidth(toolForm.name)}/30<span style={{fontSize:9,color:"var(--text-muted)",marginLeft:6}}>僅限中、英、符號，不允許空格</span><HintTip text={HOVER_TIP}/></span>
            </label>
            <label className="form-label">Version *
              <input className="form-input" value={toolForm.v} onChange={e=>{const raw=e.target.value;const digits=raw.replace(/[^\d]/g,'').slice(0,4);let v;if(digits.length>2)v=digits.slice(0,2)+'.'+digits.slice(2);else if(digits.length===2&&raw.includes('.'))v=digits+'.';else v=digits;setToolForm(p=>({...p,v}))}} placeholder="01.00" maxLength={5}/>
              <span className="char-hint">格式：00.00~99.99</span>
            </label>
            <label className="form-label">Type *
              <select className="form-input" value={toolForm.cat} onChange={e=>setToolForm(p=>({...p,cat:e.target.value}))}>
                <option value="HW">HW</option><option value="SW">SW</option><option value="ME">ME</option><option value="RTE">RTE</option><option value="Others">Others</option>
              </select>
            </label>
            <label className="form-label">Dev Site *
              <select className="form-input" value={toolForm.dev_site} onChange={e=>setToolForm(p=>({...p,dev_site:e.target.value}))}>
                {SITES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="form-label">Dev Unit *
              <select className="form-input" value={toolForm.dev_unit} onChange={e=>setToolForm(p=>({...p,dev_unit:e.target.value}))}>
                <option value="Monitor">Monitor</option><option value="TV">TV</option><option value="PD">PD</option><option value="Others">Others</option>
              </select>
            </label>
            <label className="form-label">Developer *
              <input className="form-input" value={toolForm.devName} onChange={e=>{const v=e.target.value.replace(/[<>&"'`]/g,'');if(getVisualWidth(v)<=30)setToolForm(p=>({...p,devName:v}))}} placeholder="Name" maxLength={30}/>
              <span className="char-hint" style={(30-getVisualWidth(toolForm.devName))<=3?{color:"var(--accent-red)"}:undefined}>{getVisualWidth(toolForm.devName)}/30<span style={{fontSize:9,color:"var(--text-muted)",marginLeft:6}}>僅限中、英、符號</span><HintTip text={HOVER_TIP}/></span>
            </label>
            <label className="form-label">Email *
              <input className="form-input" value={toolForm.devEmail} onChange={e=>{const v=e.target.value.replace(EMAIL_RE,'');if(v.length<=50)setToolForm(p=>({...p,devEmail:v}))}} onFocus={e=>{if(!toolForm.devEmail){setToolForm(p=>({...p,devEmail:"@tpv-tech.com"}));setTimeout(()=>{e.target.setSelectionRange(0,0)},0)}}} placeholder="developer_name@tpv-tech.com" maxLength={50}/>
              <span className="char-hint" style={(50-(toolForm.devEmail||"").length)<=5?{color:"var(--accent-red)"}:undefined}>{(toolForm.devEmail||"").length}/50<span style={{fontSize:9,color:"var(--text-muted)",marginLeft:6}}>僅限英數與部分符號，不允許空格</span><HintTip text={EMAIL_TIP}/></span>
            </label>
            <label className="form-label">Ext *
              <input className="form-input" value={toolForm.devExt} onChange={e=>{const raw=e.target.value;const digits=raw.replace(/[^\d]/g,'').slice(0,6);let v;if(digits.length>2)v=digits.slice(0,2)+'-'+digits.slice(2);else if(digits.length===2&&raw.includes('-'))v=digits+'-';else v=digits;if(v.length<=7)setToolForm(p=>({...p,devExt:v}))}} placeholder="82-8888" maxLength={7}/>
              <span className="char-hint" style={(7-(toolForm.devExt||"").length)<=2?{color:"var(--accent-red)"}:undefined}>{(toolForm.devExt||"").length}/7<span style={{fontSize:9,color:"var(--text-muted)",marginLeft:6}}>格式：XX-XXXX（6位數字+1個 -）</span></span>
            </label>
            <label className="form-label">Service Start *
              <DateEN value={toolForm.finish_date} onChange={e=>setToolForm(p=>({...p,finish_date:e.target.value}))}/>
            </label>
            <label className="form-label">Service End Date
              <DateEN value={toolForm.service_end_date} onChange={e=>setToolForm(p=>({...p,service_end_date:e.target.value}))} disabled={!editingTool}/>
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
