import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Search,
    Plus,
    RefreshCw,
    Pencil,
    Trash2,
    X,
    LoaderCircle,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Building2,
    IndianRupee,
    Mail,
    SlidersHorizontal,
    UserRound,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import api from "../api/axios";

const PAGE_SIZE = 10;
const DEPARTMENTS = [
    "Engineering",
    "HR",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
    "Other",
];

const EMPTY_FORM = {
    name: "",
    email: "",
    department: "",
    salary: "",
};

function readStoredUser() {
    try {
        return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

function employeeId(employee) {
    return employee?._id || employee?.id;
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });
}

function getErrorMessage(error, fallback) {
    if (error?.response?.status === 403) {
        return "Aapke account ko is action ki permission nahi hai.";
    }
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        fallback
    );
}

export default function Employees() {
    const navigate = useNavigate();

    const [user, setUser] = useState(readStoredUser);
    const [employees, setEmployees] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const syncUser = () => setUser(readStoredUser());
        window.addEventListener("storage", syncUser);
        window.addEventListener("profile-updated", syncUser);
        return () => {
            window.removeEventListener("storage", syncUser);
            window.removeEventListener("profile-updated", syncUser);
        };
    }, []);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = sessionStorage.getItem("accessToken");
            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            const response = await api.get("/employees", {
                params: {
                    page,
                    limit: PAGE_SIZE,
                    ...(search ? { search } : {}),
                    ...(department ? { department } : {}),
                },
            });

            const result = response?.data?.data ?? response?.data;
            const list = Array.isArray(result)
                ? result
                : result?.employees || result?.items || result?.docs || [];

            const meta = Array.isArray(result)
                ? null
                : result?.pagination || result?.meta || null;

            setEmployees(Array.isArray(list) ? list : []);
            setPagination(meta);
        } catch (err) {
            if (err.response?.status === 401) {
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }
            setError(
                getErrorMessage(
                    err,
                    "Employees load nahi ho paye. API response aur server status check karein."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [navigate, page, search, department]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const totalEmployees = pagination?.total ?? pagination?.totalItems ?? null;
    const totalPages = Math.max(
        1,
        Number(pagination?.totalPages ?? pagination?.pages ?? 1)
    );

    const departmentCount = useMemo(() => {
        if (totalEmployees != null && !search && !department) {
            return new Set(employees.map((item) => item.department).filter(Boolean)).size;
        }
        return new Set(employees.map((item) => item.department).filter(Boolean)).size;
    }, [employees, totalEmployees, search, department]);

    function openAddModal() {
        if (!isAdmin) return;
        setEditingEmployee(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setError("");
        setModalOpen(true);
    }

    function openEditModal(employee) {
        if (!isAdmin) return;
        setEditingEmployee(employee);
        setForm({
            name: employee.name || "",
            email: employee.email || "",
            department: employee.department || "",
            salary: employee.salary ?? "",
        });
        setFormError("");
        setError("");
        setModalOpen(true);
    }

    function handleFormChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setFormError("");
    }

    function validateForm() {
        const name = form.name.trim();
        const email = form.email.trim();
        const salaryText = String(form.salary).trim();
        const salary = Number(salaryText);

        if (name.length < 2 || name.length > 100) {
            return "Name 2 se 100 characters ke beech hona chahiye.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            return "Valid email address enter karein.";
        }
        if (!form.department) {
            return "Department select karein.";
        }
        if (!salaryText || !Number.isFinite(salary) || salary < 0) {
            return "Valid non-negative salary enter karein.";
        }
        return "";
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!isAdmin || saving) return;

        const validationMessage = validateForm();
        if (validationMessage) {
            setFormError(validationMessage);
            return;
        }

        setSaving(true);
        setFormError("");

        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                department: form.department,
                salary: Number(form.salary),
            };

            const id = employeeId(editingEmployee);
            if (editingEmployee && !id) {
                setFormError("Employee ID missing hai. Record refresh karke dobara try karein.");
                return;
            }

            if (editingEmployee) {
                await api.patch(`/employees/${id}`, payload);
                setNotice("Employee details successfully update ho gayi.");
            } else {
                await api.post("/employees", payload);
                setNotice("Employee successfully add ho gaya.");
            }

            setModalOpen(false);
            setForm(EMPTY_FORM);
            await fetchEmployees();
        } catch (err) {
            if (err.response?.status === 401) {
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }
            setFormError(
                getErrorMessage(
                    err,
                    "Employee save nahi ho paya. Fields aur API response check karein."
                )
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(employee) {
        if (!isAdmin || deletingId) return;

        const id = employeeId(employee);
        if (!id) {
            setError("Employee ID missing hai. Record refresh karke dobara try karein.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${employee.name}?`);
        if (!confirmed) return;

        setDeletingId(id);
        setError("");
        setNotice("");

        try {
            await api.delete(`/employees/${id}`);
            setNotice(`${employee.name} successfully delete ho gaya.`);

            if (employees.length === 1 && page > 1) {
                setPage((current) => Math.max(1, current - 1));
            } else {
                await fetchEmployees();
            }
        } catch (err) {
            if (err.response?.status === 401) {
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }
            setError(getErrorMessage(err, "Employee delete nahi ho paya."));
        } finally {
            setDeletingId(null);
        }
    }

    function changeDepartment(value) {
        setDepartment(value);
        setPage(1);
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <ArrowLeft size={17} />
                    Back to dashboard
                </button>

                <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-600/20">
                            <Users size={26} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                                Workspace / People
                            </p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                Employees
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Manage your team, departments, and employee records.
                            </p>
                        </div>
                    </div>

                    {isAdmin && (
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                        >
                            <Plus size={18} />
                            Add employee
                        </button>
                    )}
                </header>

                <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">Employees on this page</span>
                            <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                                <Users size={20} />
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold tracking-tight">
                            {loading ? "—" : employees.length}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {totalEmployees != null ? `${totalEmployees} total matching records` : "Current result set"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">Departments on page</span>
                            <span className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                                <Building2 size={20} />
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold tracking-tight">
                            {loading ? "—" : departmentCount}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Distinct departments in current results</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">Access level</span>
                            <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                <UserRound size={20} />
                            </span>
                        </div>
                        <p className="mt-4 text-2xl font-bold capitalize tracking-tight">
                            {user?.role || "User"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {isAdmin ? "Can create, edit, and delete records" : "Read-only employee access"}
                        </p>
                    </div>
                </section>

                {(notice || error) && (
                    <div className="mt-5 space-y-3" aria-live="polite">
                        {notice && (
                            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                                <span className="flex-1">{notice}</span>
                                <button
                                    type="button"
                                    onClick={() => setNotice("")}
                                    aria-label="Dismiss success message"
                                    className="rounded p-1 hover:bg-emerald-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        {error && (
                            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span className="flex-1">{error}</span>
                                <button
                                    type="button"
                                    onClick={() => setError("")}
                                    aria-label="Dismiss error message"
                                    className="rounded p-1 hover:bg-red-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900">Team directory</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Search records and filter by department.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[minmax(200px,1fr)_190px_auto]">
                            <label className="relative block">
                                <span className="sr-only">Search employees</span>
                                <Search
                                    size={18}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Search name or email..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </label>

                            <label className="relative block">
                                <span className="sr-only">Filter by department</span>
                                <SlidersHorizontal
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <select
                                    value={department}
                                    onChange={(event) => changeDepartment(event.target.value)}
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                >
                                    <option value="">All departments</option>
                                    {DEPARTMENTS.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </label>

                            <button
                                type="button"
                                onClick={() => {
                                    setNotice("");
                                    fetchEmployees();
                                }}
                                disabled={loading}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th scope="col" className="px-5 py-4 font-semibold">Employee</th>
                                    <th scope="col" className="px-5 py-4 font-semibold">Department</th>
                                    <th scope="col" className="px-5 py-4 font-semibold">Monthly salary</th>
                                    <th scope="col" className="px-5 py-4 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-16 text-center text-slate-500">
                                            <LoaderCircle size={24} className="mx-auto mb-3 animate-spin text-indigo-600" />
                                            <p className="font-medium">Loading employees...</p>
                                            <p className="mt-1 text-xs">Fetching the latest records</p>
                                        </td>
                                    </tr>
                                ) : employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                                <Users size={22} />
                                            </div>
                                            <p className="mt-3 font-semibold text-slate-800">No employees found</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Try changing the search or department filter.
                                            </p>
                                            {(searchInput || department) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchInput("");
                                                        setSearch("");
                                                        setDepartment("");
                                                        setPage(1);
                                                    }}
                                                    className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                                >
                                                    Clear filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((employee) => {
                                        const id = employeeId(employee);
                                        const isDeleting = deletingId === id;
                                        return (
                                            <tr key={id} className="transition hover:bg-slate-50/80">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700">
                                                            {(employee.name || "E").trim().charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-slate-800">{employee.name || "Unnamed employee"}</p>
                                                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                                                                <Mail size={12} className="shrink-0" />
                                                                {employee.email || "No email"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                                        {employee.department || "Unassigned"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-semibold tabular-nums text-slate-800">
                                                    <span className="inline-flex items-center gap-1">
                                                        <IndianRupee size={14} className="text-slate-400" />
                                                        {Number(employee.salary || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        {isAdmin ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(employee)}
                                                                    aria-label={`Edit ${employee.name || "employee"}`}
                                                                    title="Edit employee"
                                                                    disabled={Boolean(deletingId)}
                                                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40"
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(employee)}
                                                                    aria-label={`Delete ${employee.name || "employee"}`}
                                                                    title="Delete employee"
                                                                    disabled={Boolean(deletingId)}
                                                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                                >
                                                                    {isDeleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">View only</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-xs text-slate-500">
                            Showing <span className="font-semibold text-slate-700">{employees.length}</span> record{employees.length === 1 ? "" : "s"}
                            {totalEmployees != null && <> of <span className="font-semibold text-slate-700">{totalEmployees}</span></>}
                            {" "}· Page {page}{pagination?.totalPages || pagination?.pages ? ` of ${totalPages}` : ""}
                        </p>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={page <= 1 || loading}
                                aria-label="Previous page"
                                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={17} />
                                <span className="hidden sm:inline">Previous</span>
                            </button>
                            <span className="min-w-10 text-center text-sm font-semibold text-slate-700">{page}</span>
                            <button
                                type="button"
                                onClick={() => setPage((current) => current + 1)}
                                disabled={loading || (pagination ? page >= totalPages : employees.length < PAGE_SIZE)}
                                aria-label="Next page"
                                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </footer>
                </section>

                {!isAdmin && (
                    <p className="mt-4 text-xs text-slate-500">
                        You have read-only access. Contact an administrator if you need to change employee records.
                    </p>
                )}
            </div>

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !saving) {
                            setModalOpen(false);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="employee-modal-title"
                        className="my-auto w-full max-w-xl rounded-2xl border border-white/50 bg-white p-5 shadow-2xl sm:p-7"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                                    Employee management
                                </p>
                                <h2 id="employee-modal-title" className="mt-1 text-xl font-bold text-slate-900">
                                    {editingEmployee ? "Edit employee" : "Add new employee"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Enter accurate details for this employee record.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                disabled={saving}
                                aria-label="Close form"
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="employee-name" className="mb-2 block text-sm font-semibold text-slate-700">
                                        Full name
                                    </label>
                                    <input
                                        id="employee-name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="e.g. Amit Verma"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        minLength={2}
                                        maxLength={100}
                                        required
                                        disabled={saving}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="employee-email" className="mb-2 block text-sm font-semibold text-slate-700">
                                        Email address
                                    </label>
                                    <input
                                        id="employee-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="e.g. amit@example.com"
                                        value={form.email}
                                        onChange={handleFormChange}
                                        maxLength={254}
                                        required
                                        disabled={saving}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="employee-department" className="mb-2 block text-sm font-semibold text-slate-700">
                                        Department
                                    </label>
                                    <select
                                        id="employee-department"
                                        name="department"
                                        value={form.department}
                                        onChange={handleFormChange}
                                        required
                                        disabled={saving}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                                    >
                                        <option value="">Select department</option>
                                        {DEPARTMENTS.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="employee-salary" className="mb-2 block text-sm font-semibold text-slate-700">
                                        Monthly salary (₹)
                                    </label>
                                    <input
                                        id="employee-salary"
                                        name="salary"
                                        type="number"
                                        inputMode="decimal"
                                        placeholder="e.g. 45000"
                                        value={form.salary}
                                        onChange={handleFormChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        disabled={saving}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving && <LoaderCircle size={17} className="animate-spin" />}
                                    {saving ? "Saving..." : editingEmployee ? "Save changes" : "Create employee"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
