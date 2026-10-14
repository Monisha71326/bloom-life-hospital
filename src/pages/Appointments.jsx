import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, ChevronDown, X } from "lucide-react";
import { useStore } from "../store.jsx";
import "../css/appointments.css";

/* ---------- design-la irukkura maadhiri extra patients (store-la illana mattum add aagum) ---------- */
const EXTRA = [
  { id: 6,  name: "Karthick", sub: "Cold",           age: "22/ Male", uid: "1234-5678-9012-72", time: "12:00 Pm", status: "Scheduled" },
  { id: 7,  name: "Infant",   sub: "Vaccination",    age: "24/ Male", uid: "1234-5678-9012-72", time: "12:00 Am", status: "Scheduled", prio: "Medium" },
  { id: 8,  name: "Felix",    sub: "Surgery checkup", age: "22/ Male", uid: "1234-5678-9012-72", time: "1:00 Pm",  status: "Scheduled" },
  { id: 9,  name: "Arun",     sub: "Cold",           age: "22/ Male", uid: "1234-5678-9012-72", time: "12:00 Am", status: "Scheduled" },
  { id: 10, name: "Virat",    sub: "Vaccination",    age: "22/ Male", uid: "1234-5678-9012-72", time: "02:00 Pm", status: "Scheduled" },
  { id: 11, name: "Ranjith",  sub: "Cold",           age: "22/ Male", uid: "1234-5678-9012-72", time: "03:00 Am", status: "Scheduled" },
  { id: 12, name: "Sri",      sub: "Checkup",        age: "22/ Male", uid: "1234-5678-9012-72", time: "04:00 Am", status: "Scheduled" },
];

/* photo avatars (name -> image). vera photo vennumna URL maathunga */
const RU = (g, n) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const AVATAR = {
  johnson: RU("men", 1),   emila: RU("women", 44),   robertson: RU("men", 32),
  steve: RU("men", 75), "steve smith": RU("men", 75),
  karthick: RU("men", 52), infant: RU("men", 11),    felix: RU("men", 46),
  arun: RU("men", 86),     virat: RU("men", 22),     ranjith: RU("men", 18), sri: RU("men", 64),
};
AVATAR["emma wilson"] = RU("women", 68);

/* yaaraiyum hide panna vendaam -> list 1-la irundhu start aagum */
const HIDE_IDS = [];

const STATUSES = ["All Status", "Scheduled", "Ongoing", "Completed", "Cancelled"];

/* popup-la "Appointment date" (p.date illana idhu varum) */
const DEFAULT_DATE = "16.03.2026";
/* popup-la "View" click panna poga vendiya page. unga route-ku maathunga */
const VIEW_ROUTE = "/patient-records";

