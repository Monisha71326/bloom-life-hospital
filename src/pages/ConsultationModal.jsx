import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Printer, Check, Save } from "lucide-react";
import "../css/consultationModal.css";

let uid = 0;
const nid = () => ++uid;
const mkItems = (labels, checked = []) =>
  labels.map((l) => ({ id: nid(), label: l, on: checked.includes(l) }));

const VITALS_PREG = [
  { k: "bp", l: "Blood pressure", ph: "120/78", u: "mmHg" },
  { k: "weight", l: "Weight", ph: "72.0", u: "kg" },
  { k: "fhr", l: "Fetal heart rate", ph: "146", u: "bpm" },
  { k: "fundal", l: "Fundal height", ph: "29", u: "cm" },
];
const VITALS_GEN = [
  { k: "bp", l: "Blood pressure", ph: "120/80", u: "mmHg" },
  { k: "pulse", l: "Pulse", ph: "78", u: "bpm" },
  { k: "weight", l: "Weight", ph: "70.0", u: "kg" },
  { k: "temp", l: "Temperature", ph: "98.6", u: "°F" },
];
const MED_PH = [
  ["Iron + Folic acid", "1 tab", "OD", "Continue"],
  ["Calcium + Vit D3", "1 tab", "BD", "Continue"],
  ["Drug name", "1 tab", "OD", "7 days"],
];

/* ---------- checklist group (Laboratory / Radiology / Vaccine) ---------- */
function CheckGroup({ title, items, setItems, addLabel, index }) {
  const [adding, setAdding] = useState(false);
  const [val, setVal] = useState("");

  const toggle = (id) => setItems(items.map((i) => (i.id === id ? { ...i, on: !i.on } : i)));
  const add = () => {
    const v = val.trim();
    if (v) setItems([...items, { id: nid(), label: v, on: true }]);
    setVal("");
    setAdding(false);
  };

  return (
    <div className="cm-grp cm-sec" style={{ "--i": index }}>
      <h5>{title}</h5>
      {items.map((i) => (
        <label key={i.id} className="cm-check">
          <input type="checkbox" checked={i.on} onChange={() => toggle(i.id)} />
          <span className="box"><Check size={11} strokeWidth={3.6} /></span>
          <span className="txt">{i.label}</span>
        </label>
      ))}
      {adding ? (
        <div className="cm-addrow">
          <input
            autoFocus
            value={val}
            placeholder={addLabel.replace("Add ", "") + " name"}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") { e.stopPropagation(); setAdding(false); }
            }}
            onBlur={add}
          />
        </div>
      ) : (
        <button type="button" className="cm-chip" onClick={() => setAdding(true)}>
          <Plus size={12} /> {addLabel}
        </button>
      )}
    </div>
  );
}

