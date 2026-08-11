// @vitest-environment jsdom

import { lazy, Suspense } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
import { PageHero } from "../components/PageHero";
import { SITE } from "../lib/site";
import BookOnline from "../pages/BookOnline";
import Contact from "../pages/Contact";
import CityPage from "../pages/CityPage";
import Index from "../pages/Index";
import Projects from "../pages/Projects";
import Services from "../pages/Services";

const supabaseTestState = vi.hoisted(() => ({
  insert: vi.fn(),
}));

vi.mock("../integrations/supabase/client", () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: (table: string) => {
      const query = {
        select: () => query,
        eq: () => query,
        gte: () => query,
        order: () => query,
        insert: (payload: unknown) => supabaseTestState.insert(payload),
        limit: () =>
          Promise.resolve({
            data: table === "job_photos"
              ? [
                  {
                    id: "published-photo",
                    public_url: "https://example.com/published-job.jpg",
                    public_caption: "Published CRM project",
                    created_at: "2026-08-10T12:00:00.000Z",
                  },
                ]
              : [],
          }),
      };
      return query;
    },
  },
}));

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
    vi.resetModules();
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

  it("stops waiting for a route main target after a bounded retry window", async () => {
    const disconnect = vi.fn();
    class TestMutationObserver {
      observe() {}
      disconnect() { disconnect(); }
    }
    vi.stubGlobal("MutationObserver", TestMutationObserver);
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const timeout = vi.spyOn(window, "setTimeout");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavigationEffects />
        <TestRoutes />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    const deadline = timeout.mock.calls.find(([, delay]) => delay === 2000);
    expect(deadline).toBeDefined();
    expect(disconnect).not.toHaveBeenCalled();

    const deadlineCallback = deadline![0];
    expect(typeof deadlineCallback).toBe("function");
    act(() => {
      if (typeof deadlineCallback === "function") deadlineCallback();
    });
    expect(disconnect).toHaveBeenCalledTimes(1);
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

  it("shows four focused desktop choices and one request action", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const primary = screen.getByRole("navigation", { name: /primary navigation/i });
    expect(primary.classList.contains("hidden")).toBe(true);
    expect(primary.classList.contains("xl:flex")).toBe(true);
    expect(within(primary).getByRole("button", { name: /services/i })).toBeTruthy();
    expect(within(primary).getByRole("link", { name: "Projects" }).getAttribute("href")).toBe("/projects");
    expect(within(primary).getByRole("link", { name: "Reviews" }).getAttribute("href")).toBe("/reviews");
    expect(within(primary).getByRole("button", { name: /service areas/i })).toBeTruthy();
    expect(primary.textContent).not.toMatch(/Book Online|Contact|About|Blog|Español|More/);

    const requestService = screen.getByRole("link", { name: "Request Service" });
    expect(requestService.getAttribute("href")).toBe("/contact");
  });

  it("links service and coverage dropdowns to existing destination pages", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const servicesTrigger = screen.getByRole("button", { name: /services/i });
    await user.click(servicesTrigger);
    expect(screen.getByRole("menuitem", { name: "24/7 Emergency HVAC" }).getAttribute("href")).toBe(
      "/services/emergency-hvac-repair-westchester-county-ny",
    );
    expect(screen.getByRole("menuitem", { name: "All Services" }).getAttribute("href")).toBe("/services");
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(servicesTrigger);

    const serviceAreasTrigger = screen.getByRole("button", { name: /service areas/i });
    await user.click(serviceAreasTrigger);
    expect(screen.getByRole("menuitem", { name: "Yonkers" }).getAttribute("href")).toBe(
      "/service-areas/yonkers",
    );
    expect(screen.getByRole("menuitem", { name: "View All Service Areas" }).getAttribute("href")).toBe(
      "/service-areas",
    );
  });

  it("marks a desktop group active for one of its child routes", () => {
    render(
      <MemoryRouter initialEntries={["/services/ac-repair-westchester-county-ny"]}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /services/i }).getAttribute("aria-current")).toBe("page");
  });

  it("marks service areas active for a city route", () => {
    render(
      <MemoryRouter initialEntries={["/service-areas/yonkers"]}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /service areas/i }).getAttribute("aria-current")).toBe(
      "page",
    );
  });
});

