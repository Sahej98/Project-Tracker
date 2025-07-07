// src/components/MainLayout.jsx
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <div className="container">
        {children}
      </div>
    </div>
  );
}
