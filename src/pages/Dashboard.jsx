import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config.js";
import { logout } from "../firebase/auth.js";
import {
  subscribeToRecords,
  addRecord,
  updateRecord,
  deleteRecord,
} from "../firebase/firestore.js";
import RecordForm from "../components/RecordForm.jsx";
import RecordTable from "../components/RecordTable.jsx";
import SearchFilters from "../components/SearchFilters.jsx";
import { exportRecordsToExcel } from "../utils/excelExport.js";
import { formatAmount } from "../utils/formatters.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [toast, setToast] = useState(null); // { type: "success" | "error", message }

  const notify = (type, message) => setToast({ type, message });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setRecords([]);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = subscribeToRecords(
      user.uid,
      (data) => {
        setRecords(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
        notify("error", "Unable to load your records. Please try again.");
      },
    );
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (dateFilter && r.date !== dateFilter) return false;
      if (!q) return true;
      return (
        r.receiverName?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q)
      );
    });
  }, [records, search, dateFilter]);

  const totalDebit = useMemo(
    () =>
      filtered.reduce(
        (sum, r) => sum + (r.type === "debit" ? Number(r.amount || 0) : 0),
        0,
      ),
    [filtered],
  );
  const totalCredit = useMemo(
    () =>
      filtered.reduce(
        (sum, r) => sum + (r.type === "debit" ? 0 : Number(r.amount || 0)),
        0,
      ),
    [filtered],
  );
  const hasFilters = search.trim() !== "" || dateFilter !== "";

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, data);
        setEditingRecord(null);
        notify("success", "Record updated successfully.");
      } else {
        await addRecord(data);
        notify("success", "Record saved successfully.");
      }
      return true;
    } catch {
      notify("error", "Something went wrong while saving the record.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    setBusyId(target.id);
    try {
      await deleteRecord(target.id);
      if (editingRecord?.id === target.id) setEditingRecord(null);
      notify("success", "Record deleted successfully.");
    } catch {
      notify("error", "Something went wrong while deleting the record.");
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = () => {
    setExporting(true);
    try {
      exportRecordsToExcel(filtered);
    } catch {
      notify("error", "Unable to generate the Excel file.");
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-lg font-semibold">Payment Records</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">{auth.currentUser?.email}</span>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        {toast && (
          <div
            role="status"
            className={`fixed right-4 top-4 z-50 max-w-xs rounded-md px-4 py-3 text-sm text-white shadow-lg ${
              toast.type === "success" ? "bg-emerald-700" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        )}

        <RecordForm
          editingRecord={editingRecord}
          saving={saving}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingRecord(null)}
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Records</div>
            <div className="text-2xl font-semibold">{filtered.length}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Total Debit </div>
            <div className="text-2xl font-semibold tabular-nums">
              {formatAmount(totalDebit)}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Total Credit </div>
            <div className="text-2xl font-semibold tabular-nums">
              {formatAmount(totalCredit)}
            </div>
          </div>
        </section>

        <SearchFilters
          search={search}
          onSearch={setSearch}
          dateFilter={dateFilter}
          onDateFilter={setDateFilter}
          onClear={() => {
            setSearch("");
            setDateFilter("");
          }}
          onExport={handleExport}
          exporting={exporting}
          canExport={filtered.length > 0}
        />

        <RecordTable
          records={filtered}
          loading={loading}
          hasFilters={hasFilters}
          editingId={editingRecord?.id}
          busyId={busyId}
          onEdit={(r) => {
            setEditingRecord(r);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDelete={setDeleteTarget}
        />
      </main>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <p className="mb-6 text-base">
              Are you sure you want to delete this record?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
