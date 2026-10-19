
import { useCallback, useEffect, useState } from "react";
import {
    Users,
    Building2,
    Wallet,
    TrendingUp,
    RefreshCw,
    LoaderCircle,
    AlertCircle,
    ArrowRight,
    Banknote,
    BriefcaseBusiness,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function formatNumber(value) {
    return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function getSummary(responseData) {
    const payload = responseData?.data ?? responseData;
    return payload?.summary ?? payload?.stats ?? payload;
}

function getWelcomeName() {
    try {
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        return user.name || "there";
    } catch {
        return "there";
    }
}

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [welcomeName, setWelcomeName] = useState(getWelcomeName);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/employees/dashboard/summary");
            const result = getSummary(response.data);

            if (
                !result ||
                typeof result !== "object" ||
                Array.isArray(result)
            ) {
                throw new Error("Dashboard summary has an unexpected format.");
            }

            setSummary(result);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load dashboard statistics."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();

        const updateWelcomeName = () => {
            setWelcomeName(getWelcomeName());
        };

        window.addEventListener("profile-updated", updateWelcomeName);

        return () => {
            window.removeEventListener("profile-updated", updateWelcomeName);
        };
    }, [fetchDashboard]);

    // Values mapped to your actual backend response
    const totalEmployees = summary?.totalEmployees ?? 0;
    const departmentStats = Array.isArray(summary?.departmentStats)
        ? summary.departmentStats
        : [];
    const salaryStats = summary?.salaryStats ?? {};

    const totalDepartments = departmentStats.length;
    const totalSalary = salaryStats.totalSalary ?? 0;
    const averageSalary = salaryStats.averageSalary ?? 0;
    const minimumSalary = salaryStats.minimumSalary ?? 0;
    const maximumSalary = salaryStats.maximumSalary ?? 0;

    const stats = [
        {
            key: "employees",
            label: "Total Employees",
            value: formatNumber(totalEmployees),
            description: "All registered employees",
            icon: Users,
            color: "bg-indigo-50 text-indigo-600",
        },
        {
            key: "departments",
            label: "Departments",
            value: formatNumber(totalDepartments),
            description: "Unique departments",
            icon: Building2,
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            key: "totalSalary",
            label: "Total Salary",
            value: formatCurrency(totalSalary),
            description: "Combined employee salaries",
            icon: Wallet,
            color: "bg-amber-50 text-amber-600",
        },
        {
            key: "averageSalary",
            label: "Average Salary",
            value: formatCurrency(averageSalary),
            description: "Average salary per employee",
            icon: TrendingUp,
            color: "bg-sky-50 text-sky-600",
        },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
            {/* Page header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-indigo-600">
                        Employee Management System
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Welcome back, {welcomeName}! Here is your overview.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchDashboard}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                >
                    {loading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Could not load dashboard
                            </p>
                            <p className="mt-1 text-sm">{error}</p>
                            <p className="mt-1 text-xs">
                                Check your login session and backend API.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={fetchDashboard}
                        disabled={loading}
                        className="self-start rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Employee overview cards */}
            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Employee overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        A live summary of your employee records.
                    </p>
                </div>

                {loading && !summary ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                            />
                        ))}
                    </div>
                ) : summary ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <article
                                    key={stat.key}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium text-slate-500">
                                            {stat.label}
                                        </p>

                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <p className="mt-5 break-words text-2xl font-bold text-slate-900">
                                        {stat.value}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {stat.description}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    !error && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                            <Users className="mx-auto h-8 w-8 text-slate-400" />
                            <h3 className="mt-3 font-semibold text-slate-900">
                                No dashboard data available
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Try refreshing the dashboard.
                            </p>
                        </div>
                    )
                )}
            </section>

            {/* Salary details */}
            {summary && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Salary overview
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Salary statistics calculated from employee records.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Banknote className="h-4 w-4" />
                                Minimum Salary
                            </div>
                            <p className="mt-2 text-xl font-bold text-slate-900">
                                {formatCurrency(minimumSalary)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <TrendingUp className="h-4 w-4" />
                                Maximum Salary
                            </div>
                            <p className="mt-2 text-xl font-bold text-slate-900">
                                {formatCurrency(maximumSalary)}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Department breakdown */}
            {summary && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Department breakdown
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Employee count in each department.
                        </p>
                    </div>

                    {departmentStats.length > 0 ? (
                        <div className="space-y-5">
                            {departmentStats.map((item) => {
                                const percentage =
                                    totalEmployees > 0
                                        ? Math.min(
                                            100,
                                            (item.count / totalEmployees) *
                                            100
                                        )
                                        : 0;

                                return (
                                    <div key={item.department}>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <BriefcaseBusiness className="h-4 w-4 text-indigo-500" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {item.department ||
                                                        "Unassigned"}
                                                </span>
                                            </div>

                                            <span className="text-sm font-semibold text-slate-900">
                                                {formatNumber(item.count)}{" "}
                                                {item.count === 1
                                                    ? "employee"
                                                    : "employees"}
                                            </span>
                                        </div>

                                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">
                            No department data available.
                        </p>
                    )}
                </section>
            )}

            {/* Quick actions */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                    Quick actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Navigate to employee management.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/employees"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        View employees
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                        to="/settings"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Manage profile
                    </Link>
                </div>
            </section>
        </div>
    );
}
