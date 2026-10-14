import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store.jsx";
import {
  Activity, ChevronLeft, ChevronRight, Plus, Coffee, Asterisk, Hospital, Video, ChevronDown, Check,
} from "lucide-react";

const STATS = [
  ["New Patients", "07", 45, "#2c4bd8"], ["Follow ups", "15", 60, "#2cc7c0"], ["Referred", "11", 50, "#f08a24"],
  ["Online / Onsite", "07/14", 40, "#3cb84a"], ["IP Patients", "12", 55, "#e0479e"],
];
const TYPES = { con: "#22d3ee", sur: "#dc2626", adm: "#f59e0b", adv: "#22c55e" };
const LEGEND = [["Consultation", "con"], ["Surgery", "sur"], ["Administration", "adm"], ["Advance", "adv"]];
const MARKS = {
  2: ["adv", "con"], 3: ["adm"], 4: ["adm"], 5: ["adv"], 8: ["adv"], 9: ["adv"], 11: ["adv"], 12: ["adv"], 14: ["con"],
  17: ["con", "adv"], 19: ["adm", "adv"], 20: ["sur"], 22: ["con"], 23: ["sur", "con"], 24: ["con"], 25: ["con"],
  26: ["con", "adv"], 29: ["con"], 30: ["con", "adv"], 31: ["adv"],
};

const ONLINE = [
  { title: "Cardiagram", who: "Board tecon", time: "9:30 - 10:00", Icon: Plus, end: "hosp" },
  { title: "Break", who: "", time: "45 mins", Icon: Coffee },
  { title: "Team meeting", who: "", time: "11:00 - 12:00", Icon: Asterisk, team: [11, 12, 13, 14], end: "meet" },
];

/* colour palette: [bar bg, left edge] */
const PAL = [["#9dc49b", "#22b31f"], ["#e08a8a", "#e0393e"], ["#8f92f5", "#3d43e0"], ["#b0b0b0", "#888"], ["#e8e2a0", "#f2d100"], ["#6fb5f0", "#1e7fe0"]];
const R = (t, name, sub, uid, at, w, c, img = null) => ({ t, name, sub, uid, at, w, c, img });
const SCHEDULE = {
  Daily: [
    R("10:00 to 10:50", "Johnson", "Blood Sugar Review", "1234-5678-9012-34", "10:00 Am", 75, 0, 12),
    R("11:00 to 12:00", "Emila", "Prenatal checkup", "1234-5678-2016-16", "Ongoing", 66, 1, 45),
    R("12:00 to 12:50", "Robert son", "Follow ups", "1234-5678-2026-26", "12:00 Am", 82, 2, 33),
    R("13:00 to 14:00", "Lunch Break", "", "", "13:00 Am", 63, 3),
    R("14:00 to 14:45", "Emma wilson", "Vaccination", "1234-5678-9012-72", "14:00 Pm", 90, 4, 47),
    R("15:00 to 16:00", "Steve smith", "Vaccination", "1234-5678-2025-18", "15:00 Pm", 55, 5, 68),
  ],
  Weekly: [
    R("Monday", "Consultations", "14 patients", "", "9am - 4pm", 80, 0),
    R("Tuesday", "Surgeries", "3 cases", "", "9am - 2pm", 45, 1),
    R("Wednesday", "Follow ups", "18 patients", "", "10am - 5pm", 92, 2),
    R("Thursday", "Vaccination", "9 patients", "", "10am - 1pm", 58, 4),
    R("Friday", "Prenatal", "12 patients", "", "9am - 3pm", 70, 5),
    R("Saturday", "Half day", "6 patients", "", "9am - 12pm", 38, 3),
  ],
  Monthly: [
    R("Week 1", "Total patients", "64 visits", "", "Mar 1 - 7", 60, 0),
    R("Week 2", "Total patients", "82 visits", "", "Mar 8 - 14", 78, 5),
    R("Week 3", "Total patients", "97 visits", "", "Mar 15 - 21", 92, 2),
    R("Week 4", "Total patients", "71 visits", "", "Mar 22 - 31", 66, 4),
  ],
  Yearly: [
    R("Jan - Mar", "Q1 patients", "812 visits", "", "Quarter 1", 70, 0),
    R("Apr - Jun", "Q2 patients", "934 visits", "", "Quarter 2", 82, 5),
    R("Jul - Sep", "Q3 patients", "1,046 visits", "", "Quarter 3", 94, 2),
    R("Oct - Dec", "Q4 patients", "875 visits", "", "Quarter 4", 76, 1),
  ],
};
const RANGES = Object.keys(SCHEDULE);

