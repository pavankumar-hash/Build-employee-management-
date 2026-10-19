
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-[#f6f8fc] text-slate-800">
            <Sidebar />
            <main className="min-h-screen lg:pl-64">
                <Outlet />
            </main>
        </div>
    );
}
