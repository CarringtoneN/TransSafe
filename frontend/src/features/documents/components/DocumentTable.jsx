import DocumentRow from "./DocumentRow";

function DocumentTable({
  documents,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">

      <table className="min-w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="px-6 py-4 text-left">
              Name
            </th>

            <th className="px-6 py-4 text-left">
              Type
            </th>

            <th className="px-6 py-4 text-left">
              Vehicle
            </th>

            <th className="px-6 py-4 text-left">
              Expiry Date
            </th>

            <th className="px-6 py-4 text-left">
              Status
            </th>

            <th className="px-6 py-4 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {documents.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="py-10 text-center text-gray-500"
              >
                No documents found.
              </td>
            </tr>
          ) : (
            documents.map(
              (document, index) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  index={index}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )
            )
          )}

        </tbody>

      </table>

    </div>
  );
}

export default DocumentTable;