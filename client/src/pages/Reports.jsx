import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Wallet,
    Building2,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    ChartNoAxesCombined,
    CircleDollarSign,
    CalendarDays,
    ChevronRight,
} from "lucide-react";
import api from "../api/axios";

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

function StatCard({ title, value, description, icon: Icon, iconClass }) {
    return (
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {value}
                    </h2>
                </div>

                <div className={`shrink-0 rounded-xl p-3 ${iconClass}`}>
                    <Icon size={22} strokeWidth={1.8} />
                </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
                {description}
            </p>
        </article>
    );
}

function EmptyState({ message }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
            <ChartNoAxesCombined
                className="mx-auto mb-3 text-slate-400"
                size={30}
            />
            <p className="text-sm font-medium text-slate-600">{message}</p>
        </div>
    );
}

export default function Reports() {
    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReports = useCallback(async () => {
        const token = sessionStorage.getItem("accessToken");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.get("/employees/dashboard/summary", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // setSummary(response.data?.data ?? {});
            console.log("Reports API response:", response.data);
            setSummary(response.data?.data ?? {});
        } catch (err) {
            if (err.response?.status === 401) {
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to load reports. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const report = useMemo(() => {
        const data = summary?.summary ?? summary ?? {};

        const departments = Array.isArray(data.departments)
            ? data.departments
            : Array.isArray(data.departmentStats)
                ? data.departmentStats
                : [];

        const totalEmployees = Number(
            data.totalEmployees ??
            data.total ??
            data.employeeCount ??
            0
        );

        const totalSalary = Number(
            data.totalSalary ??
            data.salaryExpense ??
            data.totalPayroll ??
            0
        );

        const departmentCount = Number(
            data.totalDepartments ??
            data.departmentCount ??
            departments.length ??
            0
        );

        const averageSalary = Number(
            data.averageSalary ??
            data.avgSalary ??
            (totalEmployees > 0 ? totalSalary / totalEmployees : 0)
        );

        return {
            totalEmployees,
            totalSalary,
            departmentCount,
            averageSalary,
            departments,
        };
    }, [summary]);

    const stats = [
        {
            title: "Total Employees",
            value: formatNumber(report.totalEmployees),
            description: "Employees registered in the system",
            icon: Users,
            iconClass: "bg-indigo-50 text-indigo-600",
        },
        {
            title: "Departments",
            value: formatNumber(report.departmentCount),
            description: "Departments reported by the backend",
            icon: Building2,
            iconClass: "bg-blue-50 text-blue-600",
        },
        {
            title: "Total Salary Expense",
            value: formatCurrency(report.totalSalary),
            description: "Total salary amount returned by the API",
            icon: Wallet,
            iconClass: "bg-emerald-50 text-emerald-600",
        },
        {
            title: "Average Salary",
            value: formatCurrency(report.averageSalary),
            description: "Average salary based on available summary data",
            icon: CircleDollarSign,
            iconClass: "bg-violet-50 text-violet-600",
        },
    ];

    const departments = report.departments.map((item) => {
        if (typeof item === "string") {
            return {
                name: item,
                count: null,
                salary: null,
            };
        }

        return {
            name: item.name ?? item.department ?? item._id ?? "Other",
            count:
                item.count ??
                item.totalEmployees ??
                item.employeeCount ??
                null,
            salary: item.totalSalary ?? item.salaryExpense ?? null,
        };
    });

    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            onClick={() => navigate("/dashboard")}
                            aria-label="Back to dashboard"
                            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
                                EmployEase / Analytics
                            </p>
                            <h1 className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
                                Reports & Analytics
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={fetchReports}
                        disabled={loading}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        <span className="hidden sm:inline">
                            {loading ? "Refreshing..." : "Refresh"}
                        </span>
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
                {/* Welcome section */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-100 sm:p-9">
                    <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
                    <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-violet-400/20 blur-2xl" />

                    <div className="relative max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-50">
                            <ChartNoAxesCombined size={15} />
                            Business overview
                        </div>

                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Your workforce at a glance
                        </h2>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                            Review employee strength, department distribution and salary
                            statistics from your employee management system.
                        </p>

                        <div className="mt-6 flex items-center gap-2 text-sm text-indigo-100">
                            <CalendarDays size={16} />
                            <span>Live summary from your backend API</span>
                        </div>
                    </div>
                </section>

                {/* Error message */}
                {error && (
                    <div
                        role="alert"
                        className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 shrink-0" size={20} />
                            <div>
                                <p className="font-semibold">Unable to load reports</p>
                                <p className="mt-1 text-sm">{error}</p>
                            </div>
                        </div>

                        <button
                            onClick={fetchReports}
                            className="self-start rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-red-100 sm:self-auto"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <section>
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                                Key metrics
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                A summary of your organization
                            </p>
                        </div>

                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                            {loading ? "Updating..." : "Summary"}
                        </span>
                    </div>

                    {loading && !summary ? (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                                >
                                    <div className="h-4 w-28 rounded bg-slate-200" />
                                    <div className="mt-6 h-8 w-36 rounded bg-slate-200" />
                                    <div className="mt-5 h-3 w-40 rounded bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {stats.map((stat) => (
                                <StatCard key={stat.title} {...stat} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Department report */}
                <section className="grid gap-6 xl:grid-cols-5">
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-3">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                            <div>
                                <h2 className="font-bold tracking-tight">
                                    Department overview
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Department-level data provided by the API
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                <Building2 size={20} />
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            {loading && !summary ? (
                                <div className="py-8 text-center text-sm text-slate-500">
                                    Loading department data...
                                </div>
                            ) : departments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                                <th className="pb-3 pr-4 font-semibold">
                                                    Department
                                                </th>
                                                <th className="pb-3 pr-4 text-right font-semibold">
                                                    Employees
                                                </th>
                                                <th className="pb-3 text-right font-semibold">
                                                    Salary
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {departments.map((department, index) => (
                                                <tr
                                                    key={`${department.name}-${index}`}
                                                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                                                >
                                                    <td className="py-4 pr-4 font-medium text-slate-700">
                                                        {department.name}
                                                    </td>
                                                    <td className="py-4 pr-4 text-right text-slate-600">
                                                        {department.count == null
                                                            ? "—"
                                                            : formatNumber(department.count)}
                                                    </td>
                                                    <td className="py-4 text-right text-slate-600">
                                                        {department.salary == null
                                                            ? "—"
                                                            : formatCurrency(department.salary)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyState message="Department-wise data is not available in the current API response." />
                            )}
                        </div>
                    </div>

                    {/* Insights panel */}
                    <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                <TrendingUp size={21} />
                            </div>
                            <div>
                                <h2 className="font-bold tracking-tight">
                                    Workforce insights
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Current summary
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Registered employees
                                </p>
                                <p className="mt-1 text-xl font-bold">
                                    {loading && !summary
                                        ? "Loading..."
                                        : formatNumber(report.totalEmployees)}
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Average salary
                                </p>
                                <p className="mt-1 text-xl font-bold">
                                    {loading && !summary
                                        ? "Loading..."
                                        : formatCurrency(report.averageSalary)}
                                </p>
                            </div>

                            <div className="rounded-xl bg-indigo-50 p-4">
                                <p className="text-sm font-semibold text-indigo-700">
                                    Reporting status
                                </p>
                                <p className="mt-1 text-sm leading-5 text-indigo-600">
                                    {error
                                        ? "The latest report could not be loaded."
                                        : loading
                                            ? "Fetching the latest summary..."
                                            : "Summary data has been loaded from the backend."}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/employees")}
                            className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            Manage employees
                            <ChevronRight size={18} />
                        </button>
                    </aside>
                </section>

                <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>EmployEase · Employee Management System</p>
                    <p>Statistics depend on the data returned by your backend.</p>
                </footer>
            </div>
        </main>
    );
}
