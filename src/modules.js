const rid = () => `1234-5678-${1000 + Math.floor(Math.random() * 9000)}-${10 + Math.floor(Math.random() * 90)}`;
export default {
  appointments: { key: "appointments", title: "Appointments", statuses: ["Scheduled", "Ongoing", "Completed", "Cancelled"],
    fields: [{ k: "name", label: "Patient" }, { k: "sub", label: "Reason" }, { k: "age", label: "Age / Gender", ph: "27/ Male" }, { k: "time", label: "Time", ph: "11:00 Am" }, { k: "prio", label: "Priority", options: ["", "High", "Medium", "Low"] }],
    defaults: () => ({ uid: rid(), img: 1 + Math.floor(Math.random() * 69) }) },
  patients: { key: "patients", title: "Patient Records", statuses: ["Active", "Discharged"],
    fields: [{ k: "name", label: "Name" }, { k: "age", label: "Age", type: "number" }, { k: "gender", label: "Gender", options: ["Female", "Male", "Other"] }, { k: "phone", label: "Phone" }, { k: "condition", label: "Condition" }] },
  labs: { key: "labs", title: "Lab Tests", statuses: ["Pending", "In Progress", "Completed"],
    fields: [{ k: "patient", label: "Patient" }, { k: "test", label: "Test" }, { k: "date", label: "Date", type: "date" }] },
  imaging: { key: "imaging", title: "Imaging", statuses: ["Scheduled", "Completed", "Cancelled"],
    fields: [{ k: "patient", label: "Patient" }, { k: "scan", label: "Scan", options: ["X-Ray", "Ultrasound", "MRI", "CT Scan"] }, { k: "date", label: "Date", type: "date" }] },
  followups: { key: "followups", title: "Follow-ups", statuses: ["Due", "Done", "Missed"],
    fields: [{ k: "patient", label: "Patient" }, { k: "reason", label: "Reason" }, { k: "date", label: "Date", type: "date" }] },
  diet: { key: "diet", title: "Diet Planning", statuses: ["Active", "Completed"],
    fields: [{ k: "patient", label: "Patient" }, { k: "plan", label: "Diet plan" }, { k: "calories", label: "Calories", type: "number" }] },
};
