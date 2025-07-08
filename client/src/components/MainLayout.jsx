// src/components/MainLayout.jsx
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function MainLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <Navbar />
      <div className="container">
        {children}
      </div>
    </div>
  );
}
