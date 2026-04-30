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
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  Smile,
  User,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
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
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "jobs", label: "Jobs", icon: CalendarDays },
  { id: "dispatch", label: "Dispatch Board", icon: MessageSquare },
  { id: "leads", label: "Customers (CRM)", icon: Users },
  { id: "messages", label: "Messages", icon: Mail, badge: "12" },
  { id: "myjobs", label: "Technicians", icon: User },
  { id: "invoices", label: "Invoices", icon: ClipboardList },
  { id: "activity", label: "Settings", icon: Settings },
];

const kpis: KPIStat[] = [
  { label: "Today's Jobs", value: "14", detail: "vs yesterday", delta: "27%", trend: "up", icon: CalendarDays, color: "from-blue-500 to-blue-600" },
  { label: "Revenue (Today)", value: "$5,680", detail: "vs yesterday", delta: "18%", trend: "up", icon: DollarSign, color: "from-green-500 to-green-600" },
  { label: "Open Jobs", value: "32", detail: "vs yesterday", delta: "8%", trend: "down", icon: ClipboardList, color: "from-orange-400 to-orange-500" },
  { label: "Unread Messages", value: "12", detail: "vs yesterday", delta: "33%", trend: "up", icon: MessageSquare, color: "from-indigo-500 to-violet-600" },
  { label: "Conversion Rate", value: "26%", detail: "vs last 7 days", delta: "12%", trend: "up", icon: LineChart, color: "from-teal-500 to-cyan-500" },
];

const dispatchColumns: DispatchColumnData[] = [
  {
    title: "New Leads",
    count: 5,
    jobs: [
      { customer: "Sarah Thompson", service: "AC Not Cooling", urgency: "High", detail: "2m ago", timeAgo: "2m ago", address: "123 Main St, Dallas, TX", avatar: "ST", image: hvacUnit },
      { customer: "James Wilson", service: "Furnace Repair", urgency: "Medium", detail: "15m ago", timeAgo: "15m ago", address: "456 Oak Ave, Dallas, TX", avatar: "JW", image: technicianImage },
      { customer: "Emily Carter", service: "AC Maintenance", urgency: "Low", detail: "1h ago", timeAgo: "1h ago", address: "789 Pine Rd, Dallas, TX", avatar: "EC", image: hvacUnit },
      { customer: "Robert Martinez", service: "Heat Pump Issue", urgency: "High", detail: "2h ago", timeAgo: "2h ago", address: "321 Maple Dr, Dallas, TX", avatar: "RM", image: technicianImage },
    ],
  },
  {
    title: "Scheduled",
    count: 8,
    jobs: [
      { customer: "Michael Johnson", service: "AC Installation", urgency: "Medium", detail: "Today, 10:00 AM", address: "1234 Cedar Ln, Dallas, TX", avatar: "MJ" },
      { customer: "Brian Davis", service: "Heating Tune-Up", urgency: "Low", detail: "Today, 1:00 PM", address: "567 Birch St, Dallas, TX", avatar: "BD" },
      { customer: "Amanda Lee", service: "AC Repair", urgency: "High", detail: "Today, 3:30 PM", address: "890 Spruce Dr, Dallas, TX", avatar: "AL" },
      { customer: "Kevin White", service: "Duct Cleaning", urgency: "Low", detail: "Tomorrow, 9:00 AM", address: "432 Walnut St, Dallas, TX", avatar: "KW" },
    ],
  },
  {
    title: "In Progress",
    count: 6,
    jobs: [
      { customer: "Daniel Anderson", service: "AC Repair", urgency: "High", detail: "Started 9:15 AM", address: "222 Park Ave, Dallas, TX", avatar: "DA" },
      { customer: "Tyler Garcia", service: "Furnace Repair", urgency: "Medium", detail: "Started 10:30 AM", address: "333 Lakeview Dr, Dallas, TX", avatar: "TG" },
      { customer: "Chris Martinez", service: "Heat Pump Repair", urgency: "Medium", detail: "Started 11:00 AM", address: "444 Hillcrest Rd, Dallas, TX", avatar: "CM" },
    ],
  },
  {
    title: "Completed",
    count: 12,
    jobs: [
      { customer: "Steven Clark", service: "AC Maintenance", urgency: "Low", detail: "Completed 8:30 AM", address: "111 Forest Ln, Dallas, TX", avatar: "SC" },
      { customer: "Justin Thomas", service: "Furnace Tune-Up", urgency: "Low", detail: "Completed 9:45 AM", address: "555 Brookside Dr, Dallas, TX", avatar: "JT" },
      { customer: "Brandon Lee", service: "AC Repair", urgency: "Low", detail: "Completed 10:15 AM", address: "666 Meadow Ln, Dallas, TX", avatar: "BL" },
    ],
  },
];

