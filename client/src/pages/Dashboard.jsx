import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
// import { LogOut } from "lucide-react";
import {
    LayoutDashboard,
    Users,
    ChartNoAxesCombined,
    Settings,
    LogOut,
    Bell,
    Search,
    ArrowUpRight,
    UserRound,
    Wallet,
    RefreshCw,
    Menu,
    X,
    ChevronRight,
    CircleHelp,
} from "lucide-react";

import api from "../api/axios";

const navigation = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Employees", icon: Users, path: "/employees" },
    { label: "Reports", icon: ChartNoAxesCombined, path: "/reports" },
    { label: "Settings", icon: Settings, path: "/settings" },
];

function formatLabel(key) {
    return key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/^./, (char) => char.toUpperCase());
}

function formatValue(key, value) {
    if (typeof value === "number") {
        const isMoney = /salary|payroll|revenue|expense|amount/i.test(key);

        return isMoney
            ? `₹${value.toLocaleString("en-IN")}`
            : value.toLocaleString("en-IN");
    }

    return String(value);
}

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {value}
                    </h3>
                </div>

                <div className={`rounded-xl p-3 ${color}`}>
                    <Icon size={22} strokeWidth={1.8} />
                </div>
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <ArrowUpRight size={14} />
                    Live
                </span>
                <span>Updated from your database</span>
            </div>
        </article>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    const fetchSummary = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const token = sessionStorage.getItem("accessToken");

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            const response = await api.get("/employees/dashboard/summary", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSummary(response.data.data);
        } catch (err) {
            if (err.response?.status === 401) {
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Dashboard data load nahi ho paya. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    function handleLogout() {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");
        navigate("/login", { replace: true });
    }

    const summaryEntries = summary
        ? Object.entries(summary).filter(
            ([, value]) =>
                value !== null &&
                value !== undefined &&
                ["number", "string"].includes(typeof value)
        )
        : [];

    const filteredNavigation = navigation.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    const statIcons = [Users, UserRound, Wallet, ChartNoAxesCombined];

    const statColors = [
        "bg-indigo-50 text-indigo-600",
        "bg-emerald-50 text-emerald-600",
        "bg-amber-50 text-amber-600",
        "bg-sky-50 text-sky-600",
    ];

    return (
        <div className="min-h-screen bg-[#f6f8fc] text-slate-800">
            {sidebarOpen && (
                <button
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#111827] text-white transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold shadow-lg shadow-indigo-500/25">
                            E
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">
                                EmployEase
                            </h1>
                            <p className="text-[11px] text-slate-400">
                                Employee Management
                            </p>
                        </div>
                    </div>

                    <button
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mx-4 mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 font-bold text-indigo-300">
                            {(user.name || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {user.name || "Admin"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">Administrator</p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Active session
                    </div>
                </div>

                <div className="px-4 pt-8">
                    <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-500">
                        WORKSPACE
                    </p>

                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = item.path === "/dashboard";

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        setSidebarOpen(false);
                                        navigate(item.path);
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active
                                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/30"
                                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                                        }`}
                                >
                                    <Icon size={19} strokeWidth={1.8} />
                                    <span>{item.label}</span>
                                    {active && (
                                        <ChevronRight className="ml-auto" size={16} />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4">
                    <div className="mb-3 rounded-xl bg-white/[0.04] p-4">
                        <CircleHelp className="mb-2 text-indigo-300" size={20} />
                        <p className="text-sm font-semibold">Need help?</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                            Manage your team from one place.
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut size={19} />
                        Sign out
                    </button>

                    <p className="mt-4 text-center text-[11px] text-slate-600">
                        EmployEase © {new Date().getFullYear()}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>

            </aside>

            {/* Main content */}
            <main className="min-h-screen lg:pl-64">
                <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu size={21} />
                        </button>

                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                Dashboard
                            </h2>
                            <p className="hidden text-xs text-slate-500 sm:block">
                                Overview of your organization
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                        <button
                            onClick={() => fetchSummary(true)}
                            disabled={refreshing}
                            title="Refresh dashboard"
                            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={18}
                                className={refreshing ? "animate-spin" : ""}
                            />
                        </button>

                        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                        <button
                            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
                            aria-label="Notifications"
                            title="Notifications"
                        >
                            <Bell size={20} />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
                        </button>

                        <div className="hidden items-center gap-3 sm:flex">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                {(user.name || "A").charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden xl:block">
                                <p className="text-sm font-semibold text-slate-800">
                                    {user.name || "Admin"}
                                </p>
                                <p className="text-xs text-slate-500">Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-9">
                    {/* Welcome banner */}
                    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-600/10 sm:p-8">
                        <div className="pointer-events-none absolute -right-8 -top-20 h-64 w-64 rounded-full border-[35px] border-white/[0.07]" />
                        <div className="pointer-events-none absolute -bottom-28 right-36 h-56 w-56 rounded-full bg-white/[0.05]" />

                        <div className="relative z-10 max-w-2xl">
                            <p className="text-xs font-semibold tracking-[0.2em] text-indigo-200">
                                ADMINISTRATOR WORKSPACE
                            </p>
                            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                                Welcome back, {user.name || "Admin"}!
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                                Here’s your employee management overview. Keep track of
                                your workforce and manage your team efficiently.
                            </p>

                            <button
                                onClick={() => navigate("/employees")}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                            >
                                <Users size={17} />
                                Manage employees
                                <ArrowUpRight size={16} />
                            </button>
                        </div>

                        <div className="absolute bottom-5 right-8 hidden text-white/20 sm:block">
                            <Users size={105} strokeWidth={1} />
                        </div>
                    </section>

                    {/* Section heading */}
                    <section className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                Overview
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Key metrics from your employee database.
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Dashboard connected
                        </span>
                    </section>

                    {/* Loading state */}
                    {loading && (
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                                >
                                    <div className="h-4 w-28 rounded bg-slate-100" />
                                    <div className="mt-6 h-8 w-20 rounded bg-slate-100" />
                                    <div className="mt-5 h-3 w-36 rounded bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {!loading && error && (
                        <div
                            role="alert"
                            className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center"
                        >
                            <p className="text-sm text-rose-700">{error}</p>
                            <button
                                onClick={() => fetchSummary(true)}
                                className="w-fit rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Summary cards */}
                    {!loading && !error && (
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {summaryEntries.length > 0 ? (
                                summaryEntries.map(([key, value], index) => {
                                    const Icon = statIcons[index % statIcons.length];
                                    const color = statColors[index % statColors.length];

                                    return (
                                        <StatCard
                                            key={key}
                                            title={formatLabel(key)}
                                            value={formatValue(key, value)}
                                            icon={Icon}
                                            color={color}
                                        />
                                    );
                                })
                            ) : (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 sm:col-span-2 xl:col-span-4">
                                    No summary data is available yet.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick actions */}
                    <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Quick actions
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Shortcuts to your everyday tasks.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <button
                                onClick={() => navigate("/employees")}
                                className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50"
                            >
                                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-100">
                                    <Users size={22} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-800">
                                        Manage employees
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        View and manage employee records.
                                    </p>
                                </div>
                                <ChevronRight
                                    size={19}
                                    className="text-slate-400 group-hover:text-indigo-600"
                                />
                            </button>

                            <button
                                onClick={() => fetchSummary(true)}
                                className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/50"
                            >
                                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 transition group-hover:bg-emerald-100">
                                    <RefreshCw size={22} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-800">
                                        Refresh statistics
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Fetch the latest summary from the API.
                                    </p>
                                </div>
                                <ChevronRight
                                    size={19}
                                    className="text-slate-400 group-hover:text-emerald-600"
                                />
                            </button>
                        </div>
                    </section>

                    <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
                        <p>
                            © {new Date().getFullYear()} EmployEase. All rights reserved.
                        </p>
                        <p>Employee Management System</p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
