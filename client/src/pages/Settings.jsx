
import { useState } from "react";
import {
    Settings as SettingsIcon,
    UserRound,
    Mail,
    ShieldCheck,
} from "lucide-react";

export default function Settings() {
    const savedUser = sessionStorage.getItem("user");

    let user = {};
    try {
        user = savedUser ? JSON.parse(savedUser) : {};
    } catch {
        user = {};
    }

    const [name, setName] = useState(user.name || "");
    const [email] = useState(user.email || "");
    const [message, setMessage] = useState("");

    function handleSave(event) {
        event.preventDefault();

        const updatedUser = {
            ...user,
            name: name.trim(),
        };

        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        setMessage("Profile details saved for this session.");
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                        <SettingsIcon size={25} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Settings
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage your account information.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSave}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                    <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                        <UserRound className="text-indigo-600" size={22} />
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Profile Information
                            </h2>
                            <p className="text-sm text-slate-500">
                                Update the name displayed in your account.
                            </p>
                        </div>
                    </div>

                    <div className="mb-5">
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                setMessage("");
                            }}
                            required
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="mb-5">
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                readOnly
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-500"
                            />
                        </div>
                    </div>

                    <div className="mb-6 flex gap-3 rounded-xl bg-indigo-50 p-4">
                        <ShieldCheck
                            className="shrink-0 text-indigo-600"
                            size={21}
                        />
                        <div>
                            <p className="font-medium text-slate-800">
                                Account Security
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                Your account access is managed by the authentication
                                system.
                            </p>
                        </div>
                    </div>

                    {message && (
                        <p role="status" className="mb-4 text-sm text-green-700">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
