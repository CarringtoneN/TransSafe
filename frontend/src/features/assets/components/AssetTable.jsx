import AssetRow from "./AssetRow";

function AssetTable({
  assets,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4 text-left font-semibold">
              Asset Tag
            </th>

            <th className="px-6 py-4 text-left font-semibold">
              Name
            </th>

            <th className="px-6 py-4 text-left font-semibold">
              Category
            </th>

            <th className="px-6 py-4 text-left font-semibold">
              Status
            </th>

            <th className="px-6 py-4 text-left font-semibold">
              Assigned Vehicle
            </th>

            <th className="px-6 py-4 text-center font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-10 text-center text-gray-500"
              >
                No assets found.
              </td>
            </tr>
          ) : (
            assets.map((asset, index) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                index={index}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AssetTable;