describe("loader, project proof, and contextual actions", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
    window.history.replaceState({}, "", "/");
  });

  it("announces a lazy route load while keeping the spinner decorative", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    window.history.replaceState({}, "", "/services");
    const { default: App } = await import("../App");

    render(<App />);

    const loader = screen.getByRole("status");
    expect(loader.getAttribute("aria-live")).toBe("polite");
    expect(within(loader).getByText("Loading page…")).toBeTruthy();
    expect(loader.querySelector(".page-loader__spinner")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("disables the page-loader animation when reduced motion is requested", () => {
    const css = readFileSync(resolve(import.meta.dirname, "../index.css"), "utf8");

    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(css).toMatch(/\.page-loader__spinner\s*\{[^}]*animation:\s*none/s);
  });

  it("reserves image space and presents verified proof on project cards", async () => {
    const { container } = render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>,
    );

    const crmImage = await screen.findByAltText("Published CRM project");
    expect(crmImage.getAttribute("width")).toBe("1200");
    expect(crmImage.getAttribute("height")).toBe("900");

    const projectImages = Array.from(container.querySelectorAll("figure img"));
    expect(projectImages.length).toBeGreaterThan(1);
    projectImages.forEach((image) => {
      expect(Number(image.getAttribute("width"))).toBeGreaterThan(0);
      expect(Number(image.getAttribute("height"))).toBeGreaterThan(0);
    });

    const boilerProof = screen.getByText(/Yonkers.*Gas boiler replacement/i).closest("figure");
    expect(boilerProof).not.toBeNull();
    expect(within(boilerProof!).getByText(/Aging steam boiler with uneven heat and leaks/i)).toBeTruthy();
    expect(within(boilerProof!).getByRole("link", { name: /boiler installation service/i }).getAttribute("href")).toBe(
      "/services/boiler-installation-westchester-county-ny",
    );
  });

  it("uses explicit transition properties on the homeowner system cards", () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>,
    );

    const card = document.querySelector<HTMLAnchorElement>('a[href="/services/heat-pumps"]');
    if (!card) throw new Error("Expected the heat-pump homeowner system card");
    expect(card.classList.contains("transition-all")).toBe(false);
    expect(card.classList.contains("transition-[border-color,box-shadow]")).toBe(true);
  });

  it("names each service request action for the service it belongs to", () => {
    render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>,
    );

    [
      "HVAC Installation",
      "HVAC Repair",
      "Preventive Maintenance",
      "Indoor Air Quality",
      "Residential HVAC",
      "Commercial HVAC",
    ].forEach((title) => {
      expect(screen.getByRole("link", { name: `Request ${title}` })).toBeTruthy();
    });
  });

  it("keeps one city estimate action and links each service card descriptively", () => {
    render(
      <MemoryRouter initialEntries={["/service-areas/ardsley"]}>
        <Routes>
          <Route path="/service-areas/:slug" element={<CityPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const main = screen.getByRole("main");
    expect(within(main).getAllByRole("link", { name: /get a free estimate/i })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "HVAC Installation services →" }).getAttribute("href")).toBe(
      "/services/hvac-installation",
    );
    expect(screen.queryByRole("link", { name: "View all services →" })).toBeNull();
  });
});

