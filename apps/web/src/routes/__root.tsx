import { createThemeCss } from "@tanstack/highlight/theme";
import { githubDarkTheme } from "@tanstack/highlight/themes/github-dark";
import { githubLightTheme } from "@tanstack/highlight/themes/github-light";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

const queryClient = new QueryClient();

const HIGHLIGHT_THEME_CSS = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  darkSelector: '[data-theme="dark"]',
});

function RootComponent() {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <HeadContent />

        {/* biome-ignore lint/correctness/useUniqueElementIds: Stupid rule */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Our own HTML */}
        <style id="tanstack-highlight-theme" dangerouslySetInnerHTML={{ __html: HIGHLIGHT_THEME_CSS }} />
      </head>
      <QueryClientProvider client={queryClient}>
        <Outlet />

        {import.meta.env.DEV && (
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
        )}
      </QueryClientProvider>
    </html>
  );
}
