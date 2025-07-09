import HeaderMobileToggle from "./HeaderMobileToggle";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <>
      <HeaderMobileToggle />
      <Sidebar />

      {/* Wrap content in a container with responsive margin */}
      <div
        className="min-vh-100"
        style={{
          marginLeft: 0,
        }}
      >
        <div
          className="p-3"
          style={{
            // Apply left margin only on medium screens and up
            marginLeft: window.innerWidth >= 768 ? "220px" : "0",
            transition: "margin-left 0.3s ease",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
