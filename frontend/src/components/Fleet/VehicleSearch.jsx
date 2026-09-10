function VehicleSearch() {
  return (
    <div className="flex justify-between items-center mb-6">
      <input
        type="text"
        placeholder="Search vehicles..."
        className="border rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
        + Add Vehicle
      </button>
    </div>
  );
}

export default VehicleSearch;