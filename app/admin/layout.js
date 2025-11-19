"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation"; // Fixed import
import Link from "next/link";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Ticket,
  LogOut 
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // --- 1. SECURITY CHECK ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/"); // Redirect non-admins to home
    }
  }, [status, session, router]);

  if (status === "loading" || !session || session.user.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // --- 2. NAVIGATION ITEMS ---
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket }, // If you build a page for coupons
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold font-[ClashDisplay-Regular]">Urban Admin</h1>
        </div>
        <nav className="flex flex-col p-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-black text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3 text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {/* Show user image if available */}
                    {session.user.image && <image src={session.user.image} alt="Admin" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}