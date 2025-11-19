"use client";

import { useState, useEffect } from "react";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Calendar, 
  Percent, 
  IndianRupee,
  X
} from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // To toggle the form
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage", // default
    discountValue: "",
    minPurchase: "",
    expiresAt: ""
  });

  // --- 1. FETCH COUPONS ---
  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // --- 2. CREATE COUPON ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...formData,
            discountValue: Number(formData.discountValue),
            minPurchase: Number(formData.minPurchase)
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success: Add new coupon to list, reset form, close form
        setCoupons([data, ...coupons]); 
        setFormData({
            code: "",
            discountType: "percentage",
            discountValue: "",
            minPurchase: "",
            expiresAt: ""
        });
        setIsCreating(false);
        alert("Coupon created successfully!");
      } else {
        alert(data.message || "Failed to create coupon");
      }
    } catch (error) {
      console.error("Create error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. DELETE COUPON ---
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c._id !== id));
      } else {
        alert("Failed to delete coupon");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Helper to check if expired
  const isExpired = (dateString) => {
    return new Date(dateString) < new Date();
  };

  if (loading) return <p className="p-8">Loading coupons...</p>;

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="text-black" /> Coupons
        </h1>
        {!isCreating && (
            <button 
            onClick={() => setIsCreating(true)}
            className="bg-black text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
            >
            <Plus size={20} /> Create New Coupon
            </button>
        )}
      </div>

      {/* --- CREATE FORM (Collapsible) --- */}
      {isCreating && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">New Coupon Details</h2>
                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-black">
                    <X size={20} />
                </button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Coupon Code</label>
                    <input 
                        type="text" 
                        required
                        placeholder="e.g. SUMMER2025"
                        className="w-full p-2 border rounded-lg uppercase"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Expiration Date</label>
                    <input 
                        type="date" 
                        required
                        className="w-full p-2 border rounded-lg"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Discount Type</label>
                    <select 
                        className="w-full p-2 border rounded-lg"
                        value={formData.discountType}
                        onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Discount Value</label>
                    <input 
                        type="number" 
                        required
                        placeholder={formData.discountType === 'percentage' ? "e.g. 10 (for 10%)" : "e.g. 100 (for ₹100 off)"}
                        className="w-full p-2 border rounded-lg"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Min Purchase Amount (₹)</label>
                    <input 
                        type="number" 
                        required
                        placeholder="e.g. 500"
                        className="w-full p-2 border rounded-lg"
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                    />
                </div>
                
                <div className="md:col-span-2 flex justify-end mt-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Creating..." : "Save Coupon"}
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* --- COUPONS LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.length > 0 ? (
            coupons.map((coupon) => (
                <div key={coupon._id} className={`bg-white p-5 rounded-xl border shadow-sm relative group ${isExpired(coupon.expiresAt) ? 'border-red-200 opacity-75' : 'border-gray-200'}`}>
                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                        <button 
                            onClick={() => handleDelete(coupon._id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-lg ${isExpired(coupon.expiresAt) ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                            <Ticket size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg tracking-wide">{coupon.code}</h3>
                            <p className={`text-xs font-medium ${isExpired(coupon.expiresAt) ? 'text-red-500' : 'text-green-600'}`}>
                                {isExpired(coupon.expiresAt) ? 'Expired' : 'Active'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            {coupon.discountType === 'percentage' ? <Percent size={16} /> : <IndianRupee size={16} />}
                            <span>
                                Discount: <strong>
                                    {coupon.discountValue}
                                    {coupon.discountType === 'percentage' ? '%' : ' INR'}
                                </strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <IndianRupee size={16} />
                            <span>Min Purchase: <strong>₹{coupon.minPurchase}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Expires: <strong>{formatDate(coupon.expiresAt)}</strong></span>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full text-center p-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No coupons found. Create one to get started!</p>
            </div>
        )}
      </div>
    </div>
  );
}