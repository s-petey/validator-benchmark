import { createThemeCss } from "@tanstack/highlight/theme";
import githubDarkTheme from "@tanstack/highlight/themes/github-dark";
import githubLightTheme from "@tanstack/highlight/themes/github-light";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

const HIGHLIGHT_THEME_CSS = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  darkSelector: '[data-theme="dark"]',
});

function RouteComponent() {
  return (
    <>
      <head>
        {/* biome-ignore lint/correctness/useUniqueElementIds: Stupid rule */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Our own HTML */}
        <style id="tanstack-highlight-theme" dangerouslySetInnerHTML={{ __html: HIGHLIGHT_THEME_CSS }} />
      </head>

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
    </>
  );
}