const SLOTS = ["10am-11am", "11am-12am", "12am-01pm", "02pm-03pm", "03pm-04pm"];
const BASE = { con: [17, 45, 102, 140, 54], sur: [4, 9, 15, 22, 8], adm: [10, 20, 30, 25, 12], adv: [8, 30, 60, 80, 40] };
const TINT = { con: ["#c9fbfb", "#00f5f5"], sur: ["#fbc9c9", "#dc0000"], adm: ["#fde6c0", "#f59e0b"], adv: ["#c9f7d2", "#22e04a"] };
const PERIODS = [["Today", 1], ["This week", 5], ["This month", 20]];

const conic = (types) => {
  if (!types) return "#d4d6da";
  const step = 100 / types.length;
  return `conic-gradient(${types.map((t, i) => `${TYPES[t]} ${i * step}% ${(i + 1) * step - 8}%, transparent ${(i + 1) * step - 8}% ${(i + 1) * step}%`).join(",")})`;
};

/* number count-up animation */
function Count({ v, pad }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, t0;
    const step = (t) => {
      if (t0 === undefined) t0 = t;
      const p = Math.min((t - t0) / 700, 1);
      setN(Math.round(v * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [v]);
  return <>{pad ? String(n).padStart(2, "0") : n}</>;
}

const WELCOME_MS = 3500;
const LEAVE_MS = 650; // card launch animation time, then navigate

export default function Dashboard() {
  const { appts } = useStore();
  const navigate = useNavigate();
  const PATIENTS = appts.filter((p) => p.status !== "Cancelled").slice(0, 5);
  const [now, setNow] = useState(new Date(2026, 2, 16, 10, 4));
  const [sel, setSel] = useState(3);
  const [month, setMonth] = useState(new Date(2026, 2, 1));
  const [day, setDay] = useState(26);
  const [done, setDone] = useState({});          // online appointments completed
  const [range, setRange] = useState("Daily");
  const [pick, setPick] = useState(null);         // selected schedule bar
  const [cat, setCat] = useState("con");          // overview category
  const [period, setPeriod] = useState(0);        // overview period index
  const [menu, setMenu] = useState(false);
  const [bar, setBar] = useState(3);
  const [welcome, setWelcome] = useState("show"); // show | hide | off
  const [leaving, setLeaving] = useState(null);   // patient id being opened in Appointments
  const menuRef = useRef(null);
  const leaveTimer = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow((d) => new Date(d.getTime() + 60000)), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setWelcome("hide"), WELCOME_MS);
    const t2 = setTimeout(() => setWelcome("off"), WELCOME_MS + 600);
    const onKey = (e) => { if (e.key === "Escape") closeWelcome(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener("keydown", onKey); };
  }, []);

  /* dropdown veliya click panna close */
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* page maarina timer clear */
  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  const closeWelcome = () => {
    setWelcome("hide");
    setTimeout(() => setWelcome("off"), 600);
  };

  /* patient card click -> animate -> open Appointments page with that patient selected */
  const openAppt = (p) => {
    if (leaving !== null) return;
    setSel(p.id);
    setLeaving(p.id);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    leaveTimer.current = setTimeout(
      () => navigate("/appointments", { state: { selected: p.id, from: "dashboard" } }),
      reduce ? 0 : LEAVE_MS
    );
  };

  const y = month.getFullYear(), m = month.getMonth();
  const first = new Date(y, m, 1).getDay();
  const cells = Array.from({ length: 35 }, (_, i) => new Date(y, m, i - first + 1));
  const marks = y === 2026 && m === 2 ? MARKS : {};
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  const current = PATIENTS.find((p) => p.id === sel) || PATIENTS[0] || { name: "-", sub: "" };
  const next = PATIENTS[(PATIENTS.indexOf(current) + 1) % (PATIENTS.length || 1)] || current;

  /* overview data */
  const mult = PERIODS[period][1];
  const vals = BASE[cat].map((v) => v * mult);
  const step = Math.ceil(Math.max(...vals) / 4);
  const top = step * 4;
  const ticks = [4, 3, 2, 1, 0].map((k) => step * k);

  /* online counts */
  const doneCount = Object.values(done).filter(Boolean).length;
  const rows = SCHEDULE[range];

  const pickDay = (n) => { setDay(n); setDone({}); };
  const changeRange = (r) => { setRange(r); setPick(null); };

  return (
    <main className={leaving !== null ? "leaving" : ""}>
      {/* -------- Welcome popup -------- */}
      {welcome !== "off" && createPortal(
        <div className={`wel${welcome === "hide" ? " out" : ""}`}>
          <div className="wel-pill" onClick={closeWelcome} style={{ "--ms": `${WELCOME_MS}ms` }}>
            <p className="wel-t1">Welcome back, Dr. Smith !</p>
            <p className="wel-t2">Your dashboard is updated with today's schedule and patient analytics</p>
            <i className="wel-bar" />
          </div>
        </div>,
        document.body
      )}

      {/* -------- Page transition veil (patient card click) -------- */}
      {leaving !== null && createPortal(
        <div className="veil" style={{ "--ms": `${LEAVE_MS}ms` }}>
          <span className="veil-dot" />
          <p>Opening appointment…</p>
        </div>,
        document.body
      )}

      <section className="strip">
        <div>
          <h2>{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).replace(/^(\w+), (\w+ \d+), (\d+)$/, "$1, $2, $3")} <small>{time}</small></h2>
          <p>Good Morning, Dr.Smith</p>
        </div>
        <div className="mid">
          <p><span className="c1">Current patient :</span><span className="pn" key={current.id}><b>{current.name}</b><em>{current.sub}</em></span></p>
          <p><span className="c2">Next patient :</span><span className="pn" key={next.id}><b>{next.name}</b><em>{next.sub}</em></span></p>
          <p className="wait"><span>Waiting Patients :</span><b>20+</b></p>
        </div>
        <div className="doc"><Activity size={20} color="#1d9bd1" /><div><b>Dr. Smith</b><small>Gynecologist</small></div></div>
      </section>

      <div className="row2">
        <section className="card">
          <h3>Today’s Appointments</h3>
          <div className="stats">
            {STATS.map(([l, v, p, c]) => (
              <div className="stat" key={l}><div><span>{l}</span><b>{v}</b></div><i style={{ background: `linear-gradient(90deg,${c} ${p}%,#c9ccd1 ${p}%)` }} /></div>
            ))}
          </div>
          <Link className="all" to="/appointments" state={{ from: "dashboard" }}>View all ›</Link>
          <div className={`pts${leaving !== null ? " leaving" : ""}`}>
            {PATIENTS.map((p) => (
              <div className={`ptw${leaving === p.id ? " go" : ""}`} key={p.id}>
                {p.prio && <span className={`prio ${p.prio}`}>{p.prio}</span>}
                <button
                  className={sel === p.id ? "pt on" : "pt"}
                  onClick={() => openAppt(p)}
                  title="Open in Appointments"
                >
                  <img src={`https://i.pravatar.cc/120?img=${p.img}`} alt={p.name} />
                  <b>{p.name}</b><span>{p.sub}</span><small>Age : {p.age}</small><small>{p.uid}</small>
                </button>
                <em>{p.status === "Ongoing" ? "Ongoing" : p.time}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="card cal">
          <div className="calh">
            <button onClick={() => setMonth(new Date(y, m - 1, 1))}><ChevronLeft size={16} /></button>
            <b>{month.toLocaleString("en-US", { month: "long" })}</b>
            <button onClick={() => setMonth(new Date(y, m + 1, 1))}><ChevronRight size={16} /></button>
          </div>
          <div className="grid">
            {"SMTWTFS".split("").map((d, i) => <span key={i} className="dow">{d}</span>)}
            {cells.map((d, i) => {
              const inM = d.getMonth() === m, n = d.getDate();
              return (
                <button key={i} className={`day${inM && day === n ? " sel" : ""}`} style={{ "--ring": conic(inM ? marks[n] : null) }} onClick={() => inM && pickDay(n)}>{n}</button>
              );
            })}
          </div>
          <div className="legend">{LEGEND.map(([l, k]) => <span key={k}><i style={{ background: TYPES[k] }} />{l}</span>)}</div>
        </section>
      </div>

      {/* -------- Online appointments -------- */}
      <div className="row3">
        <section className="card onl">
          <div className="onh">
            <div>
              <h3>Online appointments</h3>
              <small className="dline"><b key={day} className="daynum">{day}</b> {new Date(y, m, day).toLocaleString("en-US", { weekday: "long" })}. {month.toLocaleString("en-US", { month: "long" })}</small>
            </div>
            <div className="cnt">
              <span>● <Count v={18} pad /> Scheduled</span>
              <span>● <Count v={6 + doneCount} pad /> Completed</span>
              <span>● <Count v={12 - doneCount} pad /> Pending</span>
            </div>
          </div>
          <div className="ol" key={day}>
            {ONLINE.map(({ title, who, time: t, Icon, team, end }, i) => (
              <div className={`oi2${done[title] ? " done" : ""}`} key={i} onClick={() => setDone((d) => ({ ...d, [title]: !d[title] }))} title="Click panni complete mark pannunga">
                <span className="ic2">{done[title] ? <Check size={16} /> : <Icon size={16} />}</span>
                <b>{title}</b>
                <em>{who}</em>
                <span className="mid2">
                  {team && (
                    <span className="avs">
                      {team.map((n) => <img key={n} src={`https://i.pravatar.cc/60?img=${n}`} alt="" />)}
                      <i>+10</i>
                    </span>
                  )}
                </span>
                <small>{t}</small>
                <span className="ic3">{end === "hosp" ? <Hospital size={16} /> : end === "meet" ? <Video size={16} /> : null}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* -------- Schedule + Patients Overview -------- */}
      <div className="row4">
        <section className="card">
          <div className="sch-h">
            <div><h3>Schedule</h3><small>Take a look to your schedule for this {range === "Daily" ? "day" : range === "Weekly" ? "week" : range === "Monthly" ? "month" : "year"}</small></div>
            <div className="rng">
              {RANGES.map((r) => <button key={r} className={range === r ? "on" : ""} onClick={() => changeRange(r)}>{r}</button>)}
            </div>
          </div>
          <div className="sch-box">
            <div className="sch" key={range}>
              {rows.map((s, i) => (
                <div className="srow" key={s.t}>
                  <span className="st-t">{s.t}</span>
                  <div className="sgrid">
                    <div
                      className={`sbar${pick === i ? " picked" : ""}`}
                      style={{ width: `${s.w}%`, background: PAL[s.c][0], "--edge": PAL[s.c][1], "--i": i }}
                      onClick={() => setPick(pick === i ? null : i)}
                    >
                      {s.img && <img src={`https://i.pravatar.cc/60?img=${s.img}`} alt="" />}
                      <b>{s.name}</b><span>{s.sub}</span><small>{s.uid}</small><em>{s.at}</em>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {pick !== null && rows[pick] && (
            <div className="pickinfo" key={`${range}-${pick}`}>
              <b>{rows[pick].name}</b> · {rows[pick].sub || "Break"} · {rows[pick].t} {rows[pick].uid && `· ${rows[pick].uid}`}
            </div>
          )}
        </section>

        <section className="card ov">
          <div className="ov-h">
            <h3>Patients Overview</h3>
            <div className="selw" ref={menuRef}>
              <button className={`sel${menu ? " open" : ""}`} onClick={() => setMenu(!menu)}>{PERIODS[period][0]} <ChevronDown size={12} /></button>
              {menu && (
                <div className="menu">
                  {PERIODS.map(([l], i) => (
                    <button key={l} className={period === i ? "on" : ""} onClick={() => { setPeriod(i); setMenu(false); }}>{l}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="chart">
            <div className="yax">{ticks.map((v) => <span key={v}>{v}</span>)}<b>No</b></div>
            <div className="bars" style={{ "--lt": TINT[cat][0], "--dk": TINT[cat][1] }}>
              {vals.map((v, i) => (
                <div className="bcol" key={`${cat}-${period}-${i}`} onClick={() => setBar(i)} style={{ "--i": i }}>
                  <em><Count v={v} /></em>
                  <i className={bar === i ? "on" : ""} style={{ height: `${Math.max((v / top) * 100, 6)}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="xax"><b>Time</b>{SLOTS.map((l, i) => <span key={l} className={bar === i ? "on" : ""}>{l}</span>)}</div>
          <div className="olg">
            {LEGEND.map(([l, k]) => (
              <button key={k} className={cat === k ? "on" : ""} onClick={() => setCat(k)} style={cat === k ? { background: TINT[k][0] } : undefined}>
                <i style={{ background: TYPES[k] }} />{l}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}