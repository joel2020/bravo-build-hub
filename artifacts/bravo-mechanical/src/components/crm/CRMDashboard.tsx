import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Home,
  Inbox,
  LayoutDashboard,
  LineChart,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  Save,
  Settings,
  Shield,
  Smile,
  X,
  User,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { asCurrency, asDate, JOB_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";
import { SITE } from "@/lib/site";
import logo from "@/assets/logo-bravo.webp";
import hvacUnit from "@/assets/job-mini-split-exterior.webp";

type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
};

type KPIStat = {
  label: string;
  value: string;
  detail: string;
  delta: string;
  trend: "up" | "down";
  icon: ComponentType<{ className?: string }>;
  color: string;
};

type Job = {
  customer: string;
  service: string;
  urgency: "High" | "Medium" | "Low";
  detail: string;
  address: string;
  phone: string;
  status?: string;
  timeAgo?: string;
  avatar: string;
  image?: string;
};

type DispatchColumnData = {
  title: string;
  count: number;
  jobs: Job[];
};

type Conversation = {
  name: string;
  preview: string;
  time: string;
  active?: boolean;
  unread?: number;
  avatar: string;
  phone: string;
  messages: ThreadMessage[];
};

type ThreadMessage = {
  id: number;
  body: string;
  direction: "inbound" | "outbound";
};

type DashboardSection = "dashboard" | "jobs" | "dispatch" | "leads" | "followups" | "alerts" | "messages" | "myjobs" | "invoices" | "activity" | "settings";

type DashboardProps = {
  searchQuery?: string;
  onNavigate?: (section: DashboardSection) => void;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "jobs", label: "Jobs", icon: CalendarDays },
  { id: "dispatch", label: "Dispatch Board", icon: MessageSquare },
  { id: "leads", label: "Customers (CRM)", icon: Users },
  { id: "followups", label: "Follow-Ups", icon: CalendarClock },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "myjobs", label: "Technicians", icon: User },
  { id: "invoices", label: "Invoices", icon: ClipboardList },
  { id: "activity", label: "Activity Log", icon: LineChart },
  { id: "settings", label: "Settings", icon: Settings },
];

// Presentation template for the five headline metrics. Values are filled in
// from live Supabase data in CRMDashboard — never hardcoded.
const KPI_META: Array<Pick<KPIStat, "label" | "icon" | "color"> & { key: string }> = [
  { key: "todayJobs", label: "Today's Jobs", icon: CalendarDays, color: "from-blue-500 to-blue-600" },
  { key: "openJobs", label: "Open Jobs", icon: ClipboardList, color: "from-orange-400 to-orange-500" },
  { key: "newLeads", label: "New Leads", icon: MessageSquare, color: "from-indigo-500 to-violet-600" },
  { key: "revenueMonth", label: "Revenue (This Month)", icon: DollarSign, color: "from-green-500 to-green-600" },
  { key: "outstanding", label: "Outstanding", icon: DollarSign, color: "from-rose-500 to-rose-600" },
];

const conversations: Conversation[] = [
  {
    name: "Sarah Thompson",
    preview: "Hey, my AC is blowing warm...",
    time: "2m",
    active: true,
    unread: 2,
    avatar: "ST",
    phone: "2145550198",
    messages: [
      { id: 1, direction: "inbound", body: "Hey, my AC is blowing warm air and it's 90 degrees in my house. Can someone come out today?" },
      { id: 2, direction: "outbound", body: "I'm sorry to hear that! We can definitely get someone out today." },
      { id: 3, direction: "inbound", body: "That would be great, thanks!" },
    ],
  },
  {
    name: "Michael Johnson",
    preview: "Thanks! See you at 10am.",
    time: "10m",
    avatar: "MJ",
    phone: "2145550140",
    messages: [
      { id: 1, direction: "outbound", body: "You're confirmed for today at 10:00 AM." },
      { id: 2, direction: "inbound", body: "Thanks! See you at 10am." },
    ],
  },
  {
    name: "James Wilson",
    preview: "Can I get an estimate?",
    time: "15m",
    avatar: "JW",
    phone: "2145550124",
    messages: [
      { id: 1, direction: "inbound", body: "My furnace keeps short cycling. Can I get an estimate?" },
    ],
  },
  {
    name: "Emily Carter",
    preview: "Sounds good, thank you!",
    time: "30m",
    avatar: "EC",
    phone: "2145550160",
    messages: [
      { id: 1, direction: "outbound", body: "We can do the maintenance visit tomorrow morning." },
      { id: 2, direction: "inbound", body: "Sounds good, thank you!" },
    ],
  },
  {
    name: "Robert Martinez",
    preview: "No problem!",
    time: "1h",
    avatar: "RM",
    phone: "2145550137",
    messages: [
      { id: 1, direction: "outbound", body: "The technician may arrive closer to 2:00 PM." },
      { id: 2, direction: "inbound", body: "No problem!" },
    ],
  },
  {
    name: "Melissa Brown",
    preview: "What's included?",
    time: "2h",
    unread: 1,
    avatar: "MB",
    phone: "2145550129",
    messages: [
      { id: 1, direction: "inbound", body: "What's included in the spring maintenance visit?" },
    ],
  },
];


