
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    ChartNoAxesCombined,
    Settings,
    LogOut,
    Menu,
    X,
    CircleHelp,
} from "lucide-react";
import { logout } from "../../utils/auth";

const navigation = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", path: "/employees", icon: Users },
    { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
    { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
    const [open, setOpen] = useState(false);

    let user = {};
    try {
        user = JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
        user = {};
    }

    return (
        <>
            <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
                className="fixed left-4 top-4 z-40 rounded-xl border bg-white p-2 shadow-sm lg:hidden"
            >
                <Menu size={21} />
            </button>

            {open && (
                <button
                    type="button"
                    aria-label="Close navigation overlay"
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#111827] text-white transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold">
                            E
                        </div>
                        <div>
                            <h1 className="font-bold">EmployEase</h1>
                            <p className="text-xs text-slate-400">Employee Management</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={() => setOpen(false)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mx-4 mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 font-bold text-indigo-300">
                            {(user.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {user.name || "User"}
                            </p>
                            <p className="mt-1 text-xs capitalize text-slate-400">
                                {user.role || "Employee"}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Signed in
                    </div>
                </div>

                <nav aria-label="Main navigation" className="flex-1 px-4 pt-8">
                    <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-500">
                        WORKSPACE
                    </p>

                    <div className="space-y-1">
                        {navigation.map(({ label, path, icon: Icon }) => (
                            <NavLink
                                key={path}
                                to={path}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive
                                        ? "bg-indigo-500 text-white shadow-lg"
                                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={19} strokeWidth={1.8} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                <div className="p-4">
                    <div className="mb-3 rounded-xl bg-white/[0.04] p-4">
                        <CircleHelp className="mb-2 text-indigo-300" size={20} />
                        <p className="text-sm font-semibold">Need help?</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                            Manage your team from one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut size={19} />
                        Sign out
                    </button>

                    <p className="mt-4 text-center text-[11px] text-slate-500">
                        EmployEase © {new Date().getFullYear()}
                    </p>
                </div>
            </aside>
        </>
    );
}
