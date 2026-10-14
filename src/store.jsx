import { createContext, useContext, useEffect, useState } from "react";
const A = (id, name, sub, age, time, img, status = "Scheduled", prio = "") => ({ id, name, sub, age, time, img, status, prio, uid: `1234-5678-${9000 + id}-${10 + id}` });
const SEED = {
  appointments: [A(1, "Johnson", "Blood Sugar Review", "27/ Male", "10:00 Am", 12), A(2, "Emila", "Prenatal Checkup", "28/ Female", "10:15 Am", 47, "Ongoing", "High"),
    A(3, "Robertson", "New Visit", "30/ Male", "10:45 Am", 33), A(4, "Emma wilson", "Vaccination", "34/ Female", "11:00 Am", 45, "Scheduled", "Medium"), A(5, "Steve smith", "Vaccination", "21/ Male", "11:40 Am", 15, "Scheduled", "Low")],
  patients: [{ id: 1, name: "Emila", age: 28, gender: "Female", phone: "98400 11223", condition: "Pregnancy - 32 weeks", status: "Active" }, { id: 2, name: "Nandhana", age: 31, gender: "Female", phone: "98410 55667", condition: "Delivery", status: "Active" }, { id: 3, name: "Johnson", age: 27, gender: "Male", phone: "98420 99881", condition: "Diabetes check", status: "Active" }],
  labs: [{ id: 1, patient: "Johnson", test: "Blood Sugar (FBS)", date: "2026-03-16", status: "Pending" }, { id: 2, patient: "Emila", test: "Hemoglobin", date: "2026-03-16", status: "In Progress" }, { id: 3, patient: "Nandhana", test: "Blood Group", date: "2026-03-15", status: "Completed" }],
  imaging: [{ id: 1, patient: "Emila", scan: "Ultrasound", date: "2026-03-16", status: "Scheduled" }, { id: 2, patient: "Robertson", scan: "X-Ray", date: "2026-03-14", status: "Completed" }],
  followups: [{ id: 1, patient: "Emma wilson", reason: "Vaccine dose 2", date: "2026-03-23", status: "Due" }, { id: 2, patient: "Steve smith", reason: "Fever review", date: "2026-03-12", status: "Done" }],
  diet: [{ id: 1, patient: "Emila", plan: "High-protein, iron rich", calories: 2200, status: "Active" }, { id: 2, patient: "Johnson", plan: "Low sugar diabetic diet", calories: 1800, status: "Active" }],
};
const Ctx = createContext();
export const useStore = () => useContext(Ctx);
export function StoreProvider({ children }) {
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem("bloom-data")) || SEED; } catch { return SEED; } });
  useEffect(() => localStorage.setItem("bloom-data", JSON.stringify(data)), [data]);
  const add = (k, it) => setData((d) => ({ ...d, [k]: [{ id: Date.now(), ...it }, ...d[k]] }));
  const update = (k, id, patch) => setData((d) => ({ ...d, [k]: d[k].map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const remove = (k, id) => setData((d) => ({ ...d, [k]: d[k].filter((r) => r.id !== id) }));
  const reset = () => setData(SEED);
  return <Ctx.Provider value={{ data, appts: data.appointments, add, update, remove, reset }}>{children}</Ctx.Provider>;
}