const avatarColors = ["bg-slate-900", "bg-blue-600", "bg-emerald-600", "bg-orange-500", "bg-indigo-600", "bg-rose-500"];

const Avatar = ({ label, size = "md", className }: { label: string; size?: "sm" | "md" | "lg"; className?: string }) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white shadow-sm ring-2 ring-white",
      size === "sm" && "h-7 w-7 text-[10px]",
      size === "md" && "h-9 w-9 text-xs",
      size === "lg" && "h-11 w-11 text-sm",
      className,
    )}
  >
    {label}
  </div>
);

export const Sidebar = ({ activeView = "dashboard", onSelect, mobile = false }: { activeView?: string; onSelect?: (id: string) => void; mobile?: boolean }) => (
  <aside className={mobile ? "flex h-full w-full flex-col bg-white/95 px-3.5 py-5" : "fixed inset-y-0 left-0 z-30 hidden w-[244px] border-r border-slate-200 bg-white/95 px-3.5 py-5 shadow-[18px_0_45px_rgba(15,23,42,0.04)] backdrop-blur-xl lg:flex lg:flex-col"}>
    <div className="mb-6 flex items-center gap-2.5 px-2">
      <img src={logo} alt="Bravo Mechanical" className="h-11 w-11 object-contain" />
      <div className="leading-tight">
        <div className="text-[23px] font-black uppercase tracking-[-0.04em] text-blue-950">Bravo</div>
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-950">Mechanical</div>
      </div>
    </div>

    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition",
              active ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">{item.badge}</span>}
          </button>
        );
      })}
    </nav>

    <div className="mt-auto space-y-3">
      <div className="overflow-hidden rounded-md">
        <img src={hvacUnit} alt="Outdoor HVAC unit" className="h-40 w-full object-cover" />
      </div>
      <SidebarUserCard />
      <button type="button" onClick={() => onSelect?.("alerts")} className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
        <span className="flex items-center gap-3"><Bell className="h-4 w-4" />Notifications</span>
      </button>
    </div>
  </aside>
);

const SidebarUserCard = () => {
  const [email, setEmail] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);
  const initials = (email.split("@")[0] || "BM").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-white p-2.5 shadow-sm">
      <Avatar label={initials} size="sm" className="bg-slate-800" />
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-slate-950">{email || "Signed in"}</div>
        <div className="text-xs text-slate-500">Bravo Mechanical</div>
      </div>
    </div>
  );
};

