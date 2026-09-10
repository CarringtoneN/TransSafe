function StatusBadge({ status }) {
  let classes =
    "px-3 py-1 rounded-full text-xs font-semibold";

  switch (status) {
    case "Active":
      classes += " bg-green-100 text-green-700";
      break;

    case "Maintenance":
      classes += " bg-yellow-100 text-yellow-700";
      break;

    case "Out of Service":
      classes += " bg-red-100 text-red-700";
      break;

    default:
      classes += " bg-gray-100 text-gray-700";
  }

  return <span className={classes}>{status}</span>;
}

export default StatusBadge;