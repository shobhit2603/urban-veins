"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react"; // <-- Import signOut
import { 
  IndianRupee, 
  ShoppingCart, 
  Package, 
  Users,
  AlertTriangle,
  LogOut // <-- Import LogOut icon
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="p-8">Loading stats...</p>;

  return (
    <div className="space-y-8">
      {/* --- HEADER WITH LOGOUT --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        
        {/* Logout Button */}
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* --- STATS CARDS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-2">₹{stats?.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <IndianRupee className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold mt-2">{stats?.totalOrders}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Products</p>
              <h3 className="text-2xl font-bold mt-2">{stats?.totalProducts}</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Customers</p>
              <h3 className="text-2xl font-bold mt-2">{stats?.totalUsers}</h3>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* --- ALERTS SECTION --- */}
      {stats?.lowStockProducts > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3 text-red-800">
          <AlertTriangle size={20} />
          <p>
            <strong>Attention Needed:</strong> {stats.lowStockProducts} products are running low on stock (less than 5 items).
          </p>
        </div>
      )}
    </div>
  );
}