export const TopBar = ({
  onSignOut,
  onNewJob,
  onMenuClick,
  onSelect,
  searchQuery = "",
  onSearchChange,
}: {
  onSignOut?: () => void;
  onNewJob?: () => void;
  onMenuClick?: () => void;
  onSelect?: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}) => {
  const [notifCount, setNotifCount] = useState(0);
  const [notifs, setNotifs] = useState<{id:string;title:string;message:string;read:boolean;created_at:string}[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("crm_notifications" as any)
        .select("id,title,message,read,created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) {
        setNotifs(data as any[]);
        setNotifCount((data as any[]).filter((n: any) => !n.read).length);
      }
    })();
  }, [notifOpen]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email || ""));
  }, []);

  const markAllRead = async () => {
    // Keep both read flags in sync — the Alerts screen tracks read_at.
    await supabase.from("crm_notifications" as any).update({ read: true, read_at: new Date().toISOString() } as any).eq("read", false);
    setNotifCount(0);
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  };

  const userInitials = (userEmail.split("@")[0] || "BM").slice(0, 2).toUpperCase();

  return (
  <header className="sticky top-0 z-20 border-b border-transparent bg-slate-50/90 px-4 py-3 backdrop-blur-xl lg:px-5 xl:px-6">
    <div className="flex h-11 items-center gap-3">
      <button type="button" onClick={onMenuClick} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-white lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
      <div className="relative mx-auto hidden h-10 max-w-[640px] flex-1 md:block">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className="h-full w-full rounded-md border border-slate-200 bg-white pl-10 pr-14 text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search customers, jobs, invoices, or phone numbers..."
          value={searchQuery}
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
        {searchQuery ? (
          <button type="button" onClick={() => onSearchChange?.("")} className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">⌘K</span>
        )}
      </div>
      <button type="button" onClick={onNewJob} className="ml-auto inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-md hover:bg-blue-700 md:ml-0">
        <Plus className="h-4 w-4" /> New Job
      </button>

      {/* Notification bell */}
      <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
        <DropdownMenuTrigger asChild>
          <button type="button" className="relative hidden h-9 w-9 items-center justify-center rounded-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 md:flex">
            <Bell className="h-4 w-4" />
            {notifCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{notifCount}</span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {notifCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
            )}
          </div>
          <DropdownMenuSeparator />
          {notifs.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-400">No notifications</p>
          ) : (
            notifs.slice(0,8).map(n => (
              <DropdownMenuItem key={n.id} className={`cursor-default px-3 py-2 ${!n.read ? "bg-blue-50/60" : ""}`}>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="hidden items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white focus:outline-none md:flex">
            <Avatar label={userInitials} size="md" className="bg-slate-800" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            <ChevronDown className="h-4 w-4 text-slate-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-900">{userEmail || "Signed in"}</p>
            <p className="text-xs text-slate-500">Bravo Mechanical</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
  );
};


export const KPIStatCard = ({ stat }: { stat: KPIStat }) => {
  const Icon = stat.icon;
  return (
    <div className="flex h-[92px] items-center gap-4 rounded-md border border-slate-200 bg-white px-4 shadow-[0_12px_32px_rgba(15,23,42,0.055)]">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-white shadow-lg", stat.color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-slate-700">{stat.label}</div>
        <div className="mt-1 flex items-end gap-1.5">
          <div className="text-[25px] font-black leading-none tracking-tight text-slate-950">{stat.value}</div>
          {stat.delta && <div className={cn("text-xs font-bold", stat.trend === "up" ? "text-emerald-600" : "text-rose-600")}>{stat.trend === "up" ? "+" : "-"} {stat.delta}</div>}
        </div>
        <div className="mt-1 text-xs text-slate-500">{stat.detail}</div>
      </div>
    </div>
  );
};

const formatPhone = (phone: string) => `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;

const includesQuery = (values: Array<string | null | undefined>, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.join(" ").toLowerCase().includes(normalized);
};

export const ConversationList = ({
  items,
  activeName,
  onSelect,
}: {
  items: Conversation[];
  activeName: string;
  onSelect: (name: string) => void;
}) => (
  <div className="w-[36%] min-w-[168px] max-w-[220px] border-r border-slate-200">
    <div className="border-b border-slate-200 p-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none" placeholder="Search conversations..." />
      </div>
    </div>
    <div className="space-y-0.5 p-2">
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 p-3 text-xs font-medium text-slate-400">No conversations found.</p>
      ) : items.map((conversation, index) => (
        <button
          key={conversation.name}
          type="button"
          onClick={() => onSelect(conversation.name)}
          className={cn("flex w-full items-center gap-2.5 rounded-md p-2 text-left", activeName === conversation.name ? "bg-blue-50" : "hover:bg-slate-50")}
        >
          <Avatar label={conversation.avatar} size="sm" className={avatarColors[index % avatarColors.length]} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-black text-slate-950">{conversation.name}</div>
            <div className="truncate text-xs text-slate-500">{conversation.preview}</div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-[10px] font-semibold text-slate-500">{conversation.time}</div>
            {conversation.unread && <div className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{conversation.unread}</div>}
          </div>
        </button>
      ))}
    </div>
    <button type="button" className="mt-4 w-full border-t border-slate-200 py-3 text-xs font-bold text-blue-600">Show all conversations</button>
  </div>
);

export const AISuggestionBox = ({ onPickSuggestion }: { onPickSuggestion: (suggestion: string) => void }) => {
  const suggestions = [
    "We can have a tech there between 1-3pm today.",
    "Thanks! Our tech is on the way and will call you shortly.",
    "We can definitely help! What's the best address to send the tech?",
  ];

  return (
  <div className="rounded-md border border-slate-200 bg-white p-2.5">
    <div className="mb-2 flex items-center justify-between">
      <div className="text-xs font-black text-slate-700">AI Reply Suggestions</div>
      <button type="button" onClick={() => onPickSuggestion("Hi, this is Bravo Mechanical. We can help today. Please confirm the address and whether the system is still running so we can dispatch the right technician.")} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">Suggest reply</button>
    </div>
    <div className="space-y-1.5">
      {suggestions.map((suggestion) => (
        <button key={suggestion} type="button" onClick={() => onPickSuggestion(suggestion)} className="block w-full rounded-md bg-blue-50 px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-blue-100">
          {suggestion}
        </button>
      ))}
    </div>
  </div>
  );
};

export const MessageThread = ({
  conversation,
  composer,
  onComposerChange,
  onSend,
  onPickSuggestion,
}: {
  conversation: Conversation;
  composer: string;
  onComposerChange: (value: string) => void;
  onSend: () => void;
  onPickSuggestion: (suggestion: string) => void;
}) => (
  <div className="flex min-w-0 flex-1 flex-col">
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar label={conversation.avatar} className="bg-slate-900" />
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-slate-950">{conversation.name}</div>
          <div className="text-xs text-slate-500">{formatPhone(conversation.phone)}</div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <a href={`tel:${conversation.phone}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"><Phone className="h-4 w-4" /></a>
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"><MoreHorizontal className="h-4 w-4" /></button>
      </div>
    </div>
    <div className="flex-1 space-y-3 p-3">
      {conversation.messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "max-w-[78%] rounded-md px-3 py-2.5 text-xs font-medium leading-5",
            message.direction === "outbound" ? "ml-auto bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-800",
          )}
        >
          {message.body}
        </div>
      ))}
      <AISuggestionBox onPickSuggestion={onPickSuggestion} />
    </div>
    <div className="border-t border-slate-200 p-2.5">
      <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5">
        <input
          className="min-w-0 flex-1 text-sm outline-none placeholder:text-slate-400"
          placeholder="Type a message..."
          value={composer}
          onChange={(event) => onComposerChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSend();
          }}
        />
        <Smile className="h-4 w-4 text-slate-500" />
        <button type="button" onClick={onSend} className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white"><Send className="h-4 w-4" /></button>
      </div>
    </div>
  </div>
);

