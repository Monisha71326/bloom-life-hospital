import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn, CalendarDays, Users, BarChart3 } from "lucide-react";
import { StoreProvider } from "./store.jsx";
import Layout from "./Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Appointments from "./pages/Appointments.jsx";
import PatientRecords from "./pages/PatientRecords.jsx";   // <-- NEW: patient records page
import Profile from "./pages/Profile.jsx";
import Module from "./Module.jsx";
import MODULES from "./modules.js";
import doctorImg from "./assets/doctor.png";
import logoImg from "./assets/logo.png";
import "./login.css";
import "./css/dashboard.css";                          // <-- global styles + shared keyframes (once)

function Login({ onLogin }) {
  const [n, setN] = useState(""), [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  return (
    <div className="lg">
      {/* ---------- LEFT ---------- */}
      <section className="lg-left">
        <div className="lg-ring" />
        <div className="lg-dot" />

        <div className="lg-logo">
          <img src={logoImg} alt="BloomLife Hospital" />
        </div>

        <div className="lg-welcome">
          <h1>Welcome Back,</h1>
          <h2>Doctor</h2>
          <p>Login to access your dashboard and<br />manage your patients &amp; appointments<br />efficiently.</p>
        </div>

        <div className="lg-photo" style={{ "--doc": `url(${doctorImg})` }}>
          <div className="lg-float f1">
            <span className="fi blue"><CalendarDays size={16} /></span>
            <div><b>Appointments</b><small>View your today's schedule</small></div>
          </div>
          <div className="lg-float f2">
            <span className="fi teal"><Users size={16} /></span>
            <div><b>Patients</b><small>Manage your patient records</small></div>
          </div>
          <div className="lg-float f3">
            <span className="fi purple"><BarChart3 size={16} /></span>
            <div><b>Reports</b><small>Track your performance</small></div>
          </div>
        </div>

        <p className="lg-copy">© 2025 BloomLife Hospital. All rights reserved.</p>
      </section>

      {/* ---------- RIGHT ---------- */}
      <section className="lg-right">
        <form className="lg-card" onSubmit={(e) => { e.preventDefault(); onLogin(n.trim()); }}>
          <div className="lg-shield"><ShieldCheck size={26} /></div>
          <h3>Doctor Login</h3>
          <p className="lg-sub">Please sign in to continue to your account</p>

          <label>Doctor ID / Email</label>
          <div className="lg-field">
            <Mail size={16} />
            <input required placeholder="Enter your Doctor ID or Email" value={n} onChange={(e) => setN(e.target.value)} />
          </div>

          <label>Password</label>
          <div className="lg-field">
            <Lock size={16} />
            <input required type={show ? "text" : "password"} placeholder="Enter your password" value={p} onChange={(e) => setP(e.target.value)} />
            <button type="button" className="lg-eye" onClick={() => setShow(!show)}>
              {show ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <div className="lg-row">
            <label className="lg-chk">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <a href="#" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
          </div>

          <button className="lg-btn"><LogIn size={16} /> Login</button>

          <div className="lg-or"><span>or continue with</span></div>

          <button type="button" className="lg-google">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
              <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            Login with Google
          </button>

          <p className="lg-help">Need help? Contact <a href="#" onClick={(e) => e.preventDefault()}>IT Support</a></p>
        </form>
      </section>
    </div>
  );
}

/* Idhula irukkura paths modules.js-la irundhalum skip aagum,
   so andha routes namma custom pages-ku mattum pogum */
const CUSTOM_PAGES = ["appointments", "patient-records"];
const isCustom = (path) => CUSTOM_PAGES.includes(String(path).replace(/^\//, "").toLowerCase());

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem("bloom-user"));
  if (!user) return <Login onLogin={(n) => { localStorage.setItem("bloom-user", n); setUser(n); }} />;
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout user={user} onLogout={() => { localStorage.removeItem("bloom-user"); setUser(null); }} />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patient-records" element={<PatientRecords />} />   {/* <-- NEW */}
            {Object.entries(MODULES)
              .filter(([path]) => !isCustom(path))
              .map(([path, cfg]) => <Route key={path} path={path} element={<Module cfg={cfg} />} />)}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}