describe("task-specific booking and contact presentation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("summarizes the booking task without the generic estimate hero action", () => {
    const router = createMemoryRouter([{ path: "*", element: <BookOnline /> }]);
    render(<RouterProvider router={router} />);

    const summary = screen.getByRole("complementary", { name: /online booking summary/i });
    const hero = screen.getByRole("heading", { name: "Pick a Day. Pick a Window. Done." }).closest("section");
    expect(summary.textContent).toContain("About 1 minute");
    expect(summary.textContent).toContain("Confirmation by text");
    expect(summary.textContent).toContain("No payment required");
    expect(hero).not.toBeNull();
    expect(within(hero!).queryByRole("link", { name: /get a free estimate/i })).toBeNull();
  });

  it("uses compact hero spacing when requested", () => {
    render(
      <MemoryRouter>
        <PageHero title="Compact task" compact hideRightSlot />
      </MemoryRouter>,
    );

    const heroContainer = screen.getByRole("heading", { name: "Compact task" }).parentElement
      ?.parentElement?.parentElement;
    expect(heroContainer?.classList.contains("py-8")).toBe(true);
    expect(heroContainer?.classList.contains("lg:py-14")).toBe(true);
  });

  it("puts contact actions in the hero and the request form before location content", () => {
    const router = createMemoryRouter([{ path: "*", element: <Contact /> }]);
    render(<RouterProvider router={router} />);

    const actions = screen.getByRole("complementary", { name: /call or text bravo mechanical/i });
    expect(actions.textContent).toContain("Call for fastest response");
    expect(actions.textContent).toContain("Text us — fastest for photos");

    const form = screen.getByRole("button", { name: /request my estimate/i }).closest("form");
    const location = screen.getByRole("complementary", { name: /location and hours/i });
    expect(form).not.toBeNull();
    expect(form!.compareDocumentPosition(location) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("uses an AA-intended emergency phone color and keeps the map outside its link", () => {
    const router = createMemoryRouter([{ path: "*", element: <Contact /> }]);
    render(<RouterProvider router={router} />);

    const emergencyPanel = screen.getByText("Emergency HVAC service").parentElement;
    const panelPhone = emergencyPanel?.querySelector(`a[href="${SITE.phoneHref}"]`);
    expect(panelPhone?.classList.contains("text-foreground")).toBe(true);

    const map = screen.getByTitle("Bravo Mechanical Google Business Profile Map");
    expect(map.closest("a")).toBeNull();
    expect(screen.getByRole("link", { name: /open in google maps/i }).getAttribute("href")).toBe(
      SITE.social.google,
    );
  });
});

describe("recoverable lead forms", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.resetModules();
    supabaseTestState.insert.mockReset();
  });

  const createDeferredInsert = () => {
    let resolve!: (result: { error: Error | null }) => void;
    const promise = new Promise<{ error: Error | null }>((complete) => {
      resolve = complete;
    });
    return { promise, resolve };
  };

  const expectUnloadProtection = (protectedFromUnload: boolean) => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(protectedFromUnload);
  };

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

  it("validates booking contact formats and clears stale guidance after correction", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([{ path: "*", element: <BookOnline /> }]);
    render(<RouterProvider router={router} />);

    await user.type(screen.getByLabelText(/^name/i), "Jordan Lee");
    const phone = screen.getByLabelText(/mobile phone/i);
    const email = screen.getByLabelText(/^email/i);
    await user.type(phone, "abc9145551234");
    await user.type(email, "not-an-email");
    await user.click(screen.getByRole("button", { name: "AC Repair" }));
    await user.click(screen.getAllByRole("button", { name: /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),/ })[0]);
    await user.click(screen.getByRole("button", { name: "Morning (8am–11am)" }));
    await user.click(screen.getByRole("button", { name: /book my visit/i }));

    expect(document.activeElement).toBe(phone);
    expect(phone.getAttribute("aria-invalid")).toBe("true");

    await user.clear(phone);
    await user.type(phone, "914-555-1234");
    await user.click(screen.getByRole("button", { name: /book my visit/i }));

    expect(document.activeElement).toBe(email);
    expect(email.getAttribute("aria-invalid")).toBe("true");

    await user.clear(email);
    await user.type(email, "jordan@example.com");

    expect(email.getAttribute("aria-invalid")).toBe("false");
    expect(screen.getByText("Required fields are marked with an asterisk.")).toBeTruthy();
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

  it("keeps a booking protected through pending and failed persistence, then releases it after success", async () => {
    const firstInsert = createDeferredInsert();
    supabaseTestState.insert
      .mockReturnValueOnce(firstInsert.promise)
      .mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    const router = createMemoryRouter([{ path: "*", element: <BookOnline /> }]);
    render(<RouterProvider router={router} />);

    await user.type(screen.getByLabelText(/^name/i), "Jordan Lee");
    await user.type(screen.getByLabelText(/mobile phone/i), "9145551234");
    await user.click(screen.getByRole("button", { name: "AC Repair" }));
    await user.click(screen.getAllByRole("button", { name: /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),/ })[0]);
    await user.click(screen.getByRole("button", { name: "Morning (8am–11am)" }));
    await user.click(screen.getByRole("button", { name: /book my visit/i }));

    expect(screen.getByRole("button", { name: /booking/i }).hasAttribute("disabled")).toBe(true);
    expectUnloadProtection(true);

    fireEvent.submit(screen.getByRole("button", { name: /booking/i }).closest("form")!);
    expect(supabaseTestState.insert).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Complete your name, mobile phone, service, day, and time window.")).toBeNull();

    firstInsert.resolve({ error: new Error("insert failed") });
    expect(await screen.findByText(/something went wrong/i)).toBeTruthy();
    expectUnloadProtection(true);

    await user.click(screen.getByRole("button", { name: /book my visit/i }));
    expect(await screen.findByRole("heading", { name: /you're on the board/i })).toBeTruthy();
    expectUnloadProtection(false);
  });

  it("keeps a contact lead protected through pending and failed persistence, then releases it after success", async () => {
    const firstInsert = createDeferredInsert();
    supabaseTestState.insert
      .mockReturnValueOnce(firstInsert.promise)
      .mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    const router = createMemoryRouter([
      {
        path: "*",
        element: (
          <LeadForm
            defaultService="AC Repair"
            defaultMessage="The system is not cooling."
          />
        ),
      },
    ]);
    render(<RouterProvider router={router} />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.type(screen.getByLabelText(/^phone/i), "9145551234");
    await user.type(screen.getByLabelText(/^email/i), "jordan@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /request my estimate/i }));

    expect(screen.getByRole("button", { name: /submitting/i }).hasAttribute("disabled")).toBe(true);
    expectUnloadProtection(true);

    firstInsert.resolve({ error: new Error("insert failed") });
    expect(await screen.findByRole("button", { name: /request my estimate/i })).toBeTruthy();
    expectUnloadProtection(true);

    await user.click(screen.getByRole("button", { name: /request my estimate/i }));
    expect(await screen.findByText(/thanks — we got your request/i)).toBeTruthy();
    expectUnloadProtection(false);
  });
});
