import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

const queryClient = new QueryClient();

function RootComponent() {
  return (
    <>
      <HeadContent />

      <QueryClientProvider client={queryClient}>
        <Outlet />

        {import.meta.env.DEV && (
          // biome-ignore lint/correctness/useUniqueElementIds: Stupid rule...
          <div id="tanstack_devtools">
            <TanStackDevtools
              plugins={[
                {
                  name: "TanStack Query",
                  render: <ReactQueryDevtoolsPanel />,
                },
                {
                  name: "TanStack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          </div>
        )}
      </QueryClientProvider>
    </>
  );
}