const conversations: Conversation[] = [
  { name: "Sarah Thompson", preview: "Hey, my AC is blowing warm...", time: "2m", active: true, unread: 2, avatar: "ST" },
  { name: "Michael Johnson", preview: "Thanks! See you at 10am.", time: "10m", avatar: "MJ" },
  { name: "James Wilson", preview: "Can I get an estimate?", time: "15m", avatar: "JW" },
  { name: "Emily Carter", preview: "Sounds good, thank you!", time: "30m", avatar: "EC" },
  { name: "Robert Martinez", preview: "No problem!", time: "1h", avatar: "RM" },
  { name: "Melissa Brown", preview: "What's included?", time: "2h", unread: 1, avatar: "MB" },
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

export const Sidebar = ({ activeView = "dashboard", onSelect }: { activeView?: string; onSelect?: (id: string) => void }) => (
  <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] border-r border-slate-200 bg-white/95 px-3.5 py-5 shadow-[18px_0_45px_rgba(15,23,42,0.04)] backdrop-blur-xl lg:flex lg:flex-col">
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

export const TopBar = ({ onSignOut }: { onSignOut?: () => void }) => (
  <header className="sticky top-0 z-20 border-b border-transparent bg-slate-50/90 px-4 py-3 backdrop-blur-xl lg:px-5 xl:px-6">
    <div className="flex h-11 items-center gap-3">
      <div className="relative mx-auto hidden h-10 max-w-[640px] flex-1 md:block">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className="h-full w-full rounded-md border border-slate-200 bg-white pl-10 pr-14 text-sm font-medium text-slate-700 shadow-[0_8px_25px_rgba(15,23,42,0.06)] outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          placeholder="Search customers, jobs, invoices, or phone numbers..."
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Ctrl K</span>
      </div>
      <button type="button" className="ml-auto inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-700">
        <Plus className="h-4 w-4" /> New Job
      </button>
      <button type="button" className="relative hidden h-9 w-9 items-center justify-center rounded-md bg-white text-slate-800 shadow-sm md:flex">
        <Inbox className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">12</span>
      </button>
      <button type="button" className="relative hidden h-9 w-9 items-center justify-center rounded-md bg-white text-slate-800 shadow-sm md:flex">
        <Bell className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">3</span>
      </button>
      <button type="button" onClick={onSignOut} className="hidden items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white md:flex">
        <Avatar label="MJ" size="md" className="bg-slate-800" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        <ChevronDown className="h-4 w-4 text-slate-600" />
      </button>
    </div>
  </header>
);

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

export const JobCard = ({ job, index }: { job: Job; index: number }) => (
  <article className="rounded-md border border-slate-100 bg-white p-2 shadow-[0_8px_20px_rgba(15,23,42,0.045)]">
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
      {[Phone, MessageSquare, MoreHorizontal].map((Icon, iconIndex) => (
        <button key={iconIndex} type="button" className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600">
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  </article>
);

export const DispatchColumn = ({ column }: { column: DispatchColumnData }) => (
  <section className="min-w-0 rounded-md bg-slate-50 p-2">
    <div className="mb-2 flex items-center justify-between px-1">
      <h3 className="text-[13px] font-black text-slate-950">{column.title}</h3>
      <span className="text-xs font-bold text-slate-500">{column.count}</span>
    </div>
    <div className="space-y-2">
      {column.jobs.map((job, index) => <JobCard key={`${column.title}-${job.customer}`} job={job} index={index} />)}
    </div>
  </section>
);

export const DispatchBoard = () => (
  <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-3.5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="text-lg font-black tracking-tight text-slate-950">Dispatch Board</h2>
      <button type="button" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600">View All Jobs <ChevronRight className="h-4 w-4" /></button>
    </div>
    <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {dispatchColumns.map((column) => <DispatchColumn key={column.title} column={column} />)}
    </div>
  </section>
);

export const ConversationList = () => (
  <div className="w-[36%] min-w-[168px] max-w-[220px] border-r border-slate-200">
    <div className="border-b border-slate-200 p-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none" placeholder="Search conversations..." />
      </div>
    </div>
    <div className="space-y-0.5 p-2">
      {conversations.map((conversation, index) => (
        <button
          key={conversation.name}
          type="button"
          className={cn("flex w-full items-center gap-2.5 rounded-md p-2 text-left", conversation.active ? "bg-blue-50" : "hover:bg-slate-50")}
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

export const AISuggestionBox = () => (
  <div className="rounded-md border border-slate-200 bg-white p-2.5">
    <div className="mb-2 flex items-center justify-between">
      <div className="text-xs font-black text-slate-700">AI Reply Suggestions</div>
      <button type="button" className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">Suggest reply</button>
    </div>
    <div className="space-y-1.5">
      {["We can have a tech there between 1-3pm today.", "Thanks! Our tech is on the way and will call you shortly.", "We can definitely help! What's the best address to send the tech?"].map((suggestion) => (
        <button key={suggestion} type="button" className="block w-full rounded-md bg-blue-50 px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-blue-100">
          {suggestion}
        </button>
      ))}
    </div>
  </div>
);

export const MessageThread = () => (
  <div className="flex min-w-0 flex-1 flex-col">
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar label="ST" className="bg-slate-900" />
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-slate-950">Sarah Thompson</div>
          <div className="text-xs text-slate-500">(214) 555-0198</div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"><Phone className="h-4 w-4" /></button>
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"><MoreHorizontal className="h-4 w-4" /></button>
      </div>
    </div>
    <div className="flex-1 space-y-3 p-3">
      <div className="max-w-[78%] rounded-md bg-slate-100 px-3 py-2.5 text-xs font-medium leading-5 text-slate-800">Hey, my AC is blowing warm air and it's 90 degrees in my house. Can someone come out today?</div>
      <div className="ml-auto max-w-[78%] rounded-md bg-blue-600 px-3 py-2.5 text-xs font-medium leading-5 text-white shadow-lg">I'm sorry to hear that! We can definitely get someone out today.</div>
      <div className="max-w-[70%] rounded-md bg-slate-100 px-3 py-2.5 text-xs font-medium leading-5 text-slate-800">That would be great, thanks!</div>
      <AISuggestionBox />
    </div>
    <div className="border-t border-slate-200 p-2.5">
      <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5">
        <input className="min-w-0 flex-1 text-sm outline-none placeholder:text-slate-400" placeholder="Type a message..." />
        <Smile className="h-4 w-4 text-slate-500" />
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white"><Send className="h-4 w-4" /></button>
      </div>
    </div>
  </div>
);

export const SMSInbox = () => (
  <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 className="text-lg font-black tracking-tight text-slate-950">SMS Inbox</h2>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live</span>
    </div>
    <div className="flex h-[490px] min-w-0 overflow-hidden">
      <ConversationList />
      <MessageThread />
    </div>
  </section>
);

export const ScheduleTimeline = () => (
  <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-black text-slate-950">Today's Schedule</h2>
      <button type="button" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">View Full Schedule <ChevronRight className="h-4 w-4" /></button>
    </div>
    <div className="grid grid-cols-[46px_1fr] gap-2.5">
      <div className="pt-10 text-xs font-medium text-slate-500">
        {["8 AM", "10 AM", "12 PM", "2 PM", "4 PM"].map((time) => <div key={time} className="h-[45px]">{time}</div>)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {schedule.map((column, index) => (
          <div key={column.tech} className="border-l border-slate-200 pl-2.5">
            <div className="mb-2 flex items-center gap-2">
              <Avatar label={column.tech.split(" ").map((part) => part[0]).join("")} size="sm" className={avatarColors[index]} />
              <div className="truncate text-sm font-black text-slate-800">{column.tech}</div>
            </div>
            <div className="space-y-1.5">
              {column.items.map(([time, title, address, color]) => (
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

export const ActivityFeed = () => (
  <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-black text-slate-950">Recent Activity</h2>
      <button type="button" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">View All Activity <ChevronRight className="h-4 w-4" /></button>
    </div>
    <div className="grid grid-cols-[1fr_210px] gap-4">
      <div className="space-y-2.5">
        {activities.map(([title, description, time, color]) => (
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

export const CRMDashboard = () => (
  <div className="min-w-0 space-y-3">
    <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {kpis.map((stat) => <KPIStatCard key={stat.label} stat={stat} />)}
    </div>

    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] 2xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
      <DispatchBoard />
      <SMSInbox />
    </div>

    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
      <ScheduleTimeline />
      <ActivityFeed />
    </div>
  </div>
);

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