export const SMSInbox = ({ searchQuery = "" }: { searchQuery?: string }) => {
  const [threads, setThreads] = useState(conversations);
  const [activeName, setActiveName] = useState(conversations[0].name);
  const [composer, setComposer] = useState("");
  const filteredThreads = useMemo(
    () => threads.filter((conversation) => includesQuery([conversation.name, conversation.preview, conversation.phone, ...conversation.messages.map((message) => message.body)], searchQuery)),
    [threads, searchQuery],
  );
  const activeConversation = threads.find((conversation) => conversation.name === activeName) || filteredThreads[0] || threads[0];

  const selectConversation = (name: string) => {
    setActiveName(name);
    setComposer("");
  };

  const sendLocalMessage = () => {
    const body = composer.trim();
    if (!body) return;
    setThreads((current) => current.map((conversation) => {
      if (conversation.name !== activeConversation.name) return conversation;
      return {
        ...conversation,
        preview: body,
        time: "now",
        unread: undefined,
        messages: [...conversation.messages, { id: Date.now(), direction: "outbound", body }],
      };
    }));
    setComposer("");
  };

  return (
  <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 className="text-lg font-black tracking-tight text-slate-950">SMS Inbox</h2>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live</span>
    </div>
    <div className="flex h-[490px] min-w-0 overflow-hidden">
      <ConversationList items={filteredThreads} activeName={activeConversation.name} onSelect={selectConversation} />
      <MessageThread conversation={activeConversation} composer={composer} onComposerChange={setComposer} onSend={sendLocalMessage} onPickSuggestion={setComposer} />
    </div>
  </section>
  );
};

// ----- Live dashboard data model (everything below is real Supabase data) -----
type DashJob = {
  id: string;
  title: string | null;
  status: string;
  scheduled_date: string | null;
  amount: number | null;
  address: string | null;
  technician_id: string | null;
  leads: { name: string | null; phone: string | null } | null;
  technicians: { name: string | null } | null;
};
type DashLead = { id: string; name: string | null; service: string | null; phone: string | null; status: string; created_at: string };
type DashInvoice = { id: string; invoice_number: string | null; amount: number | null; status: string; due_date: string | null; paid_date: string | null; leads: { name: string | null } | null };
type DashActivity = { id: string; title: string | null; description: string | null; created_at: string };

const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayOf = (value: string | null | undefined) => (value ? value.slice(0, 10) : "");
const CLOSED_JOB = new Set(["completed", "cancelled"]);
const NON_OWED_INVOICE = new Set(["paid", "cancelled", "draft"]);
const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

const jobBadge = (status: string) => STATUS_BADGE_CLASS[status] || "bg-slate-100 text-slate-700";

