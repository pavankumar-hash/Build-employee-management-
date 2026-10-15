
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    LoaderCircle,
    LayoutDashboard,
} from "lucide-react";
import api from "../api/axios";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: form.email.trim(),
                password: form.password,
            });

            const { accessToken, user } = response.data.data || {};

            if (!accessToken) {
                throw new Error("Access token was not returned by the server.");
            }

            sessionStorage.setItem("accessToken", accessToken);

            if (user) {
                sessionStorage.setItem("user", JSON.stringify(user));
            }

            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7ff] px-4 py-10 sm:px-6">
            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />

            <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-indigo-950/10 lg:grid-cols-2">
                {/* Left panel */}
                <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-700 to-violet-800 p-10 text-white lg:flex xl:p-12">
                    <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full border-[45px] border-white/[0.06]" />
                    <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/[0.04]" />

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                            <Users size={27} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                EmployEase
                            </h1>
                            <p className="text-xs text-indigo-200">
                                Employee Management System
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 my-12">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-indigo-100">
                            <ShieldCheck size={15} />
                            Your workspace, simplified
                        </div>

                        <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                            Manage your team.
                            <span className="mt-2 block text-indigo-200">
                                Achieve more.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-sm text-sm leading-7 text-indigo-100/90">
                            One organized workspace to manage employee records,
                            monitor key metrics, and keep your workforce connected.
                        </p>

                        <div className="mt-9 rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                                    <LayoutDashboard size={24} />
                                </div>
                                <div>
                                    <p className="font-semibold">Your admin workspace</p>
                                    <p className="mt-1 text-sm text-indigo-200">
                                        Everything you need, in one place.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="relative z-10 text-xs text-indigo-200/80">
                        © {new Date().getFullYear()} EmployEase. All rights reserved.
                    </p>
                </section>

                {/* Right panel */}
                <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-14">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="mb-10 flex items-center gap-3 lg:hidden">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                <Users size={24} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">
                                    EmployEase
                                </h1>
                                <p className="text-xs text-slate-500">
                                    Employee Management System
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
                                Admin Portal
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Welcome back
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Enter your credentials to access your dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={19}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        autoComplete="username"
                                        required
                                        maxLength={254}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>
                                </div>

                                <div className="relative">
                                    <LockKeyhole
                                        size={19}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={
                                            showPassword ? "Hide password" : "Show password"
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle size={19} className="animate-spin" />
                                        Signing you in...
                                    </>
                                ) : (
                                    <>
                                        Sign in to dashboard
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="my-7 flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-xs text-slate-400">
                                SECURE ADMIN ACCESS
                            </span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                            <ShieldCheck
                                size={20}
                                className="mt-0.5 shrink-0 text-emerald-600"
                            />
                            <p className="text-xs leading-5 text-slate-500">
                                This portal is for authorized users only. Keep your
                                login credentials private and sign out when finished.
                            </p>
                        </div>

                        <p className="mt-8 text-center text-xs text-slate-400">
                            © {new Date().getFullYear()} EmployEase
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
