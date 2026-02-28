import { useState, useEffect, useCallback, useMemo } from "react";


// ─── SEED DATA ────────────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d) => {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split("T")[0];
};
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };
const daysAhead = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };

const INITIAL_DATA = {
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const avatarColors = ["#0D7377","#2563EB","#7C3AED","#DC2626","#D97706","#059669","#DB2777"];
function getAvatarColor(str) { let h = 0; for (let c of (str||"")) h = ((h << 5) - h) + c.charCodeAt(0); return avatarColors[Math.abs(h) % avatarColors.length]; }
function getInitials(name) { return (name||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); }
function formatDate(d) { if (!d) return "-"; const dt = new Date(d + "T12:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function formatCurrency(n) { return "$" + Number(n).toFixed(2); }
function calcAge(dob) { const d = new Date(dob); const diff = Date.now() - d.getTime(); return Math.floor(diff / (1000*60*60*24*365.25)); }
function getInvoiceTotal(items) { return (items||[]).reduce((sum, i) => sum + (i.qty * i.price), 0); }
function newPatientId(list) {
  const nums = list.map(i => parseInt((i.id||"").replace(/\D/g,""))).filter(Boolean);
  return "P-" + (nums.length ? Math.max(...nums) + 1 : 1001);
}
function newApptId(list) {
  const nums = list.map(i => parseInt((i.id||"").replace(/\D/g,""))).filter(Boolean);
  return "A-" + String(nums.length ? Math.max(...nums) + 1 : 1).padStart(3,"0");
}
function newInvId(list) {
  const nums = list.map(i => parseInt((i.id||"").replace(/\D/g,""))).filter(Boolean);
  return "INV-" + String(nums.length ? Math.max(...nums) + 1 : 1).padStart(3,"0");
}
function newRecordId(list) {
  const nums = list.map(i => parseInt((i.id||"").replace(/\D/g,""))).filter(Boolean);
  return "R-" + String(nums.length ? Math.max(...nums) + 1 : 1).padStart(3,"0");
}
function newUserId(list) {
  const nums = list.map(i => parseInt((i.id||"").replace(/\D/g,""))).filter(Boolean);
  return "u" + (nums.length ? Math.max(...nums) + 1 : 1);
}

// ─── PERSISTENCE LAYER (Simulated API) ────────────────────────────────────────
const storage = {
  get: () => {
    const saved = localStorage.getItem("clinic_os_db");
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  },
  set: (data) => {
    localStorage.setItem("clinic_os_db", JSON.stringify(data));
  }
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: "🏥", patients: "👥", appointments: "📅", records: "📋",
    billing: "💳", reports: "📊", users: "⚙️", logout: "🚪",
    plus: "＋", edit: "✏️", trash: "🗑️", eye: "👁️", search: "🔍",
    check: "✓", x: "✕", close: "✕", bell: "🔔", menu: "☰",
    arrow_left: "←", arrow_right: "→", calendar: "📆", clock: "🕐",
    user: "👤", phone: "📞", email: "📧", location: "📍", heart: "❤️",
    pill: "💊", file: "📄", chart: "📈", money: "💰", warning: "⚠️",
    info: "ℹ️", star: "⭐", print: "🖨️", download: "⬇️", upload: "⬆️",
    save: "💾", refresh: "🔄", filter: "🔽", pdf: "📄", shield: "🔒",
    settings: "⚙️", doctor: "👨‍⚕️", stethoscope: "🩺"
  };
  return <span style={{ fontSize: size, lineHeight: 1 }}>{icons[name] || "•"}</span>;
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      <span>{type === "success" ? "✓" : "⚠"}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16 }}>✕</button>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose, size = "", footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn-icon" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ users, onLogin, theme, toggleTheme }) {
  const [email, setEmail] = useState("sarah.chen@clinic.com");
  const [password, setPassword] = useState("doc123");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = users.find(u => u.email === email && u.password === password && u.active);
    if (user) onLogin(user);
    else setError("Invalid credentials. Please try again.");
  };

  const quickLogin = (u) => { setEmail(u.email); setPassword(u.password); setError(""); };

  return (
    <div className="login-page">
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <label className="switch" style={{ fontSize: '12px' }}>
          <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
          <span className="slider"></span>
        </label>
      </div>
      <div className="login-card" style={{ position: 'relative', overflow: 'hidden', borderTop: '4px solid var(--blue)' }}>
        <div style={{ position: 'absolute', top: 0, right: 20, width: 30, height: 45, background: 'var(--blue)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold', paddingTop: '2px' }}>v2.1</div>
        <div className="login-logo">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, background: "var(--teal-faint)", borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, border: '2px dashed var(--teal)' }}>🏥</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, fontWeight: 100, color: "var(--text)" }}>ClinicOS</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Clinic Management System</div>
          </div>
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          {error && <div style={{ background: "var(--red-light)", color: "var(--red)", padding: "8px 12px", borderRadius: 8, fontSize: 13 }}>⚠ {error}</div>}
          <button className="btn btn-primary w-full" style={{ justifyContent: "center", padding: "11px" }} onClick={handleLogin}>Sign In</button>
        </div>

        <div className="divider" />
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>Quick Access</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { label: "Dr. Sarah Chen", sub: "Doctor", color: "#d10c0c", u: { email: "sarah.chen@clinic.com", password: "doc123" } },
            { label: "Priya Nair", sub: "Receptionist", color: "#2563EB", u: { email: "priya@clinic.com", password: "rec123" } },
            { label: "Admin", sub: "Administrator", color: "#7C3AED", u: { email: "admin@clinic.com", password: "admin123" } },
          ].map(item => (
            <button key={item.label} onClick={() => quickLogin(item.u)} className="btn btn-secondary" style={{ justifyContent: "flex-start", gap: 8, fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{item.label}</span>
              <span style={{ color: "var(--text-muted)", marginLeft: "auto" }}>{item.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ data, onNavigate }) {
  const todayStr = useMemo(() => fmt(today), []);
  const todayAppts = useMemo(() => data.appointments.filter(a => a.date === todayStr), [data.appointments, todayStr]);
  const totalRevenue = useMemo(() => data.invoices.reduce((s, inv) => s + (inv.status === "paid" ? getInvoiceTotal(inv.items) : 0), 0), [data.invoices]);
  const pendingBills = useMemo(() => data.invoices.filter(i => i.status === "pending").length, [data.invoices]);
  const overdueCount = useMemo(() => data.invoices.filter(i => i.status === "overdue").length, [data.invoices]);

  // Last 7 days revenue bar chart
  const revenueData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    const rev = data.invoices.filter(inv => inv.paidDate === d).reduce((s, inv) => s + getInvoiceTotal(inv.items), 0);
    const dayName = new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
    return { label: dayName, value: rev };
  }), [data.invoices]);
  const maxRev = useMemo(() => Math.max(...revenueData.map(r => r.value), 100), [revenueData]);

  // Appointment status breakdown
  const scheduled = useMemo(() => data.appointments.filter(a => a.status === "scheduled").length, [data.appointments]);
  const completed = useMemo(() => data.appointments.filter(a => a.status === "completed").length, [data.appointments]);
  const cancelled = useMemo(() => data.appointments.filter(a => a.status === "cancelled").length, [data.appointments]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title" style={{ fontFamily: "'TimesNewRoman', sans", textAlign: "center" }}>Hello, {data.currentUser.name.split(" ")[0]} {data.currentUser.name.split(" ")[1]} 👋</div>
          <div className="page-subtitle">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · <br></br> {todayAppts.length} appointments today</div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: "👥", label: "Total Patients", value: data.patients.length, change: "+3 this week", up: true, color: "#E8F7F7", iconColor: "#0D7377" },
          { icon: "📅", label: "Today's Appointments", value: todayAppts.length, change: `${todayAppts.filter(a=>a.status==="completed").length} completed`, up: true, color: "#DBEAFE", iconColor: "#2563EB" },
          { icon: "💰", label: "Total Revenue", value: formatCurrency(totalRevenue), change: `${pendingBills} pending`, up: true, color: "#D1FAE5", iconColor: "#059669" },
          { icon: "⚠️", label: "Overdue Bills", value: overdueCount, change: "Needs attention", up: false, color: "#FEE2E2", iconColor: "#DC2626" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-change ${s.up ? "stat-up" : "stat-down"}`}>{s.up ? "↑" : "↓"} {s.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📅 Today's Schedule</span>
            <button className="btn btn-sm btn-secondary" onClick={() => onNavigate("appointments")}>View all</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {todayAppts.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-icon">📭</div>
                <div>No appointments today</div>
              </div>
            ) : (
              <div>
                {todayAppts.map(appt => {
                  const patient = data.patients.find(p => p.id === appt.patientId);
                  const doctor = data.users.find(u => u.id === appt.doctorId);
                  return (
                    <div key={appt.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ width: 40, textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)" }}>{appt.time}</div>
                      </div>
                      <div className="patient-avatar" style={{ background: getAvatarColor(patient?.name), color: "white", width: 32, height: 32, fontSize: 12 }}>
                        {getInitials(patient?.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{patient?.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{appt.type} · {doctor?.name}</div>
                      </div>
                      <span className={`badge ${appt.status === "completed" ? "badge-green" : appt.status === "cancelled" ? "badge-red" : "badge-blue"}`}>
                        {appt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 Revenue — Last 7 Days</span>
            <button className="btn btn-sm btn-secondary" onClick={() => onNavigate("reports")}>Full report</button>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>{formatCurrency(totalRevenue)}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total collected to date</div>
            </div>
            <div className="bar-chart">
              {revenueData.map((d, i) => (
                <div key={i} className="bar-col">
                  {d.value > 0 && <div className="bar-value">${d.value}</div>}
                  <div className="bar" style={{ height: `${Math.max((d.value / maxRev) * 80, d.value > 0 ? 8 : 2)}px`, background: d.value > 0 ? "var(--teal)" : "var(--border)" }} />
                  <div className="bar-label">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }} className="grid-2">
        {/* Recent Patients */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 Recent Patients</span>
            <button className="btn btn-sm btn-secondary" onClick={() => onNavigate("patients")}>All patients</button>
          </div>
          <div style={{ padding: 0 }}>
            {data.patients.slice(0, 4).map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                <div className="patient-avatar" style={{ background: getAvatarColor(p.name), color: "white" }}>{getInitials(p.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{calcAge(p.dob)} yrs · {p.bloodType}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(p.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Stats */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Appointment Overview</span>
          </div>
          <div className="card-body">
            {[
              { label: "Scheduled", value: scheduled, color: "var(--blue)", pct: Math.round(scheduled/(scheduled+completed+cancelled||1)*100) },
              { label: "Completed", value: completed, color: "var(--green)", pct: Math.round(completed/(scheduled+completed+cancelled||1)*100) },
              { label: "Cancelled", value: cancelled, color: "var(--red)", pct: Math.round(cancelled/(scheduled+completed+cancelled||1)*100) },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{item.value} ({item.pct}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>Total appointments</span>
              <span style={{ fontWeight: 700 }}>{scheduled + completed + cancelled}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
function Patients({ data, setData, showToast, currentUser }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  const filtered = useMemo(() => data.patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  ), [data.patients, search]);

  const handleSave = (patientData) => {
    if (editPatient) {
      setData(d => ({ ...d, patients: d.patients.map(p => p.id === editPatient.id ? { ...p, ...patientData } : p) }));
      showToast("Patient updated successfully", "success");
    } else {
      setData(d => {
        const newPatient = { ...patientData, id: newPatientId(d.patients), createdAt: fmt(today) };
        return { ...d, patients: [...d.patients, newPatient] };
      });
      showToast("Patient registered successfully", "success");
    }
    setShowForm(false); setEditPatient(null);
  };

  const handleDelete = (p) => {
    if (window.confirm(`Remove ${p.name} from the system?`)) {
      setData(d => ({ ...d, patients: d.patients.filter(x => x.id !== p.id) }));
      if (selected?.id === p.id) setSelected(null);
      showToast("Patient removed", "success");
    }
  };

  const patientRecords = useMemo(() => selected ? data.medicalRecords.filter(r => r.patientId === selected.id) : [], [selected, data.medicalRecords]);
  const patientAppts = useMemo(() => selected ? data.appointments.filter(a => a.patientId === selected.id) : [], [selected, data.appointments]);
  const patientInvoices = useMemo(() => selected ? data.invoices.filter(i => i.patientId === selected.id) : [], [selected, data.invoices]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title" style={{ fontFamily: "'DM Serif Display', serif" }}>Patient Management</div>
          <div className="page-subtitle">{data.patients.length} patients registered</div>
        </div>
        {(currentUser.role === "receptionist" || currentUser.role === "admin") && (
          <button className="btn btn-primary" onClick={() => { setEditPatient(null); setShowForm(true); }}>
            <Icon name="plus" /> New Patient
          </button>
        )}
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: selected ? "360px 1fr" : "1fr" }}>
        {/* Patient List */}
        <div className="card">
          <div className="card-header">
            <div className="search-wrap">
              <span className="search-icon"><Icon name="search" /></span>
              <input className="search-input" placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%" }} />
            </div>
          </div>
          <div style={{ maxHeight: selected ? "calc(100vh - 220px)" : "auto", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🔍</div><div>No patients found</div></div>
            ) : (
              filtered.map(p => (
                <div key={p.id} onClick={() => { setSelected(p); setActiveTab("info"); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid var(--border)", background: selected?.id === p.id ? "var(--teal-faint)" : "white", borderLeft: selected?.id === p.id ? "3px solid var(--teal)" : "3px solid transparent" }}>
                  <div className="patient-avatar" style={{ background: getAvatarColor(p.name), color: "white" }}>{getInitials(p.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.id} · {calcAge(p.dob)} yrs · {p.gender}</div>
                  </div>
                  <span className={`badge badge-${p.bloodType.includes("-") ? "red" : "blue"}`} style={{ flexShrink: 0 }}>{p.bloodType}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patient Detail */}
        {selected && (
          <div className="card animate-in" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="patient-avatar" style={{ background: getAvatarColor(selected.name), color: "white", width: 42, height: 42, fontSize: 16 }}>{getInitials(selected.name)}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{selected.id} · Registered {formatDate(selected.createdAt)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(currentUser.role !== "patient") && (
                  <button className="btn btn-sm btn-secondary" onClick={() => { setEditPatient(selected); setShowForm(true); }}><Icon name="edit" /> Edit</button>
                )}
                {currentUser.role === "admin" && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(selected)}><Icon name="trash" /></button>
                )}
                <button className="btn-icon" onClick={() => setSelected(null)}><Icon name="close" /></button>
              </div>
            </div>
            <div className="tabs" style={{ padding: "0 20px", marginBottom: 0, borderBottom: "1px solid var(--border)" }}>
              {["info", "records", "appointments", "billing"].map(t => (
                <div key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                  {t === "info" ? "📋 Info" : t === "records" ? "🩺 Records" : t === "appointments" ? "📅 Appointments" : "💳 Billing"}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {activeTab === "info" && (
                <div>
                  <div className="grid-2">
                    <div>
                      <div className="section-label">Personal Info</div>
                      {[
                        ["Date of Birth", formatDate(selected.dob) + ` (${calcAge(selected.dob)} yrs)`],
                        ["Gender", selected.gender],
                        ["Blood Type", selected.bloodType],
                        ["National ID", selected.nationalId],
                      ].map(([l, v]) => <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v}</span></div>)}
                    </div>
                    <div>
                      <div className="section-label">Contact</div>
                      {[
                        ["Phone", selected.phone],
                        ["Email", selected.email],
                        ["Address", selected.address],
                        ["Emergency", selected.emergencyContact],
                      ].map(([l, v]) => <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value" style={{ fontSize: 12 }}>{v}</span></div>)}
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="section-label">Medical Flags</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ background: selected.allergies === "None" ? "var(--green-light)" : "var(--amber-light)", color: selected.allergies === "None" ? "var(--green)" : "var(--amber)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {selected.allergies === "None" ? "✓ No known allergies" : `⚠ Allergies: ${selected.allergies}`}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "records" && (
                <div>
                  {patientRecords.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📋</div><div>No medical records yet</div></div>
                  ) : (
                    <div className="timeline">
                      {patientRecords.sort((a,b) => b.date.localeCompare(a.date)).map(rec => {
                        const dr = data.users.find(u => u.id === rec.doctorId);
                        return (
                          <div key={rec.id} className="timeline-item">
                            <div className="timeline-dot" style={{ background: "var(--teal-faint)" }}>🩺</div>
                            <div className="timeline-content">
                              <div className="timeline-date">{formatDate(rec.date)} · Dr. {dr?.name}</div>
                              <div className="timeline-title">{rec.type} — {rec.diagnosis}</div>
                              <div className="timeline-text">{rec.notes}</div>
                              {rec.prescription && (
                                <div style={{ marginTop: 8, padding: "6px 10px", background: "var(--teal-faint)", borderRadius: 8, fontSize: 12 }}>
                                  💊 {rec.prescription}
                                </div>
                              )}
                              {rec.vitals && (
                                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  {Object.entries(rec.vitals).map(([k, v]) => (
                                    <span key={k} className="chip" style={{ fontSize: 11 }}>{k.toUpperCase()}: {v}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "appointments" && (
                <div>
                  {patientAppts.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📅</div><div>No appointments found</div></div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {patientAppts.sort((a,b) => b.date.localeCompare(a.date)).map(appt => {
                        const dr = data.users.find(u => u.id === appt.doctorId);
                        return (
                          <div key={appt.id} style={{ display: "flex", gap: 12, padding: 12, background: "#F9FAFB", borderRadius: 10, border: "1px solid var(--border)", alignItems: "center" }}>
                            <div style={{ textAlign: "center", minWidth: 50 }}>
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(appt.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}</div>
                              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{new Date(appt.date + "T12:00:00").getDate()}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{appt.type}</div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Dr. {dr?.name} · {appt.time}</div>
                            </div>
                            <span className={`badge ${appt.status === "completed" ? "badge-green" : appt.status === "cancelled" ? "badge-red" : appt.status === "no-show" ? "badge-amber" : "badge-blue"}`}>{appt.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "billing" && (
                <div>
                  {patientInvoices.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">💳</div><div>No invoices found</div></div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {patientInvoices.sort((a,b) => b.date.localeCompare(a.date)).map(inv => (
                        <div key={inv.id} style={{ display: "flex", gap: 12, padding: 12, background: "#F9FAFB", borderRadius: 10, border: "1px solid var(--border)", alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{inv.id}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(inv.date)} · Due {formatDate(inv.dueDate)}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 15, fontWeight: 800 }}>{formatCurrency(getInvoiceTotal(inv.items))}</div>
                            <span className={`badge ${inv.status === "paid" ? "badge-green" : inv.status === "overdue" ? "badge-red" : "badge-amber"}`}>{inv.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          patient={editPatient}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditPatient(null); }}
        />
      )}
    </div>
  );
}

function PatientForm({ patient, onSave, onClose }) {
  const [form, setForm] = useState({
    name: patient?.name || "",
    dob: patient?.dob || "",
    gender: patient?.gender || "male",
    phone: patient?.phone || "",
    email: patient?.email || "",
    bloodType: patient?.bloodType || "O+",
    nationalId: patient?.nationalId || "",
    address: patient?.address || "",
    allergies: patient?.allergies || "None",
    emergencyContact: patient?.emergencyContact || "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name && form.dob && form.phone && form.nationalId;

  return (
    <Modal title={patient ? "Edit Patient" : "Register New Patient"} onClose={onClose} size="modal-lg"
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => valid && onSave(form)} disabled={!valid}>
          <Icon name="save" /> {patient ? "Update Patient" : "Register Patient"}
        </button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="section-label">Personal Information</div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jane Doe" /></div>
          <div className="form-group"><label className="form-label">Date of Birth *</label><input className="form-input" type="date" value={form.dob} onChange={e => set("dob", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Gender</label>
            <select className="form-select" value={form.gender} onChange={e => set("gender", e.target.value)}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Blood Type</label>
            <select className="form-select" value={form.bloodType} onChange={e => set("bloodType", e.target.value)}>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">National ID *</label><input className="form-input" value={form.nationalId} onChange={e => set("nationalId", e.target.value)} placeholder="TX-XXXXX" /></div>
          <div className="form-group"><label className="form-label">Allergies</label><input className="form-input" value={form.allergies} onChange={e => set("allergies", e.target.value)} placeholder="None, or list allergies" /></div>
        </div>
        <div className="divider" />
        <div className="section-label">Contact Information</div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="patient@email.com" /></div>
        </div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Main St, City, State 12345" /></div>
        <div className="form-group"><label className="form-label">Emergency Contact</label><input className="form-input" value={form.emergencyContact} onChange={e => set("emergencyContact", e.target.value)} placeholder="Name - Phone number" /></div>
      </div>
    </Modal>
  );
}

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
function Appointments({ data, setData, showToast, currentUser }) {
  const [view, setView] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [selected, setSelected] = useState(null);

  const doctors = data.users.filter(u => u.role === "doctor");

  const filtered = useMemo(() => {
    let list = [...data.appointments].sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));
    if (filterDate) list = list.filter(a => a.date === filterDate);
    if (filterStatus !== "all") list = list.filter(a => a.status === filterStatus);
    if (filterDoctor !== "all") list = list.filter(a => a.doctorId === filterDoctor);
    return list;
  }, [data.appointments, filterDate, filterStatus, filterDoctor]);

  const handleSave = (apptData) => {
    if (editAppt) {
      setData(d => ({ ...d, appointments: d.appointments.map(a => a.id === editAppt.id ? { ...a, ...apptData } : a) }));
      showToast("Appointment updated", "success");
    } else {
      const newAppt = { ...apptData, id: newApptId(data.appointments), status: "scheduled" };
      setData(d => ({ ...d, appointments: [...d.appointments, newAppt] }));
      showToast("Appointment booked!", "success");
    }
    setShowForm(false); setEditAppt(null);
  };

  const handleStatus = (appt, status) => {
    setData(d => ({ ...d, appointments: d.appointments.map(a => a.id === appt.id ? { ...a, status } : a) }));
    showToast(`Appointment marked as ${status}`, "success");
    setSelected(null);
  };

  const getPatient = (id) => data.patients.find(p => p.id === id);
  const getDoctor = (id) => data.users.find(u => u.id === id);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title" style={{ fontFamily: "'DM Serif Display', serif" }}>Appointments</div>
          <div className="page-subtitle">{data.appointments.filter(a => a.status === "scheduled").length} upcoming · {data.appointments.filter(a => a.date === fmt(today)).length} today</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditAppt(null); setShowForm(true); }}>
          <Icon name="plus" /> Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div style={{ padding: "12px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input className="form-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 160 }} />
          <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 140 }}>
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-Show</option>
          </select>
          <select className="form-select" value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} style={{ width: 180 }}>
            <option value="all">All Doctors</option>
            {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
          </select>
          {(filterDate || filterStatus !== "all" || filterDoctor !== "all") && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setFilterDate(""); setFilterStatus("all"); setFilterDoctor("all"); }}>✕ Clear</button>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {["list", "calendar"].map(v => (
              <button key={v} onClick={() => setView(v)} className="btn btn-sm" style={{ background: view === v ? "var(--teal)" : "white", color: view === v ? "white" : "var(--text-muted)", border: "1px solid var(--border)" }}>
                {v === "list" ? "☰ List" : "📅 Calendar"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "list" ? (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📅</div><div>No appointments found</div></div></td></tr>
                ) : (
                  filtered.map(appt => {
                    const p = getPatient(appt.patientId);
                    const dr = getDoctor(appt.doctorId);
                    return (
                      <tr key={appt.id}>
                        <td>
                          <div className="patient-card">
                            <div className="patient-avatar" style={{ background: getAvatarColor(p?.name), color: "white" }}>{getInitials(p?.name)}</div>
                            <div><div className="patient-name">{p?.name}</div><div className="patient-id">{appt.patientId}</div></div>
                          </div>
                        </td>
                        <td><div style={{ fontSize: 13.5, fontWeight: 600 }}>Dr. {dr?.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{dr?.specialty}</div></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{formatDate(appt.date)}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>🕐 {appt.time}</div>
                        </td>
                        <td><span className="chip" style={{ fontSize: 12 }}>{appt.type}</span></td>
                        <td>
                          <span className={`badge ${appt.status === "completed" ? "badge-green" : appt.status === "cancelled" ? "badge-red" : appt.status === "no-show" ? "badge-amber" : "badge-blue"}`}>
                            {appt.status === "completed" ? "✓" : appt.status === "cancelled" ? "✕" : appt.status === "no-show" ? "!" : "●"} {appt.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn-icon" title="View" onClick={() => setSelected(appt)}><Icon name="eye" /></button>
                            {appt.status === "scheduled" && (
                              <>
                                <button className="btn-icon" title="Edit" onClick={() => { setEditAppt(appt); setShowForm(true); }}><Icon name="edit" /></button>
                                <button className="btn-icon" title="Complete" style={{ color: "var(--green)" }} onClick={() => handleStatus(appt, "completed")}>✓</button>
                                <button className="btn-icon" title="Cancel" style={{ color: "var(--red)" }} onClick={() => handleStatus(appt, "cancelled")}>✕</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AppointmentCalendar data={data} onBook={() => setShowForm(true)} />
      )}

      {/* Appointment Detail Modal */}
      {selected && (
        <Modal title={`Appointment ${selected.id}`} onClose={() => setSelected(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            {selected.status === "scheduled" && (
              <>
                <button className="btn btn-danger" onClick={() => handleStatus(selected, "cancelled")}>Cancel Appointment</button>
                <button className="btn btn-success" onClick={() => handleStatus(selected, "completed")}>Mark Completed</button>
              </>
            )}
          </>}>
          <ApptDetail appt={selected} data={data} />
        </Modal>
      )}

      {showForm && (
        <AppointmentForm
          appt={editAppt}
          data={data}
          currentUser={currentUser}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditAppt(null); }}
        />
      )}
    </div>
  );
}

function ApptDetail({ appt, data }) {
  const p = data.patients.find(x => x.id === appt.patientId);
  const dr = data.users.find(u => u.id === appt.doctorId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, background: "var(--teal-faint)", borderRadius: 10, padding: 14 }}>
          <div className="section-label mb-2">Patient</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="patient-avatar" style={{ background: getAvatarColor(p?.name), color: "white" }}>{getInitials(p?.name)}</div>
            <div><div style={{ fontWeight: 700 }}>{p?.name}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p?.id} · {p?.phone}</div></div>
          </div>
        </div>
        <div style={{ flex: 1, background: "#F0F4FF", borderRadius: 10, padding: 14 }}>
          <div className="section-label mb-2">Doctor</div>
          <div style={{ fontWeight: 700 }}>Dr. {dr?.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{dr?.specialty}</div>
        </div>
      </div>
      {[
        ["Appointment ID", appt.id], ["Date", formatDate(appt.date)], ["Time", appt.time],
        ["Type", appt.type], ["Status", appt.status],
      ].map(([l, v]) => <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v}</span></div>)}
      {appt.notes && (
        <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 12px" }}>
          <div className="section-label mb-2">Notes</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)" }}>{appt.notes}</div>
        </div>
      )}
    </div>
  );
}

function AppointmentCalendar({ data, onBook }) {
  const [calDate, setCalDate] = useState(new Date());
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = fmt(today);
  const monthName = calDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const apptsByDay = {};
  data.appointments.forEach(a => {
    const d = new Date(a.date + "T12:00:00");
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!apptsByDay[day]) apptsByDay[day] = [];
      apptsByDay[day].push(a);
    }
  });

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn-icon" onClick={() => setCalDate(new Date(year, month - 1, 1))}>←</button>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{monthName}</span>
          <button className="btn-icon" onClick={() => setCalDate(new Date(year, month + 1, 1))}>→</button>
        </div>
        <button className="btn btn-sm btn-primary" onClick={onBook}><Icon name="plus" /> Book</button>
      </div>
      <div className="card-body">
        <div className="cal-grid" style={{ marginBottom: 8 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", padding: "4px 0", textTransform: "uppercase" }}>{d}</div>
          ))}
        </div>
        <div className="cal-grid">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const isToday = dateStr === todayStr;
            const dayAppts = apptsByDay[day] || [];
            return (
              <div key={day} className={`cal-day ${isToday ? "today" : ""} ${dayAppts.length > 0 ? "has-appt" : ""}`}>
                <span>{day}</span>
                {dayAppts.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: isToday ? "rgba(255,255,255,0.8)" : "var(--teal)" }}>{dayAppts.length}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="divider" />
        <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
          <span>● Today</span>
          <span style={{ color: "var(--amber)" }}>● Has appointments</span>
        </div>
      </div>
    </div>
  );
}

function AppointmentForm({ appt, data, currentUser, onSave, onClose }) {
  const doctors = data.users.filter(u => u.role === "doctor");
  const [form, setForm] = useState({
    patientId: appt?.patientId || "",
    doctorId: appt?.doctorId || (currentUser.role === "doctor" ? currentUser.id : doctors[0]?.id || ""),
    date: appt?.date || fmt(today),
    time: appt?.time || "09:00",
    type: appt?.type || "Consultation",
    notes: appt?.notes || "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.patientId && form.doctorId && form.date && form.time;

  // Check for conflicts
  const conflict = !appt && data.appointments.find(a =>
    a.doctorId === form.doctorId && a.date === form.date && a.time === form.time && a.status !== "cancelled"
  );

  const times = [];
  for (let h = 8; h <= 17; h++) {
    times.push(`${String(h).padStart(2,"0")}:00`);
    if (h < 17) times.push(`${String(h).padStart(2,"0")}:30`);
  }

  return (
    <Modal title={appt ? "Reschedule Appointment" : "Book Appointment"} onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => valid && !conflict && onSave(form)} disabled={!valid || !!conflict}>
          <Icon name="save" /> {appt ? "Update" : "Book Appointment"}
        </button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Patient *</label>
          <select className="form-select" value={form.patientId} onChange={e => set("patientId", e.target.value)}>
            <option value="">— Select patient —</option>
            {data.patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Doctor *</label>
          <select className="form-select" value={form.doctorId} onChange={e => set("doctorId", e.target.value)}>
            {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} — {d.specialty}</option>)}
          </select>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="form-input" type="date" value={form.date} min={fmt(today)} onChange={e => set("date", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Time *</label>
            <select className="form-select" value={form.time} onChange={e => set("time", e.target.value)}>
              {times.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {conflict && (
          <div style={{ background: "var(--red-light)", color: "var(--red)", padding: "8px 12px", borderRadius: 8, fontSize: 13 }}>
            ⚠ This time slot is already booked. Please choose a different time.
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Appointment Type</label>
          <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
            {["Consultation","Follow-up","Annual Checkup","Procedure","Lab Review","New Patient","Emergency","Cardiology Review"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Reason for visit, special instructions…" />
        </div>
      </div>
    </Modal>
  );
}

// ─── MEDICAL RECORDS ─────────────────────────────────────────────────────────
function MedicalRecords({ data, setData, showToast, currentUser }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [filterPatient, setFilterPatient] = useState("all");

  const filtered = useMemo(() => {
    let list = [...data.medicalRecords].sort((a, b) => b.date.localeCompare(a.date));
    if (filterPatient !== "all") list = list.filter(r => r.patientId === filterPatient);
    if (search) list = list.filter(r => {
      const p = data.patients.find(x => x.id === r.patientId);
      return p?.name.toLowerCase().includes(search.toLowerCase()) || r.diagnosis.toLowerCase().includes(search.toLowerCase());
    });
    return list;
  }, [data.medicalRecords, filterPatient, search, data.patients]);

  const handleSave = (recData) => {
    if (editRecord) {
      setData(d => ({ ...d, medicalRecords: d.medicalRecords.map(r => r.id === editRecord.id ? { ...r, ...recData } : r) }));
      showToast("Record updated", "success");
    } else {
      setData(d => {
        const newRec = { ...recData, id: newRecordId(d.medicalRecords), doctorId: currentUser.id, date: fmt(today) };
        return { ...d, medicalRecords: [...d.medicalRecords, newRec] };
      });
      showToast("Medical record saved", "success");
    }
    setShowForm(false); setEditRecord(null);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title" style={{ fontFamily: "'DM Serif Display', serif" }}>Medical Records</div>
          <div className="page-subtitle">{data.medicalRecords.length} records across {data.patients.length} patients</div>
        </div>
        {currentUser.role === "doctor" && (
          <button className="btn btn-primary" onClick={() => { setEditRecord(null); setShowForm(true); }}>
            <Icon name="plus" /> New Record
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="search-wrap">
          <span className="search-icon"><Icon name="search" /></span>
          <input className="search-input" placeholder="Search by patient or diagnosis…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={filterPatient} onChange={e => setFilterPatient(e.target.value)} style={{ width: 200 }}>
          <option value="all">All Patients</option>
          {data.patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon">📋</div><div>No records found</div></div></div>
        ) : (
          filtered.map(rec => {
            const p = data.patients.find(x => x.id === rec.patientId);
            const dr = data.users.find(u => u.id === rec.doctorId);
            return (
              <div key={rec.id} className="card animate-in" style={{ border: "1px solid var(--border)" }}>
                <div style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--teal-faint)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🩺</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{rec.diagnosis}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          <span className="chip" style={{ fontSize: 11 }}>{rec.type}</span>
                          <span style={{ marginLeft: 8 }}>Patient: <strong>{p?.name}</strong> ({p?.id})</span>
                          <span style={{ marginLeft: 8 }}>Dr. {dr?.name}</span>
                          <span style={{ marginLeft: 8 }}>📅 {formatDate(rec.date)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {currentUser.role === "doctor" && (
                          <button className="btn btn-sm btn-secondary" onClick={() => { setEditRecord(rec); setShowForm(true); }}><Icon name="edit" /> Edit</button>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{rec.notes}</div>
                    {rec.prescription && (
                      <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--teal-faint)", color: "var(--teal)", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        💊 {rec.prescription}
                      </div>
                    )}
                    {rec.vitals && (
                      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Object.entries(rec.vitals).map(([k, v]) => (
                          <span key={k} style={{ background: "#F3F4F6", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{k}: {v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <RecordForm record={editRecord} data={data} currentUser={currentUser} onSave={handleSave} onClose={() => { setShowForm(false); setEditRecord(null); }} />
      )}
    </div>
  );
}

function RecordForm({ record, data, onSave, onClose }) {
  const [form, setForm] = useState({
    patientId: record?.patientId || "",
    type: record?.type || "Consultation",
    diagnosis: record?.diagnosis || "",
    prescription: record?.prescription || "",
    notes: record?.notes || "",
    vitals: record?.vitals || { bp: "", hr: "", temp: "", weight: "" },
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setVital = (k, v) => setForm(f => ({ ...f, vitals: { ...f.vitals, [k]: v } }));
  const valid = form.patientId && form.diagnosis && form.notes;

  return (
    <Modal title={record ? "Edit Medical Record" : "New Medical Record"} onClose={onClose} size="modal-lg"
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => valid && onSave(form)} disabled={!valid}>
          <Icon name="save" /> Save Record
        </button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Patient *</label>
            <select className="form-select" value={form.patientId} onChange={e => set("patientId", e.target.value)}>
              <option value="">— Select patient —</option>
              {data.patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Visit Type</label>
            <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {["Consultation","Follow-up","Annual Checkup","Emergency","Procedure","Lab Review","Cardiology Review"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Diagnosis *</label>
          <input className="form-input" value={form.diagnosis} onChange={e => set("diagnosis", e.target.value)} placeholder="Primary diagnosis" />
        </div>
        <div className="section-label mt-2">Vital Signs</div>
        <div className="form-grid-3">
          {[["bp","Blood Pressure","120/80 mmHg"],["hr","Heart Rate","72 bpm"],["temp","Temperature","98.6°F"],["weight","Weight","lbs"],].map(([k,l,ph]) => (
            <div key={k} className="form-group"><label className="form-label">{l}</label>
              <input className="form-input" value={form.vitals[k]} onChange={e => setVital(k, e.target.value)} placeholder={ph} />
            </div>
          ))}
        </div>
        <div className="form-group"><label className="form-label">Prescription / Treatment</label>
          <input className="form-input" value={form.prescription} onChange={e => set("prescription", e.target.value)} placeholder="Medications, dosage, instructions" />
        </div>
        <div className="form-group"><label className="form-label">Clinical Notes *</label>
          <textarea className="form-textarea" style={{ minHeight: 120 }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Detailed clinical observations, patient symptoms, treatment plan…" />
        </div>
      </div>
    </Modal>
  );
}

// ─── BILLING ─────────────────────────────────────────────────────────────────
function Billing({ data, setData, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = [...data.invoices].sort((a, b) => b.date.localeCompare(a.date));
    if (filterStatus !== "all") list = list.filter(i => i.status === filterStatus);
    if (search) list = list.filter(i => {
      const p = data.patients.find(x => x.id === i.patientId);
      return p?.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
    });
    return list;
  }, [data.invoices, filterStatus, search, data.patients]);

  const totalPaid = data.invoices.filter(i => i.status === "paid").reduce((s, i) => s + getInvoiceTotal(i.items), 0);
  const totalPending = data.invoices.filter(i => i.status === "pending").reduce((s, i) => s + getInvoiceTotal(i.items), 0);
  const totalOverdue = data.invoices.filter(i => i.status === "overdue").reduce((s, i) => s + getInvoiceTotal(i.items), 0);

  const handleSave = (invData) => {
    const newInv = { ...invData, id: newInvId(data.invoices), date: fmt(today), dueDate: daysAhead(30), status: "pending" };
    setData(d => ({ ...d, invoices: [...d.invoices, newInv] }));
    showToast("Invoice created", "success");
    setShowForm(false);
  };

  const handleMarkPaid = (inv) => {
    setData(d => ({ ...d, invoices: d.invoices.map(i => i.id === inv.id ? { ...i, status: "paid", paidDate: fmt(today) } : i) }));
    showToast("Invoice marked as paid", "success");
    setViewInvoice(null);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title" style={{ fontFamily: "'DM Serif Display', serif" }}>Billing & Invoices</div>
          <div className="page-subtitle">{data.invoices.length} total invoices</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Icon name="plus" /> New Invoice</button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Collected", value: totalPaid, color: "var(--green)", bg: "var(--green-light)", icon: "✓" },
          { label: "Pending", value: totalPending, color: "var(--amber)", bg: "var(--amber-light)", icon: "🕐" },
          { label: "Overdue", value: totalOverdue, color: "var(--red)", bg: "var(--red-light)", icon: "⚠" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: 12, padding: "16px 18px", border: `1px solid ${s.bg}`, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{formatCurrency(s.value)}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div className="search-wrap">
          <span className="search-icon"><Icon name="search" /></span>
          <input className="search-input" placeholder="Search invoices…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["all","pending","paid","overdue"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className="btn btn-sm"
              style={{ background: filterStatus === s ? "var(--teal)" : "white", color: filterStatus === s ? "white" : "var(--text-muted)", border: "1px solid var(--border)", textTransform: "capitalize" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th>Invoice</th><th>Patient</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">💳</div><div>No invoices found</div></div></td></tr>
              ) : (
                filtered.map(inv => {
                  const p = data.patients.find(x => x.id === inv.patientId);
                  const total = getInvoiceTotal(inv.items);
                  const isOverdue = inv.status === "pending" && new Date(inv.dueDate) < today;
                  return (
                    <tr key={inv.id}>
                      <td><span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>{inv.id}</span></td>
                      <td>
                        <div className="patient-card">
                          <div className="patient-avatar" style={{ background: getAvatarColor(p?.name), color: "white" }}>{getInitials(p?.name)}</div>
                          <div><div className="patient-name">{p?.name}</div><div className="patient-id">{p?.id}</div></div>
                        </div>
                      </td>
                      <td>{formatDate(inv.date)}</td>
                      <td style={{ color: isOverdue ? "var(--red)" : "inherit", fontWeight: isOverdue ? 700 : 400 }}>{formatDate(inv.dueDate)}</td>
                      <td><span style={{ fontWeight: 800, fontSize: 14 }}>{formatCurrency(total)}</span></td>
                      <td>
                        <span className={`badge ${inv.status === "paid" ? "badge-green" : inv.status === "overdue" ? "badge-red" : "badge-amber"}`}>
                          {inv.status === "paid" ? "✓ " : inv.status === "overdue" ? "⚠ " : "● "}{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn-icon" title="View" onClick={() => setViewInvoice(inv)}><Icon name="eye" /></button>
                          {inv.status !== "paid" && (
                            <button className="btn btn-sm btn-success" onClick={() => handleMarkPaid(inv)}>Mark Paid</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewInvoice && (
        <Modal title="Invoice Details" onClose={() => setViewInvoice(null)} size="modal-lg"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setViewInvoice(null)}>Close</button>
            {viewInvoice.status !== "paid" && (
              <button className="btn btn-success" onClick={() => handleMarkPaid(viewInvoice)}>✓ Mark as Paid</button>
            )}
          </>}>
          <InvoiceView invoice={viewInvoice} data={data} />
        </Modal>
      )}

      {showForm && (
        <InvoiceForm data={data} onSave={handleSave} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function InvoiceView({ invoice, data }) {
  const p = data.patients.find(x => x.id === invoice.patientId);
  const subtotal = getInvoiceTotal(invoice.items);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div>
      <div className="invoice-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>🏥 ClinicOS</div>
            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>42 Medical Center Drive, Austin TX 78701</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Invoice</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace" }}>{invoice.id}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[["Bill To", p?.name], ["Date", formatDate(invoice.date)], ["Due", formatDate(invoice.dueDate)], ["Status", invoice.status.toUpperCase()]].map(([l,v]) => (
            <div key={l}><div style={{ opacity: 0.6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px" }}>{l}</div><div style={{ fontWeight: 700, marginTop: 2 }}>{v}</div></div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 0 4px" }}>
        <table className="invoice-table" style={{ width: "100%", marginTop: 0 }}>
          <thead><tr><th>Description</th><th style={{ textAlign: "right" }}>Qty</th><th style={{ textAlign: "right" }}>Unit Price</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}><td>{item.desc}</td><td style={{ textAlign: "right" }}>{item.qty}</td><td style={{ textAlign: "right" }}>{formatCurrency(item.price)}</td><td style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(item.qty * item.price)}</td></tr>
            ))}
            <tr className="invoice-total-row"><td colSpan={3} style={{ textAlign: "right" }}>Subtotal</td><td style={{ textAlign: "right" }}>{formatCurrency(subtotal)}</td></tr>
            <tr className="invoice-total-row"><td colSpan={3} style={{ textAlign: "right" }}>Tax (8%)</td><td style={{ textAlign: "right" }}>{formatCurrency(tax)}</td></tr>
            <tr style={{ background: "var(--teal-faint)" }}><td colSpan={3} style={{ textAlign: "right", fontWeight: 800, fontSize: 15 }}>Total Due</td><td style={{ textAlign: "right", fontWeight: 800, fontSize: 15, color: "var(--teal)" }}>{formatCurrency(total)}</td></tr>
          </tbody>
        </table>
      </div>
      {invoice.paidDate && <div style={{ padding: "10px 0 0", fontSize: 13, color: "var(--green)", fontWeight: 600 }}>✓ Paid on {formatDate(invoice.paidDate)}</div>}
    </div>
  );
}



function InvoiceForm({ data, onSave, onClose }) {
  const [form, setForm] = useState({ patientId: "", appointmentId: "", items: [{ desc: "Consultation Fee", qty: 1, price: 120 }] });
  const [newItem, setNewItem] = useState({ desc: "", qty: 1, price: 0 });

  const addItem = () => {
    if (newItem.desc && newItem.price > 0) {
      setForm(f => ({ ...f, items: [...f.items, { ...newItem }] }));
      setNewItem({ desc: "", qty: 1, price: 0 });
    }
  };

  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const subtotal = getInvoiceTotal(form.items);
  const valid = form.patientId && form.items.length > 0;

  return (
    <Modal title="Create Invoice" onClose={onClose} size="modal-lg"
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => valid && onSave(form)} disabled={!valid}>
          <Icon name="save" /> Create Invoice
        </button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Patient *</label>
            <select className="form-select" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
              <option value="">— Select patient —</option>
              {data.patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Linked Appointment</label>
            <select className="form-select" value={form.appointmentId} onChange={e => setForm(f => ({ ...f, appointmentId: e.target.value }))}>
              <option value="">— Optional —</option>
              {data.appointments.filter(a => a.patientId === form.patientId).map(a => <option key={a.id} value={a.id}>{a.id} — {formatDate(a.date)} {a.time}</option>)}
            </select>
          </div>
        </div>
        <div className="divider" />
        <div className="section-label">Line Items</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ background: "var(--teal-faint)", color: "var(--teal)", padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, borderRadius: "4px 0 0 0" }}>Description</th>
            <th style={{ background: "var(--teal-faint)", color: "var(--teal)", padding: "8px 10px", textAlign: "center", fontSize: 11, fontWeight: 700, width: 60 }}>Qty</th>
            <th style={{ background: "var(--teal-faint)", color: "var(--teal)", padding: "8px 10px", textAlign: "right", fontSize: 11, fontWeight: 700 }}>Price</th>
            <th style={{ background: "var(--teal-faint)", color: "var(--teal)", padding: "8px 10px", textAlign: "right", fontSize: 11, fontWeight: 700, borderRadius: "0 4px 0 0", width: 40 }}></th>
          </tr></thead>
          <tbody>
            {form.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 10px", fontSize: 13 }}>{item.desc}</td>
                <td style={{ padding: "8px 10px", textAlign: "center", fontSize: 13 }}>{item.qty}</td>
                <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 13 }}>{formatCurrency(item.qty * item.price)}</td>
                <td style={{ padding: "8px 10px", textAlign: "right" }}>
                  <button className="btn-icon" style={{ color: "var(--red)" }} onClick={() => removeItem(i)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="form-input" style={{ flex: 3 }} placeholder="Item description" value={newItem.desc} onChange={e => setNewItem(n => ({ ...n, desc: e.target.value }))} />
          <input className="form-input" style={{ width: 60 }} type="number" min="1" placeholder="Qty" value={newItem.qty} onChange={e => setNewItem(n => ({ ...n, qty: parseInt(e.target.value) || 1 }))} />
          <input className="form-input" style={{ width: 90 }} type="number" min="0" placeholder="Price" value={newItem.price || ""} onChange={e => setNewItem(n => ({ ...n, price: parseFloat(e.target.value) || 0 }))} />
          <button className="btn btn-secondary" onClick={addItem}>Add</button>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, padding: "10px 0 0", borderTop: "1px solid var(--border)" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Subtotal: {formatCurrency(subtotal)}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Tax (8%): {formatCurrency(subtotal * 0.08)}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--teal)" }}>Total: {formatCurrency(subtotal * 1.08)}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function Reports({ data }) {
  const [period, setPeriod] = useState("week");

  const getDays = () => period === "week" ? 7 : period === "month" ? 30 : 90;

  const revenueByDay = Array.from({ length: Math.min(getDays(), 14) }, (_, i) => {
    const d = daysAgo(getDays() - 1 - Math.floor(i * (getDays() / 14)));
    const rev = data.invoices.filter(inv => inv.paidDate === d).reduce((s, inv) => s + getInvoiceTotal(inv.items), 0);
    const dt = new Date(d + "T12:00:00");
    return { label: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: rev };
  });
  const maxRev = Math.max(...revenueByDay.map(r => r.value), 1);

  const totalPeriodRev = data.invoices
    .filter(inv => inv.paidDate && inv.paidDate >= daysAgo(getDays()))
    .reduce((s, inv) => s + getInvoiceTotal(inv.items), 0);

  const apptByDoctor = data.users.filter(u => u.role === "doctor").map(dr => {
    const appts = data.appointments.filter(a => a.doctorId === dr.id);
    return { doctor: dr.name, total: appts.length, completed: appts.filter(a => a.status === "completed").length };
  });

  const apptByType = {};
  data.appointments.forEach(a => { apptByType[a.type] = (apptByType[a.type] || 0) + 1; });
  const apptTypesSorted = Object.entries(apptByType).sort((a, b) => b[1] - a[1]);
  const maxType = Math.max(...Object.values(apptByType), 1);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title" style={{ fontFamily: "'DM Serif Display', serif" }}>Reports & Analytics</div>
          <div className="page-subtitle">Clinic performance overview</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["week","month","quarter"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className="btn btn-sm"
              style={{ background: period === p ? "var(--teal)" : "white", color: period === p ? "white" : "var(--text-muted)", border: "1px solid var(--border)", textTransform: "capitalize" }}>
              {p === "week" ? "7D" : p === "month" ? "30D" : "90D"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Revenue (Period)", value: formatCurrency(totalPeriodRev), icon: "💰", color: "var(--green-light)" },
          { label: "New Patients", value: data.patients.filter(p => p.createdAt >= daysAgo(getDays())).length, icon: "👥", color: "var(--teal-faint)" },
          { label: "Total Appointments", value: data.appointments.filter(a => a.date >= daysAgo(getDays())).length, icon: "📅", color: "var(--blue-light)" },
          { label: "Completion Rate", value: `${Math.round(data.appointments.filter(a=>a.status==="completed").length / Math.max(data.appointments.length,1) * 100)}%`, icon: "✓", color: "var(--purple-light)" },
        ].map((k, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, padding: "16px", border: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: k.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{k.icon}</div>
            <div><div style={{ fontSize: 20, fontWeight: 800 }}>{k.value}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{k.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">📈 Revenue Trend</span></div>
          <div className="card-body">
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(totalPeriodRev)}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Collected over {getDays()} days</div>
            </div>
            <div className="bar-chart" style={{ height: 130 }}>
              {revenueByDay.map((d, i) => (
                <div key={i} className="bar-col">
                  {d.value > 0 && <div className="bar-value" style={{ fontSize: 9 }}>${d.value}</div>}
                  <div className="bar" style={{ height: `${Math.max((d.value / maxRev) * 100, d.value > 0 ? 8 : 2)}px`, background: d.value > 0 ? "linear-gradient(to top, var(--teal-dark), var(--teal-light))" : "var(--border)" }} />
                  <div className="bar-label" style={{ fontSize: 9 }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Billing Breakdown */}
        <div className="card">
          <div className="card-header"><span className="card-title">💳 Billing Status</span></div>
          <div className="card-body">
            {[
              { label: "Paid", count: data.invoices.filter(i => i.status === "paid").length, amount: data.invoices.filter(i => i.status === "paid").reduce((s,i) => s+getInvoiceTotal(i.items),0), color: "var(--green)" },
              { label: "Pending", count: data.invoices.filter(i => i.status === "pending").length, amount: data.invoices.filter(i => i.status === "pending").reduce((s,i) => s+getInvoiceTotal(i.items),0), color: "var(--amber)" },
              { label: "Overdue", count: data.invoices.filter(i => i.status === "overdue").length, amount: data.invoices.filter(i => i.status === "overdue").reduce((s,i) => s+getInvoiceTotal(i.items),0), color: "var(--red)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, display: "block" }} />
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({item.count} invoices)</span>
                </div>
                <span style={{ fontWeight: 700, color: item.color }}>{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Collection rate</span>
                <span style={{ fontWeight: 700 }}>{Math.round(data.invoices.filter(i=>i.status==="paid").length/Math.max(data.invoices.length,1)*100)}%</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 6 }}>
                <div className="progress-fill" style={{ width: `${Math.round(data.invoices.filter(i=>i.status==="paid").length/Math.max(data.invoices.length,1)*100)}%`, background: "var(--green)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Appointments by Doctor */}
        <div className="card">
          <div className="card-header"><span className="card-title">👨‍⚕️ Appointments by Doctor</span></div>
          <div className="card-body">
            {apptByDoctor.map(item => (
              <div key={item.doctor} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>Dr. {item.doctor}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.completed}/{item.total} completed</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.round(item.completed/Math.max(item.total,1)*100)}%`, background: "var(--teal)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments by Type */}
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Appointment Types</span></div>
          <div className="card-body">
            {apptTypesSorted.map(([type, count]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 130, fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>{type}</div>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(count / maxType) * 100}%`, background: "linear-gradient(to right, var(--teal-dark), var(--teal-light))" }} />
                  </div>
                </div>
                <div style={{ width: 28, textAlign: "right", fontWeight: 700, fontSize: 13 }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
function UserManagement({ data, setData, showToast, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const handleSave = (userData) => {
    if (editUser) {
      setData(d => ({ ...d, users: d.users.map(u => u.id === editUser.id ? { ...u, ...userData } : u) }));
      showToast("User updated", "success");
    } else {
      setData(d => {
        const newUser = { ...userData, id: newUserId(d.users), active: true };
        return { ...d, users: [...d.users, newUser] };
      });
      showToast("User created", "success");
    }
    setShowForm(false); setEditUser(null);
  };

  const toggleActive = (u) => {
    setData(d => ({ ...d, users: d.users.map(x => x.id === u.id ? { ...x, active: !x.active } : x) }));
    showToast(`User ${u.active ? "deactivated" : "activated"}`, "success");
  };

  const roleColors = { admin: "badge-purple", doctor: "badge-teal", receptionist: "badge-blue" };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title" style={{ fontFamily: "'DM Serif Display', serif" }}>User Management</div>
          <div className="page-subtitle">{data.users.filter(u => u.active).length} active users</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditUser(null); setShowForm(true); }}><Icon name="plus" /> Add User</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>User</th><th>Role</th><th>Email</th><th>Specialty</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {data.users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: getAvatarColor(u.name), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{getInitials(u.name)}</div>
                      <div><div style={{ fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.id}</div></div>
                    </div>
                  </td>
                  <td><span className={`badge ${roleColors[u.role] || "badge-gray"}`} style={{ textTransform: "capitalize" }}>{u.role}</span></td>
                  <td style={{ fontSize: 13 }}>{u.email}</td>
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{u.specialty || "—"}</td>
                  <td><span className={`badge ${u.active ? "badge-green" : "badge-red"}`}>{u.active ? "✓ Active" : "Inactive"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn-icon" onClick={() => { setEditUser(u); setShowForm(true); }}><Icon name="edit" /></button>
                      {u.id !== currentUser.id && (
                        <button className="btn btn-sm" style={{ background: u.active ? "var(--red-light)" : "var(--green-light)", color: u.active ? "var(--red)" : "var(--green)" }} onClick={() => toggleActive(u)}>
                          {u.active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title={editUser ? "Edit User" : "Create User"} onClose={() => { setShowForm(false); setEditUser(null); }}
          footer={<>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditUser(null); }}>Cancel</button>
            <button className="btn btn-primary" form="user-form" type="submit"><Icon name="save" /> {editUser ? "Update" : "Create"}</button>
          </>}>
          <UserForm user={editUser} onSave={handleSave} />
        </Modal>
      )}
    </div>
  );
}

function UserForm({ user, onSave }) {
  const [form, setForm] = useState({ name: user?.name||"", email: user?.email||"", password: user?.password||"", role: user?.role||"receptionist", specialty: user?.specialty||"" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form id="user-form" onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="form-group"><label className="form-label">Full Name</label><input required className="form-input" value={form.name} onChange={e => set("name", e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Email</label><input required type="email" className="form-input" value={form.email} onChange={e => set("email", e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Password</label><input required={!user} type="password" className="form-input" value={form.password} onChange={e => set("password", e.target.value)} placeholder={user ? "Leave blank to keep current" : "Set password"} /></div>
      <div className="form-group"><label className="form-label">Role</label>
        <select className="form-select" value={form.role} onChange={e => set("role", e.target.value)}>
          <option value="admin">Admin</option><option value="doctor">Doctor</option><option value="receptionist">Receptionist</option>
        </select>
      </div>
      {form.role === "doctor" && <div className="form-group"><label className="form-label">Specialty</label><input className="form-input" value={form.specialty} onChange={e => set("specialty", e.target.value)} placeholder="e.g. General Practice" /></div>}
    </form>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  // Theme state management
  const [theme, setTheme] = useState(localStorage.getItem("clinic_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("clinic_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // Centralized Data Updater with Persistence
  const updateData = useCallback((updater) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(newData);
      return newData;
    });
  }, []);

  const todayAppts = useMemo(() => {
    if (!data) return [];
    return data.appointments.filter(a => a.date === fmt(today) && a.status === "scheduled");
  }, [data]);
  
  const overdueInvoices = useMemo(() => {
    if (!data) return [];
    return data.invoices.filter(i => i.status === "overdue");
  }, [data]);

  const navItems = useMemo(() => {
    if (!currentUser) return [];
    return [
      { id: "dashboard", icon: "dashboard", label: "Dashboard", section: "Overview" },
      { id: "patients", icon: "patients", label: "Patients", section: "Clinical" },
      { id: "appointments", icon: "appointments", label: "Appointments", badge: todayAppts.length || null, section: "Clinical" },
      { id: "records", icon: "records", label: "Medical Records", section: "Clinical" },
      { id: "billing", icon: "billing", label: "Billing", badge: overdueInvoices.length || null, section: "Finance" },
      { id: "reports", icon: "reports", label: "Reports", section: "Finance" },
      ...(currentUser?.role === "admin" ? [{ id: "users", icon: "users", label: "User Management", section: "Admin" }] : []),
    ]
  }, [currentUser, todayAppts.length, overdueInvoices.length]);

  const groupedNav = useMemo(() => {
    if (!navItems) return {};
    return navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {})}, [navItems]);

  const pageProps = useMemo(() => ({ data, setData: updateData, showToast, currentUser }), [data, updateData, showToast, currentUser]);

  // Initial Data Load
  useEffect(() => {
    const timer = setTimeout(() => {
      const dbData = storage.get();
      setData(dbData);
      // Attempt to restore currentUser from data if not already set
      if (!currentUser && dbData.currentUser) {
        setCurrentUser(dbData.currentUser);
        setLoggedIn(true); // Assuming if currentUser exists, user is logged in
      }
      setLoading(false);
    }, 800); // Simulate network delay
    return () => clearTimeout(timer);
  }, [currentUser, updateData]);


  const handleLogin = (user) => {
    setCurrentUser(user);
    updateData(d => ({ ...d, currentUser: user }));
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    updateData(d => ({ ...d, currentUser: null }));
    setPage("dashboard");
  };

  if (loading) return (
    <div className="loader-container">
      <div className="loader"></div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "var(--teal)" }}>ClinicOS</div>
    </div>
  );

  if (!loggedIn || !data) return (
    <>
      <LoginPage users={data ? data.users : []} onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />
    </>
  );

  return (
    <>
      <div className="app">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🏥</div>
            {!sidebarCollapsed && (
              <div>
                <div className="sidebar-logo-text" style={{ fontFamily: "'DM Serif Display', serif" }}>ClinicOS    v2.1</div>
                <div className="sidebar-logo-sub">Clinic Management System</div>
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
            {Object.entries(groupedNav).map(([section, items]) => (
              <div key={section} className="nav-section">
                {!sidebarCollapsed && <div className="nav-section-label">{section}</div>}
                {items.map(item => (
                  <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)} title={sidebarCollapsed ? item.label : ""}>
                    <span className="nav-icon"><Icon name={item.icon} size={18} /></span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {!sidebarCollapsed && item.badge && <span className="nav-badge">{item.badge}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="user-avatar">{getInitials(currentUser?.name)}</div>
            {!sidebarCollapsed && (
              <div className="user-info" style={{ flex: 1 }}>
                <div className="user-name">{currentUser?.name}</div>
                <div className="user-role" style={{ textTransform: "capitalize" }}>{currentUser?.role}</div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button className="btn-icon" style={{ color: "rgba(255,255,255,0.5)" }} onClick={handleLogout} title="Logout">
                <Icon name="logout" />
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="main">
          <header className="topbar">
            <button className="btn-icon" onClick={() => setSidebarCollapsed(c => !c)} style={{ fontSize: 18 }}>☰</button>
            <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 13 }}>
              {[{ id: "dashboard", label: "Home" }, { id: page, label: navItems.find(n => n.id === page)?.label }].filter((v,i,a) => a.findIndex(x=>x.id===v.id)===i && v.id).map((crumb, i, arr) => (
                <span key={crumb.id}>
                  <span style={{ color: i === arr.length-1 ? "var(--text)" : "var(--text-muted)", fontWeight: i === arr.length-1 ? 600 : 400, cursor: "pointer" }} onClick={() => setPage(crumb.id)}>{crumb.label}</span>
                  {i < arr.length-1 && <span style={{ color: "var(--text-light)", margin: "0 4px" }}>›</span>}
                </span>
              ))}
            </div>
            <div className="topbar-actions">
              {/* Theme Switch */}
              <label className="switch" style={{ fontSize: '11px', marginRight: '8px' }}>
                <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
                <span className="slider"></span>
              </label>

              <div style={{ position: "relative" }}>
                <button className="btn-icon notif-btn" onClick={() => setNotifOpen(o => !o)}>
                  🔔
                  {(todayAppts.length + overdueInvoices.length) > 0 && (
                    <span className="notif-count">{todayAppts.length + overdueInvoices.length}</span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 300, background: "white", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", zIndex: 100 }}>
                    <div style={{ padding: "12px 14px", fontWeight: 700, borderBottom: "1px solid var(--border)" }}>Notifications</div>
                    {todayAppts.length > 0 && <div style={{ padding: "10px 14px", fontSize: 13, borderBottom: "1px solid var(--border)" }}>📅 <strong>{todayAppts.length}</strong> appointments today</div>}
                    {overdueInvoices.length > 0 && <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>⚠ <strong>{overdueInvoices.length}</strong> overdue invoices</div>}
                    {(todayAppts.length + overdueInvoices.length) === 0 && <div style={{ padding: "16px 14px", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>All caught up! ✓</div>}
                    <button style={{ width: "100%", padding: "8px", background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={() => setNotifOpen(false)}>Dismiss</button>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "var(--teal-faint)", borderRadius: 20, cursor: "pointer" }} onClick={handleLogout}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: getAvatarColor(currentUser?.name), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{getInitials(currentUser?.name)}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>{currentUser?.name.split(" ")[0]}</span>
              </div>
            </div>
          </header>

          <div className="content" onClick={() => notifOpen && setNotifOpen(false)}>
            {(() => {
              switch(page) {
                case "dashboard":    return <Dashboard {...pageProps} onNavigate={setPage} />;
                case "patients":     return <Patients {...pageProps} />;
                case "appointments": return <Appointments {...pageProps} />;
                case "records":      return <MedicalRecords {...pageProps} />;
                case "billing":      return <Billing {...pageProps} />;
                case "reports":      return <Reports {...pageProps} />;
                case "users":        return <UserManagement {...pageProps} />;
                default:             return <Dashboard {...pageProps} onNavigate={setPage} />;
              }
            })()}
          </div>
        </main>
      </div>

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={hideToast} />}
    </>
  );
}
