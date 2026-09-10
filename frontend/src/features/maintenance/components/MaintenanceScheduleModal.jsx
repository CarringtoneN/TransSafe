
import { useEffect, useMemo, useState } from "react";
import { Field, Modal, inputClass } from "./MaintenanceUI";
import userService from "../../../services/userService";

const blank = {
  scheduleNumber:"", vehicleId:"", assignedDriverId:"", serviceType:"Preventive", maintenanceCategory:"Routine",
  dueDate:"", dueMileage:"", scheduledDate:"", priority:"MEDIUM", reason:"",
  description:"", assignedTechnician:"", assignedWorkshop:"", requiredParts:"",
  status:"SCHEDULED", approvalStatus:"PENDING", createdBy:"Fleet Manager", notes:""
};

const isoLocal = value => value ? new Date(value).toISOString().slice(0,16) : "";

export default function MaintenanceScheduleModal({ open, item, vehicles, drivers, assignments = [], onClose, onSave }) {
  const [form,setForm]=useState(blank); const [error,setError]=useState(""); const [mechanics,setMechanics]=useState([]);
  useEffect(()=>{ if(open) userService.list().then(r=>setMechanics((r.data.data||[]).filter(u=>u.role==="TECHNICIAN_MECHANIC"&&u.active))).catch(()=>setMechanics([])); if(item) setForm({...blank,...item,vehicleId:item.vehicleId||"",assignedDriverId:item.assignedDriverId||"",dueDate:isoLocal(item.dueDate),scheduledDate:isoLocal(item.scheduledDate)}); else setForm({...blank,scheduledDate:new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16)}); setError(""); },[item,open]);
  const activeAssignments = useMemo(() => assignments.filter(a => a.status === "ACTIVE"), [assignments]);
  const eligibleDrivers = useMemo(() => {
    const vehicleId = Number(form.vehicleId);
    if (!vehicleId) return [];
    const ids = new Set(activeAssignments.filter(a => Number(a.vehicleId) === vehicleId).map(a => Number(a.driverId)));
    return drivers.filter(d => ids.has(Number(d.id)));
  }, [assignments, activeAssignments, drivers, form.vehicleId]);
  const change=e=>{
    const { name, value } = e.target;
    setForm(f=>{
      const next={...f,[name]:value};
      if(name === "vehicleId"){
        const vehicleId=Number(value);
        const linked=activeAssignments.filter(a=>Number(a.vehicleId)===vehicleId);
        if(linked.length>=1) {
          const stillLinked = linked.some(a=>Number(a.driverId)===Number(f.assignedDriverId));
          next.assignedDriverId = stillLinked ? String(f.assignedDriverId) : String(linked[0].driverId);
        } else next.assignedDriverId="";
      }
      return next;
    });
  };
  const submit=async e=>{e.preventDefault();setError("");if(!form.vehicleId||!form.scheduledDate||!form.serviceType||!form.reason||!form.description||!form.createdBy){setError("Vehicle, scheduled date, service type, reason, description and created by are required.");return;}try{await onSave({...form,vehicleId:Number(form.vehicleId),assignedDriverId:form.assignedDriverId?Number(form.assignedDriverId):null,dueDate:form.dueDate?new Date(form.dueDate).toISOString():null,scheduledDate:new Date(form.scheduledDate).toISOString()});}catch(e){setError(e?.response?.data?.message||"Unable to save schedule.");}};
  return <Modal open={open} onClose={onClose} title={item?"Edit Maintenance Schedule":"New Maintenance Schedule"} subtitle="Schedule preventive or corrective maintenance.">
    <form id="schedule-form" onSubmit={submit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field label="Schedule Number"><input name="scheduleNumber" value={form.scheduleNumber} onChange={change} className={inputClass} placeholder="MS-2026-0001" required/></Field>
      <Field label="Vehicle"><select name="vehicleId" value={form.vehicleId} onChange={change} className={inputClass} required><option value="">Select vehicle</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.registration} — {v.make} {v.model}</option>)}</select></Field>
      <Field label="Assigned Driver"><select name="assignedDriverId" value={form.assignedDriverId} onChange={change} className={inputClass} disabled={!form.vehicleId}><option value="">{form.vehicleId ? (eligibleDrivers.length ? "Select allocated driver" : "No driver allocated to this vehicle") : "Select vehicle first"}</option>{eligibleDrivers.map(d=><option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}</select>{form.vehicleId && eligibleDrivers.length===1 && <p className="mt-1 text-xs text-slate-500">Automatically selected from the active vehicle allocation.</p>}</Field>
      <Field label="Service Type"><select name="serviceType" value={form.serviceType} onChange={change} className={inputClass}><option>Routine</option><option>Major</option><option>Minor</option><option>Preventive</option><option>Corrective</option></select></Field>
      <Field label="Maintenance Category"><input name="maintenanceCategory" value={form.maintenanceCategory} onChange={change} className={inputClass} placeholder="Brakes, engine, tyres..."/></Field>
      <Field label="Scheduled Date"><input type="datetime-local" name="scheduledDate" value={form.scheduledDate} onChange={change} className={inputClass} required/></Field>
      <Field label="Due Date"><input type="datetime-local" name="dueDate" value={form.dueDate} onChange={change} className={inputClass}/></Field>
      <Field label="Due Mileage (km)"><input type="number" min="0" name="dueMileage" value={form.dueMileage} onChange={change} className={inputClass}/></Field>
      <Field label="Priority"><select name="priority" value={form.priority} onChange={change} className={inputClass}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></Field>
      <Field label="Status"><select name="status" value={form.status} onChange={change} className={inputClass}><option>SCHEDULED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option></select></Field>
      <Field label="Approval Status"><select name="approvalStatus" value={form.approvalStatus} onChange={change} className={inputClass}><option>PENDING</option><option>APPROVED</option><option>REJECTED</option></select></Field>
      <Field label="Mechanic"><select value={mechanics.find(m=>m.name===form.assignedTechnician)?.id || ""} onChange={e=>{const mechanic=mechanics.find(u=>String(u.id)===e.target.value);setForm(f=>({...f,assignedTechnician:mechanic?.name||"",assignedWorkshop:mechanic?.workshop||""}));}} className={inputClass}><option value="">Select registered mechanic</option>{mechanics.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></Field><Field label="Workshop"><input name="assignedWorkshop" value={form.assignedWorkshop} onChange={change} className={inputClass} readOnly={!!form.assignedTechnician}/></Field>
      <Field label="Created By"><input name="createdBy" value={form.createdBy} onChange={change} className={inputClass} required/></Field>
      <Field label="Required Parts" className="md:col-span-2"><textarea name="requiredParts" value={form.requiredParts} onChange={change} className={inputClass} rows="3" placeholder="List parts, quantities and part numbers."/></Field>
      <Field label="Reason" className="md:col-span-2"><input name="reason" value={form.reason} onChange={change} className={inputClass} required/></Field>
      <Field label="Description of Work Required" className="md:col-span-2"><textarea name="description" value={form.description} onChange={change} className={inputClass} rows="4" required/></Field>
      <Field label="Notes" className="md:col-span-2"><textarea name="notes" value={form.notes} onChange={change} className={inputClass} rows="3"/></Field>
      {error && <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border px-5 py-2.5">Cancel</button><button className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">{item?"Update Schedule":"Create Schedule"}</button></div>
    </form>
  </Modal>;
}
