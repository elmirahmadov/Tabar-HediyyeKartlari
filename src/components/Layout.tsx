import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

export type SidebarItem = { id: string; label: string };

type LayoutProps = {
  title: string;
  sidebarItems: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  children: ReactNode;
  headerRight?: ReactNode;
  sidebarFooter?: ReactNode;
};

export default function Layout({
  title,
  sidebarItems,
  activeId,
  onSelect,
  children,
  headerRight,
  sidebarFooter,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarItemClick = (id: string) => {
    onSelect(id);
    setSidebarOpen(false);
  };

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <header className="app-header">
        <div className="app-header-inner">
          {sidebarItems.length > 0 && (
            <button
              type="button"
              className="app-sidebar-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Menü"
              aria-expanded={sidebarOpen}
            >
              <span className="app-sidebar-toggle-icon" />
            </button>
          )}
          <Link
            to="/"
            className="app-logo"
            onClick={() => setSidebarOpen(false)}
          >
            Tabar
          </Link>
          {title ? <h1 className="app-title">{title}</h1> : null}
          {headerRight && <div className="app-header-right">{headerRight}</div>}
        </div>
      </header>
      {sidebarItems.length > 0 && (
        <>
          <div
            className="app-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="app-sidebar">
            <nav className="app-sidebar-nav">
              {sidebarItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`app-sidebar-item ${
                    activeId === item.id ? "active" : ""
                  }`}
                  onClick={() => handleSidebarItemClick(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            {sidebarFooter && (
              <div className="app-sidebar-footer">{sidebarFooter}</div>
            )}
          </aside>
        </>
      )}
      <main className="app-main">{children}</main>
    </div>
  );
}
