"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:px-8 shadow-sm">
      <div className="flex-1">
        {/* Can add Breadcrumbs here if needed */}
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-full pl-2 pr-4 py-1.5 hover:bg-muted transition-colors outline-none">
            <Avatar className="h-9 w-9 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                {session?.user?.name?.[0] ?? <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-semibold text-gray-800 leading-none mb-1">
                {session?.user?.name ?? "管理员"}
              </span>
              <span className="text-xs text-gray-400 font-medium">超级管理员</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
