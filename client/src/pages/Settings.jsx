import { useEffect, useState } from "react";
import {
    UserRound,
    Mail,
    ShieldCheck,
    Save,
    LoaderCircle,
    RefreshCw,
} from "lucide-react";

import api from "../api/axios";

export default function Settings() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function fetchProfile() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/auth/me");

            // Supports the profile response shape from your controller.
            const profile =
                response.data?.data?.user ?? response.data?.user;

            if (!profile) {
                throw new Error("Profile data was not returned by the server.");
            }

            setName(profile.name ?? "");
            setEmail(profile.email ?? "");
            setRole(profile.role ?? "");

            sessionStorage.setItem("user", JSON.stringify(profile));
            window.dispatchEvent(new Event("profile-updated"));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load your profile.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProfile();
    }, []);

    async function handleSave(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        const trimmedName = name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 100) {
            setError("Name must contain between 2 and 100 characters.");
            return;
        }

        setSaving(true);

        try {
            const response = await api.patch("/auth/profile", {
                name: trimmedName,
            });

            const updatedUser =
                response.data?.data?.user ?? response.data?.user;

            if (!updatedUser) {
                throw new Error("Updated profile was not returned by the server.");
            }

            setName(updatedUser.name ?? trimmedName);
            setEmail(updatedUser.email ?? email);
            setRole(updatedUser.role ?? role);

            sessionStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("profile-updated"));

            setMessage(
                response.data?.message || "Profile updated successfully.",
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to update your profile.",
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center gap-3 text-slate-600">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                <span>Loading profile...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Settings
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage your account and profile information.
                </p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                            <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Profile information
                            </h2>
                            <p className="text-sm text-slate-500">
                                Update the name associated with your account.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-5 p-5 sm:p-7">
                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                            <button
                                type="button"
                                onClick={fetchProfile}
                                className="ml-2 inline-flex items-center gap-1 font-semibold underline"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Retry
                            </button>
                        </div>
                    )}

                    {message && (
                        <div
                            role="status"
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                        >
                            {message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label
                            htmlFor="profile-name"
                            className="text-sm font-medium text-slate-700"
                        >
                            Full name
                        </label>
                        <div className="relative">
                            <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                id="profile-name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                minLength={2}
                                maxLength={100}
                                required
                                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="profile-email"
                            className="text-sm font-medium text-slate-700"
                        >
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                id="profile-email"
                                type="email"
                                value={email}
                                readOnly
                                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none"
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            Email editing is not enabled for this API.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Account role
                        </label>
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <ShieldCheck className="h-5 w-5 text-indigo-600" />
                            <span className="text-sm capitalize text-slate-700">
                                {role || "Not available"}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={fetchProfile}
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reload profile
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}