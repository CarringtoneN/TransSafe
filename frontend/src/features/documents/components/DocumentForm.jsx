import { useEffect, useState } from "react";

function DocumentForm({
  document,
  vehicles,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    documentName: "",
    documentType: "",
    issueDate: "",
    expiryDate: "",
    status: "VALID",
    filePath: "",
    notes: "",
    vehicleId: "",
  });

  useEffect(() => {
    if (document) {
      setFormData({
        documentName: document.documentName || "",
        documentType: document.documentType || "",
        issueDate: document.issueDate
          ? document.issueDate.substring(0, 10)
          : "",
        expiryDate: document.expiryDate
          ? document.expiryDate.substring(0, 10)
          : "",
        status: document.status || "VALID",
        filePath: document.filePath || "",
        notes: document.notes || "",
        vehicleId: document.vehicleId || "",
      });
    } else {
      setFormData({
        documentName: "",
        documentType: "",
        issueDate: "",
        expiryDate: "",
        status: "VALID",
        filePath: "",
        notes: "",
        vehicleId: "",
      });
    }
  }, [document]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      ...formData,
      vehicleId: Number(formData.vehicleId),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-5">

        <div>
          <label className="mb-1 block font-medium">
            Document Name
          </label>

          <input
            type="text"
            name="documentName"
            value={formData.documentName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Document Type
          </label>

          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-2"
          >
            <option value="">Select Type</option>
            <option value="Insurance">
              Insurance
            </option>
            <option value="Road License">
              Road License
            </option>
            <option value="Logbook">
              Logbook
            </option>
            <option value="Inspection">
              Inspection
            </option>
            <option value="Emission">
              Emission
            </option>
            <option value="Other">
              Other
            </option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Issue Date
          </label>

          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Expiry Date
          </label>

          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          >
            <option value="VALID">
              VALID
            </option>

            <option value="EXPIRED">
              EXPIRED
            </option>

            <option value="PENDING">
              PENDING
            </option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Vehicle
          </label>

          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-2"
          >
            <option value="">
              Select Vehicle
            </option>

            {vehicles.map((vehicle) => (
              <option
                key={vehicle.id}
                value={vehicle.id}
              >
                {vehicle.registration} -{" "}
                {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block font-medium">
            File Path
          </label>

          <input
            type="text"
            name="filePath"
            value={formData.filePath}
            onChange={handleChange}
            placeholder="Optional"
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block font-medium">
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
          className="rounded-lg bg-gray-500 px-5 py-2 text-white hover:bg-gray-600"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          {document
            ? "Update Document"
            : "Add Document"}
        </button>

      </div>
    </form>
  );
}

export default DocumentForm;