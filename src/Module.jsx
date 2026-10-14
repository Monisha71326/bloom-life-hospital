import { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { useStore } from "./store.jsx";

export default function Module({ cfg }) {
  const { data, add, update, remove } = useStore();
  const rows = data[cfg.key];
  const [q, setQ] = useState(""), [f, setF] = useState("All"), [open, setOpen] = useState(false), [form, setForm] = useState({});
  const shown = rows.filter((r) => (f === "All" || r.status === f) && JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const submit = (e) => {
    e.preventDefault();
    add(cfg.key, { ...(cfg.defaults ? cfg.defaults() : {}), prio: "", ...form, status: cfg.statuses[0] });
    setForm({}); setOpen(false);
  };
  return (
    <main className="card mod">
      <div className="modh">
        <div><h3>{cfg.title}</h3><small>{shown.length} of {rows.length} records</small></div>
        <label className="search"><Search size={14} /><input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <button className="btn" onClick={() => setOpen(!open)}><Plus size={14} /> Add new</button>
      </div>
      <div className="chips">{["All", ...cfg.statuses].map((s) => <button key={s} className={f === s ? "on" : ""} onClick={() => setF(s)}>{s}</button>)}</div>
      {open && (
        <form className="frm" onSubmit={submit}>
          {cfg.fields.map(({ k, label, type, options, ph }, i) =>
            options ? (
              <select key={k} value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })}>{options.map((o) => <option key={o} value={o}>{o || `${label} (none)`}</option>)}</select>
            ) : (
              <input key={k} required={i < 2} type={type || "text"} placeholder={ph || label} value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            ))}
          <button className="btn">Save</button>
        </form>
      )}
      <div className="tw">
        <table>
          <thead><tr>{cfg.fields.map((c) => <th key={c.k}>{c.label}</th>)}<th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id}>
                {cfg.fields.map((c) => <td key={c.k}>{r[c.k] || "-"}</td>)}
                <td><select className={`st s-${r.status.replace(" ", "")}`} value={r.status} onChange={(e) => update(cfg.key, r.id, { status: e.target.value })}>{cfg.statuses.map((s) => <option key={s}>{s}</option>)}</select></td>
                <td><button className="del" onClick={() => confirm("Delete this record?") && remove(cfg.key, r.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={cfg.fields.length + 2} className="empty">No records found. Use "Add new" to create one.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
