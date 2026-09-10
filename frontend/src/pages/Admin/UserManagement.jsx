import { useEffect, useState } from "react";
import {
  Copy,
  Edit3,
  KeyRound,
  Plus,
  ShieldCheck,
  UserPlus,
  UserX,
  Trash2,
} from "lucide-react";
import userService from "../../services/userService";
import { roleLabel } from "../../config/roles";

const roles = [
  ["DRIVER", "Driver"],
  ["FLEET_MANAGER", "Fleet Manager"],
  ["OPERATIONS_MANAGER", "Operations & Scheduling Manager"],
  ["MAINTENANCE_COMPLIANCE", "Maintenance & Compliance"],
  ["TECHNICIAN_MECHANIC", "Mechanic"],
];

const initial = {
  name: "",
  email: "",
  role: "DRIVER",
  phone: "",
  employeeNumber: "",
  licenseNumber: "",
  licenseExpiry: "",
  workshop: "",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await userService.list();
      setUsers(response.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  function change(e) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  }

  function closeModal() {
    setOpen(false);
    setEditing(null);
  }

  function openCreate() {
    setEditing(null);
    setCredentials(null);
    setError("");
    setForm({ ...initial });
    setOpen(true);
  }

  function openMechanicEdit(user) {
    setEditing(user);
    setCredentials(null);
    setError("");
    setForm({
      ...initial,
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      workshop: user.workshop || "",
    });
    setOpen(true);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editing) {
        await userService.update(editing.id, {
          name: form.name,
          email: form.email,
          workshop: form.workshop,
        });
        closeModal();
      } else {
        const response = await userService.create(form);
        setCredentials(response.data.credentials);
        closeModal();
        setForm({ ...initial });
      }
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          `Unable to ${editing ? "update" : "create"} user.`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggle(user) {
    try {
      await userService.setStatus(user.id, !user.active);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update user.");
    }
  }

  async function reset(user) {
    try {
      const response = await userService.resetPassword(user.id);
      setCredentials({
        email: user.email,
        password: response.data.credentials.password,
      });
    } catch (e) {
      setError(e.response?.data?.message || "Unable to reset password.");
    }
  }

  async function remove(user) {
    if (!window.confirm(`Delete ${user.name}? This removes their system login.`)) {
      return;
    }

    try {
      await userService.delete(user.id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to delete user.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="mt-1 text-slate-500">
            Create accounts, assign responsibilities and control system access.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <UserPlus size={18} /> Create New User
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      {credentials && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-2 font-semibold text-green-800">
            <ShieldCheck size={20} /> Login credentials
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <span className="text-sm text-green-700">Email</span>
              <div className="font-mono">{credentials.email}</div>
            </div>
            <div>
              <span className="text-sm text-green-700">Password</span>
              <div className="font-mono">{credentials.password}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard?.writeText(
                `Email: ${credentials.email}\nPassword: ${credentials.password}`,
              )
            }
            className="mt-3 flex items-center gap-2 rounded-lg border border-green-300 px-3 py-2 text-sm"
          >
            <Copy size={15} /> Copy credentials
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              {["User", "Email", "Role", "Driver", "Workshop", "Status", "Actions"].map(
                (heading) => (
                  <th key={heading} className="px-5 py-4 text-left text-sm font-semibold">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center">
                  Loading users...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-5 py-4 font-medium">{user.name}</td>
                  <td className="px-5 py-4">{user.email}</td>
                  <td className="px-5 py-4">{roleLabel(user.role)}</td>
                  <td className="px-5 py-4">
                    {user.driver
                      ? `${user.driver.firstName} ${user.driver.lastName}`
                      : "-"}
                  </td>
                  <td className="px-5 py-4">
                    {user.role === "TECHNICIAN_MECHANIC" ? user.workshop || "—" : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {user.active ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {user.role === "TECHNICIAN_MECHANIC" && (
                        <button
                          type="button"
                          title="Edit mechanic"
                          onClick={() => openMechanicEdit(user)}
                          className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                        >
                          <Edit3 size={17} />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Reset password"
                        onClick={() => reset(user)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <KeyRound size={17} />
                      </button>
                      <button
                        type="button"
                        title={user.active ? "Disable" : "Enable"}
                        onClick={() => toggle(user)}
                        className={`rounded-lg p-2 ${
                          user.active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        <UserX size={17} />
                      </button>
                      <button
                        type="button"
                        title="Delete user"
                        onClick={() => remove(user)}
                        className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {editing ? "Edit Mechanic" : "Create New User"}
                </h2>
                <p className="text-slate-500">
                  {editing
                    ? "Update the mechanic's account details and workshop."
                    : "The initial password will be Trans#2026."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-3 py-2 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  Name
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={change}
                    className="mt-1 w-full rounded-lg border p-3"
                    placeholder="Otieno"
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={change}
                    className="mt-1 w-full rounded-lg border p-3"
                    placeholder="mechanic@transsafe.com"
                  />
                </label>
              </div>

              {editing ? (
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Role</div>
                  <div className="mt-1 font-semibold">Mechanic</div>
                </div>
              ) : (
                <>
                  <label>
                    Role
                    <select
                      name="role"
                      value={form.role}
                      onChange={change}
                      className="mt-1 w-full rounded-lg border p-3"
                    >
                      {roles.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {form.role === "DRIVER" && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <h3 className="mb-3 font-semibold">Driver profile</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label>
                          Phone
                          <input
                            name="phone"
                            value={form.phone}
                            onChange={change}
                            className="mt-1 w-full rounded-lg border p-3"
                          />
                        </label>
                        <label>
                          Employee Number
                          <input
                            required
                            name="employeeNumber"
                            value={form.employeeNumber}
                            onChange={change}
                            className="mt-1 w-full rounded-lg border p-3"
                          />
                        </label>
                        <label>
                          License Number
                          <input
                            required
                            name="licenseNumber"
                            value={form.licenseNumber}
                            onChange={change}
                            className="mt-1 w-full rounded-lg border p-3"
                          />
                        </label>
                        <label>
                          License Expiry
                          <input
                            type="date"
                            name="licenseExpiry"
                            value={form.licenseExpiry}
                            onChange={change}
                            className="mt-1 w-full rounded-lg border p-3"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}

              {(editing?.role === "TECHNICIAN_MECHANIC" ||
                form.role === "TECHNICIAN_MECHANIC") && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <label className="font-semibold">
                    Workshop
                    <input
                      required
                      name="workshop"
                      value={form.workshop}
                      onChange={change}
                      className="mt-1 w-full rounded-lg border p-3"
                      placeholder="e.g. TransSafe Central Workshop"
                    />
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-5 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  <Plus size={18} />
                  {saving
                    ? editing
                      ? "Saving..."
                      : "Creating..."
                    : editing
                      ? "Save Changes"
                      : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