export default function Appointments() {
  const { appts: stored } = useStore();
  const { state } = useLocation();
  const navigate = useNavigate();

  /* dashboard-la irundhu vandha patient (navigate state) */
  const arrivedId = state?.from === "dashboard" ? state.selected : null;

  /* store data + design-la irukkura extra patients */
  const appts = useMemo(() => {
    const names = new Set(stored.map((p) => p.name.toLowerCase()));
    const ids = new Set(stored.map((p) => p.id));
    const extra = EXTRA.filter((e) => !names.has(e.name.toLowerCase()) && !ids.has(e.id));
    return [...stored, ...extra].filter((p) => !HIDE_IDS.includes(p.id) || p.id === arrivedId);
  }, [stored, arrivedId]);

  const [selected, setSelected] = useState(() => {
    if (state?.selected != null && appts.some((p) => p.id === state.selected)) return state.selected;
    return appts.find((p) => p.status === "Ongoing")?.id ?? appts[0]?.id ?? null;
  });
  const [openId, setOpenId] = useState(arrivedId); // perusa aagi popup open aana patient
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All Status");
  const [marks, setMarks] = useState({}); // { id: "Completed" | "Cancelled" }
  const listRef = useRef(null);

  /* final status: user mark pannadhu > store status */
  const statusOf = (p) => marks[p.id] ?? p.status;
  const isDone = (p) => statusOf(p) === "Completed";
  const isCancel = (p) => statusOf(p) === "Cancelled";
  const isClosed = (p) => isDone(p) || isCancel(p);
  const mark = (id, st) => setMarks((m) => ({ ...m, [id]: st }));
  const reopen = (id) => setMarks((m) => { const n = { ...m }; delete n[id]; return n; });
  /* active -> Completed -> Cancelled (kadaisila) */
  const rank = (p) => (isCancel(p) ? 2 : isDone(p) ? 1 : 0);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return appts
      .filter((p) => {
        const okStatus = status === "All Status" || statusOf(p) === status;
        const okText = !s || `${p.name} ${p.sub} ${p.uid}`.toLowerCase().includes(s);
        return okStatus && okText;
      })
      /* completed / cancelled ellam kadaisila (order maaraama) */
      .sort((a, b) => rank(a) - rank(b));
  }, [appts, q, status, marks]);

  /* selected row-ah left list-la scroll panni kaattu */
  useEffect(() => {
    const el = listRef.current?.querySelector(".ap-row.on");
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  /* popup open aana card-ah kaattu + Esc-na close */
  useEffect(() => {
    if (openId == null) return;
    document.querySelector(".ap-item.open")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const esc = (e) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [openId]);

  const pick = (id) => { setSelected(id); setOpenId(id); };
  const ageOf = (p) => String(p.age ?? "").split("/")[0].trim();
  const stKey = (p) => `st-${statusOf(p).toLowerCase()}`;

  const fromDash = (p) => (selected === p.id && arrivedId === p.id ? " from-dash" : "");
  const stCls = (p) => (isDone(p) ? " done" : isCancel(p) ? " cancel" : "");
  const rowClass = (p) => `ap-row${selected === p.id ? " on" : ""}${stCls(p)}${fromDash(p)}`;
  const cardClass = (p) => `ap-card${selected === p.id ? " on" : ""}${stCls(p)}${fromDash(p)}`;
  const avatar = (p) => p.avatar ?? AVATAR[p.name.toLowerCase()] ?? `https://i.pravatar.cc/120?img=${p.img ?? p.id}`;

  return (
    <div className="ap-page page-in">
      <h1 className="ap-title">Appointments List</h1>

      <div className="ap-layout">
        {/* ---------- LEFT : Patient List ---------- */}
        <aside className="ap-panel ap-side">
          <h3>Patient List</h3>
          <div className="plist" ref={listRef}>
            {list.map((p) => (
              <button key={p.id} className={rowClass(p)} onClick={() => pick(p.id)}>
                <span className="ap-num">{p.id}</span>
                <div>
                  <b>{p.name}</b>
                  <small>{p.sub}</small>
                </div>
              </button>
            ))}
            {!list.length && <p className="ap-empty">No patients</p>}
          </div>
        </aside>

        {/* ---------- RIGHT : search + cards ---------- */}
        <section className="ap-panel ap-main">
          <div className="ap-bar">
            <label className="ap-search">
              <Search size={16} />
              <input placeholder="Search patient..." value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <div className="ap-filter">
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="ap-grid" key={`${status}-${q}`}>
            {list.map((p, i) => {
              const open = openId === p.id;
              return (
                <div className={`ap-item${stCls(p)}${open ? " open" : ""}`} key={`${p.id}-${statusOf(p)}`} style={{ "--i": i }}>
                  {!open && p.prio && !isClosed(p) && <span className={`ap-prio ${p.prio}`}>{p.prio}</span>}

                  {open ? (
                    <>
                      {/* ---- perusa aana card ---- */}
                      <div className="ap-bigw">
                        {p.prio && !isClosed(p) && <span className={`ap-prio ${p.prio}`}>{p.prio}</span>}
                        <button className={`ap-big${stCls(p)}`} onClick={() => setOpenId(null)} title="Close">
                          <img src={avatar(p)} alt={p.name} />
                          <b>{p.name}</b>
                          <em className={stKey(p)}>{statusOf(p)}</em>
                        </button>
                      </div>

                      {/* ---- details popup ---- */}
                      <div className="ap-detail">
                        <header>
                          <h4>{p.name} <em className={stKey(p)}>{statusOf(p)}</em></h4>
                          <button className="ap-x" onClick={() => setOpenId(null)} aria-label="Close"><X size={11} strokeWidth={3} /></button>
                        </header>
                        <p><span>1. Name</span><i>:</i><b>{p.name}</b></p>
                        <p><span>2. Appointment date</span><i>:</i><b>{p.date ?? DEFAULT_DATE}</b></p>
                        <p><span>3. Age</span><i>:</i><b>{ageOf(p)}</b></p>
                        <p><span>4. Patient visit</span><i>:</i><b>{p.sub}</b></p>
                        <p><span>5. Status</span><i>:</i><b>{statusOf(p)}</b></p>
                        <p><span>6. Action</span><i>:</i>
                          <button className="ap-view" onClick={() => navigate(VIEW_ROUTE, { state: { patient: p } })}>View</button>
                        </p>
                        <div className="ap-acts">
                          {isClosed(p)
                            ? <button className="ap-act undo" onClick={() => reopen(p.id)}>Undo</button>
                            : (
                              <>
                                <button className="ap-act" onClick={() => mark(p.id, "Completed")}>Complete</button>
                                <button className="ap-act no" onClick={() => mark(p.id, "Cancelled")}>Not came</button>
                              </>
                            )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className={cardClass(p)} onClick={() => pick(p.id)}>
                        <img src={avatar(p)} alt={p.name} />
                        <b>{p.name}</b>
                        <span className="sub">{p.sub}</span>
                        <small>Age : {p.age}{p.gender ? `/ ${p.gender}` : ""}</small>
                        <small>{p.uid}</small>
                        {statusOf(p) === "Ongoing" && <span className="ap-chip">Check in</span>}
                        {isDone(p) && <span className="ap-chip ap-chip-done">Completed</span>}
                        {isCancel(p) && <span className="ap-chip ap-chip-cancel">Cancelled</span>}
                      </button>
                      <span className="ap-time">{isClosed(p) ? statusOf(p) : p.status === "Ongoing" ? "Ongoing" : p.time}</span>
                    </>
                  )}
                </div>
              );
            })}
            {!list.length && <p className="ap-empty">No patients found</p>}
          </div>
        </section>
      </div>
    </div>
  );
}