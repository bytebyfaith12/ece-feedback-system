import { BriefcaseBusiness, MessagesSquare, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

const columns = [
  {
    title: "Solutions",
    links: [
      ["IT Service Feedback", "/it-service"],
      ["HR Support", "/hr-support"],
      ["Payroll Support", "/payroll-support"],
      ["Facilities Management", "/facilities"],
      ["All Solutions", "/feedback"],
    ],
  },
  {
    title: "Product",
    links: [
      ["Features", "/dashboard"],
      ["Dashboard", "/dashboard"],
      ["Integrations", "/tickets"],
      ["Security", "/settings"],
      ["Reports", "/reports"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Blog", "/reports"],
      ["Case Studies", "/dashboard"],
      ["Guides", "/feedback"],
      ["Help Center", "/alerts"],
      ["Documentation", "/settings"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/"],
      ["Careers", "/"],
      ["Partners", "/"],
      ["Contact Us", "/alerts"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.35fr_2fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-400 text-lg font-black text-white">E</span>
            <span>
              <span className="block text-xl font-black">ECE Pulse</span>
              <span className="block text-xs font-semibold text-slate-400">Feedback System</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
            Real-time feedback for better workplace experiences across ECE Contact Centers.
          </p>
          <div className="mt-6 flex gap-3">
            {[BriefcaseBusiness, PlayCircle, MessagesSquare].map((Icon, index) => (
              <a key={index} href="#" className="grid size-10 place-items-center rounded-full border border-white/10 text-slate-300 transition hover:border-emerald-400 hover:text-emerald-300">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-black text-white">{column.title}</p>
              <div className="mt-4 grid gap-3">
                {column.links.map(([label, to]) => (
                  <Link key={label} to={to} className="text-sm text-slate-400 transition hover:text-emerald-300">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-black text-white">Contact</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
            <p>support@ecepulse.local</p>
            <p>ECE Contact Centers</p>
            <p>Dumaguete, Philippines</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 ECE Pulse. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/settings" className="hover:text-emerald-300">Privacy Policy</Link>
            <Link to="/settings" className="hover:text-emerald-300">Terms of Service</Link>
            <Link to="/settings" className="hover:text-emerald-300">Data Security</Link>
            <button className="hover:text-emerald-300">English</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