/* ---------- main modal ---------- */
export default function ConsultationModal({
  meta = "",
  pregnancy = false,
  labOptions = [],
  defaultNext = "",
  onClose,
  onSave,
}) {
  const [closing, setClosing] = useState(false);
  const [saved, setSaved] = useState(false);
  const closingRef = useRef(false);
  const firstRef = useRef(null);

  const vitalFields = pregnancy ? VITALS_PREG : VITALS_GEN;
  const [vitals, setVitals] = useState({});
  const [assessment, setAssessment] = useState("");
  const [meds, setMeds] = useState([
    { id: nid(), drug: "", dose: "", freq: "", dur: "" },
    { id: nid(), drug: "", dose: "", freq: "", dur: "" },
  ]);
  const [referral, setReferral] = useState(false);
  const [advice, setAdvice] = useState("");
  const [next, setNext] = useState("");

  const [labs, setLabs] = useState(() =>
    mkItems(labOptions.length ? labOptions : ["CBC", "Blood glucose", "Urine routine"])
  );
  const [rads, setRads] = useState(() => mkItems(["CT scan", "Ultra sound", "MRI"]));
  const [vacc, setVacc] = useState(() =>
    mkItems(pregnancy ? ["1st Trimester", "2nd Trimester", "3rd Trimester"] : ["Tetanus", "Influenza", "Hepatitis B"])
  );

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setTimeout(onClose, 220);
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line
  }, []);

  const setMed = (id, k, v) => setMeds((m) => m.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const addMed = () => setMeds((m) => [...m, { id: nid(), drug: "", dose: "", freq: "", dur: "" }]);
  const delMed = (id) => setMeds((m) => (m.length > 1 ? m.filter((r) => r.id !== id) : m));

  const save = () => {
    if (saved) return;
    const pick = (a) => a.filter((x) => x.on).map((x) => x.label);
    onSave?.({
      vitals, assessment,
      meds: meds.filter((m) => m.drug.trim()),
      referral, advice, next,
      labs: pick(labs), radiology: pick(rads), vaccines: pick(vacc),
    });
    setSaved(true);
    setTimeout(close, 800);
  };

  return createPortal(
    <div
      className={`cm-overlay${closing ? " out" : ""}`}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="cm-modal" role="dialog" aria-modal="true" aria-label="Today's consultation form">
        {/* ---------- header ---------- */}
        <header className="cm-head">
          <h2>Today's consultation form</h2>
          <div className="cm-headr">
            {meta && <span className="cm-meta">{meta}</span>}
            <button className="cm-x" onClick={close} aria-label="Close"><X size={16} /></button>
          </div>
        </header>

        <div className="cm-body">
          {/* ================= LEFT ================= */}
          <div className="cm-left">
            <section className="cm-sec" style={{ "--i": 0 }}>
              <h4>Vitals recorded today</h4>
              <div className="cm-vgrid">
                {vitalFields.map((f, i) => (
                  <label key={f.k} className="cm-field">
                    <small>{f.l}</small>
                    <div className="cm-unit">
                      <input
                        ref={i === 0 ? firstRef : null}
                        value={vitals[f.k] ?? ""}
                        placeholder={f.ph}
                        onChange={(e) => setVitals({ ...vitals, [f.k]: e.target.value })}
                      />
                      <span>{f.u}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="cm-sec" style={{ "--i": 1 }}>
              <h4>Assessment / Diagnosis</h4>
              <textarea
                rows={3}
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                placeholder="e.g. 28w singleton, cephalic. Anaemia improving, BP normal, no PIH features..."
              />
            </section>

            <section className="cm-sec" style={{ "--i": 2 }}>
              <h4>Medications prescribed today</h4>
              <div className="cm-meds">
                <div className="cm-mrow head">
                  <span>Drug</span><span>Dose</span><span>Frequency</span><span>Duration</span><span />
                </div>
                {meds.map((m, i) => {
                  const ph = MED_PH[i % MED_PH.length];
                  return (
                    <div key={m.id} className="cm-mrow cm-mnew">
                      <input value={m.drug} placeholder={ph[0]} onChange={(e) => setMed(m.id, "drug", e.target.value)} />
                      <input value={m.dose} placeholder={ph[1]} onChange={(e) => setMed(m.id, "dose", e.target.value)} />
                      <input value={m.freq} placeholder={ph[2]} onChange={(e) => setMed(m.id, "freq", e.target.value)} />
                      <input value={m.dur} placeholder={ph[3]} onChange={(e) => setMed(m.id, "dur", e.target.value)} />
                      <button type="button" className="cm-del" onClick={() => delMed(m.id)} aria-label="Remove medication" disabled={meds.length === 1}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="cm-medfoot">
                <button type="button" className="cm-chip" onClick={addMed}><Plus size={12} /> Add medication</button>
                <label className="cm-check sm">
                  <input type="checkbox" checked={referral} onChange={() => setReferral(!referral)} />
                  <span className="box"><Check size={10} strokeWidth={3.6} /></span>
                  <span className="txt">Move to Referral</span>
                </label>
              </div>
            </section>

            <section className="cm-sec" style={{ "--i": 3 }}>
              <h4>Advice / Notes</h4>
              <textarea
                rows={3}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Kick count, warning signs, diet, follow-up instructions..."
              />
            </section>

            <section className="cm-sec" style={{ "--i": 4 }}>
              <h4>Next visit</h4>
              <input
                className="cm-single"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder={defaultNext || "e.g. 26 Jul 2026 · 32w"}
              />
            </section>
          </div>

          {/* ================= RIGHT ================= */}
          <aside className="cm-right">
            <div className="cm-panel">
              <CheckGroup index={1} title="Laboratory" items={labs} setItems={setLabs} addLabel="Add test" />
              <CheckGroup index={2} title="Radiology" items={rads} setItems={setRads} addLabel="Add Radiology" />
              <CheckGroup index={3} title="Vaccine" items={vacc} setItems={setVacc} addLabel="Add vaccine" />
            </div>

            <div className="cm-actions cm-sec" style={{ "--i": 5 }}>
              <div className="cm-btns">
                <button type="button" className={`cm-save${saved ? " done" : ""}`} onClick={save}>
                  {saved ? <><Check size={15} /> Saved</> : <><Save size={14} /> Save to record</>}
                </button>
                <button type="button" className="cm-print" onClick={() => window.print()}>
                  <Printer size={14} /> Print Rx
                </button>
              </div>
              <p>Saving adds this visit to the timeline. You can edit it anytime from the record.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body
  );
}