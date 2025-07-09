import { useSidebar } from "../contexts/SidebarContext";
import { Menu } from "lucide-react";

export default function HeaderMobileToggle() {
  const { openSidebar } = useSidebar();

  return (
    <div className="d-md-none d-flex align-items-center justify-content-between p-2 bg-white shadow-sm border-bottom">
      <button
        className="btn btn-outline-primary"
        onClick={openSidebar}
        aria-label="Open sidebar"
      >
        <Menu />
      </button>
      <span className="fw-semibold text-primary">Project Tracker</span>
      <span style={{ width: "40px" }} /> {/* Spacer to balance button alignment */}
    </div>
  );
}