const DashJobCard = ({ job, onOpen }: { job: DashJob; onOpen?: () => void }) => (
  <button type="button" onClick={onOpen} className="w-full rounded-md border border-slate-100 bg-white p-2.5 text-left shadow-[0_8px_20px_rgba(15,23,42,0.045)] transition hover:border-blue-200 hover:shadow-[0_10px_24px_rgba(37,99,235,0.1)]">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="truncate text-xs font-black text-slate-950">{job.leads?.name || job.title || "Job"}</div>
        <div className="truncate text-[11px] font-medium text-slate-500">{job.title || "Untitled job"}</div>
      </div>
      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", jobBadge(job.status))}>{JOB_STATUS_LABELS[job.status] || job.status}</span>
    </div>
    {job.address && <div className="mt-1 truncate text-[11px] text-slate-500">{job.address}</div>}
    <div className="mt-1.5 flex items-center justify-between">
      <span className="text-[11px] font-semibold text-slate-500">{job.technicians?.name || "Unassigned"}</span>
      <span className="text-[11px] font-bold text-slate-900">{asCurrency(job.amount)}</span>
    </div>
  </button>
);

const SnapshotColumn = ({ title, accent, jobs, onOpen }: { title: string; accent: string; jobs: DashJob[]; onOpen?: () => void }) => (
  <section className="min-w-0 rounded-md bg-slate-50 p-2">
    <div className="mb-2 flex items-center justify-between px-1">
      <div className="flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", accent)} /><h3 className="text-[13px] font-black text-slate-950">{title}</h3></div>
      <span className="text-xs font-bold text-slate-500">{jobs.length}</span>
    </div>
    <div className="space-y-2">
      {jobs.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 bg-white p-3 text-xs font-medium text-slate-400">Nothing here.</p>
      ) : jobs.map((job) => <DashJobCard key={job.id} job={job} onOpen={onOpen} />)}
    </div>
  </section>
);

