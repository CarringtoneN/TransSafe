function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-500">
        {title}
      </h3>

      <p className="text-4xl font-bold text-slate-800 mt-3">
        {value}
      </p>

      <p className="text-sm text-gray-500 mt-2">
        {subtitle}
      </p>
    </div>
  );
}

export default StatCard;