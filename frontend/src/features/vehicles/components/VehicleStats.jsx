import Card from "../../../components/ui/Card";

function VehicleStats({ vehicles }) {
  const total = vehicles.length;

  const active = vehicles.filter(
    (vehicle) => vehicle.status === "Active"
  ).length;

  const maintenance = vehicles.filter(
    (vehicle) => vehicle.status === "Maintenance"
  ).length;

  const outOfService = vehicles.filter(
    (vehicle) => vehicle.status === "Out of Service"
  ).length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-5">
        <p className="text-sm text-gray-500">🚛 Total Vehicles</p>
        <h2 className="mt-2 text-3xl font-bold">{total}</h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-gray-500">✅ Active</p>
        <h2 className="mt-2 text-3xl font-bold text-green-600">
          {active}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-gray-500">🔧 Maintenance</p>
        <h2 className="mt-2 text-3xl font-bold text-yellow-600">
          {maintenance}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-gray-500">❌ Out of Service</p>
        <h2 className="mt-2 text-3xl font-bold text-red-600">
          {outOfService}
        </h2>
      </Card>
    </div>
  );
}

export default VehicleStats;