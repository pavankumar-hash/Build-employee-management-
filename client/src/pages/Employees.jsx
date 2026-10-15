
import { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import api from "../api/axios";

const emptyForm = {
    name: "",
    email: "",
    department: "",
    salary: "",
};

export default function Employees() {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const getToken = () => sessionStorage.getItem("accessToken");

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = getToken();

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            const response = await api.get("/employees", {
                params: {
                    page,
                    limit: 10,
                    ...(search.trim() ? { search: search.trim() } : {}),
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = response.data.data;
            const list = Array.isArray(result)
                ? result
                : result?.employees || result?.items || [];

            setEmployees(list);

            setPagination(
                Array.isArray(result)
                    ? null
                    : result?.pagination || result?.meta || null
            );
        } catch (err) {
            if (err.response?.status === 401) {
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Employees load nahi ho paye. API response check karein."
            );
        } finally {
            setLoading(false);
        }
    }, [navigate, page, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEmployees();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchEmployees]);

    function openAddModal() {
        setEditingEmployee(null);
        setForm(emptyForm);
        setError("");
        setModalOpen(true);
    }

    function openEditModal(employee) {
        setEditingEmployee(employee);
        setForm({
            name: employee.name || "",
            email: employee.email || "",
            department: employee.department || "",
            salary: employee.salary ?? "",
        });
        setError("");
        setModalOpen(true);
    }

    function handleFormChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const token = getToken();
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                department: form.department.trim(),
                salary: Number(form.salary),
            };

            if (editingEmployee) {
                await api.patch(
                    `/employees/${editingEmployee._id || editingEmployee.id}`,
                    payload,
                    config
                );
            } else {
                await api.post("/employees", payload, config);
            }

            setModalOpen(false);
            setForm(emptyForm);
            await fetchEmployees();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Employee save nahi ho paya."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(employee) {
        const employeeId = employee._id || employee.id;

        if (
            !window.confirm(
                `Kya aap ${employee.name} ko delete karna chahte hain?`
            )
        ) {
            return;
        }

        setDeletingId(employeeId);
        setError("");

        try {
            await api.delete(`/employees/${employeeId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            await fetchEmployees();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Employee delete nahi ho paya."
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main className="min-h-screen bg-[#f6f8fc] p-4 sm:p-6 lg:p-9">
            <div className="mx-auto max-w-[1400px]">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
                >
                    <ArrowLeft size={17} />
                    Back to dashboard
                </button>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                                <Users size={25} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Employees
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Manage your employee records.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
                    >
                        <Plus size={19} />
                        Add Employee
                    </button>
                </div>

                <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                All Employees
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Search and manage employee details.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative min-w-0 flex-1 sm:w-72">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setPage(1);
                                        setSearch(event.target.value);
                                    }}
                                    placeholder="Search employees..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <button
                                onClick={fetchEmployees}
                                disabled={loading}
                                aria-label="Refresh employees"
                                className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={17}
                                    className={loading ? "animate-spin" : ""}
                                />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Employee</th>
                                    <th className="px-5 py-4 font-semibold">Department</th>
                                    <th className="px-5 py-4 font-semibold">Salary</th>
                                    <th className="px-5 py-4 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-5 py-12 text-center text-slate-500"
                                        >
                                            <LoaderCircle
                                                size={22}
                                                className="mx-auto mb-2 animate-spin"
                                            />
                                            Loading employees...
                                        </td>
                                    </tr>
                                ) : employees.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-5 py-12 text-center text-slate-500"
                                        >
                                            No employees found.
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((employee) => (
                                        <tr
                                            key={employee._id || employee.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                                        {(employee.name || "E")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {employee.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {employee.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                                                    {employee.department || "Not specified"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 font-semibold text-slate-800">
                                                {Number(employee.salary || 0).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        style: "currency",
                                                        currency: "INR",
                                                        maximumFractionDigits: 0,
                                                    }
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(employee)}
                                                        aria-label={`Edit ${employee.name}`}
                                                        title="Edit employee"
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(employee)}
                                                        disabled={
                                                            deletingId ===
                                                            (employee._id || employee.id)
                                                        }
                                                        aria-label={`Delete ${employee.name}`}
                                                        title="Delete employee"
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                    >
                                                        {deletingId ===
                                                            (employee._id || employee.id) ? (
                                                            <LoaderCircle
                                                                size={16}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
                        <p className="text-xs text-slate-500">
                            Showing {employees.length} employee
                            {employees.length === 1 ? "" : "s"}
                            {pagination?.total != null
                                ? ` of ${pagination.total}`
                                : ""}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={page <= 1 || loading}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span className="px-2 text-sm font-medium text-slate-600">
                                Page {page}
                            </span>

                            <button
                                onClick={() => setPage((current) => current + 1)}
                                disabled={
                                    loading ||
                                    (pagination
                                        ? page >=
                                        (pagination.totalPages ||
                                            pagination.pages ||
                                            page)
                                        : employees.length < 10)
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Next page"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Add / Edit modal */}
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
                        className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h2
                                    id="employee-modal-title"
                                    className="text-xl font-bold text-slate-900"
                                >
                                    {editingEmployee ? "Edit Employee" : "Add Employee"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Enter the employee details below.
                                </p>
                            </div>

                            <button
                                onClick={() => setModalOpen(false)}
                                disabled={saving}
                                aria-label="Close form"
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {[
                                {
                                    name: "name",
                                    label: "Full name",
                                    type: "text",
                                    placeholder: "e.g. Amit Verma",
                                },
                                {
                                    name: "email",
                                    label: "Email address",
                                    type: "email",
                                    placeholder: "e.g. amit@example.com",
                                },
                                {
                                    name: "department",
                                    label: "Department",
                                    type: "text",
                                    placeholder: "e.g. Engineering",
                                },
                                {
                                    name: "salary",
                                    label: "Monthly salary (₹)",
                                    type: "number",
                                    placeholder: "e.g. 45000",
                                },
                            ].map((field) => (
                                <div key={field.name}>
                                    <label
                                        htmlFor={field.name}
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        {field.label}
                                    </label>

                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={form[field.name]}
                                        onChange={handleFormChange}
                                        required
                                        min={field.type === "number" ? "0" : undefined}
                                        step={field.type === "number" ? "0.01" : undefined}
                                        maxLength={field.type !== "number" ? 254 : undefined}
                                        disabled={saving}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                                    />
                                </div>
                            ))}

                            {error && (
                                <p role="alert" className="text-sm text-red-600">
                                    {error}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {saving && (
                                        <LoaderCircle size={17} className="animate-spin" />
                                    )}
                                    {editingEmployee ? "Save Changes" : "Add Employee"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
