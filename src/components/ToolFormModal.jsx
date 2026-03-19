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
          <div className="form-grid">
            <label className="form-label">Tool Name *
              <input className="form-input" value={toolForm.name} onChange={e=>setToolForm(p=>({...p,name:e.target.value}))} placeholder="e.g. TPE Tool 11"/>
            </label>
            <label className="form-label">Version
              <input className="form-input" value={toolForm.v} onChange={e=>setToolForm(p=>({...p,v:e.target.value}))} placeholder="1.0.0"/>
            </label>
            <label className="form-label">Type
              <select className="form-input" value={toolForm.cat} onChange={e=>setToolForm(p=>({...p,cat:e.target.value,unit:e.target.value==="HW"?"HW Q":"SW Q"}))}>
                <option value="HW">HW</option><option value="SW">SW</option>
              </select>
            </label>
            <label className="form-label">Site
              <select className="form-input" value={toolForm.dev_site} onChange={e=>setToolForm(p=>({...p,dev_site:e.target.value}))}>
                <option value="TPE">TPE</option><option value="XM">XM</option><option value="FQ">FQ</option>
              </select>
            </label>
            <label className="form-label">Team
              <input className="form-input" value={toolForm.dev_unit} onChange={e=>setToolForm(p=>({...p,dev_unit:e.target.value}))} placeholder="e.g. Monitor"/>
            </label>
            <label className="form-label">Unit
              <input className="form-input" value={toolForm.unit} onChange={e=>setToolForm(p=>({...p,unit:e.target.value}))} placeholder="HW Q / SW Q"/>
            </label>
            <label className="form-label">Developer
              <input className="form-input" value={toolForm.devName} onChange={e=>setToolForm(p=>({...p,devName:e.target.value}))} placeholder="Name"/>
            </label>
            <label className="form-label">Email
              <input className="form-input" value={toolForm.devEmail} onChange={e=>setToolForm(p=>({...p,devEmail:e.target.value}))} placeholder="email@company.com"/>
            </label>
            <label className="form-label">Ext
              <input className="form-input" value={toolForm.devExt} onChange={e=>setToolForm(p=>({...p,devExt:e.target.value}))} placeholder="2501"/>
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
