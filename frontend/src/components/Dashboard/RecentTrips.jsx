function RecentTrips() {
  const trips = [
    {
      id: "TR001",
      driver: "John Smith",
      vehicle: "Toyota Hilux",
      destination: "Johannesburg",
      status: "Completed",
    },
    {
      id: "TR002",
      driver: "Sarah Jones",
      vehicle: "Ford Ranger",
      destination: "Pretoria",
      status: "In Progress",
    },
    {
      id: "TR003",
      driver: "Michael Brown",
      vehicle: "Isuzu D-Max",
      destination: "Durban",
      status: "Scheduled",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">
        Recent Trips
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3">Trip ID</th>
            <th className="text-left py-3">Driver</th>
            <th className="text-left py-3">Vehicle</th>
            <th className="text-left py-3">Destination</th>
            <th className="text-left py-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => (
            <tr key={trip.id} className="border-b hover:bg-gray-50">
              <td className="py-3">{trip.id}</td>
              <td>{trip.driver}</td>
              <td>{trip.vehicle}</td>
              <td>{trip.destination}</td>
              <td>{trip.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentTrips;