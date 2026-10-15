
import { useEffect, useState } from "react";
import {
    Users,
    Wallet,
    Building2,
    RefreshCw,
    ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Reports() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchReports() {
        setLoading(true);
        setError("");

        try {
            const token = sessionStorage.getItem("accessToken");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await api.get(
                "/employees/dashboard/summary",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSummary(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Reports load nahi ho paayi. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReports();
    }, []);

    const reportCards = [
        {
            title: "Total Employees",
            value:
                summary?.totalEmployees ??
                summary?.total ??
                0,
            icon: Users,
            color: "bg-indigo-100 text-indigo-600",
        },
        {
            title: "Departments",
            value:
                summary?.totalDepartments ??
                summary?.departmentCount ??
                (Array.isArray(summary?.departments)
                    ? summary.departments.length
                    : 0),
            icon: Building2,
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "Total Salary",
            value: new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }).format(
                Number(
                    summary?.totalSalary ??
                    summary?.salaryExpense ??
                    0
                )
            ),
            icon: Wallet,
            color: "bg-emerald-100 text-emerald-600",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
                        >
                            <ArrowLeft size={17} />
                            Back to Dashboard
                        </button>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Reports & Analytics
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Employee aur salary statistics ka overview.
                        </p>
                    </div>

                    <button
                        onClick={fetchReports}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        <RefreshCw size={16} />
                        Refresh Reports
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                        <button
                            onClick={fetchReports}
                            className="ml-3 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                        Loading reports...
                    </div>
                ) : (
                    <>
                        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {reportCards.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <article
                                        key={card.title}
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {card.title}
                                                </p>
                                                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                                                    {card.value}
                                                </h2>
                                            </div>

                                            <div className={`rounded-xl p-3 ${card.color}`}>
                                                <Icon size={24} />
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">
                                Report Data
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Backend se milne wala summary response:
                            </p>

                            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm text-emerald-300">
                                {JSON.stringify(summary, null, 2)}
                            </pre>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
