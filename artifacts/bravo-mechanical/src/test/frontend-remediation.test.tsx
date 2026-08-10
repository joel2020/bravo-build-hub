// @vitest-environment jsdom

import { lazy, Suspense } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Layout } from "../components/Layout";
import { NavigationEffects } from "../components/NavigationEffects";
import { Header } from "../components/Header";
import { LeadForm } from "../components/LeadForm";
import BookOnline from "../pages/BookOnline";

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

  it("dismisses at xl without focusing the hidden trigger before effect cleanup", async () => {
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
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("navigation", { name: /mobile navigation/i })).toBeNull();
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

describe("recoverable lead forms", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("protects only a dirty unfinished request", async () => {
    const { useUnsavedChangesGuard } = await import("../hooks/useUnsavedChangesGuard");
    const GuardHarness = ({ dirty }: { dirty: boolean }) => {
      useUnsavedChangesGuard(dirty);
      return null;
    };
    const dirtyRouter = createMemoryRouter([{ path: "*", element: <GuardHarness dirty /> }]);
    const { unmount } = render(<RouterProvider router={dirtyRouter} />);

    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    unmount();
    const cleanRouter = createMemoryRouter([
      { path: "*", element: <GuardHarness dirty={false} /> },
    ]);
    render(<RouterProvider router={cleanRouter} />);
    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);
  });

  it("prompts before dirty in-app navigation", async () => {
    const { useUnsavedChangesGuard } = await import("../hooks/useUnsavedChangesGuard");
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const GuardHarness = () => {
      const navigate = useNavigate();
      useUnsavedChangesGuard(true);
      return <button onClick={() => navigate("/next")}>Leave request</button>;
    };

    const router = createMemoryRouter([
      { path: "/", element: <GuardHarness /> },
      { path: "/next", element: <h1>Next page</h1> },
    ]);
    render(<RouterProvider router={router} />);

    await userEvent.click(screen.getByRole("button", { name: "Leave request" }));

    expect(confirm).toHaveBeenCalledWith(
      "You have an unfinished service request. Leave this page and discard it?",
    );
    expect(screen.queryByRole("heading", { name: "Next page" })).toBeNull();
  });

  it("continues dirty in-app navigation after confirmation", async () => {
    const { useUnsavedChangesGuard } = await import("../hooks/useUnsavedChangesGuard");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const GuardHarness = () => {
      const navigate = useNavigate();
      useUnsavedChangesGuard(true);
      return <button onClick={() => navigate("/next")}>Leave request</button>;
    };
    const router = createMemoryRouter([
      { path: "/", element: <GuardHarness /> },
      { path: "/next", element: <h1>Next page</h1> },
    ]);
    render(<RouterProvider router={router} />);

    await userEvent.click(screen.getByRole("button", { name: "Leave request" }));

    expect(await screen.findByRole("heading", { name: "Next page" })).toBeTruthy();
  });

  it("can stay on or leave a dirty request during back navigation", async () => {
    const { useUnsavedChangesGuard } = await import("../hooks/useUnsavedChangesGuard");
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const GuardHarness = () => {
      const navigate = useNavigate();
      useUnsavedChangesGuard(true);
      return <button onClick={() => navigate(-1)}>Back</button>;
    };
    const router = createMemoryRouter(
      [
        { path: "/previous", element: <h1>Previous page</h1> },
        { path: "/request", element: <GuardHarness /> },
      ],
      { initialEntries: ["/previous", "/request"], initialIndex: 1 },
    );
    render(<RouterProvider router={router} />);

    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();

    confirm.mockReturnValue(true);
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByRole("heading", { name: "Previous page" })).toBeTruthy();
  });

  it("focuses and describes the first invalid booking field", async () => {
    const router = createMemoryRouter([{ path: "*", element: <BookOnline /> }]);
    render(<RouterProvider router={router} />);

    await userEvent.click(screen.getByRole("button", { name: /book my visit/i }));

    expect(document.activeElement).toBe(screen.getByLabelText(/name/i));
    expect(screen.getByLabelText(/name/i).getAttribute("aria-invalid")).toBe("true");
    expect(
      screen.getByRole("group", { name: /what do you need/i }).getAttribute("aria-describedby"),
    ).toBe("booking-service-error");
  });

  it("clears an individual booking error when its value becomes valid", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([{ path: "*", element: <BookOnline /> }]);
    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: /book my visit/i }));
    const name = screen.getByLabelText(/name/i);
    await user.type(name, "Jordan Lee");

    expect(name.getAttribute("aria-invalid")).toBe("false");
    expect(name.hasAttribute("aria-describedby")).toBe(false);
    expect(screen.queryByText("Enter your name.")).toBeNull();
  });

  it("focuses the first invalid contact field after an empty submit", async () => {
    const router = createMemoryRouter([{ path: "*", element: <LeadForm /> }]);
    render(<RouterProvider router={router} />);

    await userEvent.click(screen.getByRole("button", { name: /request my estimate/i }));

    expect(document.activeElement).toBe(screen.getByLabelText(/full name/i));
    expect(screen.getByLabelText(/full name/i).getAttribute("aria-invalid")).toBe("true");
  });

  it("protects a prefilled lead only after the user edits it", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const PrefilledLeadHarness = () => {
      const navigate = useNavigate();
      return (
        <>
          <LeadForm
            defaultService="Emergency HVAC repair"
            defaultMessage="Urgent no-heat or no-cool issue."
          />
          <button type="button" onClick={() => navigate("/next")}>Leave request</button>
        </>
      );
    };
    const routes = [
      { path: "/", element: <PrefilledLeadHarness /> },
      { path: "/next", element: <h1>Next page</h1> },
    ];

    const pristineRouter = createMemoryRouter(routes);
    const pristineRender = render(<RouterProvider router={pristineRouter} />);
    await user.click(screen.getByRole("button", { name: "Leave request" }));

    expect(await screen.findByRole("heading", { name: "Next page" })).toBeTruthy();
    expect(confirm).not.toHaveBeenCalled();

    pristineRender.unmount();
    confirm.mockClear();
    const editedRouter = createMemoryRouter(routes);
    render(<RouterProvider router={editedRouter} />);
    await user.type(screen.getByLabelText(/how can we help/i), " Please call.");
    await user.click(screen.getByRole("button", { name: "Leave request" }));

    expect(confirm).toHaveBeenCalledWith(
      "You have an unfinished service request. Leave this page and discard it?",
    );
    expect(screen.queryByRole("heading", { name: "Next page" })).toBeNull();
  });
});
