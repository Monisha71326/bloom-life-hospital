import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Baby, HeartPulse, Stethoscope, Clock, ChevronDown, Check, Send, X, Coffee } from "lucide-react";
import "../css/profile.css";

const pick = (g) => Object.values(g)[0];
const profileImg = pick(import.meta.glob("../assets/profile.*", { eager: true, import: "default" }));
const pregImg = pick(import.meta.glob("../assets/pregnancy.*", { eager: true, import: "default" }));

const polar = (cx, cy, r, a) => { const t = (a * Math.PI) / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; };
const arc = (cx, cy, r, a0, a1) => {
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

const WORK = {
  Today: { total: 9, vals: [26, 10, 4] },
  Weekly: { total: 46, vals: [130, 52, 28] },
  Monthly: { total: 190, vals: [540, 210, 95] },
};
const WCOL = ["#2b3f66", "#b4b9e0", "#dd9fd0"];
const WLAB = ["Patients reception", "Documents processing", "Online consultation"];

const PCT = {
  Daily: { total: "1,750", vals: [64, 74, 48] },
  Weekly: { total: "9,820", vals: [70, 68, 55] },
  Monthly: { total: "38,400", vals: [78, 81, 60] },
};
const PCOL = ["#c2ab72", "#2fae8f", "#464d51"];
const PLAB = ["New Patient", "Recovered", "In treatment"];
const RADII = [108, 84, 60];

const SPEC = ["General Medicine", "Health Screening", "Pediatric Nutrition", "Injury Management", "Chronic Disease", "Skin Conditions"];

/* break request config */
const BREAK_TYPES = {
  "Tea Break": "Short Tea Break",
  "Lunch Break": "Lunch Break",
  "Emergency Break": "Emergency break",
  "Personal Break": "Personal work",
};
const URGENCY = ["Low", "Normal", "High", "Urgent"];
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fmt = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const BREAK_INIT = { type: "", start: "11:00", end: "11:15", reason: "Short Tea Break", urgency: "Normal", notes: "", notify: true };

/* count-up animation */
function useCount(target, dur = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = Number(String(target).replace(/,/g, ""));
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setV(Math.round(t * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}
function Num({ to, comma }) {
  const v = useCount(to);
  return <>{comma ? v.toLocaleString("en-US") : v}</>;
}

function Gauge({ vals }) {
  const sum = vals.reduce((a, b) => a + b, 0), gap = 4;
  let a = 180;
  return (
    <svg viewBox="0 0 220 125" className="pf-gauge">
      {vals.map((v, i) => {
        const span = (v / sum) * 180;
        const d = arc(110, 112, 95, a + gap / 2, a + span - gap / 2);
        a += span;
        return <path key={i} d={d} className="pf-arc" pathLength="1" stroke={WCOL[i]} strokeWidth="24" fill="none" style={{ animationDelay: `${i * 0.18}s` }} />;
      })}
    </svg>
  );
}

function Rings({ vals }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 200); return () => clearTimeout(t); }, []);
  return (
    <svg viewBox="0 0 260 260" className="pf-rings">
      <g transform="translate(260,0) scale(-1,1)">
        {vals.map((v, i) => {
          const r = RADII[i], C = 2 * Math.PI * r;
          return (
            <circle key={i} cx="130" cy="130" r={r} fill="none" stroke={PCOL[i]} strokeWidth="18"
              strokeDasharray={`${go ? (v / 100) * C : 0} ${C}`} transform="rotate(-90 130 130)"
              style={{ transition: `stroke-dasharray 1.1s cubic-bezier(.22,1,.36,1) ${i * 0.15}s` }} />
          );
        })}
      </g>
    </svg>
  );
}

