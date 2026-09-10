import { FileText } from "lucide-react";
import { Modal, StatusBadge, formatDate, moneyKES } from "./MaintenanceUI";

function Row({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 text-sm text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function ViewMaintenanceModal({ open, item, type, onClose }) {
  if (!item) return null;

  const titleMap = {
    schedule: "Maintenance Schedule Details",
    workOrder: "Work Order Details",
    repair: "Repair Details",
    compliance: "Compliance Details",
  };

  const title = titleMap[type] || "Maintenance Details";
  const vehicle = item.vehicle?.registration || "—";
  const driverRecord = item.assignedDriver || item.driver;
  const driver = driverRecord
    ? `${driverRecord.firstName || ""} ${driverRecord.lastName || ""}`.trim() || driverRecord.name || "—"
    : "—";

  const renderBody = () => {
    if (type === "schedule") {
      return (
        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Schedule Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Row label="Schedule Number" value={item.scheduleNumber} />
              <Row label="Status" value={<StatusBadge value={item.status} />} />
              <Row label="Service Type" value={item.serviceType} />
              <Row label="Maintenance Category" value={item.maintenanceCategory} />
              <Row label="Priority" value={<StatusBadge value={item.priority} />} />
              <Row label="Approval Status" value={<StatusBadge value={item.approvalStatus} />} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Vehicle & Assignment</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Row label="Vehicle" value={vehicle} />
              <Row label="Assigned Driver" value={driver} />
              <Row label="Assigned Mechanic" value={item.assignedTechnician || "—"} />
              <Row label="Workshop" value={item.assignedWorkshop || item.workshopName || "—"} />
              <Row label="Due Mileage" value={item.dueMileage != null ? `${Number(item.dueMileage).toLocaleString()} km` : "—"} />
              <Row label="Current / Service Odometer" value={item.odometerAtService != null ? `${Number(item.odometerAtService).toLocaleString()} km` : "—"} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Dates & Responsibility</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Row label="Scheduled Date" value={formatDate(item.scheduledDate)} />
              <Row label="Due Date" value={item.dueDate ? formatDate(item.dueDate) : "—"} />
              <Row label="Created By" value={item.createdBy || "—"} />
              <Row label="Created" value={item.createdAt ? formatDate(item.createdAt) : "—"} />
              <Row label="Last Updated" value={item.updatedAt ? formatDate(item.updatedAt) : "—"} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Maintenance Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <Row label="Reason" value={item.reason || "—"} />
              <Row label="Description of Work Required" value={item.description || "—"} />
              <Row label="Required Parts" value={item.requiredParts || "—"} />
              <Row label="Notes" value={item.notes || "—"} />
            </div>
          </section>
        </div>
      );
    }

    if (type === "workOrder") {
      return <div className="space-y-6">
        <section><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Work Order Information</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Row label="Work Order Number" value={item.workOrderNumber}/><Row label="Vehicle" value={vehicle}/><Row label="Requested By" value={item.requestedBy}/><Row label="Department" value={item.department}/><Row label="Priority" value={<StatusBadge value={item.priority}/>}/><Row label="Status" value={<StatusBadge value={item.status}/>}/><Row label="Created" value={formatDate(item.dateCreated||item.createdAt)}/><Row label="Last Updated" value={formatDate(item.updatedAt)}/></div></section>
        <section><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Assignment & Schedule</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Row label="Assigned Mechanic" value={item.assignedTechnician||"—"}/><Row label="Workshop" value={item.assignedWorkshop||item.workshopName||"—"}/><Row label="Supervisor" value={item.supervisor||"—"}/><Row label="Current Mileage" value={item.currentMileage!=null?`${Number(item.currentMileage).toLocaleString()} km`:"—"}/><Row label="Estimated Completion" value={formatDate(item.estimatedCompletionDate)}/><Row label="Actual Completion" value={formatDate(item.actualCompletionDate)}/></div></section>
        <section><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Work Details</h3><div className="grid grid-cols-1 gap-4"><Row label="Maintenance Type" value={item.maintenanceType||"—"}/><Row label="Work Description" value={item.workDescription||"—"}/><Row label="Fault Description" value={item.faultDescription||"—"}/><Row label="Requested Repairs" value={item.requestedRepairs||"—"}/><Row label="Required Spare Parts" value={item.requiredSpareParts||"—"}/><Row label="Required Tools" value={item.requiredTools||"—"}/><Row label="Mechanic Notes / Work Performed" value={item.technicianNotes||"—"}/></div></section>
      </div>;
    }

    if (type === "repair") {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Row label="Repair Reference" value={item.repairReference} />
          <Row label="Vehicle" value={vehicle} />
          <Row label="Fault Reported" value={item.faultReported} />
          <Row label="Diagnosis" value={item.diagnosis || "—"} />
          <Row label="Severity" value={<StatusBadge value={item.severityLevel} />} />
          <Row label="Repair Status" value={<StatusBadge value={item.repairStatus} />} />
          <Row label="Mechanic" value={item.assignedTechnician || "—"} />
          <Row label="Workshop" value={item.workshopName || "—"} />
          <Row label="Repair Start" value={formatDate(item.startDate)} />
          <Row label="Completion" value={formatDate(item.completionDate)} />
          <Row label="Total Repair Cost" value={moneyKES(item.totalRepairCost)} />
          <Row label="Roadworthy" value={item.roadworthy == null ? "—" : item.roadworthy ? "Yes" : "No"} />
          <div className="md:col-span-2">
            <Row label="Repair Details" value={item.repairDetails || item.workPerformed || "—"} />
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Row label="Item" value={item.itemName} />
        <Row label="Type" value={item.itemType} />
        <Row label="Vehicle" value={vehicle} />
        <Row label="Driver" value={driver} />
        <Row label="Issue Date" value={formatDate(item.issueDate)} />
        <Row label="Expiry Date" value={formatDate(item.expiryDate)} />
        <Row label="Status" value={<StatusBadge value={item.calculatedStatus || item.status} />} />
        <Row label="Reference Number" value={item.referenceNumber || "—"} />
        <Row label="Issuing Authority" value={item.issuingAuthority || "—"} />
        <Row label="Notes" value={item.notes || item.description || "—"} />
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Review the complete maintenance record."
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800"
        >
          Close
        </button>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="rounded-lg bg-blue-600 p-2 text-white">
          <FileText size={20} />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{item.scheduleNumber || item.workOrderNumber || item.repairReference || item.itemName}</p>
          <p className="text-sm text-slate-600">{vehicle}</p>
        </div>
      </div>
      {renderBody()}
    </Modal>
  );
}

export default ViewMaintenanceModal;
