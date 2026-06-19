import {
  Bell,
  BriefcaseBusiness,
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
import logo from "@/assets/logo-bravo.webp";
import hvacUnit from "@/assets/job-mini-split-exterior.webp";
import technicianImage from "@/assets/hero-technician.webp";

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

type DashboardSection = "dashboard" | "jobs" | "dispatch" | "leads" | "messages" | "myjobs" | "invoices" | "activity" | "settings";

type DashboardProps = {
  searchQuery?: string;
  onNavigate?: (section: DashboardSection) => void;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "jobs", label: "Jobs", icon: CalendarDays },
  { id: "dispatch", label: "Dispatch Board", icon: MessageSquare },
  { id: "leads", label: "Customers (CRM)", icon: Users },
  { id: "messages", label: "Messages", icon: Mail, badge: "12" },
  { id: "myjobs", label: "Technicians", icon: User },
  { id: "invoices", label: "Invoices", icon: ClipboardList },
  { id: "activity", label: "Activity Log", icon: LineChart },
  { id: "settings", label: "Settings", icon: Settings },
];

const kpis: KPIStat[] = [
  { label: "Today's Jobs", value: "14", detail: "vs yesterday", delta: "27%", trend: "up", icon: CalendarDays, color: "from-blue-500 to-blue-600" },
  { label: "Revenue (Today)", value: "$5,680", detail: "vs yesterday", delta: "18%", trend: "up", icon: DollarSign, color: "from-green-500 to-green-600" },
  { label: "Open Jobs", value: "32", detail: "vs yesterday", delta: "8%", trend: "down", icon: ClipboardList, color: "from-orange-400 to-orange-500" },
  { label: "Unread Messages", value: "0", detail: "vs yesterday", delta: "33%", trend: "up", icon: MessageSquare, color: "from-indigo-500 to-violet-600" },
  { label: "Conversion Rate", value: "26%", detail: "vs last 7 days", delta: "12%", trend: "up", icon: LineChart, color: "from-teal-500 to-cyan-500" },
];

