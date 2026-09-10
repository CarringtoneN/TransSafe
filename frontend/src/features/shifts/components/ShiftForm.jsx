import { useEffect, useState } from "react";

function ShiftForm({
  shift,
  drivers,
  vehicles,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    driverId: "",
    vehicleId: "",
    shiftDate: "",
    startTime: "",
    endTime: "",
    status: "SCHEDULED",
    notes: "",
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        driverId: shift.driverId || "",
        vehicleId: shift.vehicleId || "",
        shiftDate: shift.shiftDate
          ? shift.shiftDate.substring(0, 10)
          : "",
        startTime: shift.startTime
          ? new Date(shift.startTime)
              .toISOString()
              .slice(0, 16)
          : "",
        endTime: shift.endTime
          ? new Date(shift.endTime)
              .toISOString()
              .slice(0, 16)
          : "",
        status: shift.status || "SCHEDULED",
        notes: shift.notes || "",
      });
    }
  }, [shift]);

  function handleChange(e) {
    const {name,value}=e.target;
    setFormData(prev=>{
      const next={...prev,[name]:value};
      if(name==="vehicleId"){
        const v=vehicles.find(x=>Number(x.id)===Number(value));
        const eligible=(v?.assignment||[]).filter(a=>a.status==="ACTIVE"&&!a.unassignedAt);
        next.driverId=eligible.length===1?String(eligible[0].driverId):"";
      }
      return next;
    });
  }
  const eligibleDrivers=formData.vehicleId ? drivers.filter(d=>new Set((vehicles.find(v=>Number(v.id)===Number(formData.vehicleId))?.assignment||[]).filter(a=>a.status==="ACTIVE"&&!a.unassignedAt).map(a=>Number(a.driverId))).has(Number(d.id))) : drivers;

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block mb-1 font-medium">
            Driver
          </label>

          <select
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          >
            <option value="">Select Driver</option>

            {eligibleDrivers.map((driver) => (
              <option
                key={driver.id}
                value={driver.id}
              >
                {driver.firstName} {driver.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Vehicle
          </label>

          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          >
            <option value="">Select Vehicle</option>

            {vehicles.map((vehicle) => (
              <option
                key={vehicle.id}
                value={vehicle.id}
              >
                {vehicle.registration}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Shift Date
          </label>

          <input
            type="date"
            name="shiftDate"
            value={formData.shiftDate}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          >
            <option value="SCHEDULED">
              SCHEDULED
            </option>

            <option value="COMPLETED">
              COMPLETED
            </option>

            <option value="CANCELLED">
              CANCELLED
            </option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Start Time
          </label>

          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            End Time
          </label>

          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block mb-1 font-medium">
            Notes
          </label>

          <textarea
            rows={4}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3">

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-500 px-5 py-2 text-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          {shift ? "Update Shift" : "Create Shift"}
        </button>

      </div>

    </form>
  );
}

export default ShiftForm;