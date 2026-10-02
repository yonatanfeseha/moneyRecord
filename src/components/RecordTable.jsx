import { formatAmount } from "../utils/formatters.js";

export default function RecordTable({
  records,
  loading,
  hasFilters,
  editingId,
  busyId,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow-sm">
        Loading records...
      </div>
    );
  }
  if (records.length === 0) {
    return (
      <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow-sm">
        {hasFilters ? "No records match your search." : "No records found."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Receiver Name</th>
            <th className="px-4 py-3 font-semibold">Reason</th>
            <th className="px-4 py-3 text-right font-semibold">Debit</th>
            <th className="px-4 py-3 text-right font-semibold">Credit</th>
            <th className="px-4 py-3 font-semibold">Method</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {records.map((r, i) => (
            <tr
              key={r.id}
              className={editingId === r.id ? "bg-blue-50" : "hover:bg-gray-50"}
            >
              <td className="px-4 py-3">{i + 1}</td>
              <td className="whitespace-nowrap px-4 py-3">{r.date}</td>
              <td className="px-4 py-3">{r.receiverName}</td>
              <td className="px-4 py-3">{r.reason}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                {r.type === "debit" ? formatAmount(r.amount) : "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                {r.type !== "debit" ? formatAmount(r.amount) : "—"}
              </td>
              <td className="px-4 py-3">{r.method}</td>

              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex gap-2">
                  <button
                    className="btn-secondary !px-3 !py-1"
                    onClick={() => onEdit(r)}
                    disabled={busyId === r.id}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger !px-3 !py-1"
                    onClick={() => onDelete(r)}
                    disabled={busyId === r.id}
                  >
                    {busyId === r.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
