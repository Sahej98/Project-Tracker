// src/components/MainLayout.jsx
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="d-flex min-vh-100">
      <Sidebar />

      <div className="flex-grow-1">
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}
