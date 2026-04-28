"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardCheck,
  ShoppingBag,
  Receipt,
  Users,
  BarChart3,
  FolderOpen,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/config";

const navItems = [
  { label: "仪表盘", href: "/", icon: LayoutDashboard },
  { label: "题库分类", href: "/bank-categories", icon: FolderOpen },
  { label: "题库管理", href: "/banks", icon: BookOpen },
  { label: "题目管理", href: "/questions", icon: FileText },
  { label: "模考管理", href: "/mock-papers", icon: ClipboardCheck },
  { label: "商品管理", href: "/products", icon: ShoppingBag },
  { label: "订单管理", href: "/orders", icon: Receipt },
  { label: "用户管理", href: "/users", icon: Users },
  { label: "统计看板", href: "/dashboard", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside 
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 shadow-2xl"
      style={{ backgroundColor: '#001529' }}
    >
      {/* Logo Section */}
      <div className="flex h-20 items-center px-6 gap-3 border-b border-white/5 bg-[#002140]">
        <div className="bg-[#1890ff] p-2 rounded-lg shadow-lg">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">{APP_NAME}</span>
      </div>
      
      {/* Navigation Section */}
      <div className="flex-1 px-3 py-6 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between group rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "nav-item-active translate-x-1"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200")} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-white/50" />}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Bottom User Section */}
      <div className="p-4 border-t border-white/5 bg-[#002140]/50">
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/10">
          <div className="h-9 w-9 rounded-lg bg-[#1890ff] flex items-center justify-center text-white font-bold shadow-inner">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">超级管理员</p>
            <p className="text-[10px] text-gray-500 font-medium">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
