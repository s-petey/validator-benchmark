import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});
function RouteComponent() {
  return (
    <div className="layout-readable">
      <header className="header border" style={{ marginBottom: "2rem" }}>
        <div className="stack">
          <h1 className="h1 no-margin">Node validator benchmarks</h1>
          <nav className="cluster">
            <span className="box invisible">
              <Link className="styled-link" to="/">
                Home
              </Link>
            </span>
            <span className="box invisible">
              <Link className="styled-link" to="/compare">
                Compare syntax
              </Link>
            </span>
            <span className="box invisible">
              <Link className="styled-link" to="/presentation" search={{ slide: 0 }}>
                📊 Performance Presentation
              </Link>
            </span>
            <span className="box invisible">
              <Link className="styled-link" to="/history">
                View historical performance
              </Link>
            </span>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
