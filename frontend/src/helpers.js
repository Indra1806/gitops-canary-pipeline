export const today = new Date();
// FIX: Use local date string to avoid UTC "Tomorrow" bug
export const fmt = (d) => {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split("T")[0];
};
export const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };
export const daysAhead = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };

export const INITIAL_DATA = {
  currentUser: null,
  users: [
    { id: "u1", name: "Dr. Sarah Chen", role: "doctor", email: "sarah.chen@clinic.com", password: "doc123", specialty: "General Practice", active: true },
    { id: "u2", name: "Dr. James Obi", role: "doctor", email: "james.obi@clinic.com", password: "doc456", specialty: "Cardiology", active: true },
    { id: "u3", name: "Priya Nair", role: "receptionist", email: "priya@clinic.com", password: "rec123", active: true },
    { id: "u4", name: "Admin", role: "admin", email: "admin@clinic.com", password: "admin123", active: true },
    { id: "u5", name: "Dr. Maria Rodriguez", role: "doctor", email: "maria.rodriguez@clinic.com", password: "doc789", specialty: "Pediatrics", active: true },
  ],
  patients: [
    { id: "P-1001", name: "Marcus Thompson", dob: "1985-03-12", phone: "+1 (555) 234-5678", email: "m.thompson@email.com", gender: "male", bloodType: "A+", address: "42 Oak Lane, Austin TX 78701", nationalId: "TX-12345", createdAt: daysAgo(120), allergies: "Penicillin", emergencyContact: "Lisa Thompson - +1(555)999-0001" },
    { id: "P-1002", name: "Amara Osei", dob: "1992-07-24", phone: "+1 (555) 345-6789", email: "amara.o@email.com", gender: "female", bloodType: "O+", address: "88 Maple Ave, Austin TX 78702", nationalId: "TX-23456", createdAt: daysAgo(90), allergies: "None", emergencyContact: "Kwame Osei - +1(555)999-0002" },
    { id: "P-1003", name: "Robert Kim", dob: "1968-11-05", phone: "+1 (555) 456-7890", email: "r.kim@email.com", gender: "male", bloodType: "B+", address: "15 Pine St, Austin TX 78703", nationalId: "TX-34567", createdAt: daysAgo(200), allergies: "Sulfa drugs", emergencyContact: "Jane Kim - +1(555)999-0003" },
    { id: "P-1004", name: "Sofia Reyes", dob: "2001-05-18", phone: "+1 (555) 567-8901", email: "sofia.r@email.com", gender: "female", bloodType: "AB-", address: "200 Elm Blvd, Austin TX 78704", nationalId: "TX-45678", createdAt: daysAgo(45), allergies: "Aspirin", emergencyContact: "Maria Reyes - +1(555)999-0004" },
    { id: "P-1005", name: "David Nakamura", dob: "1975-09-30", phone: "+1 (555) 678-9012", email: "d.naka@email.com", gender: "male", bloodType: "O-", address: "77 Cherry St, Austin TX 78705", nationalId: "TX-56789", createdAt: daysAgo(300), allergies: "Latex", emergencyContact: "Yuki Nakamura - +1(555)999-0005" },
    { id: "P-1006", name: "Emily Davis", dob: "1990-02-14", phone: "+1 (555) 789-0123", email: "emily.d@email.com", gender: "female", bloodType: "B-", address: "123 Oak Street, Austin TX 78706", nationalId: "TX-67890", createdAt: daysAgo(150), allergies: "None", emergencyContact: "Michael Davis - +1(555)999-0006" },
    { id: "P-1007", name: "Michael Johnson", dob: "1982-08-22", phone: "+1 (555) 890-1234", email: "michael.j@email.com", gender: "male", bloodType: "A-", address: "456 Maple Avenue, Austin TX 78707", nationalId: "TX-78901", createdAt: daysAgo(60), allergies: "Peanuts", emergencyContact: "Sarah Johnson - +1(555)999-0007" },
  ],
  appointments: [
    { id: "A-001", patientId: "P-1001", doctorId: "u5", date: daysAgo(7), time: "09:00", status: "completed", type: "Follow-up", notes: "Blood pressure under control. Continue current medication." },
    { id: "A-002", patientId: "P-1002", doctorId: "u1", date: daysAgo(3), time: "10:30", status: "completed", type: "Consultation", notes: "Annual checkup. All vitals normal." },
    { id: "A-003", patientId: "P-1003", doctorId: "u2", date: daysAgo(1), time: "14:00", status: "completed", type: "Cardiology Review", notes: "Echo results reviewed. Schedule follow-up in 3 months." },
    { id: "A-004", patientId: "P-1001", doctorId: "u1", date: fmt(today), time: "09:30", status: "scheduled", type: "Routine Check", notes: "" },
    { id: "A-005", patientId: "P-1004", doctorId: "u1", date: fmt(today), time: "11:00", status: "scheduled", type: "New Patient", notes: "" },
    { id: "A-006", patientId: "P-1005", doctorId: "u2", date: fmt(today), time: "15:00", status: "scheduled", type: "Follow-up", notes: "" },
    { id: "A-007", patientId: "P-1002", doctorId: "u1", date: daysAhead(2), time: "10:00", status: "scheduled", type: "Lab Review", notes: "" },
    { id: "A-008", patientId: "P-1003", doctorId: "u1", date: daysAhead(4), time: "09:00", status: "scheduled", type: "Consultation", notes: "" },
    { id: "A-009", patientId: "P-1006", doctorId: "u1", date: daysAhead(1), time: "13:00", status: "scheduled", type: "New Patient", notes: "" },
  ],
  medicalRecords: [
    { id: "R-001", patientId: "P-1001", doctorId: "u1", date: daysAgo(7), type: "Follow-up", diagnosis: "Hypertension - Controlled", prescription: "Amlodipine 5mg daily", notes: "Blood pressure 128/82. Well controlled on current regimen. Continue medication. Lifestyle modification counseling provided.", vitals: { bp: "128/82", hr: "72", temp: "98.4°F", weight: "185 lbs" } },
    { id: "R-002", patientId: "P-1001", doctorId: "u1", date: daysAgo(45), type: "Consultation", diagnosis: "Hypertension - Stage 1", prescription: "Amlodipine 5mg daily, Lifestyle changes", notes: "New diagnosis of stage 1 hypertension. Initiated antihypertensive therapy. Patient counseled on DASH diet and exercise.", vitals: { bp: "148/92", hr: "78", temp: "98.6°F", weight: "188 lbs" } },
    { id: "R-003", patientId: "P-1002", doctorId: "u1", date: daysAgo(3), type: "Annual Checkup", diagnosis: "Healthy - No concerns", prescription: "Multivitamin, Vitamin D 2000IU", notes: "Annual wellness exam. All labs within normal limits. Discussed preventive care and immunization schedule.", vitals: { bp: "112/70", hr: "64", temp: "98.4°F", weight: "132 lbs" } },
    { id: "R-004", patientId: "P-1003", doctorId: "u2", date: daysAgo(1), type: "Cardiology Review", diagnosis: "Mild Mitral Regurgitation", prescription: "Continue Metoprolol 25mg, Losartan 50mg", notes: "Echo shows stable mild MR. LVEF 60%. No significant changes from prior study. Will reimage in 12 months.", vitals: { bp: "138/88", hr: "68", temp: "98.2°F", weight: "204 lbs" } },
  ],
  invoices: [
    { id: "INV-001", patientId: "P-1001", appointmentId: "A-001", date: daysAgo(7), dueDate: daysAhead(23), status: "paid", paidDate: daysAgo(5), items: [{ desc: "Consultation Fee", qty: 1, price: 120 }, { desc: "Blood Pressure Monitoring", qty: 1, price: 40 }, { desc: "Amlodipine 5mg (30 tabs)", qty: 1, price: 25 }] },
    { id: "INV-002", patientId: "P-1002", appointmentId: "A-002", date: daysAgo(3), dueDate: daysAhead(27), status: "pending", items: [{ desc: "Annual Physical Exam", qty: 1, price: 180 }, { desc: "Comprehensive Metabolic Panel", qty: 1, price: 85 }, { desc: "Vitamin D Level Test", qty: 1, price: 45 }] },
    { id: "INV-003", patientId: "P-1003", appointmentId: "A-003", date: daysAgo(1), dueDate: daysAhead(29), status: "pending", items: [{ desc: "Cardiology Consultation", qty: 1, price: 220 }, { desc: "Echocardiogram Review", qty: 1, price: 150 }] },
    { id: "INV-004", patientId: "P-1005", appointmentId: null, date: daysAgo(60), dueDate: daysAgo(30), status: "overdue", items: [{ desc: "Consultation Fee", qty: 1, price: 120 }, { desc: "Lab Work", qty: 1, price: 95 }] },
  ],
};

