function VehicleSearch({ value, onChange }) {
  return (
    <div className="flex justify-end">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search vehicles..."
        className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

export default VehicleSearch;