export const CRMDashboard = ({ searchQuery = "", onNavigate }: DashboardProps) => {
  const [jobs, setJobs] = useState<DashJob[]>([]);
  const [leads, setLeads] = useState<DashLead[]>([]);
  const [invoices, setInvoices] = useState<DashInvoice[]>([]);
  const [activity, setActivity] = useState<DashActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [jobRes, leadRes, invRes, actRes] = await Promise.all([
        supabase.from("jobs").select("id, title, status, scheduled_date, amount, address, technician_id, leads(name, phone), technicians(name)").order("scheduled_date", { ascending: true }),
        supabase.from("leads").select("id, name, service, phone, status, created_at").order("created_at", { ascending: false }).limit(100),
        supabase.from("invoices").select("id, invoice_number, amount, status, due_date, paid_date, leads(name)").order("created_at", { ascending: false }).limit(200),
        // activity_logs is written by createActivity() but isn't in the generated
        // Supabase types yet, so cast like the rest of the codebase does.
        supabase.from("activity_logs" as any).select("id, title, description, created_at").order("created_at", { ascending: false }).limit(8),
      ]);
      if (cancelled) return;
      setJobs((jobRes.data as DashJob[]) || []);
      setLeads((leadRes.data as DashLead[]) || []);
      setInvoices((invRes.data as DashInvoice[]) || []);
      setActivity((actRes.data as unknown as DashActivity[]) || []);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const today = localDate(new Date());
  const month = today.slice(0, 7);

  const stats = useMemo(() => {
    const openJobs = jobs.filter((job) => !CLOSED_JOB.has(job.status));
    const revenueMonth = invoices.filter((inv) => inv.status === "paid" && dayOf(inv.paid_date).startsWith(month)).reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const outstanding = invoices.filter((inv) => !NON_OWED_INVOICE.has(inv.status)).reduce((sum, inv) => sum + (inv.amount || 0), 0);
    return {
      todayJobs: openJobs.filter((job) => dayOf(job.scheduled_date) === today).length,
      openJobs: openJobs.length,
      newLeads: leads.filter((lead) => lead.status === "new").length,
      revenueMonth: asCurrency(revenueMonth),
      outstanding: asCurrency(outstanding),
    } as Record<string, string | number>;
  }, [jobs, leads, invoices, today, month]);

  const kpis: KPIStat[] = useMemo(() => KPI_META.map((meta) => ({
    label: meta.label,
    icon: meta.icon,
    color: meta.color,
    value: String(stats[meta.key] ?? 0),
    detail: {
      todayJobs: "scheduled today",
      openJobs: "active jobs",
      newLeads: "awaiting response",
      revenueMonth: "paid this month",
      outstanding: "unpaid invoices",
    }[meta.key] || "",
    delta: "",
    trend: "up" as const,
  })), [stats]);
  const filteredKpis = useMemo(() => kpis.filter((stat) => includesQuery([stat.label, stat.value, stat.detail], searchQuery)), [kpis, searchQuery]);

  const openJobs = useMemo(() => jobs.filter((job) => !CLOSED_JOB.has(job.status) && includesQuery([job.title, job.leads?.name, job.address, job.technicians?.name], searchQuery)), [jobs, searchQuery]);
  const snapshot = useMemo(() => ({
    today: openJobs.filter((job) => dayOf(job.scheduled_date) === today),
    upcoming: openJobs.filter((job) => dayOf(job.scheduled_date) > today),
    unscheduled: openJobs.filter((job) => !job.scheduled_date),
  }), [openJobs, today]);

  const newLeads = useMemo(() => leads.filter((lead) => lead.status === "new" && includesQuery([lead.name, lead.service, lead.phone], searchQuery)), [leads, searchQuery]);
  const overdueInvoices = useMemo(() => invoices.filter((inv) => !NON_OWED_INVOICE.has(inv.status) && !!inv.due_date && dayOf(inv.due_date) < today && includesQuery([inv.invoice_number, inv.leads?.name], searchQuery)), [invoices, today, searchQuery]);

  const schedule = useMemo(() => {
    const groups = new Map<string, DashJob[]>();
    snapshot.today.forEach((job) => {
      const tech = job.technicians?.name || "Unassigned";
      if (!groups.has(tech)) groups.set(tech, []);
      groups.get(tech)!.push(job);
    });
    return Array.from(groups.entries());
  }, [snapshot.today]);

  const filteredActivity = useMemo(() => activity.filter((row) => includesQuery([row.title, row.description], searchQuery)), [activity, searchQuery]);

  if (loading) {
    return <div className="rounded-md border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500">Loading your dashboard…</div>;
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {filteredKpis.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-white p-4 text-sm font-medium text-slate-400 md:col-span-2 xl:col-span-5">No matching metrics.</div>
        ) : filteredKpis.map((stat) => <KPIStatCard key={stat.label} stat={stat} />)}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Jobs</h2>
            <button type="button" onClick={() => onNavigate?.("dispatch")} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">Open dispatch <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <SnapshotColumn title="Today" accent="bg-blue-500" jobs={snapshot.today} onOpen={() => onNavigate?.("dispatch")} />
            <SnapshotColumn title="Upcoming" accent="bg-violet-500" jobs={snapshot.upcoming} onOpen={() => onNavigate?.("dispatch")} />
            <SnapshotColumn title="Unscheduled" accent="bg-amber-500" jobs={snapshot.unscheduled} onOpen={() => onNavigate?.("dispatch")} />
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <h2 className="mb-3 text-lg font-black text-slate-950">Needs attention</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-500"><Users className="h-3.5 w-3.5" /> New leads</div>
                <button type="button" onClick={() => onNavigate?.("leads")} className="text-xs font-bold text-blue-600">View all</button>
              </div>
              {newLeads.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-200 p-3 text-xs font-medium text-slate-400">No new leads. You're all caught up.</p>
              ) : (
                <div className="space-y-1.5">
                  {newLeads.slice(0, 4).map((lead) => (
                    <div key={lead.id} className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 p-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-black text-slate-950">{lead.name || "New lead"}</div>
                        <div className="truncate text-[11px] font-medium text-slate-500">{lead.service || "General inquiry"} · {relativeTime(lead.created_at)}</div>
                      </div>
                      {lead.phone && <a href={`tel:${lead.phone}`} onClick={(event) => event.stopPropagation()} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"><Phone className="h-3.5 w-3.5" /></a>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-500"><DollarSign className="h-3.5 w-3.5" /> Overdue invoices</div>
                <button type="button" onClick={() => onNavigate?.("invoices")} className="text-xs font-bold text-blue-600">View all</button>
              </div>
              {overdueInvoices.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-200 p-3 text-xs font-medium text-slate-400">No overdue invoices.</p>
              ) : (
                <div className="space-y-1.5">
                  {overdueInvoices.slice(0, 4).map((inv) => (
                    <button key={inv.id} type="button" onClick={() => onNavigate?.("invoices")} className="flex w-full items-center gap-2 rounded-md border border-rose-100 bg-rose-50 p-2 text-left">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-black text-slate-950">{inv.leads?.name || inv.invoice_number || "Invoice"}</div>
                        <div className="truncate text-[11px] font-medium text-rose-600">Due {asDate(inv.due_date)}</div>
                      </div>
                      <span className="shrink-0 text-xs font-black text-rose-700">{asCurrency(inv.amount)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Today's Schedule</h2>
            <button type="button" onClick={() => onNavigate?.("dispatch")} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">Full schedule <ChevronRight className="h-4 w-4" /></button>
          </div>
          {schedule.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 p-4 text-sm font-medium text-slate-400">No jobs scheduled for today.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {schedule.map(([tech, techJobs], index) => (
                <div key={tech} className="border-l border-slate-200 pl-2.5">
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar label={tech.split(" ").map((part) => part[0]).join("").slice(0, 2)} size="sm" className={avatarColors[index % avatarColors.length]} />
                    <div className="truncate text-sm font-black text-slate-800">{tech}</div>
                  </div>
                  <div className="space-y-1.5">
                    {techJobs.map((job) => (
                      <div key={job.id} className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs text-blue-900">
                        <div className="font-black">{job.title || "Job"}</div>
                        <div className="truncate opacity-80">{job.leads?.name || job.address || ""}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Recent Activity</h2>
            <button type="button" onClick={() => onNavigate?.("activity")} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">View all <ChevronRight className="h-4 w-4" /></button>
          </div>
          {filteredActivity.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 p-4 text-sm font-medium text-slate-400">No activity yet.</p>
          ) : (
            <div className="space-y-2.5">
              {filteredActivity.map((row) => (
                <div key={row.id} className="flex items-start gap-2.5 border-b border-slate-100 pb-2.5 last:border-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Bell className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-slate-950">{row.title || "Activity"}</div>
                    {row.description && <div className="truncate text-xs font-medium text-slate-500">{row.description}</div>}
                  </div>
                  <div className="shrink-0 text-xs font-medium text-slate-500">{relativeTime(row.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export const CRMSettingsPanel = () => {
  const [users, setUsers] = useState<{user_id:string;role:string}[]>([]);
  const [emailsById, setEmailsById] = useState<Record<string,string>>({});
  const [savingRole, setSavingRole] = useState<string|null>(null);
  const [notifs, setNotifs] = useState({ new_lead: true, job_update: true, invoice_sent: true, job_complete: true });
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [templates, setTemplates] = useState({
    day_1: `Hi {name}, your {service} appointment is confirmed. Questions? Call ${SITE.phone}. — Bravo Mechanical`,
    follow_up: "Hi {name}, this is Bravo Mechanical following up on your recent service. How is everything working? — Bravo Mechanical",
    invoice: `Hi {name}, your invoice is ready. Please call ${SITE.phone} to pay or for questions. — Bravo Mechanical`,
  });
  const [editingTpl, setEditingTpl] = useState<string|null>(null);
  const [savingTpl, setSavingTpl] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase.from("user_roles" as any).select("user_id,role");
      if (roles) setUsers(roles as any[]);
      const { data: profiles } = await supabase.from("user_profiles" as any).select("id,email");
      if (profiles) setEmailsById(Object.fromEntries((profiles as any[]).map(p => [p.id, p.email])));
      const { data: s } = await supabase.from("settings" as any).select("key,value").in("key",["notif_new_lead","notif_job_update","notif_invoice_sent","notif_job_complete","sms_day_1","sms_follow_up","sms_invoice"]);
      if (s) {
        const m: Record<string,any> = {};
        (s as any[]).forEach(r => { m[r.key] = r.value; });
        setNotifs(n => ({
          new_lead: m.notif_new_lead !== undefined ? !!m.notif_new_lead : n.new_lead,
          job_update: m.notif_job_update !== undefined ? !!m.notif_job_update : n.job_update,
          invoice_sent: m.notif_invoice_sent !== undefined ? !!m.notif_invoice_sent : n.invoice_sent,
          job_complete: m.notif_job_complete !== undefined ? !!m.notif_job_complete : n.job_complete,
        }));
        setTemplates(t => ({
          day_1: m.sms_day_1 || t.day_1,
          follow_up: m.sms_follow_up || t.follow_up,
          invoice: m.sms_invoice || t.invoice,
        }));
      }
    })();
  }, []);

  const changeRole = async (userId: string, role: string) => {
    setSavingRole(userId);
    // user_roles is unique on (user_id, role) — not on user_id alone — so an
    // upsert with onConflict:"user_id" errors. Replace the user's role rows instead.
    const { error: delError } = await supabase.from("user_roles" as any).delete().eq("user_id", userId);
    if (delError) {
      setSavingRole(null);
      toast({ title: "Failed to update role", description: delError.message, variant: "destructive" });
      return;
    }
    const { error: insError } = await supabase.from("user_roles" as any).insert({ user_id: userId, role });
    if (insError) {
      setSavingRole(null);
      toast({ title: "Failed to update role", description: insError.message, variant: "destructive" });
      return;
    }
    const { data: roles } = await supabase.from("user_roles" as any).select("user_id,role");
    if (roles) setUsers(roles as any[]);
    setSavingRole(null);
    toast({ title: "Role updated" });
  };

  const saveNotifs = async () => {
    setSavingNotifs(true);
    const results = await Promise.all([
      supabase.from("settings" as any).upsert({ key:"notif_new_lead", value: notifs.new_lead }, { onConflict:"key" }),
      supabase.from("settings" as any).upsert({ key:"notif_job_update", value: notifs.job_update }, { onConflict:"key" }),
      supabase.from("settings" as any).upsert({ key:"notif_invoice_sent", value: notifs.invoice_sent }, { onConflict:"key" }),
      supabase.from("settings" as any).upsert({ key:"notif_job_complete", value: notifs.job_complete }, { onConflict:"key" }),
    ]);
    setSavingNotifs(false);
    const err = results.find((r) => r.error)?.error;
    toast(err
      ? { title: "Failed to save rules", description: err.message, variant: "destructive" }
      : { title: "Notification rules saved" });
  };

  const saveTemplate = async (key: string) => {
    setSavingTpl(true);
    const { error } = await supabase.from("settings" as any).upsert({ key: "sms_" + key, value: (templates as any)[key] }, { onConflict: "key" });
    setSavingTpl(false);
    setEditingTpl(null);
    if (error) {
      toast({ title: "Failed to save template", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Template saved" });
  };

  return (
    <div className="space-y-4">
      {/* Team & Permissions */}
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-950">Team & Permissions</h2>
        </div>
        {users.length === 0 ? (
          <p className="text-sm text-slate-500">No users found. Add users in Supabase Auth.</p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
            {users.map(u => (
              <div key={u.user_id} className="flex items-center justify-between px-4 py-3">
                <span className="min-w-0 truncate pr-3 text-xs font-semibold text-slate-700">{emailsById[u.user_id] || `${u.user_id.substring(0,16)}…`}</span>
                <Select value={u.role} onValueChange={v => changeRole(u.user_id, v)} disabled={savingRole === u.user_id}>
                  <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notification Rules */}
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-950">Notification Rules</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            { key: "new_lead", label: "New lead submitted" },
            { key: "job_update", label: "Job status changed" },
            { key: "invoice_sent", label: "Invoice sent" },
            { key: "job_complete", label: "Job completed" },
          ] as {key: keyof typeof notifs, label: string}[]).map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
              <input type="checkbox" className="h-4 w-4 rounded accent-blue-600" checked={notifs[key]} onChange={e => setNotifs(n => ({...n, [key]: e.target.checked}))} />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={saveNotifs} disabled={savingNotifs}>
          <Save className="mr-2 h-4 w-4" />{savingNotifs ? "Saving..." : "Save rules"}
        </Button>
      </section>

      {/* SMS Templates */}
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-950">SMS Templates</h2>
        </div>
        <div className="grid gap-3">
          {([
            { key: "day_1", label: "Day-1 Confirmation" },
            { key: "follow_up", label: "Follow-Up" },
            { key: "invoice", label: "Invoice Ready" },
          ] as {key: keyof typeof templates, label: string}[]).map(({ key, label }) => (
            <div key={key} className="rounded-md border border-slate-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <Label className="font-semibold">{label}</Label>
                <button className="text-xs text-blue-600 hover:underline" onClick={() => setEditingTpl(editingTpl === key ? null : key)}>
                  {editingTpl === key ? "Cancel" : "Edit"}
                </button>
              </div>
              {editingTpl === key ? (
                <div className="space-y-2">
                  <textarea className="w-full rounded-md border border-slate-200 p-2 text-sm" rows={3} value={(templates as any)[key]} onChange={e => setTemplates(t => ({...t, [key]: e.target.value}))} />
                  <Button size="sm" onClick={() => saveTemplate(key)} disabled={savingTpl}>
                    <Save className="mr-1 h-3 w-3" />{savingTpl ? "Saving..." : "Save"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-600">{(templates as any)[key]}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};


export const PlaceholderPanel = ({ title }: { title: string }) => (
  <div className="rounded-md border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
    <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
      <LayoutDashboard className="h-4 w-4" />
      Bravo Mechanical CRM
    </div>
    <h1 className="text-2xl font-black text-slate-950">{title}</h1>
    <p className="mt-2 max-w-2xl text-sm text-slate-600">
      This section keeps the existing CRM workflow available from the redesigned app shell.
    </p>
  </div>
);
