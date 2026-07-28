import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <header className="grid grid-flow-col grid-rows-2 m-4">
        <h1 className="text-4xl font-bold">Node validator benchmarks</h1>
        <div className="flex gap-4">
          <Link to="/compare" className="text-blue-500 hover:text-blue-700">
            Compare syntax
          </Link>
          <Link to="/presentation" search={{ slide: 0 }} className="text-blue-500 hover:text-blue-700">
            📊 Performance Presentation
          </Link>
          <Link to="/history" className="text-blue-500 hover:text-blue-700">
            View historical performance
          </Link>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
