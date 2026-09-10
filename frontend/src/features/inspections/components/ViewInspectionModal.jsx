import {
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Car,
  Gauge,
  ClipboardCheck,
} from "lucide-react";

function ViewInspectionModal({
  isOpen,
  inspection,
  onClose,
}) {
  if (!isOpen || !inspection) return null;

  const checklist = [
    ["Brakes", inspection.brakes],
    ["Tyres", inspection.tyres],
    ["Lights", inspection.lights],
    ["Engine", inspection.engine],
    ["Battery", inspection.battery],
    ["Oil Level", inspection.oilLevel],
    ["Coolant", inspection.coolant],
    ["Mirrors", inspection.mirrors],
    ["Windshield", inspection.windshield],
    ["Fire Extinguisher", inspection.fireExtinguisher],
    ["First Aid Kit", inspection.firstAidKit],
  ];

  const passed =
    inspection.overallStatus === "PASS";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">

      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b p-6">

          <div>

            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
              <ClipboardCheck
                size={28}
                className="text-blue-600"
              />
              Vehicle Inspection
            </h2>

            <p className="mt-1 text-gray-500">
              Inspection Details
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-red-500 px-5 py-2 text-white transition hover:bg-red-600"
          >
            Close
          </button>

        </div>

        {/* Status Banner */}

        <div
          className={`flex items-center justify-between px-6 py-4 ${
            passed
              ? "bg-green-50"
              : "bg-red-50"
          }`}
        >

          <div>

            <p className="text-sm text-gray-500">
              Overall Inspection Status
            </p>

            <div className="mt-1">

              {passed ? (

                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">

                  <CheckCircle size={18} />

                  PASS

                </span>

              ) : (

                <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 font-semibold text-red-700">

                  <XCircle size={18} />

                  FAIL

                </span>

              )}

            </div>

          </div>

        </div>

        {/* Body */}

        <div className="space-y-8 p-6">

          {/* Summary */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-xl border p-4">

              <div className="mb-2 flex items-center gap-2 text-blue-600">
                <Car size={18} />
                <span className="font-semibold">
                  Vehicle
                </span>
              </div>

              <p className="text-lg font-medium">
                {inspection.vehicle?.registration || "-"}
              </p>

            </div>

            <div className="rounded-xl border p-4">

              <div className="mb-2 flex items-center gap-2 text-green-600">
                <User size={18} />
                <span className="font-semibold">
                  Driver
                </span>
              </div>

              <p className="text-lg font-medium">
                {inspection.driver
                  ? `${inspection.driver.firstName} ${inspection.driver.lastName}`
                  : "-"}
              </p>

            </div>

            <div className="rounded-xl border p-4">

              <div className="mb-2 flex items-center gap-2 text-purple-600">
                <Calendar size={18} />
                <span className="font-semibold">
                  Inspection Date
                </span>
              </div>

              <p className="text-lg font-medium">
                {new Date(
                  inspection.inspectionDate
                ).toLocaleDateString()}
              </p>

            </div>

            <div className="rounded-xl border p-4">

              <div className="mb-2 flex items-center gap-2 text-orange-600">
                <Gauge size={18} />
                <span className="font-semibold">
                  Odometer
                </span>
              </div>

              <p className="text-lg font-medium">
                {inspection.odometer?.toLocaleString()} km
              </p>

            </div>

            <div className="rounded-xl border p-4">

              <div className="mb-2 font-semibold text-slate-700">
                Inspector
              </div>

              <p className="text-lg font-medium">
                {inspection.inspectorName}
              </p>

            </div>

          </div>

          {/* Checklist */}

          <div>

            <h3 className="mb-4 text-xl font-semibold">
              Inspection Checklist
            </h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

              {checklist.map(([label, passed]) => (

                <div
                  key={label}
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    passed
                      ? "border-green-300 bg-green-50"
                      : "border-red-300 bg-red-50"
                  }`}
                >

                  <span className="font-medium">
                    {label}
                  </span>

                  {passed ? (
                    <CheckCircle
                      size={22}
                      className="text-green-600"
                    />
                  ) : (
                    <XCircle
                      size={22}
                      className="text-red-600"
                    />
                  )}

                </div>

              ))}

            </div>

          </div>

          {/* Remarks */}

          <div>

            <h3 className="mb-3 text-xl font-semibold">
              Remarks
            </h3>

            <div className="min-h-[120px] rounded-xl border bg-slate-50 p-4 text-slate-700">
              {inspection.remarks
                ? inspection.remarks
                : "No remarks were recorded for this inspection."}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ViewInspectionModal;