import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Percent,
} from "lucide-react";

function InspectionStats({
  inspections,
  activeFilter,
  onFilterChange,
}) {
  const total = inspections.length;

  const passed = inspections.filter(
    (inspection) => inspection.overallStatus === "PASS"
  ).length;

  const failed = inspections.filter(
    (inspection) => inspection.overallStatus === "FAIL"
  ).length;

  const passRate =
    total === 0
      ? 0
      : Math.round((passed / total) * 100);

  const cards = [
    {
      title: "Total Inspections",
      value: total,
      icon: ClipboardCheck,
      color:
        "bg-blue-100 text-blue-600 border-blue-200",
      filter: "ALL",
    },
    {
      title: "Passed",
      value: passed,
      icon: CheckCircle,
      color:
        "bg-green-100 text-green-600 border-green-200",
      filter: "PASS",
    },
    {
      title: "Failed",
      value: failed,
      icon: XCircle,
      color:
        "bg-red-100 text-red-600 border-red-200",
      filter: "FAIL",
    },
    {
      title: "Pass Rate",
      value: `${passRate}%`,
      icon: Percent,
      color:
        "bg-purple-100 text-purple-600 border-purple-200",
      filter: null,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => {
        const Icon = card.icon;

        const isActive =
          activeFilter === card.filter;

        return (
          <button
            key={card.title}
            type="button"
            disabled={!card.filter}
            onClick={() =>
              card.filter &&
              onFilterChange(card.filter)
            }
            className={`rounded-2xl border bg-white p-6 text-left shadow-sm transition

              ${
                card.filter
                  ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                  : "cursor-default"
              }

              ${
                isActive
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : ""
              }
            `}
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {card.value}
                </h2>

              </div>

              <div
                className={`rounded-xl border p-3 ${card.color}`}
              >
                <Icon size={28} />
              </div>

            </div>

          </button>
        );
      })}

    </div>
  );
}

export default InspectionStats;