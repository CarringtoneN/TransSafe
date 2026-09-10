import { useEffect, useState } from "react";

function DriverForm({
  driver,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    licenseExpiry: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        employeeNumber: driver.employeeNumber || "",
        firstName: driver.firstName || "",
        lastName: driver.lastName || "",
        email: driver.email || "",
        phone: driver.phone || "",
        licenseNumber: driver.licenseNumber || "",
        licenseExpiry: driver.licenseExpiry
          ? driver.licenseExpiry.substring(0, 10)
          : "",
        status: driver.status || "ACTIVE",
      });
    } else {
      setFormData({
        employeeNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        licenseNumber: "",
        licenseExpiry: "",
        status: "ACTIVE",
      });
    }
  }, [driver]);

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
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-5">

        <div>
          <label className="mb-1 block font-medium">
            Employee Number
          </label>

          <input
            type="text"
            name="employeeNumber"
            value={formData.employeeNumber}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            First Name
          </label>

          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Last Name
          </label>

          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Phone Number
          </label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            License Number
          </label>

          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            License Expiry
          </label>

          <input
            type="date"
            name="licenseExpiry"
            value={formData.licenseExpiry}
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
            <option value="ACTIVE">
              ACTIVE
            </option>

            <option value="INACTIVE">
              INACTIVE
            </option>

            <option value="SUSPENDED">
              SUSPENDED
            </option>
          </select>
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
          {driver
            ? "Update Driver"
            : "Add Driver"}
        </button>

      </div>

    </form>
  );
}

export default DriverForm;