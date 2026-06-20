import { ReactNode, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Gauge, Bell, Wrench, Boxes, Search, Menu, X, Activity,
  Map, BarChart3, ClipboardList, CalendarClock, FileText, Monitor, ClipboardCheck,
} from 'lucide-react';

const nav = [
  { to: '/', label: 'Boshqaruv paneli', icon: LayoutDashboard, end: true },
  { to: '/mnemoscheme', label: 'Korxona xaritasi', icon: Map },
  { to: '/analytics', label: 'Bosh injener paneli', icon: BarChart3 },
  { to: '/pumps', label: 'Nasoslar', icon: Gauge },
  { to: '/alerts', label: 'Ogohlantirishlar', icon: Bell },
  { to: '/work-orders', label: 'Ish-naryadlar', icon: ClipboardCheck },
  { to: '/maintenance', label: 'Texnik xizmat', icon: Wrench },
  { to: '/preventive', label: 'Profilaktik jadval', icon: CalendarClock },
  { to: '/inventory', label: 'Ombor', icon: Boxes },
  { to: '/shift-logs', label: 'Smena jurnali', icon: ClipboardList },
  { to: '/shift-report', label: 'Smena hisoboti', icon: FileText },
];

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const title = nav.find(n => n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to) && n.to !== '/')?.label
    ?? (loc.pathname === '/' ? 'Boshqaruv paneli' : 'Nasos tafsilotlari');

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-bg-soft border-r border-line overflow-y-auto
        transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-line sticky top-0 bg-bg-soft z-10">
          <div className="p-1.5 rounded-lg bg-brand-dim"><Activity size={20} className="text-white" /></div>
          <div>
            <p className="font-bold text-sm leading-tight">PumpGuard</p>
            <p className="text-muted text-[11px]">AGMK Monitoring</p>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-brand-dim/15 text-brand font-medium' : 'text-muted hover:text-txt hover:bg-bg-hover'
                }`}>
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
          {/* Video wall — alohida */}
          <Link to="/wall" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-txt hover:bg-bg-hover transition-colors mt-2 border-t border-line pt-3">
            <Monitor size={18} /> Video wall (katta ekran)
          </Link>
        </nav>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center gap-4 px-4 lg:px-6 border-b border-line bg-bg-soft/50 backdrop-blur sticky top-0 z-20 print:hidden">
          <button className="lg:hidden btn-ghost p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-semibold text-lg">{title}</h1>
          <div className="ml-auto relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-9 w-56" placeholder="Qidirish..." />
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-dim flex items-center justify-center text-white text-sm font-semibold">D</div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