/* ---------------- Doctor Break Request ---------------- */
function BreakRequest() {
  const [f, setF] = useState(BREAK_INIT);
  const [err, setErr] = useState({});
  const [shake, setShake] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [list, setList] = useState([]);
  const [toast, setToast] = useState("");

  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErr((p) => ({ ...p, [k]: "" })); };
  const dur = useMemo(() => toMin(f.end) - toMin(f.start), [f.start, f.end]);
  const hasErr = Object.values(err).some(Boolean);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const pickType = (type) => {
    setF((p) => ({ ...p, type, reason: BREAK_TYPES[type] || p.reason }));
    setErr((p) => ({ ...p, type: "" }));
  };

  const validate = () => {
    const e = {};
    if (!f.type) e.type = "Break type select pannunga";
    if (!f.start) e.start = "Required";
    if (!f.end) e.end = "Required";
    if (f.start && f.end && dur <= 0) e.end = "End time > Start time irukanum";
    else if (dur > 120) e.end = "Max 2 hours dhaan";
    if (!f.reason.trim()) e.reason = "Reason type pannunga";
    return e;
  };

  const submit = () => {
    if (status === "loading") return;
    const e = validate();
    setErr(e);
    if (Object.keys(e).length) { setShake((s) => s + 1); return; }
    setStatus("loading");
    setTimeout(() => {
      setList((l) => [{ id: Date.now(), ...f, dur }, ...l]);
      setStatus("done");
      setToast(f.notify ? "Break request sent • Reception & Staff notified" : "Break request sent");
      setTimeout(() => { setStatus("idle"); setF(BREAK_INIT); }, 1400);
    }, 900);
  };

  const cancel = (id) => setList((l) => l.filter((x) => x.id !== id));

  return (
    <div className="pf-card pb">
      <h4 className="pb-title">Doctor Break Request</h4>

      <div className="pb-row" key={shake} data-shake={hasErr ? "1" : "0"}>
        <label className="pb-f">
          <span>Break Type</span>
          <div className={`pb-in pb-sel ${err.type ? "bad" : ""}`}>
            <select value={f.type} onChange={(e) => pickType(e.target.value)}>
              <option value="" disabled>Select Break type</option>
              {Object.keys(BREAK_TYPES).map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} />
          </div>
          {err.type && <em className="pb-err">{err.type}</em>}
        </label>

        <label className="pb-f">
          <span>Start Time</span>
          <div className={`pb-in ${err.start ? "bad" : ""}`}>
            <Clock size={13} />
            <b>{f.start ? fmt(f.start) : "--:--"}</b>
            <input type="time" value={f.start} onChange={(e) => set("start", e.target.value)} />
          </div>
          {err.start && <em className="pb-err">{err.start}</em>}
        </label>

        <label className="pb-f">
          <span>End Time</span>
          <div className={`pb-in ${err.end ? "bad" : ""}`}>
            <Clock size={13} />
            <b>{f.end ? fmt(f.end) : "--:--"}</b>
            <input type="time" value={f.end} onChange={(e) => set("end", e.target.value)} />
          </div>
          {err.end && <em className="pb-err">{err.end}</em>}
        </label>

        <label className="pb-f">
          <span>Reason</span>
          <div className={`pb-in ${err.reason ? "bad" : ""}`}>
            <input type="text" className="pb-txt" value={f.reason} onChange={(e) => set("reason", e.target.value)} placeholder="Reason" />
          </div>
          {err.reason && <em className="pb-err">{err.reason}</em>}
        </label>

        <label className="pb-f">
          <span>Urgency</span>
          <div className={`pb-in pb-sel u-${f.urgency.toLowerCase()}`}>
            <select value={f.urgency} onChange={(e) => set("urgency", e.target.value)}>
              {URGENCY.map((u) => <option key={u}>{u}</option>)}
            </select>
            <ChevronDown size={14} />
          </div>
        </label>
      </div>

      <div className="pb-bottom">
        <div className="pb-notes">
          <span>Additional Notes (Optional)</span>
          <div className="pb-in">
            <input className="pb-txt" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Add any additional notes ....." />
          </div>
        </div>

        <div className="pb-actions">
          <label className="pb-chk">
            <input type="checkbox" checked={f.notify} onChange={(e) => set("notify", e.target.checked)} />
            <i><Check size={11} strokeWidth={3} /></i>
            Notify Reception & Staff
          </label>

          {dur > 0 && <span className="pb-dur" key={dur}>{dur} min</span>}

          <button className={`pb-btn ${status}`} onClick={submit}>
            {status === "loading" && <><span className="pb-spin" /> Sending...</>}
            {status === "done" && <><Check size={14} /> Requested</>}
            {status === "idle" && <><Send size={13} /> Request Break</>}
          </button>
        </div>
      </div>

      {list.length > 0 && (
        <ul className="pb-list">
          {list.map((r) => (
            <li key={r.id}>
              <Coffee size={14} />
              <b>{r.type}</b>
              <span>{fmt(r.start)} – {fmt(r.end)} ({r.dur} min)</span>
              <em className={`tag u-${r.urgency.toLowerCase()}`}>{r.urgency}</em>
              <small>{r.reason}</small>
              <span className="pb-pend">Pending</span>
              <button onClick={() => cancel(r.id)} title="Cancel"><X size={13} /></button>
            </li>
          ))}
        </ul>
      )}

      {toast && <div className="pb-toast"><Check size={14} /> {toast}</div>}
    </div>
  );
}

