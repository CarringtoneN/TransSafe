import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import navigation from "../utils/navigation";
import useAuth from "../hooks/useAuth";
import { canAccess, ROLE_CONFIG } from "../config/roles";

const STORAGE_KEY = "transsafe-sidebar-sections";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const visible = useMemo(
    () =>
      navigation
        .map((item) => {
          if (item.title === "Dashboard") {
            const dashboardPath = ROLE_CONFIG[user?.role]?.dashboard || "/";
            return { ...item, path: dashboardPath };
          }
          return item.children
            ? { ...item, children: item.children.filter((c) => canAccess(user?.role, c.path)) }
            : item;
        })
        .filter((item) =>
          item.path === "/logout"
            ? true
            : item.children
              ? item.children.length > 0
              : canAccess(user?.role, item.path)
        ),
    [user?.role]
  );

  const grouped = useMemo(() => visible.filter((i) => i.children), [visible]);
  const active = useMemo(
    () =>
      Object.fromEntries(
        grouped.map((i) => [
          i.title,
          i.children.some(
            (c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`)
          ),
        ])
      ),
    [grouped, location.pathname]
  );

  const [open, setOpen] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    setOpen((previous) => ({
      ...previous,
      ...Object.fromEntries(
        Object.entries(active)
          .filter(([, isActive]) => isActive)
          .map(([key]) => [key, true])
      ),
    }));
  }, [active]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
  }, [open]);

  const toggle = (title) => setOpen((previous) => ({ ...previous, [title]: !previous[title] }));

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col bg-slate-900 p-5 text-white">
      <div className="mb-7 px-2">
        <h1 className="text-2xl font-bold">🚛 TransSafe</h1>
        <p className="mt-1 text-xs text-slate-400">
          {user?.name} · {user?.role?.replaceAll("_", " ")}
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {visible.map((item) => {
          if (!item.children) {
            if (item.path === "/logout") {
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-300 hover:bg-red-600/20 hover:text-white"
                >
                  <item.icon size={20} />
                  <span>{item.title}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.title}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.title}</span>
              </NavLink>
            );
          }

          const isOpen = open[item.title] || active[item.title];
          return (
            <div key={item.title}>
              <button
                type="button"
                onClick={() => toggle(item.title)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <item.icon size={20} />
                  {item.title}
                </span>
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>

              <div
                className={`grid transition-all ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="ml-5 space-y-1 border-l border-slate-700 pl-3 pt-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-2 text-sm ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`
                        }
                      >
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-slate-700 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium text-slate-300 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
