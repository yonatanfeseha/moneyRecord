import { useEffect, useState } from "react";
import { todayISO } from "../utils/formatters.js";

const empty = () => ({ date: todayISO(), receiverName: "", reason: "", amount: "" });

export default function RecordForm({ editingRecord, saving, onSubmit, onCancelEdit }) {
  const [form, setForm] = useState(empty());
  const [error, setError] = useState("");
  const isEditing = Boolean(editingRecord);

  // Load the record into the form when Edit is clicked; reset when editing ends.
  useEffect(() => {
    setError("");
    if (editingRecord) {
      setForm({
        date: editingRecord.date,
        receiverName: editingRecord.receiverName,
        reason: editingRecord.reason,
        amount: String(editingRecord.amount),
      });
    } else {
      setForm(empty());
    }
  }, [editingRecord]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const amount = parseFloat(form.amount);
    if (!form.date || !form.receiverName.trim() || !form.reason.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    setError("");
    const ok = await onSubmit({
      date: form.date,
      receiverName: form.receiverName.trim(),
      reason: form.reason.trim(),
      amount: Math.round(amount * 100) / 100,
    });
    if (ok) setForm(empty());
  };

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">{isEditing ? "Edit record" : "Add record"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium">Date</label>
            <input id="date" name="date" type="date" required className="input"
              value={form.date} onChange={change} disabled={saving} />
          </div>
          <div>
            <label htmlFor="receiverName" className="mb-1 block text-sm font-medium">Receiver Name</label>
            <input id="receiverName" name="receiverName" type="text" required className="input"
              value={form.receiverName} onChange={change} disabled={saving} />
          </div>
          <div>
            <label htmlFor="reason" className="mb-1 block text-sm font-medium">Reason</label>
            <input id="reason" name="reason" type="text" required className="input"
              value={form.reason} onChange={change} disabled={saving} />
          </div>
          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium">Amount</label>
            <input id="amount" name="amount" type="number" required min="0.01" step="any" inputMode="decimal"
              className="input" value={form.amount} onChange={change} disabled={saving} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (isEditing ? "Updating..." : "Saving...") : isEditing ? "Update Record" : "Save Record"}
          </button>
          {isEditing && (
            <button type="button" className="btn-secondary" onClick={onCancelEdit} disabled={saving}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
