import * as XLSX from "xlsx-js-style";
import { todayISO } from "./formatters.js";

// xlsx-js-style is a SheetJS fork with the same API plus cell styling (bold, fills, borders).
export function exportRecordsToExcel(records) {
  const headers = ["#", "Date", "Receiver Name", "Reason", "Debit", "Credit"];
  const thin = { style: "thin", color: { rgb: "BBBBBB" } };
  const border = { top: thin, bottom: thin, left: thin, right: thin };

  const headerRow = headers.map((h) => ({
    v: h,
    t: "s",
    s: {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1D4ED8" } },
      alignment: { horizontal: h === "Debit" || h === "Credit" ? "right" : "left" },
      border,
    },
  }));

  const body = records.map((r, i) => [
    { v: i + 1, t: "n", s: { border, alignment: { horizontal: "left" } } },
    { v: r.date, t: "s", s: { border } }, // ISO YYYY-MM-DD text keeps the format consistent
    { v: r.receiverName, t: "s", s: { border } },
    { v: r.reason, t: "s", s: { border } },
    { v: r.type === "debit" ? Number(r.amount) : 0, t: "n", z: "#,##0.00", s: { border } },
    { v: r.type === "debit" ? 0 : Number(r.amount), t: "n", z: "#,##0.00", s: { border } },
  ]);

  const totalDebit = records.reduce((sum, r) => sum + (r.type === "debit" ? Number(r.amount || 0) : 0), 0);
  const totalCredit = records.reduce((sum, r) => sum + (r.type === "debit" ? 0 : Number(r.amount || 0)), 0);
  const bold = { font: { bold: true }, border, fill: { fgColor: { rgb: "E5E7EB" } } };
  const totalRow = [
    { v: "", t: "s", s: bold },
    { v: "", t: "s", s: bold },
    { v: "", t: "s", s: bold },
    { v: "Totals", t: "s", s: { ...bold, alignment: { horizontal: "right" } } },
    { v: totalDebit, t: "n", z: "#,##0.00", s: bold },
    { v: totalCredit, t: "n", z: "#,##0.00", s: bold },
  ];

  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...body, totalRow]);
  ws["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 28 }, { wch: 40 }, { wch: 16 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payment Records");
  XLSX.writeFile(wb, `payment-records-${todayISO()}.xlsx`);
}