/* patient avatars: first 5 = circle-la theriyum, mela 10 = "+10" click panna varum */
const PATIENTS = [
  { img: 11, name: "Arun Kumar", id: "P-1001" },
  { img: 12, name: "Priya Sharma", id: "P-1002" },
  { img: 15, name: "Karthik Raj", id: "P-1003" },
  { img: 32, name: "Divya Lakshmi", id: "P-1004" },
  { img: 47, name: "Suresh Babu", id: "P-1005" },
  { img: 1, name: "Meena Devi", id: "P-1006" },
  { img: 3, name: "Vignesh M", id: "P-1007" },
  { img: 5, name: "Anitha R", id: "P-1008" },
  { img: 8, name: "Ramesh Kannan", id: "P-1009" },
  { img: 9, name: "Sangeetha V", id: "P-1010" },
  { img: 13, name: "Harish Babu", id: "P-1011" },
  { img: 16, name: "Kavitha S", id: "P-1012" },
  { img: 20, name: "Prakash J", id: "P-1013" },
  { img: 25, name: "Nandhini P", id: "P-1014" },
  { img: 33, name: "Dinesh Kumar", id: "P-1015" },
];

function PatientAvatars() {
  const [open, setOpen] = useState(null); // null | index (single) | "all"
  const ref = useRef(null);

  useEffect(() => {
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, []);

  const av = (n) => `https://i.pravatar.cc/80?img=${n}`;
  const one = typeof open === "number" ? PATIENTS[open] : null;

  return (
    <div className="pf-avs-wrap" ref={ref}>
      <div className="pf-avs">
        {PATIENTS.slice(0, 5).map((p, i) => (
          <img key={p.id} src={av(p.img)} alt={p.name} title={p.name} className={open === i ? "on" : ""}
            onClick={() => setOpen(open === i ? null : i)} />
        ))}
        <em className={open === "all" ? "on" : ""} onClick={() => setOpen(open === "all" ? null : "all")}>+{PATIENTS.length - 5}</em>
      </div>

      {one && (
        <div className="pf-pop one" key={open}>
          <img src={av(one.img)} alt="" />
          <div><b>{one.name}</b><small>Patient ID : {one.id}</small></div>
        </div>
      )}

      {open === "all" && (
        <div className="pf-pop all">
          <header>
            <span>All Patients ({PATIENTS.length})</span>
            <button onClick={() => setOpen(null)}><X size={12} /></button>
          </header>
          <ul>
            {PATIENTS.map((p, i) => (
              <li key={p.id} style={{ animationDelay: `${i * 0.04}s` }} onClick={() => setOpen(i)}>
                <img src={av(p.img)} alt="" />
                <div><b>{p.name}</b><small>{p.id}</small></div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------------- Profile page ---------------- */
export default function Profile() {
  const [wTab, setWTab] = useState("Today");
  const [pTab, setPTab] = useState("Daily");
  const [email, setEmail] = useState("Smithdr.798@gmail.com");
  const [leave, setLeave] = useState("Sick leave");
  const [tool, setTool] = useState(0);
  const w = WORK[wTab], p = PCT[pTab];

  const edit = () => {
    const v = prompt("Email:", email);
    if (v) setEmail(v);
  };
  const addLeave = () => {
    const v = prompt("Leave type? (Sick leave / Casual leave / ...)", leave);
    if (v) setLeave(v);
  };

  return (
    <main className="pf">
      <section className="pf-wrap">
        <div className="pf-head">
          <h2>Doctor Profile</h2>
          <button className="pf-edit" onClick={edit}><Pencil size={13} /> Edit</button>
        </div>

        <div className="pf-grid">
          {/* -------- LEFT -------- */}
          <div className="pf-left">
            <div className="pf-top">
              {/* profile */}
              <div className="pf-card pf-prof">
                <div className="pf-who">
                  {profileImg ? <img src={profileImg} alt="Dr. Smith Steve" /> : <div className="pf-ph" />}
                  <div>
                    <h3>Dr. Smith Steve</h3>
                    <p>M.B.B.S <small>Lorem Ipsum is simply dummy text of the printing</small></p>
                  </div>
                </div>
                <div className="pf-info">
                  <p>Age : <b>49</b></p>
                  <p>Email : <b key={email} className="pf-flash">{email}</b></p>
                  <p>Address : <b>89 Marine Parade Rd #02-31 Parkway Parade.</b></p>
                  <p>Phone number : <b>+91 1234567890</b></p>
                  <div className="pf-spec">
                    <span>Specialist :</span>
                    <ul>{SPEC.map((s) => <li key={s}>{s}</li>)}</ul>
                  </div>
                </div>
              </div>

              {/* working hours */}
              <div className="pf-card pf-work">
                <div className="pf-ch">
                  <h4>Working hours</h4>
                  <div className="pf-tabs sm">
                    {Object.keys(WORK).map((t) => <button key={t} className={wTab === t ? "on" : ""} onClick={() => setWTab(t)}>{t}</button>)}
                  </div>
                </div>
                <div className="pf-gwrap">
                  <Gauge key={wTab} vals={w.vals} />
                  <div className="pf-gc"><b><Num to={w.total} /></b><span>Total hours</span></div>
                </div>
                <ul className="pf-wl">
                  {w.vals.map((v, i) => (
                    <li key={wTab + i}><i style={{ background: WCOL[i] }} /><b><Num to={v} /></b><span>{WLAB[i]}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* gynecology */}
            <div className="pf-card pf-gyn">
              <div className="pf-gh">
                <h4>Gynecology <span>| Pregnancy</span></h4>
                <small>Name : Sarah &nbsp;&nbsp; Age : 28</small>
              </div>
              <div className="pf-gbox">
                <dl>
                  <dt>Patient Type</dt><dd>: Antenatal / Postnatal</dd>
                  <dt>Key Services</dt><dd>: Routine checkups, Ultrasound scans, Nutritional guidance, High-risk pregnancy monitoring</dd>
                  <dt>Important Fields</dt><dd>: LMP (Last Menstrual Period), EDD (Expected Delivery Date), Gravida / Para, Blood Group</dd>
                  <dt>Visit</dt><dd>: Monthly / Weekly (based on trimester)</dd>
                  <dt>Outcome</dt><dd>: Normal Delivery / C-Section</dd>
                </dl>
                {pregImg ? <img className="pf-preg" src={pregImg} alt="Pregnancy" /> : <div className="pf-preg ph" />}
              </div>
              <div className="pf-tools">
                {[Baby, HeartPulse, Stethoscope].map((Ic, i) => (
                  <button key={i} className={tool === i ? "on" : ""} onClick={() => setTool(i)}><Ic size={20} /></button>
                ))}
              </div>
            </div>
          </div>

          {/* -------- RIGHT -------- */}
          <div className="pf-right">
            <div className="pf-card pf-pct">
              <div className="pf-ch">
                <h4>Patient Percentage</h4>
                <div className="pf-tabs">
                  {Object.keys(PCT).map((t) => <button key={t} className={pTab === t ? "on" : ""} onClick={() => setPTab(t)}>{t}</button>)}
                </div>
              </div>
              <div className="pf-total">
                <span className="hrt">♥</span>
                <div><small>Total Patient</small><b><Num to={p.total} comma /></b></div>
                <PatientAvatars />
              </div>
              <Rings vals={p.vals} />
              <ul className="pf-pl">
                {p.vals.map((v, i) => (
                  <li key={i}><i style={{ background: PCOL[i] }} /><b><Num to={v} />%</b><span>{PLAB[i]}</span></li>
                ))}
              </ul>
            </div>

            <div className="pf-card pf-leave">
              <div className="pf-ch">
                <h4>Apply for leave</h4>
                <button className="pf-add" onClick={addLeave}><Plus size={13} /> Add leave</button>
              </div>
              <p><b>1. Doctor name</b><span>: Dr. Smith</span></p>
              <p><b>2. Doctor ID No</b><span>: 123457-1</span></p>
              <p><b>3. Leave type</b><span key={leave} className="pf-flash">: {leave}</span></p>
            </div>
          </div>
        </div>

        {/* -------- BOTTOM: Doctor Break Request -------- */}
        <BreakRequest />
      </section>
    </main>
  );
}