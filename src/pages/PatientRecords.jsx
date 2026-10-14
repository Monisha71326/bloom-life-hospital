import { useEffect, useRef, useState, useId } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HeartPulse, ClipboardList, Info, ScanLine, ShieldCheck, TrendingUp, Shirt, Cog,
  Plus, AlertTriangle, Clock, User, Stethoscope, CalendarDays, BarChart3, ArrowLeft, X,
  Activity, FlaskConical, Beaker, Pill, Droplet, Bone, MessageCircle, Send, Heart, Camera,
} from "lucide-react";
import ConsultationModal from "./ConsultationModal";
import "../css/patientRecords.css";

/* =====================================================
   ULTRASOUND IMAGE (auto-generated SVG)
   src illa-na idhu kaattum. Real image vennumna scans-la src kudunga.
   ===================================================== */
function ScanArt({ kind }) {
  const id = useId().replace(/:/g, "");
  const edge = "#e6e9ec";
  return (
    <svg className="scan" viewBox="0 0 100 100" role="img" aria-label={kind}>
      <defs>
        <filter id={`n${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="linear" slope="0.55" /></feComponentTransfer>
        </filter>
        <filter id={`b${id}`}><feGaussianBlur stdDeviation="1.1" /></filter>
        <radialGradient id={`g${id}`} cx="50%" cy="38%" r="65%">
          <stop offset="0" stopColor="#a3aab1" />
          <stop offset=".45" stopColor="#3d434a" />
          <stop offset="1" stopColor="#060708" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="#050607" />
      {/* ultrasound fan */}
      <path d="M50 3 L97 82 A62 62 0 0 1 3 82 Z" fill={`url(#g${id})`} />
      <g filter={`url(#b${id})`} fill="none" stroke={edge} strokeLinecap="round">
        {kind === "full" && (
          <>
            <circle cx="42" cy="34" r="13" strokeWidth="3" fill="#59616a" />
            <ellipse cx="55" cy="63" rx="15" ry="19" strokeWidth="3" fill="#4a5159" />
            <path d="M62 78 Q72 82 76 70" strokeWidth="4" />
            <path d="M45 50 Q40 60 44 66" strokeWidth="2.5" />
          </>
        )}
        {kind === "leg" && (
          <>
            <path d="M28 24 L52 66" strokeWidth="6" />
            <path d="M52 66 L74 46" strokeWidth="5" />
            <ellipse cx="52" cy="48" rx="26" ry="9" transform="rotate(25 52 48)" strokeWidth="1.5" opacity=".5" />
            <circle cx="78" cy="42" r="3" fill={edge} />
          </>
        )}
        {kind === "head" && (
          <>
            <ellipse cx="50" cy="46" rx="25" ry="29" strokeWidth="4.5" fill="#2b3036" />
            <path d="M50 20 L50 72" strokeWidth="1.8" opacity=".8" />
            <ellipse cx="42" cy="46" rx="5" ry="9" strokeWidth="1.5" opacity=".6" />
            <ellipse cx="58" cy="46" rx="5" ry="9" strokeWidth="1.5" opacity=".6" />
          </>
        )}
      </g>
      <rect width="100" height="100" filter={`url(#n${id})`} opacity=".55" style={{ mixBlendMode: "screen" }} />
    </svg>
  );
}

/* =====================================================
   DATA  (patient name lowercase -> records)
   Medical values ellam SAMPLE. Real data-va inga maathikonga.
   ===================================================== */
const ICONS = { user: User, heart: Heart, flask: FlaskConical, clip: ClipboardList, pill: Pill, cam: Camera, cal: CalendarDays, scan: ScanLine };

/* consultation timeline (6 cards) */
const VISIT_BASE = [
  { title: "Initial Consultation", sub: "Routine checkup",     tag: "Completed", tone: "teal",   icon: "user"  },
  { title: "Follow-up",            sub: "Progress reviewed",   tag: "Completed", tone: "pink",   icon: "heart" },
  { title: "Lab Test",             sub: "Blood & urine tests", tag: "Completed", tone: "purple", icon: "flask" },
  { title: "Report Review",        sub: "Reports discussed",   tag: "Reviewed",  tone: "orange", icon: "clip"  },
  { title: "Treatment Plan",       sub: "Medication advised",  tag: "Active",    tone: "blue",   icon: "pill"  },
  { title: "Next Appointment",     sub: "Review visit",        tag: "Upcoming",  tone: "green",  icon: "cam"   },
];
const visitsOf = (dates) => VISIT_BASE.map((v, i) => ({ ...v, date: dates[i] }));

/* vitals helper (non-pregnancy patients) */
const vit = (bp, pulse, weight, temp, bmi, spo2) => [
  { l: "Blood pressure", v: bp, u: "mmHg", big: true },
  { l: "Pulse", v: pulse, u: "bpm", big: true, inline: true },
  { l: "Weight", v: weight, u: "kg", inline: true },
  { l: "Temperature", v: temp, u: "°F", inline: true },
  { l: "BMI", v: bmi, u: "", inline: true, warn: Number(bmi) >= 25 },
  { l: "SpO₂", v: spo2, u: "%", inline: true },
];

const CBC = { t: "Complete Blood Count", d: "Check haemoglobin, red blood cells, white cells, and platelets.", Icon: Droplet, tone: "red" };
const GLU = { t: "Blood Glucose Test", d: "Measure blood sugar levels to screen for diabetes.", Icon: FlaskConical, tone: "orange" };
const URN = { t: "Urine Routine & Culture", d: "Detects urinary tract infection, protein, glucose, and other abnormalities.", Icon: Beaker, tone: "lime" };

/* ---------- templates ---------- */
const CHECKUP = {
  alerts: [{ id: 1, level: "mid", title: "Review Due", text: "Follow-up review is due. Please confirm the next visit with the patient." }],
  labs: [CBC, GLU],
  rx: [
    { t: "Multivitamin", d: "Daily multivitamin to support general health and immunity.", Icon: Pill, tone: "orange" },
    { t: "Calcium Supplements", d: "Support healthy bone development and bone health.", Icon: Bone, tone: "none" },
  ],
  journey: [
    { tag: "ROUTINE CHECKUP", title: "General health stable", sub: "Vitals normal", badge: "Scan", tone: "teal", node: "cal", day: "30", mon: "Aug 2026" },
    { tag: "LAB REVIEW", title: "Blood report within range", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "18", mon: "Aug 2026" },
    { tag: "FOLLOW-UP", title: "Advised diet and exercise", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "05", mon: "Aug 2026" },
    { tag: "FIRST VISIT", title: "Initial assessment done", sub: "", badge: "Scan", tone: "cyan", node: "scan", day: "21", mon: "Jul 2026" },
  ],
  visits: visitsOf(["21 Jul 2026", "05 Aug 2026", "18 Aug 2026", "25 Aug 2026", "30 Aug 2026", "15 Oct 2026"]),
  stats: [6, 4, 1, 1],
  next: { date: "Thu, 15 Oct", sub: "Review visit · 10:30 AM · Room 2", tag: "General review" },
  history: [], historyNote: "",
  impression: "No acute abnormality detected. Findings are consistent with the clinical picture.",
  scans: [],
};

const SUGAR = {
  ...CHECKUP,
  alerts: [{ id: 1, level: "mid", title: "High Fasting Sugar", text: "Fasting glucose above normal range. Review diet and medication." }],
  labs: [GLU, { t: "HbA1c", d: "Average blood sugar level over the last 3 months.", Icon: Droplet, tone: "red" }],
  rx: [
    { t: "Metformin", d: "Helps control blood sugar levels.", Icon: Pill, tone: "orange" },
    { t: "Glimepiride", d: "Stimulates insulin release to lower blood sugar.", Icon: Droplet, tone: "red" },
  ],
  journey: [
    { tag: "ROUTINE REVIEW", title: "Sugar levels slightly high", sub: "Diet advised", badge: "Lab", tone: "pink", node: "lab", day: "15", mon: "Sep 2026" },
    { tag: "FOLLOW-UP", title: "Medication adjusted", sub: "HbA1c planned", badge: "Scan", tone: "teal", node: "cal", day: "01", mon: "Oct 2026" },
    { tag: "LAB REVIEW", title: "Fasting sugar elevated", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "02", mon: "Sep 2026" },
    { tag: "FIRST VISIT", title: "Diabetes screening done", sub: "", badge: "Scan", tone: "cyan", node: "scan", day: "21", mon: "Aug 2026" },
  ],
  next: { date: "Thu, 15 Oct", sub: "Follow-up · 10:00 AM · Room 2", tag: "HbA1c recheck" },
  impression: "No acute abnormality. Advise lifestyle modification and glycaemic control.",
};

const COLD = {
  ...CHECKUP,
  alerts: [{ id: 1, level: "mid", title: "High Fever", text: "If fever stays above 101°F for more than 3 days, contact the doctor." }],
  labs: [CBC, { t: "CRP", d: "Checks for infection or inflammation in the body.", Icon: FlaskConical, tone: "orange" }],
  rx: [
    { t: "Paracetamol", d: "Reduces fever and relieves body pain.", Icon: Pill, tone: "orange" },
    { t: "Cetirizine", d: "Relieves sneezing, runny nose and watery eyes.", Icon: Pill, tone: "red" },
    { t: "Steam Inhalation", d: "Helps clear blocked nose and ease congestion.", Icon: Droplet, tone: "none" },
  ],
  journey: [
    { tag: "COLD & COUGH", title: "Symptoms improving", sub: "Rest advised", badge: "Scan", tone: "teal", node: "cal", day: "28", mon: "Sep 2026" },
    { tag: "LAB REVIEW", title: "Mild infection markers", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "25", mon: "Sep 2026" },
    { tag: "FIRST VISIT", title: "Fever with sore throat", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "23", mon: "Sep 2026" },
    { tag: "CHEST CHECK", title: "Chest clear on exam", sub: "", badge: "Scan", tone: "cyan", node: "scan", day: "23", mon: "Sep 2026" },
  ],
  visits: visitsOf(["23 Sep 2026", "25 Sep 2026", "25 Sep 2026", "28 Sep 2026", "28 Sep 2026", "05 Oct 2026"]),
  stats: [4, 3, 1, 1],
  next: { date: "Mon, 05 Oct", sub: "Review visit · 12:00 PM · Room 1", tag: "Cold follow-up" },
  impression: "Chest X-ray not required. Upper respiratory tract infection, clinically.",
};

const VACC = {
  ...CHECKUP,
  alerts: [{ id: 1, level: "mid", title: "Vaccine Due", text: "Next dose is due on schedule. Check the immunisation card before the visit." }],
  labs: [{ t: "Haemoglobin", d: "Checks iron levels and screens for anaemia.", Icon: Droplet, tone: "red" }],
  rx: [
    { t: "Paracetamol Drops", d: "Given after vaccination if fever or pain occurs.", Icon: Pill, tone: "orange" },
    { t: "Vitamin D3", d: "Supports healthy bone and teeth development.", Icon: Bone, tone: "none" },
  ],
  journey: [
    { tag: "VACCINATION", title: "Dose given, no reaction", sub: "Observed 30 min", badge: "Scan", tone: "teal", node: "cal", day: "10", mon: "Sep 2026" },
    { tag: "GROWTH CHECK", title: "Weight and height normal", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "10", mon: "Aug 2026" },
    { tag: "VACCINATION", title: "Previous dose completed", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "10", mon: "Jul 2026" },
    { tag: "FIRST VISIT", title: "Immunisation plan made", sub: "", badge: "Scan", tone: "cyan", node: "scan", day: "10", mon: "Jun 2026" },
  ],
  visits: visitsOf(["10 Jun 2026", "10 Jul 2026", "10 Aug 2026", "10 Sep 2026", "10 Sep 2026", "10 Oct 2026"]),
  stats: [6, 4, 1, 1],
  next: { date: "Sat, 10 Oct", sub: "Vaccination · 12:00 PM · Room 4", tag: "Next dose" },
  impression: "Growth parameters are normal for age. Immunisation on schedule.",
};

const SURGERY = {
  ...CHECKUP,
  alerts: [{ id: 1, level: "high", title: "Wound Infection Signs", text: "Redness, swelling, pus or fever near the surgical site needs immediate attention." }],
  labs: [CBC, { t: "Wound Swab Culture", d: "Checks for bacterial infection at the surgical site.", Icon: Beaker, tone: "lime" }],
  rx: [
    { t: "Amoxicillin", d: "Antibiotic course to prevent post-surgical infection.", Icon: Pill, tone: "orange" },
    { t: "Diclofenac", d: "Relieves post-operative pain and swelling.", Icon: Droplet, tone: "red" },
  ],
  journey: [
    { tag: "POST-OP CHECK", title: "Wound healing well", sub: "Sutures intact", badge: "Scan", tone: "teal", node: "cal", day: "26", mon: "Sep 2026" },
    { tag: "LAB REVIEW", title: "No infection markers", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "20", mon: "Sep 2026" },
    { tag: "SURGERY", title: "Procedure done under anaesthesia", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "14", mon: "Sep 2026" },
    { tag: "PRE-OP VISIT", title: "Fitness for surgery cleared", sub: "", badge: "Scan", tone: "cyan", node: "scan", day: "08", mon: "Sep 2026" },
  ],
  visits: visitsOf(["08 Sep 2026", "14 Sep 2026", "20 Sep 2026", "26 Sep 2026", "26 Sep 2026", "08 Oct 2026"]),
  stats: [6, 4, 1, 1],
  next: { date: "Thu, 08 Oct", sub: "Surgery checkup · 1:00 PM · Room 3", tag: "Suture removal" },
  history: [{ t: "SURGERY", date: "14.09.2026", d: "A planned surgical procedure performed under anaesthesia with post-operative monitoring." }],
  impression: "Post-operative site healing well. No collection or abnormality noted.",
};

const RECORDS = {
  /* ================= EMILA (pregnancy) ================= */
  emila: {
    sex: "F", dob: "14 Mar 1996", age: 29, mrn: "OG-24-08817", blood: "B positive", phone: "+91 98••• ••204",
    grav: 3, para: 1, abor: 1, living: 1,
    lmp: "17 Dec 2024", edd: "23 Sep 2025", week: 28, day: 3,
    tags: [
      { t: "Pregnant · 28w 3d", c: "rose" },
      { t: "Prev. LSCS · High-risk", c: "amber" },
      { t: "Allergy: Penicillin", c: "red" },
    ],
    vitalsDate: "04 Jul",
    vitals: [
      { l: "Blood pressure", v: "118/76", u: "mmHg", big: true },
      { l: "Fetal heart rate", v: "148", u: "bpm", big: true, inline: true },
      { l: "Weight", v: "71.4", u: "kg", inline: true },
      { l: "Fundal height", v: "28", u: "cm", inline: true },
      { l: "BMI", v: "27.9", u: "", inline: true, warn: true },
      { l: "Wt. gain", v: "+9.2", u: "kg", inline: true },
    ],
    uhid: "12345", doctor: "Dr. Kavitha", quals: "MBBS, MD (OG)",
    time: "10:30 AM", date: "10 May 2026", type: "Regular Checkup", typeSub: "OPD Consultation",
    alerts: [
      { id: 1, level: "high", title: "Severe Bleeding", text: "Heavy vaginal bleeding or passing large blood clots requires immediate medical attention." },
      { id: 2, level: "mid", title: "Baby Movement Reduced", text: "If you notice significantly fewer baby movements than usual, contact your doctor immediately." },
      { id: 3, level: "info", title: "Severe Headache & Blurred Vision", text: "Persistent headache, or sudden swelling may indicate high blood pressure during pregnancy." },
    ],
    labs: [
      CBC,
      { t: "Blood Glucose Test", d: "Measure blood sugar levels to screen for gestational diabetes.", Icon: FlaskConical, tone: "orange" },
      URN,
    ],
    rx: [
      { t: "Prenatal Vitamins", d: "Daily multivitamin containing folic acid and essential nutrients.", Icon: Pill, tone: "orange" },
      { t: "Iron Supplements", d: "Helps prevent and treat iron deficiency during pregnancy.", Icon: Droplet, tone: "red" },
      { t: "Calcium Supplements", d: "Supports healthy bone development for the baby and maintains maternal bone health.", Icon: Bone, tone: "none" },
    ],
    visits: visitsOf(["05 Jan 2026", "02 Feb 2026", "03 Mar 2026", "21 Apr 2026", "30 Jun 2026", "26 Jul 2026"]),
    stats: [8, 5, 3, 2],
    journey: [
      { tag: "ROUTINE ANC · GROWTH SCAN", title: "Growth appropriate for age", sub: "Dopplers normal", badge: "Scan", tone: "teal", node: "cal", day: "30", mon: "Jun 2026" },
      { tag: "ROUTINE ANC", title: "Stable · fetal movements good", sub: "OGTT planned", badge: "Lab", tone: "pink", node: "lab", day: "10", mon: "Jun 2026" },
      { tag: "ROUTINE ANC", title: "Anaemia improving on iron therapy", sub: "", badge: "Lab", tone: "pink", node: "lab", day: "02", mon: "Jun 2026" },
      { tag: "ANOMALY SCAN VISIT", title: "No structural anomaly, anatomy normal", sub: "", badge: "Scan", tone: "cyan", node: "scan", day: "21", mon: "Apr 2026" },
    ],
    next: { date: "Sat, 26 Jul", sub: "32-week visit · 11:30 AM · Room 3", tag: "OGTT + Growth scan" },
    history: [
      { t: "IVF", date: "28.07.2026", d: "A complex series of assisted reproductive technology (ART) procedures where mature eggs are fertilised outside the body." },
      { t: "EGG RETRIEVAL", date: "01.07.2026", d: "A minor surgical procedure performed under anesthesia where a needle is guided via ultrasound to remove the mature eggs from the follicles." },
    ],
    historyNote: "IVF is primarily used to treat infertility, but it can also be used for family planning and genetic preservation. It is often recommended.",
    impression: "Single live intrauterine pregnancy is identified. Fetal biometric measurements are consistent with gestational age.",
    scans: [
      { l: "Full baby", kind: "full", src: null },
      { l: "Baby Leg",  kind: "leg",  src: null },
      { l: "Baby Head", kind: "head", src: null },
      /* real image vennumna: { l: "Full baby", kind: "full", src: "/scans/full-baby.jpg" } */
    ],
  },

  /* ================= OTHER PATIENTS ================= */
  johnson:  { ...SUGAR,   sex: "M", dob: "12 Aug 1998", mrn: "GM-24-03321", blood: "O positive", phone: "+91 98••• ••112", vitalsDate: "01 Oct", vitals: vit("122/80", "78", "72", "98.6", "23.4", "99") },
  robertson:{ ...CHECKUP, sex: "M", dob: "03 Feb 1981", mrn: "GM-24-04410", blood: "A positive", phone: "+91 97••• ••540", vitals: vit("128/84", "82", "81", "98.4", "26.8", "98") },
  steve:    { ...CHECKUP, sex: "M", dob: "19 Nov 1990", mrn: "GM-24-05127", blood: "B positive", phone: "+91 96••• ••318", vitals: vit("120/78", "76", "70", "98.6", "23.9", "99") },
  "emma wilson": { ...CHECKUP, sex: "F", dob: "25 Jun 1992", mrn: "GM-24-05893", blood: "AB positive", phone: "+91 95••• ••776", vitals: vit("116/74", "80", "58", "98.4", "21.6", "99") },
  karthick: { ...COLD,    sex: "M", dob: "07 Apr 2004", mrn: "GM-24-06102", blood: "O positive", phone: "+91 90••• ••451", vitals: vit("118/76", "88", "64", "100.2", "21.2", "98") },
  infant:   { ...VACC,    sex: "M", dob: "02 Jan 2026", mrn: "PD-24-00731", blood: "B positive", phone: "+91 94••• ••902", vitals: vit("—", "128", "7.8", "98.2", "—", "99") },
  felix:    { ...SURGERY, sex: "M", dob: "15 Sep 2003", mrn: "GS-24-02215", blood: "A positive", phone: "+91 93••• ••267", vitals: vit("124/80", "80", "74", "98.6", "24.1", "99") },
  arun:     { ...COLD,    sex: "M", dob: "28 Oct 2003", mrn: "GM-24-06377", blood: "O negative", phone: "+91 92••• ••845", vitals: vit("120/80", "90", "68", "99.8", "22.4", "98") },
  virat:    { ...VACC,    sex: "M", dob: "11 Mar 2003", mrn: "GM-24-06619", blood: "B positive", phone: "+91 91••• ••693", vitals: vit("122/78", "74", "70", "98.4", "23.0", "99") },
  ranjith:  { ...COLD,    sex: "M", dob: "30 Jul 2003", mrn: "GM-24-06840", blood: "A positive", phone: "+91 98••• ••159", vitals: vit("118/74", "86", "66", "100.0", "21.9", "98") },
  sri:      { ...CHECKUP, sex: "M", dob: "16 Dec 2003", mrn: "GM-24-07052", blood: "AB negative", phone: "+91 97••• ••024", vitals: vit("120/76", "72", "62", "98.4", "21.0", "99") },
};
RECORDS["steve smith"] = RECORDS.steve;

/* ---------- antenatal timeline (design x-positions, 1330px base) ---------- */
const BASE = 1330;
const MILESTONES = [
  { w: 6,  x: 117,  t: "Early Heartbeat",           Icon: HeartPulse,    tone: "teal" },
  { w: 12, x: 240,  t: "End of 1st Trimester",      Icon: ClipboardList, tone: "teal" },
  { w: 14, x: 464,  t: "Start of 2nd Trimester",    Icon: Info,          tone: "mauve" },
  { w: 18, x: 598,  t: "Anomaly scan window",       Icon: ScanLine,      tone: "mauve" },
  { w: 24, x: 758,  t: "Viability Milestone",       Icon: ShieldCheck,   tone: "mauve" },
  { w: 32, x: 1055, t: "Growth & Monitoring Focus", Icon: TrendingUp,    tone: "amber", future: true },
  { w: 36, x: 1207, t: "Preparation Phase",         Icon: Shirt,         tone: "amber", future: true },
  { w: 40, x: 1302, t: "Expected Delivery",         Icon: Cog,           tone: "amber", future: true, bare: true },
];
const ANCHORS = [[0, 0], [6, 117], [12, 240], [14, 464], [18, 598], [24, 758], [28, 901], [32, 1055], [36, 1207], [40, 1302]];
const CHIPS = [{ w: 11, x: 315 }, { w: 20, x: 678 }, { w: 28, x: 901, now: true }, { w: 32, x: 1124, future: true }];
const TICKS = [{ l: "0w", x: 6 }, { l: "8w", x: 179 }, { l: "16w", x: 542 }, { l: "26w", x: 830 }, { l: "30w", x: 987 }, { l: "40w", x: 1302 }];

const pct = (x) => `${(x / BASE) * 100}%`;
const posOf = (w) => {
  for (let i = 1; i < ANCHORS.length; i++) {
    const [w0, x0] = ANCHORS[i - 1], [w1, x1] = ANCHORS[i];
    if (w <= w1) return x0 + ((w - w0) / (w1 - w0)) * (x1 - x0);
  }
  return ANCHORS[ANCHORS.length - 1][1];
};

const NODE_ICON = { cal: CalendarDays, lab: FlaskConical, scan: ScanLine };
const todayLabel = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const two = (n) => String(n).padStart(2, "0");
const DESIGN_W = 1388; // Figma-la card area width (1440 - 2x26)

export default function PatientRecords() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const host = pageRef.current?.parentElement;
    if (!host) return;
    const cs = getComputedStyle(host);
    const calc = () => {
      const w = host.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
      setZoom(w >= 900 ? Math.min(1, w / DESIGN_W) : 1);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);
  const p = state?.patient ?? { name: "Emila" }; // direct-ah open pannina Emila kaattum

  const name = p.name;
  const base = RECORDS[name.toLowerCase()] ?? {};
  const ageFromAppt = String(p.age ?? "").split("/")[0].trim();
  const sexFromAppt = /female/i.test(p.age ?? "") ? "F" : /male/i.test(p.age ?? "") ? "M" : "";
  const rec = {
    age: ageFromAppt || "—", dob: "—", mrn: "—", blood: "—", phone: "—",
    uhid: p.uid ?? "—", doctor: "Dr. Kavitha", quals: "MBBS, MD (OG)",
    time: p.time ?? "—", date: p.date ?? "—", type: p.sub ?? "Checkup", typeSub: "OPD Consultation",
    vitals: [], alerts: [], tags: [], labs: [], rx: [], journey: [], visits: [], stats: [], history: [], scans: [],
    ...base,
  };
  const hasPregnancy = rec.week != null;
  const todayX = hasPregnancy ? posOf(rec.week) : 0;
  const sex = rec.sex || sexFromAppt;
  const salute = sex === "F" ? (hasPregnancy ? "Mrs." : "Ms.") : sex === "M" ? "Mr." : "";

  const [alerts, setAlerts] = useState(rec.alerts);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", text: "" });
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState("");
  const [consultOpen, setConsultOpen] = useState(false);

  const addAlert = () => {
    if (!draft.title.trim()) return;
    setAlerts((a) => [...a, { id: Date.now(), level: "mid", title: draft.title.trim(), text: draft.text.trim() }]);
    setDraft({ title: "", text: "" });
    setAdding(false);
  };
  const removeAlert = (id) => setAlerts((a) => a.filter((x) => x.id !== id));
  const send = () => { if (msg.trim()) { setMsgs((m) => [...m, msg.trim()]); setMsg(""); } };

  const alertIcon = (l) =>
    l === "high" ? <AlertTriangle size={14} fill="currentColor" /> : l === "info" ? <Plus size={14} strokeWidth={3.2} /> : <Clock size={14} />;

  const STAT_LABELS = ["Total Visit", "Doctor Consultation", "Lab Tests", "Report Reviewed"];
  const STAT_ICONS = [CalendarDays, Stethoscope, FlaskConical, ClipboardList];
  const STAT_TONES = ["teal", "pink", "purple", "orange"];

  /* consultation modal-ku thevaiyana values */
  const openConsult = () => setConsultOpen(true);
  const consultMeta = `${todayLabel()} ${new Date().getFullYear()}${hasPregnancy ? ` · ${rec.week}w ${rec.day}d` : ""} · Visit #${(Number(rec.stats?.[0]) || 0) + 1}`;
  const consultLabs = hasPregnancy
    ? ["75g OGTT", "Growth scan (next visit)", "Urine routine"]
    : rec.labs.map((l) => l.t);
  const consultNext = rec.next ? `${rec.next.date} · ${rec.next.tag}` : "";

  return (
    <div className="pr-page" ref={pageRef} style={{ zoom }}>
      <button className="pr-back" onClick={() => navigate("/appointments")}>
        <ArrowLeft size={14} /> Appointments
      </button>

      {/* ================= PATIENT HEADER ================= */}
      <section className="pr-card pr-head">
        <div className="pr-avatar">{name[0]}</div>
        <div className="pr-who">
          <h1>{name}</h1>
          <p className="pr-meta">
            <span><b>{rec.age}</b> yrs · <i className="pr-mono">{rec.dob}</i></span>
            <span>MRN <b>{rec.mrn}</b></span>
            <span>Blood group <b>{rec.blood}</b></span>
            <span><b>{rec.phone}</b></span>
          </p>
        </div>

        {hasPregnancy && (
          <>
            <div className="pr-gpal">
              {[["GRAV", rec.grav], ["PARA", rec.para], ["ABOR", rec.abor], ["LIVING", rec.living]].map(([l, n]) => (
                <div key={l}><strong>{n}</strong><small>{l}</small></div>
              ))}
            </div>
            <div className="pr-tags">
              {rec.tags.map((t) => (
                <span key={t.t} className={`pr-tag ${t.c}`}><i />{t.t}</span>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ================= ANTENATAL TIMELINE ================= */}
      {hasPregnancy && (
        <section className="pr-card pr-tl">
          <header>
            <h3>ANTENATAL TIMELINE</h3>
            <p className="pr-lmp">
              LMP <span className="pr-mono">{rec.lmp}</span> · EDD <em className="pr-mono">{rec.edd}</em> · <em>{rec.week}w {rec.day}d</em>
            </p>
          </header>

          <div className="pr-scroll">
            <div className="pr-track">
              <div className="pr-bar" />
              <div className="pr-fill" style={{ width: pct(todayX) }} />

              <span className="pr-today" style={{ left: pct(todayX) }}>TODAY · {rec.week}w</span>
              <span className="pr-today-line" style={{ left: pct(todayX) }} />

              <span className="pr-tri" style={{ left: 0 }}>1st trimester</span>
              <span className="pr-tri" style={{ left: pct(366) }}>2nd trimester</span>
              <span className="pr-tri" style={{ left: pct(932) }}>3rd trimester</span>

              {CHIPS.map((c) => (
                <span key={c.w} className={`pr-chip${c.now ? " now" : ""}${c.future ? " future" : ""}`} style={{ left: pct(c.x) }}>{c.w}w</span>
              ))}
              {TICKS.map((t) => (
                <span key={t.l} className="pr-tick" style={{ left: pct(t.x) }}>{t.l}</span>
              ))}

              {MILESTONES.map(({ w, x, t, Icon, tone, future, bare }) => (
                <div key={t} className={`pr-ms ${tone}${future ? " future" : ""}`} style={{ left: pct(x) }}>
                  <span className="pr-pin"><Icon size={13} /></span>
                  <span className="pr-dot" />
                  {!bare && <span className="pr-dash" />}
                  {!bare && <span className="pr-lbl"><b>{w}W</b>{t}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= 3 COLUMNS ================= */}
      <div className="pr-cols">
        {/* ---------- LEFT ---------- */}
        <div className="pr-col">
          <section className="pr-card pr-vitals">
            <header><h3>VITALS · TODAY</h3><span className="pr-mono">{rec.vitalsDate ?? todayLabel()}</span></header>
            <div className="pr-vgrid">
              {rec.vitals.map((x) => (
                <div key={x.l} className={`pr-vbox${x.big ? " big" : ""}`}>
                  <small>{x.l}</small>
                  <strong className={x.warn ? "warn" : ""}>{x.v}{x.inline && x.u && <span> {x.u}</span>}</strong>
                  {!x.inline && <em>{x.u}</em>}
                </div>
              ))}
            </div>
            {!rec.vitals.length && <p className="pr-none">No vitals recorded</p>}
          </section>

          <section className="pr-card pr-list">
            <h3>LABORATORY</h3>
            {rec.labs.map(({ t, d, Icon, tone }) => (
              <div key={t} className="pr-item">
                <b><Icon size={15} className={`ti ${tone}`} />{t}</b>
                <p>{d}</p>
              </div>
            ))}
            {!rec.labs.length && <p className="pr-none">No lab tests</p>}
          </section>

          <section className="pr-card pr-list grow">
            <h3>PRESCRIPTION</h3>
            {rec.rx.map(({ t, d, Icon, tone }) => (
              <div key={t} className="pr-item">
                <b><Icon size={15} className={`ti ${tone}`} />{t}</b>
                <p>{d}</p>
              </div>
            ))}
            {!rec.rx.length && <p className="pr-none">No prescription</p>}
          </section>
        </div>

        {/* ---------- CENTER ---------- */}
        <div className="pr-col">
          <section className="pr-card pr-form">
            <header>
              <h3>TODAY CONSULTATION FORM</h3>
              <span className="pr-badge">Pre Consultation</span>
            </header>
            <div className="pr-info">
              <div><span className="ic blue"><User size={18} /></span><p><small>Patient</small><b>{salute} {name}</b><em>UHID : {rec.uhid}</em></p></div>
              <div><span className="ic green"><Stethoscope size={18} /></span><p><small>Doctor</small><b>{rec.doctor}</b><em>{rec.quals}</em></p></div>
              <div><span className="ic purple"><CalendarDays size={18} /></span><p><small>Appointments</small><b>{rec.time}</b><em>{rec.date}</em></p></div>
              {/* ---- CLICK PANNA CONSULTATION FORM OPEN AAGUM ---- */}
              <div
                className="clickable"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                onClick={openConsult}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openConsult())}
              >
                <span className="ic orange"><BarChart3 size={18} /></span>
                <p><small>Consultation Type</small><b>{rec.type}</b><em>{rec.typeSub}</em></p>
              </div>
            </div>
          </section>

          {/* ---- consultation timeline ---- */}
          {rec.visits.length > 0 && (
            <section className="pr-card pr-vtl">
              <h3>CONSULTATION TIMELINE</h3>
              <small className="pr-vsub">Your consultation visiting history</small>

              <div className="pr-vcards">
                {rec.visits.map((v) => (
                  <div key={v.title} className="pr-vcol">
                    <div className={`pr-vcard ${v.tone}`}>
                      <span className="d">{v.date}</span>
                      <b>{v.title}</b>
                      <em>{v.sub}</em>
                      <i className="tg">{v.tag}</i>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pr-vnodes">
                {rec.visits.map((v, i) => {
                  const Icon = ICONS[v.icon] ?? User;
                  return (
                    <div key={v.title} className={`pr-vnode ${v.tone}`}>
                      <span className="circle"><Icon size={16} /></span>
                      {i < rec.visits.length - 1 && <i className="gap" />}
                    </div>
                  );
                })}
              </div>

              {rec.stats.length > 0 && (
                <div className="pr-vstats">
                  {rec.stats.map((n, i) => {
                    const Icon = STAT_ICONS[i];
                    return (
                      <div key={i} className="st">
                        <span className={`sic ${STAT_TONES[i]}`}><Icon size={14} /></span>
                        <p><strong>{two(n)}</strong><small>{STAT_LABELS[i]}</small></p>
                      </div>
                    );
                  })}
                  <div className="st hl">
                    <span className="sic green"><Heart size={14} fill="currentColor" /></span>
                    <p><small>We are with you at every step of health journey</small></p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ---- clinical journey ---- */}
          {rec.journey.length > 0 && (
            <section className="pr-card pr-journey">
              <h2><Activity size={18} /> Clinical Journey</h2>
              <small className="pr-jsub">Track key milestone and test results</small>

              <div className="pr-jcards">
                {rec.journey.map((j, i) => (
                  <div key={i} className="pr-jcol">
                    <div className={`pr-jcard ${j.tone}`}>
                      <span className="tag">{j.tag}</span>
                      <b>{j.title}</b>
                      {j.sub && <em>{j.sub}</em>}
                      <i className="bd">{j.badge}</i>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pr-jnodes">
                {rec.journey.map((j, i) => {
                  const Icon = NODE_ICON[j.node] ?? CalendarDays;
                  return (
                    <div key={i} className={`pr-jnode ${j.tone}`}>
                      <span className="circle"><Icon size={16} /></span>
                      <i className="pt" />
                      <strong>{j.day}</strong>
                      <small>{j.mon}</small>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="pr-pair grow">
            <section className="pr-card pr-next">
              <h3>NEXT APPOINTMENT</h3>
              <div className="pr-nbox">
                {rec.next ? (
                  <>
                    <strong>{rec.next.date}</strong>
                    <p>{rec.next.sub}</p>
                    <span><i />{rec.next.tag}</span>
                  </>
                ) : <p className="pr-none">No upcoming visit</p>}
              </div>
            </section>

            <section className="pr-card pr-msgr">
              <h3>MESSENGER</h3>
              <div className="pr-mbox">
                <MessageCircle size={20} />
                {msgs.length > 0 && (
                  <div className="pr-msgs">{msgs.map((m, i) => <span key={i}>{m}</span>)}</div>
                )}
                <div className="pr-minput">
                  <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} aria-label="Message" />
                  <button onClick={send} aria-label="Send"><Send size={14} /></button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ---------- RIGHT ---------- */}
        <div className="pr-col">
          <section className="pr-card pr-alerts">
            <header>
              <h3>HIGHER ALERTS</h3>
              <button className="pr-add" onClick={() => setAdding((s) => !s)}><Plus size={14} /> Add Alert</button>
            </header>

            {adding && (
              <div className="pr-newalert">
                <input placeholder="Alert title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                <input placeholder="Details" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
                <button onClick={addAlert}>Add</button>
              </div>
            )}

            {alerts.map((a) => (
              <div key={a.id} className={`pr-alert pr-lv-${a.level}`}>
                <b>{alertIcon(a.level)} {a.title}</b>
                <p>{a.text}</p>
                <button className="pr-rm" onClick={() => removeAlert(a.id)} aria-label="Remove"><X size={11} /></button>
              </div>
            ))}
            {!alerts.length && <p className="pr-none">No alerts</p>}
          </section>

          <section className="pr-card pr-list">
            <h3>VISIT SUMMARY</h3>
            {rec.history.map((h) => (
              <div key={h.t} className="pr-item hist">
                <b>{h.t}<span>{h.date}</span></b>
                <p>{h.d}</p>
              </div>
            ))}
            {rec.historyNote && <p className="pr-note">{rec.historyNote}</p>}
            {!rec.history.length && !rec.historyNote && <p className="pr-none">No visit summary</p>}
          </section>

          <section className="pr-card pr-rad grow">
            <h3>RADIOLOGY</h3>
            {rec.impression && (
              <>
                <h4>Impression</h4>
                <p>{rec.impression}</p>
              </>
            )}
            <h4>Ultra sound</h4>
            <div className="pr-scans">
              {rec.scans.map((s) => (
                <figure key={s.l}>
                  {s.src ? <img src={s.src} alt={s.l} /> : <ScanArt kind={s.kind} />}
                  <figcaption>{s.l}</figcaption>
                </figure>
              ))}
              {!rec.scans.length && <p className="pr-none">No scans</p>}
            </div>
          </section>
        </div>
      </div>

      {/* ================= CONSULTATION FORM MODAL (portal -> document.body) ================= */}
      {consultOpen && (
        <ConsultationModal
          pregnancy={hasPregnancy}
          meta={consultMeta}
          labOptions={consultLabs}
          defaultNext={consultNext}
          onClose={() => setConsultOpen(false)}
          onSave={(data) => console.log("consultation saved", data)}
        />
      )}
    </div>
  );
}