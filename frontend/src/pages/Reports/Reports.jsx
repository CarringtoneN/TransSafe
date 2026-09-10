import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Car,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Fuel,
  RefreshCw,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

import reportsService from "../../services/reportsService";

const KES = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat("en-KE");

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const isoDate = (date) => {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
};

const initialFilters = () => {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 29);
  return {
    from: isoDate(from),
    to: isoDate(today),
    vehicleId: "",
  };
};

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function Breakdown({ title, values }) {
  const entries = Object.entries(values || {});
  const max = Math.max(...entries.map(([, value]) => Number(value) || 0), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No data for this period.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {entries.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-slate-600">
                  {label.replaceAll("_", " ")}
                </span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${Math.max((Number(value) / max) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Reports() {
  const [filters, setFilters] = useState(initialFilters);
  const [vehicles, setVehicles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        from: filters.from,
        to: filters.to,
        ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
      };

      const [summaryResult, dataResult] = await Promise.all([
        reportsService.summary(params),
        reportsService.data({ ...params, limit: 100 }),
      ]);

      setSummary(summaryResult);
      setData(dataResult);
    } catch (err) {
      console.error("Reports loading error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reportsService
      .vehicles()
      .then(setVehicles)
      .catch((err) => console.error("Report vehicle loading error:", err));

    load();
  }, []);

  const k = summary?.kpis || {};

  const combinedRows = useMemo(() => {
    if (!data) return [];

    const rows = [
      ...(data.trips || []).map((x) => ({
        date: x.departureTime,
        type: "Trip",
        reference: `${x.origin} → ${x.destination}`,
        vehicle: x.vehicle?.registration || "-",
        status: x.status,
        amount: "",
      })),
      ...(data.fuel || []).map((x) => ({
        date: x.fuelDate,
        type: "Fuel",
        reference: x.station || "Fuel purchase",
        vehicle: x.vehicle?.registration || "-",
        status: "RECORDED",
        amount: KES.format(Number(x.cost || 0)),
      })),
      ...(data.incidents || []).map((x) => ({
        date: x.incidentDate,
        type: "Incident",
        reference: x.incidentType || "Incident",
        vehicle: x.vehicle?.registration || "-",
        status: x.status,
        amount:
          x.estimatedCost == null ? "" : KES.format(Number(x.estimatedCost)),
      })),
      ...(data.maintenance || []).map((x) => ({
        date: x.serviceDate,
        type: "Maintenance",
        reference: x.serviceType || "Maintenance",
        vehicle: x.vehicle?.registration || "-",
        status: "COMPLETED",
        amount: KES.format(Number(x.cost || 0)),
      })),
      ...(data.workOrders || []).map((x) => ({
        date: x.dateCreated,
        type: "Work Order",
        reference: x.workOrderNumber,
        vehicle: x.vehicle?.registration || "-",
        status: x.status,
        amount: KES.format(
          Number(x.finalCost ?? x.estimatedTotalCost ?? 0)
        ),
      })),
      ...(data.repairs || []).map((x) => ({
        date: x.dateReported,
        type: "Repair",
        reference: x.repairReference,
        vehicle: x.vehicle?.registration || "-",
        status: x.repairStatus,
        amount: KES.format(Number(x.totalRepairCost || 0)),
      })),
    ];

    return rows
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 100);
  }, [data]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const exportCsv = () => {
    const header = ["Date", "Type", "Reference", "Vehicle", "Status", "Amount"];
    const lines = combinedRows.map((row) =>
      [
        formatDate(row.date),
        row.type,
        row.reference,
        row.vehicle,
        row.status,
        row.amount,
      ]
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(",")
    );

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `transsafe-report-${filters.from}-to-${filters.to}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:bg-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <BarChart3 size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
              <p className="mt-1 text-slate-500">
                Fleet, operations, driver, maintenance, compliance and financial
                reporting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={printReport}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText size={18} />
            Print
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!combinedRows.length}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
        <div className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
          <CalendarDays size={19} />
          Report Filters
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            From
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            To
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Vehicle
            <select
              name="vehicleId"
              value={filters.vehicleId}
              onChange={handleFilterChange}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              <option value="">All vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration} — {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={load}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800"
          >
            <RefreshCw size={18} />
            Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Loading reports...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Vehicles" value={number.format(k.vehicles || 0)} subtitle="Fleet total" icon={Truck} />
            <StatCard title="Drivers" value={number.format(k.drivers || 0)} subtitle="Driver records" icon={Users} />
            <StatCard title="Trips" value={number.format(k.trips || 0)} subtitle={`${k.tripCompletionRate || 0}% completed`} icon={Car} />
            <StatCard title="Completed Trips" value={number.format(k.completedTrips || 0)} subtitle="Selected period" icon={CheckCircle2} />
            <StatCard title="Fuel Cost" value={KES.format(k.fuelCost || 0)} subtitle={`${number.format(k.fuelLitres || 0)} litres`} icon={Fuel} />
            <StatCard title="Incident Cost" value={KES.format(k.incidentCost || 0)} subtitle={`${k.incidentCount || 0} incidents`} icon={AlertTriangle} />
            <StatCard title="Maintenance Cost" value={KES.format(k.maintenanceCost || 0)} subtitle={`${k.workOrders || 0} work orders`} icon={Wrench} />
            <StatCard title="Compliance" value={number.format(Object.values(summary?.breakdowns?.complianceByStatus || {}).reduce((a,b) => a + Number(b), 0))} subtitle={`${k.expiredDocuments || 0} expired documents`} icon={ShieldCheck} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Breakdown title="Trips by Status" values={summary?.breakdowns?.tripByStatus} />
            <Breakdown title="Incidents by Severity" values={summary?.breakdowns?.incidentBySeverity} />
            <Breakdown title="Work Orders by Status" values={summary?.breakdowns?.workOrderByStatus} />
            <Breakdown title="Repairs by Status" values={summary?.breakdowns?.repairByStatus} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard title="Inspections" value={number.format(k.inspections || 0)} subtitle="Completed inspection records" icon={ClipboardCheck} />
            <StatCard title="Assignments" value={number.format(k.assignments || 0)} subtitle="Driver/vehicle assignments" icon={Users} />
            <StatCard title="Shift Hours" value={number.format(k.shiftHours || 0)} subtitle="Recorded working hours" icon={CalendarDays} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Activity Report</h2>
                <p className="text-sm text-slate-500">
                  Combined activity across the selected period.
                </p>
              </div>
              <span className="text-sm text-slate-500">
                {combinedRows.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                        No report activity found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    combinedRows.map((row, index) => (
                      <tr key={`${row.type}-${row.date}-${index}`} className="border-t border-slate-100">
                        <td className="whitespace-nowrap px-5 py-3">{formatDate(row.date)}</td>
                        <td className="px-5 py-3 font-medium">{row.type}</td>
                        <td className="px-5 py-3">{row.reference}</td>
                        <td className="px-5 py-3">{row.vehicle}</td>
                        <td className="px-5 py-3">{row.status}</td>
                        <td className="px-5 py-3 text-right">{row.amount || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