const dispatchColumns: DispatchColumnData[] = [
  {
    title: "New Leads",
    count: 5,
    jobs: [
      { customer: "Sarah Thompson", service: "AC Not Cooling", urgency: "High", detail: "2m ago", timeAgo: "2m ago", address: "123 Main St, Dallas, TX", phone: "2145550198", avatar: "ST", image: hvacUnit },
      { customer: "James Wilson", service: "Furnace Repair", urgency: "Medium", detail: "15m ago", timeAgo: "15m ago", address: "456 Oak Ave, Dallas, TX", phone: "2145550124", avatar: "JW", image: technicianImage },
      { customer: "Emily Carter", service: "AC Maintenance", urgency: "Low", detail: "1h ago", timeAgo: "1h ago", address: "789 Pine Rd, Dallas, TX", phone: "2145550160", avatar: "EC", image: hvacUnit },
      { customer: "Robert Martinez", service: "Heat Pump Issue", urgency: "High", detail: "2h ago", timeAgo: "2h ago", address: "321 Maple Dr, Dallas, TX", phone: "2145550137", avatar: "RM", image: technicianImage },
    ],
  },
  {
    title: "Scheduled",
    count: 8,
    jobs: [
      { customer: "Michael Johnson", service: "AC Installation", urgency: "Medium", detail: "Today, 10:00 AM", address: "1234 Cedar Ln, Dallas, TX", phone: "2145550140", avatar: "MJ" },
      { customer: "Brian Davis", service: "Heating Tune-Up", urgency: "Low", detail: "Today, 1:00 PM", address: "567 Birch St, Dallas, TX", phone: "2145550152", avatar: "BD" },
      { customer: "Amanda Lee", service: "AC Repair", urgency: "High", detail: "Today, 3:30 PM", address: "890 Spruce Dr, Dallas, TX", phone: "2145550185", avatar: "AL" },
      { customer: "Kevin White", service: "Duct Cleaning", urgency: "Low", detail: "Tomorrow, 9:00 AM", address: "432 Walnut St, Dallas, TX", phone: "2145550171", avatar: "KW" },
    ],
  },
  {
    title: "In Progress",
    count: 6,
    jobs: [
      { customer: "Daniel Anderson", service: "AC Repair", urgency: "High", detail: "Started 9:15 AM", address: "222 Park Ave, Dallas, TX", phone: "2145550182", avatar: "DA" },
      { customer: "Tyler Garcia", service: "Furnace Repair", urgency: "Medium", detail: "Started 10:30 AM", address: "333 Lakeview Dr, Dallas, TX", phone: "2145550133", avatar: "TG" },
      { customer: "Chris Martinez", service: "Heat Pump Repair", urgency: "Medium", detail: "Started 11:00 AM", address: "444 Hillcrest Rd, Dallas, TX", phone: "2145550190", avatar: "CM" },
    ],
  },
  {
    title: "Completed",
    count: 12,
    jobs: [
      { customer: "Steven Clark", service: "AC Maintenance", urgency: "Low", detail: "Completed 8:30 AM", address: "111 Forest Ln, Dallas, TX", phone: "2145550195", avatar: "SC" },
      { customer: "Justin Thomas", service: "Furnace Tune-Up", urgency: "Low", detail: "Completed 9:45 AM", address: "555 Brookside Dr, Dallas, TX", phone: "2145550157", avatar: "JT" },
      { customer: "Brandon Lee", service: "AC Repair", urgency: "Low", detail: "Completed 10:15 AM", address: "666 Meadow Ln, Dallas, TX", phone: "2145550168", avatar: "BL" },
    ],
  },
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

const schedule = [
  { tech: "Daniel Anderson", items: [["8:00 AM", "AC Maintenance", "111 Forest Ln", "green"], ["10:00 AM", "AC Repair", "222 Park Ave", "red"], ["1:00 PM", "Furnace Repair", "333 Lakeview Dr", "amber"]] },
  { tech: "Tyler Garcia", items: [["8:30 AM", "Duct Cleaning", "444 Hillcrest Rd", "blue"], ["11:00 AM", "Heat Pump Repair", "555 Brookside Dr", "red"], ["2:00 PM", "AC Installation", "666 Meadow Ln", "green"]] },
  { tech: "Chris Martinez", items: [["9:00 AM", "AC Repair", "777 Sunset Blvd", "red"], ["12:00 PM", "Maintenance", "888 Riverside Dr", "green"], ["3:00 PM", "Furnace Tune-Up", "999 Valley View Ln", "amber"]] },
];

const activities = [
  ["New lead from Sarah Thompson", "AC Not Cooling - 123 Main St, Dallas, TX", "2m ago", "red"],
  ["Job completed by Steven Clark", "AC Maintenance - 111 Forest Ln", "8m ago", "green"],
  ["Payment received from Michael Johnson", "$450.00 - Invoice #INV-1001", "25m ago", "amber"],
  ["New message from James Wilson", "Furnace Repair - 456 Oak Ave", "30m ago", "blue"],
  ["Job completed by Justin Thomas", "Furnace Tune-Up - 555 Brookside Dr", "1h ago", "green"],
];

const badgeClass = {
  High: "bg-rose-50 text-rose-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-emerald-50 text-emerald-600",
};

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
      <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Avatar label="MJ" size="sm" className="bg-slate-800" />
          <div>
            <div className="text-sm font-bold text-slate-950">Mike Johnson</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </div>
      <button type="button" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm">
        <span className="flex items-center gap-3"><Bell className="h-4 w-4" />Notifications</span>
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">3</span>
      </button>
    </div>
  </aside>
);

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

  const markAllRead = async () => {
    await supabase.from("crm_notifications" as any).update({ read: true } as any).eq("read", false);
    setNotifCount(0);
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  };

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
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">Ã¢ÂÂK</span>
        )}
      </div>
      <button type="button" onClick={onNewJob} className="ml-auto inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-md hover:bg-blue-700 md:ml-0">
        <Plus className="h-4 w-4" /> New Job
      </button>

      {/* Inbox button Ã¢ÂÂ navigates to SMS inbox */}
      <button type="button" onClick={() => onSelect?.("messages")} className="relative hidden h-9 w-9 items-center justify-center rounded-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 md:flex">
        <Inbox className="h-4 w-4" />
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
            <Avatar label="MJ" size="md" className="bg-slate-800" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            <ChevronDown className="h-4 w-4 text-slate-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Mike Johnson</p>
            <p className="text-xs text-slate-500">Administrator</p>
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
          <div className={cn("text-xs font-bold", stat.trend === "up" ? "text-emerald-600" : "text-rose-600")}>{stat.trend === "up" ? "+" : "-"} {stat.delta}</div>
        </div>
        <div className="mt-1 text-xs text-slate-500">{stat.detail}</div>
      </div>
    </div>
  );
};