const avatarColors = ["#0D7377","#2563EB","#7C3AED","#DC2626","#D97706","#059669","#DB2777"];
export function getAvatarColor(str) { let h = 0; for (let c of (str||"")) h = ((h << 5) - h) + c.charCodeAt(0); return avatarColors[Math.abs(h) % avatarColors.length]; }
export function getInitials(name) { return (name||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); }
export function formatDate(d) { if (!d) return "-"; const dt = new Date(d + "T12:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
export function formatCurrency(n) { return "$" + Number(n).toFixed(2); }
export function calcAge(dob) { const d = new Date(dob); const diff = Date.now() - d.getTime(); return Math.floor(diff / (1000*60*60*24*365.25)); }
export function getInvoiceTotal(items) { return (items||[]).reduce((sum, i) => sum + (i.qty * i.price), 0); }

export function newPatientId(list) {
  const nums = (list || []).map(i => parseInt(String(i.id).replace(/\D/g,""))).filter(n => !isNaN(n));
  return "P-" + (nums.length ? Math.max(...nums) + 1 : 1001);
}
export function newApptId(list) {
  const nums = (list || []).map(i => parseInt(String(i.id).replace(/\D/g,""))).filter(n => !isNaN(n));
  return "A-" + String(nums.length ? Math.max(...nums) + 1 : 1).padStart(3,"0");
}
export function newInvId(list) {
  const nums = (list || []).map(i => parseInt(String(i.id).replace(/\D/g,""))).filter(n => !isNaN(n));
  return "INV-" + String(nums.length ? Math.max(...nums) + 1 : 1).padStart(3,"0");
}
export function newRecordId(list) {
  const nums = (list || []).map(i => parseInt(String(i.id).replace(/\D/g,""))).filter(n => !isNaN(n));
  return "R-" + String(nums.length ? Math.max(...nums) + 1 : 1).padStart(3,"0");
}
export function newUserId(list) {
  const nums = (list || []).map(i => parseInt(String(i.id).replace(/\D/g,""))).filter(n => !isNaN(n));
  return "u" + (nums.length > 0 ? Math.max(...nums) + 1 : 1);
}

export const storage = {
  get: () => {
    const saved = localStorage.getItem("clinic_os_db");
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  },
  set: (data) => {
    localStorage.setItem("clinic_os_db", JSON.stringify(data));
  }
};