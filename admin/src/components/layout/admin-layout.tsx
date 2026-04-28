import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#f0f2f5]">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