const formatPhone = (phone: string) => `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;

const includesQuery = (values: Array<string | undefined>, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.join(" ").toLowerCase().includes(normalized);
};

export const JobCard = ({ job, index, onSelect }: { job: Job; index: number; onSelect?: (job: Job) => void }) => (
  <article
    role="button"
    tabIndex={0}
    onClick={() => onSelect?.(job)}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect?.(job);
      }
    }}
    className="rounded-md border border-slate-100 bg-white p-2 text-left shadow-[0_8px_20px_rgba(15,23,42,0.045)] transition hover:border-blue-200 hover:shadow-[0_10px_24px_rgba(37,99,235,0.1)]"
  >
    <div className="flex gap-2">
      {job.image ? <img src={job.image} alt="" className="h-9 w-9 rounded-sm object-cover" /> : <Avatar label={job.avatar} size="sm" className={avatarColors[index % avatarColors.length]} />}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-xs font-black text-slate-950">{job.customer}</h4>
            <p className="truncate text-[11px] font-medium text-slate-500">{job.service}</p>
          </div>
          {job.timeAgo && <span className="shrink-0 text-[10px] font-semibold text-slate-400">{job.timeAgo}</span>}
        </div>
        <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold", badgeClass[job.urgency])}>{job.urgency}</span>
      </div>
    </div>
    <div className="mt-1.5 text-[11px] font-medium text-slate-500">{job.detail}</div>
    <div className="mt-0.5 truncate text-[11px] text-slate-600">{job.address}</div>
    <div className="mt-1.5 flex items-center gap-1.5">
      <a href={`tel:${job.phone}`} onClick={(event) => event.stopPropagation()} className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600">
        <Phone className="h-3.5 w-3.5" />
      </a>
      <a href={`sms:${job.phone}`} onClick={(event) => event.stopPropagation()} className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600">
        <MessageSquare className="h-3.5 w-3.5" />
      </a>
      <button type="button" onClick={(event) => { event.stopPropagation(); onSelect?.(job); }} className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600">
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </div>
  </article>
);

export const DispatchColumn = ({ column, onSelectJob }: { column: DispatchColumnData; onSelectJob?: (job: Job) => void }) => (
  <section className="min-w-0 rounded-md bg-slate-50 p-2">
    <div className="mb-2 flex items-center justify-between px-1">
      <h3 className="text-[13px] font-black text-slate-950">{column.title}</h3>
      <span className="text-xs font-bold text-slate-500">{column.count}</span>
    </div>
    <div className="space-y-2">
      {column.jobs.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 bg-white p-3 text-xs font-medium text-slate-400">No matching jobs.</p>
      ) : (
        column.jobs.map((job, index) => <JobCard key={`${column.title}-${job.customer}`} job={job} index={index} onSelect={onSelectJob} />)
      )}
    </div>
  </section>
);

const JobDetailsSheet = ({ job, onOpenChange }: { job: Job | null; onOpenChange: (open: boolean) => void }) => (
  <Sheet open={!!job} onOpenChange={onOpenChange}>
    <SheetContent className="w-full overflow-y-auto sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{job?.customer || "Job Details"}</SheetTitle>
      </SheetHeader>
      {job && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
            <Avatar label={job.avatar} size="lg" />
            <div className="min-w-0">
              <div className="truncate text-lg font-black text-slate-950">{job.customer}</div>
              <div className="text-sm font-medium text-slate-500">{formatPhone(job.phone)}</div>
            </div>
          </div>
          {[
            ["Service Type", job.service],
            ["Urgency", job.urgency],
            ["Address", job.address],
            ["Time / Status", `${job.detail}${job.status ? ` - ${job.status}` : ""}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-slate-200 p-3">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${job.phone}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-bold text-white hover:bg-blue-700">
              <Phone className="h-4 w-4" /> Call
            </a>
            <a href={`sms:${job.phone}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700">
              <MessageSquare className="h-4 w-4" /> SMS
            </a>
          </div>
        </div>
      )}
    </SheetContent>
  </Sheet>
);

export const DispatchBoard = ({ searchQuery = "", onNavigate }: DashboardProps) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const filteredColumns = useMemo(() => dispatchColumns.map((column) => ({
    ...column,
    jobs: column.jobs
      .map((job) => ({ ...job, status: column.title }))
      .filter((job) => includesQuery([job.customer, job.service, job.urgency, job.detail, job.address, job.status, job.phone], searchQuery)),
  })), [searchQuery]);

  return (
  <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-3.5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="text-lg font-black tracking-tight text-slate-950">Dispatch Board</h2>
      <button type="button" onClick={() => onNavigate?.("jobs")} className="inline-flex items-center gap-1 text-sm font-bold text-blue-600">View All Jobs <ChevronRight className="h-4 w-4" /></button>
    </div>
    <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {filteredColumns.map((column) => <DispatchColumn key={column.title} column={column} onSelectJob={setSelectedJob} />)}
    </div>
    <JobDetailsSheet job={selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)} />
  </section>
  );
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

export const ScheduleTimeline = ({ searchQuery = "", onNavigate }: DashboardProps) => {
  const filteredSchedule = useMemo(() => schedule.map((column) => ({
    ...column,
    items: column.items.filter(([time, title, address]) => includesQuery([column.tech, time, title, address], searchQuery)),
  })), [searchQuery]);

  return (
  <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-black text-slate-950">Today's Schedule</h2>
      <button type="button" onClick={() => onNavigate?.("dispatch")} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">View Full Schedule <ChevronRight className="h-4 w-4" /></button>
    </div>
    <div className="grid grid-cols-[46px_1fr] gap-2.5">
      <div className="pt-10 text-xs font-medium text-slate-500">
        {["8 AM", "10 AM", "12 PM", "2 PM", "4 PM"].map((time) => <div key={time} className="h-[45px]">{time}</div>)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {filteredSchedule.map((column, index) => (
          <div key={column.tech} className="border-l border-slate-200 pl-2.5">
            <div className="mb-2 flex items-center gap-2">
              <Avatar label={column.tech.split(" ").map((part) => part[0]).join("")} size="sm" className={avatarColors[index]} />
              <div className="truncate text-sm font-black text-slate-800">{column.tech}</div>
            </div>
            <div className="space-y-1.5">
              {column.items.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-200 p-2 text-xs text-slate-400">No matching visits.</p>
              ) : column.items.map(([time, title, address, color]) => (
                <div
                  key={`${column.tech}-${time}`}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs",
                    color === "green" && "border-emerald-200 bg-emerald-50 text-emerald-900",
                    color === "red" && "border-rose-200 bg-rose-50 text-rose-900",
                    color === "amber" && "border-amber-200 bg-amber-50 text-amber-900",
                    color === "blue" && "border-blue-200 bg-blue-50 text-blue-900",
                  )}
                >
                  <div className="font-black">{time}</div>
                  <div className="font-semibold">{title}</div>
                  <div className="truncate opacity-80">{address}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

export const ActivityFeed = ({ searchQuery = "", onNavigate }: DashboardProps) => {
  const filteredActivities = useMemo(
    () => activities.filter(([title, description, time, color]) => includesQuery([title, description, time, color], searchQuery)),
    [searchQuery],
  );

  return (
  <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-black text-slate-950">Recent Activity</h2>
      <button type="button" onClick={() => onNavigate?.("activity")} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">View All Activity <ChevronRight className="h-4 w-4" /></button>
    </div>
    <div className="grid grid-cols-[1fr_210px] gap-4">
      <div className="space-y-2.5">
        {filteredActivities.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 p-4 text-sm text-slate-400">No matching activity.</p>
        ) : filteredActivities.map(([title, description, time, color]) => (
          <div key={title} className="flex items-start gap-2.5 border-b border-slate-100 pb-2.5 last:border-0">
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                color === "red" && "bg-rose-50 text-rose-600",
                color === "green" && "bg-emerald-50 text-emerald-600",
                color === "amber" && "bg-amber-50 text-amber-600",
                color === "blue" && "bg-blue-50 text-blue-600",
              )}
            >
              {color === "green" ? <CheckCircle2 className="h-4 w-4" /> : color === "blue" ? <MessageSquare className="h-4 w-4" /> : color === "amber" ? <BriefcaseBusiness className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-slate-950">{title}</div>
              <div className="truncate text-xs font-medium text-slate-500">{description}</div>
            </div>
            <div className="text-xs font-medium text-slate-500">{time}</div>
          </div>
        ))}
      </div>
      <img src={technicianImage} alt="Bravo technician servicing HVAC equipment" className="h-full max-h-[230px] min-h-[190px] w-full rounded-md object-cover" />
    </div>
  </section>
  );
};

export const CRMDashboard = ({ searchQuery = "", onNavigate }: DashboardProps) => {
  const [liveKpis, setLiveKpis] = useState<KPIStat[]>(kpis);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [j0, j1, inv, newLeads] = await Promise.all([
          supabase.from('jobs').select('id', { count: 'exact', head: true }).gte('scheduled_date', today + 'T00:00:00').lte('scheduled_date', today + 'T23:59:59'),
          supabase.from('jobs').select('id', { count: 'exact', head: true }).not('status', 'in', '("completed","cancelled")'),
          supabase.from('invoices').select('amount').eq('status', 'paid').gte('created_at', today + 'T00:00:00'),
          supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        ]);
        const rev = (inv.data || []).reduce((s: number, i: {amount: number}) => s + (i.amount || 0), 0);
        setLiveKpis(prev => prev.map((k: KPIStat) => {
          if (k.label === "Today's Jobs") return { ...k, value: String(j0.count ?? 0), detail: 'scheduled today', delta: '' };
          if (k.label === 'Revenue (Today)') return { ...k, value: rev > 0 ? String(rev.toLocaleString()) : '0', detail: 'paid invoices', delta: '' };
          if (k.label === 'Open Jobs') return { ...k, value: String(j1.count ?? 0), detail: 'active jobs', delta: '' };
          if (k.label === 'Unread Messages') return { ...k, value: String(newLeads.count ?? 0), detail: 'new leads', delta: '' };
          return k;
        }));
      } catch (_) {}
    };
    fetchStats();
  }, []);
  const filteredKpis = useMemo(() => kpis.filter((stat) => includesQuery([stat.label, stat.value, stat.detail], searchQuery)), [searchQuery]);

  return (
  <div className="min-w-0 space-y-3">
    <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {filteredKpis.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-white p-4 text-sm font-medium text-slate-400 md:col-span-2 xl:col-span-5">No matching dashboard metrics.</div>
      ) : filteredKpis.map((stat) => <KPIStatCard key={stat.label} stat={stat} />)}
    </div>

    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] 2xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
      <DispatchBoard searchQuery={searchQuery} onNavigate={onNavigate} />
      <SMSInbox searchQuery={searchQuery} />
    </div>

    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
      <ScheduleTimeline searchQuery={searchQuery} onNavigate={onNavigate} />
      <ActivityFeed searchQuery={searchQuery} onNavigate={onNavigate} />
    </div>
  </div>
  );
};

export const CRMSettingsPanel = () => {
  const [users, setUsers] = useState<{user_id:string;role:string}[]>([]);
  const [savingRole, setSavingRole] = useState<string|null>(null);
  const [notifs, setNotifs] = useState({ new_lead: true, job_update: true, invoice_sent: true, job_complete: true });
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [templates, setTemplates] = useState({
    day_1: "Hi {name}, your {service} appointment is confirmed. Questions? Call (214) 555-0100. ÃÂ¢ÃÂÃÂ Bravo Mechanical",
    follow_up: "Hi {name}, this is Bravo Mechanical following up on your recent service. How is everything working? ÃÂ¢ÃÂÃÂ Bravo Mech",
    invoice: "Hi {name}, your invoice is ready. Please call (214) 555-0100 to pay or for questions. ÃÂ¢ÃÂÃÂ Bravo Mechanical",
  });
  const [editingTpl, setEditingTpl] = useState<string|null>(null);
  const [savingTpl, setSavingTpl] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase.from("user_roles" as any).select("user_id,role");
      if (roles) setUsers(roles as any[]);
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
    await supabase.from("user_roles" as any).upsert({ user_id: userId, role }, { onConflict: "user_id" });
    const { data: roles } = await supabase.from("user_roles" as any).select("user_id,role");
    if (roles) setUsers(roles as any[]);
    setSavingRole(null);
    toast({ title: "Role updated" });
  };

  const saveNotifs = async () => {
    setSavingNotifs(true);
    await Promise.all([
      supabase.from("settings" as any).upsert({ key:"notif_new_lead", value: notifs.new_lead }, { onConflict:"key" }),
      supabase.from("settings" as any).upsert({ key:"notif_job_update", value: notifs.job_update }, { onConflict:"key" }),
      supabase.from("settings" as any).upsert({ key:"notif_invoice_sent", value: notifs.invoice_sent }, { onConflict:"key" }),
      supabase.from("settings" as any).upsert({ key:"notif_job_complete", value: notifs.job_complete }, { onConflict:"key" }),
    ]);
    setSavingNotifs(false);
    toast({ title: "Notification rules saved" });
  };

  const saveTemplate = async (key: string) => {
    setSavingTpl(true);
    await supabase.from("settings" as any).upsert({ key: "sms_" + key, value: (templates as any)[key] }, { onConflict: "key" });
    setSavingTpl(false);
    setEditingTpl(null);
    toast({ title: "Template saved" });
  };

  return (
    <div className="space-y-4">
      <PlaceholderPanel title="Settings" />

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
                <span className="font-mono text-xs text-slate-600">{u.user_id.substring(0,16)}...</span>
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
