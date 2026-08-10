// @vitest-environment jsdom

import { lazy, Suspense } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { NavigationEffects } from "../components/NavigationEffects";
import { Header } from "../components/Header";

const TestRoutes = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<button onClick={() => navigate("/next")}>Next</button>} />
      <Route path="/next" element={<h1>Next page</h1>} />
    </Routes>
  );
};

describe("frontend remediation navigation shell", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("offers a keyboard skip link and focusable main target", () => {
    render(
      <MemoryRouter>
        <Layout>
          <h1>Page</h1>
        </Layout>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /skip to main content/i }).getAttribute("href")).toBe(
      "#main-content",
    );
    expect(screen.getByRole("main").getAttribute("tabindex")).toBe("-1");
  });

  it("scrolls forward navigation to top and focuses main", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavigationEffects />
        <Layout>
          <TestRoutes />
        </Layout>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
    expect(document.activeElement).toBe(screen.getByRole("main"));
  });

  it("waits for a suspended destination layout before focusing main", async () => {
    let resolveDestination!: (module: { default: () => React.ReactNode }) => void;
    const Destination = lazy(
      () =>
        new Promise<{ default: () => React.ReactNode }>((resolve) => {
          resolveDestination = resolve;
        }),
    );
    const SuspendedRoutes = () => {
      const navigate = useNavigate();
      const { pathname } = useLocation();

      return (
        <Suspense key={pathname} fallback={<div role="status">Loading destination</div>}>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <button onClick={() => navigate("/next", { flushSync: true })}>
                    Load destination
                  </button>
                </Layout>
              }
            />
            <Route path="/next" element={<Destination />} />
          </Routes>
        </Suspense>
      );
    };

    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavigationEffects />
        <SuspendedRoutes />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Load destination" }));
    expect(screen.getByRole("status")).toBeTruthy();

    await act(async () => {
      resolveDestination({
        default: () => (
          <section>
            <Layout>
              <h1>Loaded destination</h1>
            </Layout>
          </section>
        ),
      });
    });

    expect(await screen.findByRole("heading", { name: "Loaded destination" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("main"));
  });

  it("provides the skip link and main target on the app subdomain", async () => {
    const appWindow = Object.create(window) as Window & typeof globalThis;
    Object.defineProperty(appWindow, "location", {
      value: { ...window.location, hostname: "app.bravomechanicalny.com" },
    });
    vi.stubGlobal("window", appWindow);
    vi.resetModules();
    const { Layout: AppLayout } = await import("../components/Layout");

    render(
      <MemoryRouter>
        <AppLayout>
          <h1>CRM</h1>
        </AppLayout>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /skip to main content/i }).getAttribute("href")).toBe(
      "#main-content",
    );
    expect(screen.getByRole("main").getAttribute("tabindex")).toBe("-1");
  });

  it("announces and dismisses the mobile menu", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole("button", { name: /open menu/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).toBe("mobile-navigation");

    await user.click(trigger);

    expect(trigger.getAttribute("aria-label")).toMatch(/close menu/i);
    expect(
      screen.getByRole("navigation", { name: /mobile navigation/i }).getAttribute("id"),
    ).toBe("mobile-navigation");

    await user.keyboard("{Escape}");

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("dismisses the mobile menu when the route changes", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
        <TestRoutes />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole("button", { name: /open menu/i });
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("dismisses the mobile menu when entering xl and keeps focus off the hidden trigger", async () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const mediaQueryState = {
      matches: false,
      media: "(min-width: 1280px)",
      onchange: null,
      addEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        listeners.add(listener);
      },
      removeEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        listeners.delete(listener);
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    };
    vi.stubGlobal("matchMedia", () => mediaQueryState as unknown as MediaQueryList);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Header />
        <button type="button">Safe target</button>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole("button", { name: /open menu/i });
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const safeTarget = screen.getByRole("button", { name: "Safe target" });
    safeTarget.focus();
    mediaQueryState.matches = true;
    act(() => {
      listeners.forEach((listener) =>
        listener({ matches: true, media: mediaQueryState.media } as MediaQueryListEvent),
      );
    });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("navigation", { name: /mobile navigation/i })).toBeNull();
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(safeTarget);

    mediaQueryState.matches = false;
    act(() => {
      listeners.forEach((listener) =>
        listener({ matches: false, media: mediaQueryState.media } as MediaQueryListEvent),
      );
    });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("navigation", { name: /mobile navigation/i })).toBeNull();
  });

  it("keeps primary navigation at xl and places secondary links in More", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const primaryNavigation = screen.getByRole("navigation", { name: /primary navigation/i });
    expect(primaryNavigation.classList.contains("hidden")).toBe(true);
    expect(primaryNavigation.classList.contains("xl:flex")).toBe(true);
    expect(primaryNavigation.textContent).toContain("Services");
    expect(primaryNavigation.textContent).toContain("Service Areas");
    expect(primaryNavigation.textContent).toContain("Projects");
    expect(primaryNavigation.textContent).toContain("Reviews");
    expect(primaryNavigation.textContent).toContain("Book Online");
    expect(primaryNavigation.textContent).toContain("Contact");
    expect(primaryNavigation.textContent).not.toContain("About");
    expect(primaryNavigation.textContent).not.toContain("Blog");
    expect(primaryNavigation.textContent).not.toContain("Español");

    await user.click(screen.getByRole("button", { name: "More" }));

    expect(screen.getByRole("menuitem", { name: "About" }).getAttribute("href")).toBe("/about");
    expect(screen.getByRole("menuitem", { name: "Blog" }).getAttribute("href")).toBe("/blog");
    expect(screen.getByRole("menuitem", { name: "Español" }).getAttribute("href")).toBe("/es");
  });
});
