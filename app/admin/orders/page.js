"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronDown
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // --- 1. FETCH ORDERS ---
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- 2. UPDATE ORDER STATUS ---
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        // Update local state to reflect change immediately
        setOrders((prev) => 
          prev.map((o) => (o._id === orderId ? updatedOrder : o))
        );
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Update error", error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper to filter orders
  const filteredOrders = orders.filter((o) =>
    o._id.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  // Helper for status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "failed": return "bg-red-100 text-red-700";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return <p className="p-8">Loading orders...</p>;

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <h1 className="text-3xl font-bold">Orders Management</h1>

      {/* --- SEARCH --- */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by Order ID or User Name..." 
          className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* --- ORDERS TABLE --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium text-gray-500">Order ID</th>
              <th className="p-4 font-medium text-gray-500">Customer</th>
              <th className="p-4 font-medium text-gray-500">Date</th>
              <th className="p-4 font-medium text-gray-500">Total</th>
              <th className="p-4 font-medium text-gray-500">Payment</th>
              <th className="p-4 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-gray-600">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{order.user?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{order.user?.email}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-medium">₹{order.totalAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {/* --- STATUS DROPDOWN --- */}
                    <div className="relative inline-block">
                      <select
                        className={`appearance-none pl-3 pr-8 py-1 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-black cursor-pointer ${getStatusColor(order.orderStatus)}`}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                    {updatingId === order._id && <span className="ml-2 text-xs text-gray-500">Updating...</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}