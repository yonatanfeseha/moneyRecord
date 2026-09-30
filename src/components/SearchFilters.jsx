export default function SearchFilters({
  search, onSearch, dateFilter, onDateFilter, onClear, onExport, exporting, canExport,
}) {
  const hasFilters = search !== "" || dateFilter !== "";
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="search" className="mb-1 block text-sm font-medium">Search</label>
          <input id="search" type="search" className="input" placeholder="Search records..."
            value={search} onChange={(e) => onSearch(e.target.value)} />
        </div>
        <div>
          <label htmlFor="dateFilter" className="mb-1 block text-sm font-medium">Filter by date</label>
          <input id="dateFilter" type="date" className="input"
            value={dateFilter} onChange={(e) => onDateFilter(e.target.value)} />
        </div>
        <button type="button" className="btn-secondary" onClick={onClear} disabled={!hasFilters}>
          Clear Filters
        </button>
        <button type="button" className="btn-success" onClick={onExport} disabled={exporting || !canExport}>
          {exporting ? "Generating..." : "Download Excel"}
        </button>
      </div>
    </section>
  );
}
