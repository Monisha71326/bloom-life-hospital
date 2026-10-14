import { useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { LayoutGrid, CalendarDays, Users, FlaskConical, ScanLine, ClipboardList, Salad, Bell, LogOut } from "lucide-react";
import { useStore } from "./store.jsx";
import logo from "./assets/logo.png";

const TABS = [["Dashboard", "/", LayoutGrid], ["Appointments", "/appointments", CalendarDays], ["Patient Records", "/patients", Users], ["Lab Tests", "/labs", FlaskConical], ["Imaging", "/imaging", ScanLine], ["Follow-ups", "/followups", ClipboardList], ["Diet Planning", "/diet", Salad]];
const Nav = ({ bottom }) => (
  <nav className={bottom ? "nav bottom" : "nav"}>
    {TABS.map(([l, to, Icon]) => <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? "tab on" : "tab")}><Icon size={14} /> {l}</NavLink>)}
  </nav>
);

export default function Layout({ user, onLogout }) {
  const { data, reset } = useStore();
  const [drop, setDrop] = useState(false), [seen, setSeen] = useState(false);
  const items = [
    [data.labs.filter((r) => r.status === "Pending").length, "lab tests pending"],
    [data.followups.filter((r) => r.status === "Due").length, "follow-ups due"],
    [data.appointments.filter((r) => r.status === "Scheduled").length, "appointments scheduled"],
  ];
  return (
    <div className="page">
      <header className="top">
        <div className="brand" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, lineHeight: 1, flex: "none" }}>
          <img src={logo} alt="BloomLife Hospital" style={{ height: 36, width: "auto", display: "block" }} />
          <small style={{ fontSize: 8, color: "#8b9098", display: "block" }}>Doctor Dashboard</small>
        </div>
        <Nav />
        <div className="acts">
          <div className="bellw">
            <button className="bell" onClick={() => { setDrop(!drop); setSeen(true); }}><Bell size={18} />{!seen && <i />}</button>
            {drop && <div className="drop">{items.map(([n, t]) => <p key={t}><b>{n}</b> {t}</p>)}<button onClick={reset}>Reset demo data</button></div>}
          </div>
          <Link to="/profile" title="My Profile" style={{ display: "flex" }}>
            <img className="me" src="https://i.pravatar.cc/80?img=60" alt={user} title={user} style={{ cursor: "pointer" }} />
          </Link>
          <button className="ghost" title="Logout" onClick={onLogout}><LogOut size={18} /></button>
        </div>
      </header>
      <div className="content"><Outlet /></div>
      <footer className="foot"><Nav bottom /></footer>
    </div>
  );
}