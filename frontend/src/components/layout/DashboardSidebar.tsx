"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Sparkles,
  SlidersHorizontal,
  BookOpen,
  CalendarCheck,
  UserRound,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  HelpCircle,
  Lightbulb,
  CalendarDays,
  Target,
  FileText,
  Activity,
  GitBranch,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Gauge,
  Brain,
  MoreVertical,
  X,
  BookMarked,
  Library,
  PenLine,
  Layers,
  ListChecks,
  CalendarCheck2,
  Bot,
  Compass,
  ClipboardList,
  Timer,
  BrainCircuit,
  Briefcase,
  Award,
  Milestone,
  FolderGit2,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";

export interface DashboardSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function DashboardSidebar({ isMobileOpen = false, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, studentProfile, signOut } = useAuth();
  const { showToast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileCardRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (groupTitle: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  // Floating tooltip state for collapsed mode
  const [tooltip, setTooltip] = useState<{
    name: string;
    subtitle?: string;
    badge?: string;
    top: number;
    left: number;
  } | null>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileCardRef.current && !profileCardRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  // Keyboard shortcut to toggle sidebar: 'Ctrl+B' / 'Cmd+B'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    name: string,
    subtitleOrBadge?: string,
    isBadge: boolean = false
  ) => {
    if (!isCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      name,
      subtitle: !isBadge ? subtitleOrBadge : undefined,
      badge: isBadge ? subtitleOrBadge : undefined,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  interface NavigationItem {
    name: string;
    label?: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    allowNested?: boolean;
    aliases?: string[];
  }

  // Section 4: Defined Information Architecture
  const navigationGroups = useMemo<{ title: string; items: NavigationItem[] }[]>(
    () => [
      {
        title: "OVERVIEW",
        items: [
          { name: "Dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, allowNested: false },
          { name: "Command Center", label: "Student Command Center", href: "/student-home", icon: Compass, badge: "TODAY", allowNested: false },
        ],
      },
      {
        title: "ACADEMIC",
        items: [
          { name: "Performance", label: "Performance", href: "/performance", icon: TrendingUp, allowNested: false },
          { name: "Subjects", label: "Subjects", href: "/subjects", icon: BookOpen, allowNested: true },
          { name: "Goals", label: "Goals", href: "/goals", icon: Target, allowNested: false },
          { name: "Study Plan", label: "Study Plan", href: "/study-plan", icon: CalendarDays, allowNested: false },
          { name: "Study Activity", label: "Study Activity", href: "/study", aliases: ["/study-activity"], icon: CalendarCheck, allowNested: false },
          { name: "Assignments", label: "Assignments", href: "/assignments", icon: ClipboardList, badge: "AI", allowNested: true },
        ],
      },
      {
        title: "LEARNING",
        items: [
          { name: "Notebook", label: "Notebook", href: "/notebook", icon: BookMarked, badge: "PRO", allowNested: true },
          { name: "Knowledge Base", label: "Knowledge Base", href: "/knowledge-base", aliases: ["/knowledge", "/knowledge-map", "/resources"], icon: Library, allowNested: true },
          { name: "Flashcards", label: "Flashcards", href: "/flashcards", icon: Layers, allowNested: false },
          { name: "Practice", label: "Practice", href: "/practice", icon: ListChecks, allowNested: false },
          { name: "Exam Prep", label: "Exam Prep", href: "/exam-prep", aliases: ["/study-guides"], icon: CalendarCheck2, allowNested: false },
          { name: "Focus Mode", label: "Focus Mode", href: "/focus", icon: Timer, badge: "NEW", allowNested: false },
          { name: "Learning Memory", label: "Learning Memory", href: "/learning-memory", icon: BrainCircuit, badge: "AI", allowNested: false },
        ],
      },
      {
        title: "INTELLIGENCE",
        items: [
          { name: "AI Assistant", label: "AI Assistant", href: "/assistant", aliases: ["/tutor"], icon: Sparkles, badge: "AI", allowNested: false },
          { name: "Insights", label: "Insights", href: "/insights", icon: Lightbulb, allowNested: false },
          { name: "Prediction", label: "Prediction", href: "/prediction", icon: Brain, badge: "ML", allowNested: false },
          { name: "Analytics", label: "Analytics", href: "/analytics", icon: BarChart3, allowNested: false },
          { name: "Reports", label: "Reports", href: "/reports", icon: FileText, allowNested: false },
          { name: "Simulator", label: "Simulator", href: "/simulator", icon: SlidersHorizontal, allowNested: false },
        ],
      },
      {
        title: "CAREER",
        items: [
          { name: "Career Hub", label: "Career Hub", href: "/career", icon: Briefcase, allowNested: false },
          { name: "Skill Intelligence", label: "Skill Intelligence", href: "/skills", icon: Award, badge: "PRO", allowNested: false },
          { name: "Resume", label: "Resume", href: "/resume", icon: FileText, badge: "AI", allowNested: false },
          { name: "Interview Studio", label: "Interview Studio", href: "/interview", icon: Bot, badge: "AI", allowNested: false },
          { name: "Career Roadmap", label: "Career Roadmap", href: "/career-roadmap", icon: Milestone, allowNested: false },
          { name: "Projects", label: "Projects", href: "/projects", icon: FolderGit2, allowNested: true },
        ],
      },
      {
        title: "ML ENGINEERING",
        items: [
          { name: "Data Quality", label: "Data Quality", href: "/data-quality", icon: ShieldCheck, allowNested: false },
          { name: "ML Monitoring", label: "ML Monitoring", href: "/ml-monitoring", icon: Activity, allowNested: false },
          { name: "Error Analysis", label: "Error Analysis", href: "/error-analysis", icon: AlertCircle, allowNested: false },
          { name: "Retraining", label: "Retraining", href: "/retraining", icon: RefreshCw, allowNested: false },
          { name: "Experiments", label: "Experiments", href: "/experiments", icon: GitBranch, allowNested: true },
          { name: "Model Evaluation", label: "Model Evaluation", href: "/admin/model", icon: Gauge, allowNested: false },
        ],
      },
      {
        title: "ACHIEVEMENTS",
        items: [
          { name: "Achievements", label: "Achievements", href: "/achievements", icon: Trophy, allowNested: false },
        ],
      },
      {
        title: "ACCOUNT",
        items: [
          { name: "Profile", label: "Profile", href: "/profile", icon: UserRound, allowNested: false },
          { name: "Settings", label: "Settings", href: "/settings", icon: Settings, allowNested: false },
        ],
      },
    ],
    []
  );

  // Guaranteed Single-Active-Item Selection
  const allNavItems = useMemo(
    () => navigationGroups.flatMap((group) => group.items),
    [navigationGroups]
  );

  const activeItemHref = useMemo(() => {
    // 1. Strict exact match has highest priority
    const exact = allNavItems.find(
      (item) => pathname === item.href || Boolean(item.aliases?.includes(pathname))
    );
    if (exact) return exact.href;

    // 2. Nested match for explicitly allowed items, matching most specific path first
    const nestedMatches = allNavItems
      .filter(
        (item) =>
          item.allowNested &&
          (pathname.startsWith(`${item.href}/`) ||
            item.aliases?.some((alias) => pathname.startsWith(`${alias}/`)))
      )
      .sort((a, b) => b.href.length - a.href.length);

    return nestedMatches[0]?.href || null;
  }, [allNavItems, pathname]);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsSubmittingFeedback(true);
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      setIsFeedbackOpen(false);
      setFeedbackText("");
      showToast("Thank you for your feedback!", "Your suggestion was sent to the LearnTrack team.", "success");
    }, 500);
  };

  const handleSignOut = async () => {
    setIsProfileMenuOpen(false);
    await signOut();
    router.push("/login");
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const academicSub = studentProfile
    ? `Year ${studentProfile.year} • Sem ${studentProfile.semester}`
    : profile?.email || "Student Workspace";

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E7EAF0] select-none">
      {/* 1. Redesigned Premium Interactive Brand Header (Height: 68px) */}
      <div
        className={cn(
          "h-[68px] flex items-center border-b border-[#EEF2F7] shrink-0 bg-white transition-all duration-200",
          isCollapsed ? "justify-center px-2" : "justify-between px-3.5"
        )}
      >
        {isCollapsed ? (
          /* Collapsed Brand State: Centered 38px Interactive Logo with Hover Expand */
          <div className="flex flex-col items-center justify-center w-full relative group/collapsedHeader">
            <Link
              href="/dashboard"
              aria-label="Go to LearnTrack dashboard"
              onMouseEnter={(e) =>
                handleMouseEnter(e, "LearnTrack", "AI Performance Intelligence", false)
              }
              onMouseLeave={handleMouseLeave}
              className="group/logo relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-xl p-0.5"
            >
              <div
                className={cn(
                  "relative w-[38px] h-[38px] rounded-[11.5px] bg-gradient-to-br from-[#2563EB] to-[#4F46E5] flex items-center justify-center text-white shrink-0 shadow-[0_2px_10px_-2px_rgba(37,99,235,0.35)] transition-all duration-200 ease-out border border-white/20 select-none",
                  "group-hover/logo:-translate-y-[1px] group-hover/logo:scale-[1.04] group-hover/logo:shadow-[0_4px_16px_-2px_rgba(37,99,235,0.45),0_0_12px_rgba(37,99,235,0.18)]",
                  "group-active/logo:scale-[0.97] group-active/logo:translate-y-0",
                  "motion-reduce:transform-none motion-reduce:transition-none"
                )}
              >
                <GraduationCap className="w-[19px] h-[19px] stroke-[2] text-white transition-transform duration-200 ease-out group-hover/logo:-translate-y-0.5 group-hover/logo:-rotate-[3deg] motion-reduce:transform-none" />
                <div className="absolute inset-0 rounded-[11px] bg-gradient-to-t from-transparent via-white/[0.08] to-white/20 pointer-events-none" />
              </div>
            </Link>

            {/* Quick Expand Button on Hover */}
            <button
              onClick={() => setIsCollapsed(false)}
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-center text-slate-500 hover:text-[#2563EB] hover:scale-110 opacity-0 group-hover/collapsedHeader:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer z-10"
              aria-label="Expand sidebar"
              title="Expand sidebar (Ctrl+B)"
            >
              <ChevronRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* Expanded Brand Header: Interactive Logo + Crisp Typography + Collapse Control */
          <>
            <Link
              href="/dashboard"
              aria-label="Go to LearnTrack dashboard"
              className="flex items-center gap-3 overflow-hidden group/brand group/logo min-w-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-xl p-0.5 transition-colors"
            >
              {/* Interactive Logo Container */}
              <div
                className={cn(
                  "relative w-[38px] h-[38px] rounded-[11.5px] bg-gradient-to-br from-[#2563EB] to-[#4F46E5] flex items-center justify-center text-white shrink-0 shadow-[0_2px_10px_-2px_rgba(37,99,235,0.35)] transition-all duration-200 ease-out border border-white/20 select-none",
                  "group-hover/brand:-translate-y-[1px] group-hover/brand:scale-[1.04] group-hover/brand:shadow-[0_4px_16px_-2px_rgba(37,99,235,0.45),0_0_12px_rgba(37,99,235,0.18)]",
                  "group-active/brand:scale-[0.97] group-active/brand:translate-y-0",
                  "motion-reduce:transform-none motion-reduce:transition-none"
                )}
              >
                <GraduationCap className="w-[19px] h-[19px] stroke-[2] text-white transition-transform duration-200 ease-out group-hover/brand:-translate-y-0.5 group-hover/brand:-rotate-[3deg] motion-reduce:transform-none" />
                <div className="absolute inset-0 rounded-[11px] bg-gradient-to-t from-transparent via-white/[0.08] to-white/20 pointer-events-none" />
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col min-w-0">
                <span className="text-[15.5px] font-bold text-[#0F172A] tracking-tight leading-none group-hover/brand:text-[#2563EB] transition-colors duration-150">
                  LearnTrack
                </span>
                <span className="text-[9.5px] font-medium text-[#94A3B8] tracking-tight leading-none mt-1.5 transition-colors duration-150">
                  AI Performance Intelligence
                </span>
              </div>
            </Link>

            {/* Right Controls: Refined Collapse Button & Mobile Close */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCollapsed(true)}
                className="w-[28px] h-[28px] rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0] flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                aria-label="Collapse sidebar"
                title="Collapse sidebar (Ctrl+B)"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>

              {/* Mobile Close Button */}
              {isMobileOpen && (
                <button
                  onClick={onMobileClose}
                  className="md:hidden w-[28px] h-[28px] rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  aria-label="Close mobile menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* 2. Scrollable Navigation Area */}
      <div
        className={cn(
          "flex-1 overflow-y-auto py-2.5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent",
          isCollapsed ? "px-2" : "px-3"
        )}
      >
        {navigationGroups.map((group) => {
          const isGroupCollapsed = !isCollapsed && Boolean(collapsedGroups[group.title]);
          const hasActiveChild = group.items.some(
            (item) => item.href === activeItemHref || Boolean(item.aliases?.includes(pathname))
          );

          return (
            <div key={group.title} className="space-y-0.5">
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full px-3 pt-2 pb-1 text-[9.5px] font-semibold text-[#94A3B8] hover:text-slate-600 uppercase tracking-[0.10em] select-none flex items-center justify-between group/groupHeader cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {group.title === "INTELLIGENCE" && (
                      <Sparkles className="w-2.5 h-2.5 text-blue-500 opacity-80" />
                    )}
                    <span>{group.title}</span>
                    {hasActiveChild && isGroupCollapsed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-slate-400 group-hover/groupHeader:text-slate-600 transition-transform duration-200",
                      isGroupCollapsed && "-rotate-90"
                    )}
                  />
                </button>
              ) : (
                <div className="h-1.5" />
              )}

              {(!isGroupCollapsed || isCollapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.href === activeItemHref;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onMobileClose}
                        onMouseEnter={(e) => handleMouseEnter(e, item.name, item.badge, true)}
                        onMouseLeave={handleMouseLeave}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center rounded-[9px] h-[38px] transition-all duration-180 relative cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
                          isCollapsed
                            ? "justify-center w-[38px] mx-auto"
                            : "gap-2.5 px-3 w-full text-[13px]",
                          isActive
                            ? "bg-[#EFF6FF] text-[#2563EB] font-semibold border border-blue-100/70 shadow-2xs"
                            : "bg-transparent text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] font-medium border border-transparent"
                        )}
                      >
                        {/* Left Flush Active Indicator Bar (3px) */}
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, scaleY: 0.5, y: "-50%" }}
                            animate={{ opacity: 1, scaleY: 1, y: "-50%" }}
                            exit={{ opacity: 0, scaleY: 0.5, y: "-50%" }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className={cn(
                              "absolute top-1/2 bg-[#2563EB] origin-center",
                              isCollapsed
                                ? "left-0 w-[2.5px] h-[16px]"
                                : "left-0 w-[3px] h-[18px]"
                            )}
                            style={{ borderRadius: "0 4px 4px 0" }}
                            aria-hidden="true"
                          />
                        )}

                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors duration-180",
                            isActive
                              ? "text-[#2563EB] stroke-[2]"
                              : "text-[#64748B] group-hover:text-[#2563EB] group-hover:translate-x-0.5 stroke-[1.8]"
                          )}
                        />

                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate tracking-tight">{item.name}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  "text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md leading-none border shrink-0",
                                  item.badge === "AI"
                                    ? "bg-purple-50 text-purple-600 border-purple-100/70"
                                    : "bg-blue-50 text-blue-600 border-blue-100/70"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Fixed Bottom Utility Area */}
      <div
        ref={profileCardRef}
        className={cn(
          "p-2.5 border-t border-[#E7EAF0] space-y-1.5 bg-white shrink-0 relative",
          isCollapsed && "px-2"
        )}
      >
        {/* Help & Feedback */}
        <button
          onClick={() => setIsFeedbackOpen(true)}
          onMouseEnter={(e) => handleMouseEnter(e, "Help & Feedback")}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "flex items-center rounded-[9px] h-[36px] text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] border border-transparent hover:border-[#E7EAF0] transition-colors cursor-pointer",
            isCollapsed
              ? "justify-center w-[38px] mx-auto"
              : "gap-2.5 px-3 w-full text-[12.5px] font-medium"
          )}
          title={isCollapsed ? undefined : "Help & Feedback"}
          aria-label="Help & Feedback"
        >
          <HelpCircle className="w-4 h-4 stroke-[1.8] text-[#94A3B8] shrink-0" />
          {!isCollapsed && <span className="flex-1 text-left truncate">Help &amp; Feedback</span>}
        </button>

        {/* User Profile Mini-Card with Click Dropdown */}
        {isCollapsed ? (
          <div
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            onMouseEnter={(e) =>
              handleMouseEnter(e, displayName, academicSub, false)
            }
            onMouseLeave={handleMouseLeave}
            className="flex items-center justify-center cursor-pointer py-1 relative"
          >
            <Avatar
              name={displayName}
              size="sm"
              src={profile?.avatar_url}
              className="w-[34px] h-[34px] rounded-full border border-[#E7EAF0] shadow-2xs hover:ring-2 hover:ring-blue-500/20 transition-all"
            />
          </div>
        ) : (
          <div
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center justify-between p-2 rounded-xl bg-[#FAFBFC] hover:bg-[#F1F5F9]/60 border border-[#E2E8F0] cursor-pointer transition-all duration-150 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <Avatar
                  name={displayName}
                  size="sm"
                  src={profile?.avatar_url}
                  className="w-8 h-8 rounded-full border border-slate-200/80 shadow-2xs"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-[#172033] truncate leading-tight group-hover:text-blue-600 transition-colors">
                  {displayName}
                </p>
                <p className="text-[10.5px] text-[#64748B] truncate leading-tight mt-0.5 font-normal">
                  {academicSub}
                </p>
              </div>
            </div>

            <div className="p-1 rounded-md text-slate-400 group-hover:text-slate-700 transition-colors shrink-0">
              <MoreVertical className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          </div>
        )}

        {/* Floating Profile Action Menu */}
        {isProfileMenuOpen && (
          <div
            className={cn(
              "absolute z-50 bg-white rounded-xl border border-[#E2E8F0] shadow-[0_12px_32px_-4px_rgba(15,23,42,0.12)] p-1.5 animate-in fade-in-0 slide-in-from-bottom-2 duration-150 select-none",
              isCollapsed
                ? "bottom-12 left-14 w-52"
                : "bottom-[calc(100%+8px)] left-2.5 right-2.5"
            )}
          >
            <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
              <p className="text-[12px] font-semibold text-[#172033] truncate">{displayName}</p>
              <p className="text-[10px] text-[#64748B] truncate font-normal">{user?.email || "Student"}</p>
            </div>

            <Link
              href="/profile"
              onClick={() => {
                setIsProfileMenuOpen(false);
                onMobileClose?.();
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-[#F8FAFC] transition-colors"
            >
              <UserRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Student Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => {
                setIsProfileMenuOpen(false);
                onMobileClose?.();
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-[#F8FAFC] transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Platform Settings</span>
            </Link>

            <div className="h-px bg-slate-100 my-1" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Tooltip in Collapsed Mode */}
      {isCollapsed && tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2.5 py-1.5 bg-white border border-[#E2E8F0] text-[#172033] text-[12px] font-medium rounded-[8px] shadow-[0_4px_16px_-2px_rgba(15,23,42,0.12)] whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-100 select-none"
          style={{
            top: `${tooltip.top}px`,
            left: `${tooltip.left}px`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 leading-tight">
            <span>{tooltip.name}</span>
            {tooltip.badge && (
              <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-100">
                {tooltip.badge}
              </span>
            )}
          </div>
          {tooltip.subtitle && (
            <p className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">
              {tooltip.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Real Feedback Modal */}
      <Modal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="Share Your Feedback"
        description="Help us make LearnTrack the best academic intelligence platform for students."
      >
        <form onSubmit={handleSendFeedback} className="space-y-4 pt-2">
          <Textarea
            label="What's on your mind?"
            placeholder="Share feature ideas, suggestions, or issues you encountered..."
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsFeedbackOpen(false)}
              disabled={isSubmittingFeedback}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmittingFeedback}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:block shrink-0 transition-[width] duration-250 ease-in-out h-screen sticky top-0 z-30 print:hidden",
          isCollapsed ? "w-[70px]" : "w-[250px]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-[#0F172A]/[0.28] backdrop-blur-[4px] transition-opacity duration-200"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-[270px] bg-white shadow-2xl animate-in slide-in-from-left duration-250 ease-out">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
