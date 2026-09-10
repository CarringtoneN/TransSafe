import { useEffect, useState } from "react";

function AssignmentForm({
  assignment,
  drivers,
  vehicles,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    driverId: "",
    vehicleId: "",
    assignedAt: "",
    unassignedAt: "",
    status: "ACTIVE",
    notes: "",
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        driverId: assignment.driverId,
        vehicleId: assignment.vehicleId,
        assignedAt: assignment.assignedAt
          ? assignment.assignedAt.substring(0, 10)
          : "",
        unassignedAt: assignment.unassignedAt
          ? assignment.unassignedAt.substring(0, 10)
          : "",
        status: assignment.status,
        notes: assignment.notes || "",
      });
    } else {
      setFormData({
        driverId: "",
        vehicleId: "",
        assignedAt: new Date().toISOString().substring(0, 10),
        unassignedAt: "",
        status: "ACTIVE",
        notes: "",
      });
    }
  }, [assignment]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

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
            <option value="">
              Select Driver
            </option>

            {drivers.map(driver => (
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
            <option value="">
              Select Vehicle
            </option>

            {vehicles.map(vehicle => (
              <option
                key={vehicle.id}
                value={vehicle.id}
              >
                {vehicle.registration} - {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Assigned Date
          </label>

          <input
            type="date"
            name="assignedAt"
            value={formData.assignedAt}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Unassigned Date
          </label>

          <input
            type="date"
            name="unassignedAt"
            value={formData.unassignedAt}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
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
            <option value="ACTIVE">
              ACTIVE
            </option>

            <option value="COMPLETED">
              COMPLETED
            </option>

            <option value="INACTIVE">
              INACTIVE
            </option>
          </select>
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
          {assignment
            ? "Update Assignment"
            : "Assign Driver"}
        </button>

      </div>

    </form>
  );
}

export default AssignmentForm;