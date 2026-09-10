
import maintenanceService from "../services/maintenanceService.js";

function sendError(res, error) {
  const status = error?.name === "ZodError" ? 400 : error?.code === "P2025" ? 404 : error?.code === "P2002" ? 409 : error?.code === "P2003" ? 400 : 500;
  const message = error?.name === "ZodError" ? "Please check the submitted fields." : error?.code === "P2003" ? "The selected vehicle or driver does not exist." : error?.message || "Maintenance request failed.";
  return res.status(status).json({ success: false, message, issues: error?.issues || undefined });
}

class MaintenanceController {
  async dashboard(req, res) { try { res.json({ success: true, data: await maintenanceService.getDashboard() }); } catch (e) { sendError(res, e); } }
  async reminders(req, res) { try { res.json({ success: true, data: await maintenanceService.getReminders() }); } catch (e) { sendError(res, e); } }

  async schedules(req, res) { try { res.json({ success: true, data: await maintenanceService.listSchedules() }); } catch (e) { sendError(res, e); } }
  async schedule(req, res) { try { const x = await maintenanceService.getSchedule(req.params.id); if (!x) return res.status(404).json({success:false,message:"Maintenance schedule not found."}); res.json({success:true,data:x}); } catch(e){sendError(res,e);} }
  async createSchedule(req,res){try{res.status(201).json({success:true,data:await maintenanceService.createSchedule(req.body)});}catch(e){sendError(res,e);}}
  async updateSchedule(req,res){try{res.json({success:true,data:await maintenanceService.updateSchedule(req.params.id,req.body)});}catch(e){sendError(res,e);}}
  async approveSchedule(req,res){try{res.json({success:true,data:await maintenanceService.approveSchedule(req.params.id, req.user)});}catch(e){sendError(res,e);}}
  async deleteSchedule(req,res){try{await maintenanceService.deleteSchedule(req.params.id);res.json({success:true,message:"Maintenance schedule deleted."});}catch(e){sendError(res,e);}}

  async workOrders(req,res){try{res.json({success:true,data:await maintenanceService.listWorkOrders()});}catch(e){sendError(res,e);}}
  async workOrder(req,res){try{const x=await maintenanceService.getWorkOrder(req.params.id);if(!x)return res.status(404).json({success:false,message:"Work order not found."});res.json({success:true,data:x});}catch(e){sendError(res,e);}}
  async createWorkOrder(req,res){try{res.status(201).json({success:true,data:await maintenanceService.createWorkOrder(req.body)});}catch(e){sendError(res,e);}}
  async updateWorkOrder(req,res){try{res.json({success:true,data:await maintenanceService.updateWorkOrder(req.params.id,req.body)});}catch(e){sendError(res,e);}}
  async approveWorkOrder(req,res){try{res.json({success:true,data:await maintenanceService.approveWorkOrder(req.params.id, req.user)});}catch(e){sendError(res,e);}}
  async startWorkOrder(req,res){try{res.json({success:true,data:await maintenanceService.startWorkOrder(req.params.id)});}catch(e){sendError(res,e);}}
  async deleteWorkOrder(req,res){try{await maintenanceService.deleteWorkOrder(req.params.id);res.json({success:true,message:"Work order deleted."});}catch(e){sendError(res,e);}}
  async createIncidentTicket(req,res){try{res.status(201).json({success:true,data:await maintenanceService.createIncidentTicket(req.params.incidentId, req.body)});}catch(e){sendError(res,e);}}
  async resolveIncident(req,res){try{res.json({success:true,data:await maintenanceService.resolveIncident(req.params.incidentId, req.body)});}catch(e){sendError(res,e);}}
  async completeWorkOrder(req,res){try{res.json({success:true,data:await maintenanceService.completeWorkOrder(req.params.id, req.body)});}catch(e){sendError(res,e);}}

  async repairs(req,res){try{res.json({success:true,data:await maintenanceService.listRepairs()});}catch(e){sendError(res,e);}}
  async repair(req,res){try{const x=await maintenanceService.getRepair(req.params.id);if(!x)return res.status(404).json({success:false,message:"Repair not found."});res.json({success:true,data:x});}catch(e){sendError(res,e);}}
  async createRepair(req,res){try{res.status(201).json({success:true,data:await maintenanceService.createRepair(req.body)});}catch(e){sendError(res,e);}}
  async updateRepair(req,res){try{res.json({success:true,data:await maintenanceService.updateRepair(req.params.id,req.body)});}catch(e){sendError(res,e);}}
  async deleteRepair(req,res){try{await maintenanceService.deleteRepair(req.params.id);res.json({success:true,message:"Repair deleted."});}catch(e){sendError(res,e);}}

  async compliance(req,res){try{res.json({success:true,data:await maintenanceService.listCompliance()});}catch(e){sendError(res,e);}}
  async complianceItem(req,res){try{const x=await maintenanceService.getCompliance(req.params.id);if(!x)return res.status(404).json({success:false,message:"Compliance record not found."});res.json({success:true,data:x});}catch(e){sendError(res,e);}}
  async createCompliance(req,res){try{res.status(201).json({success:true,data:await maintenanceService.createCompliance(req.body)});}catch(e){sendError(res,e);}}
  async updateCompliance(req,res){try{res.json({success:true,data:await maintenanceService.updateCompliance(req.params.id,req.body)});}catch(e){sendError(res,e);}}
  async deleteCompliance(req,res){try{await maintenanceService.deleteCompliance(req.params.id);res.json({success:true,message:"Compliance record deleted."});}catch(e){sendError(res,e);}}

  async approvals(req,res){try{res.json({success:true,data:await maintenanceService.listApprovals(req.query)});}catch(e){sendError(res,e);}}
  async serviceHistory(req,res){try{res.json({success:true,data:await maintenanceService.getServiceHistory(req.query.vehicleId)});}catch(e){sendError(res,e);}}
}

export default new MaintenanceController();
