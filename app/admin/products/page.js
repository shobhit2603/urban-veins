"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
} from "lucide-react";
import StockEditModal from "./StockEditModal"; // --- 1. IMPORT THE MODAL ---

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // --- 2. NEW STATE FOR MODAL ---
  // This holds the product currently being edited (or null if modal is closed)
  const [editingStockProduct, setEditingStockProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (slug) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.slug !== slug));
        alert("Product deleted successfully");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };
  
  // --- 3. CALLBACK TO UPDATE UI ---
  // When the modal saves, it calls this to update the local list immediately
  const handleProductUpdate = (updatedProduct) => {
    setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-8">Loading products...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-black text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={20} /> Add Product
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium text-gray-500">Product</th>
              <th className="p-4 font-medium text-gray-500">Category</th>
              <th className="p-4 font-medium text-gray-500">Price</th>
              <th className="p-4 font-medium text-gray-500">Total Stock</th>
              <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                // Calculate total stock across all variants
                const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;

                return (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0">
                          {product.images?.[0] && (
                            <Image 
                              src={product.images[0]} 
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-4 font-medium">₹{product.price.toLocaleString()}</td>
                    
                    {/* --- 4. STOCK COLUMN WITH EDIT BUTTON --- */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${totalStock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {totalStock} in stock
                        </span>
                        {/* Quick Edit Button */}
                        <button 
                          onClick={() => setEditingStockProduct(product)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Quick Edit Stock"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/products/${product.slug}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                           <Edit size={18} />
                        </Link>
                        
                        <button 
                          onClick={() => handleDelete(product.slug)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- 5. RENDER MODAL IF ACTIVE --- */}
      {editingStockProduct && (
        <StockEditModal 
          product={editingStockProduct} 
          onClose={() => setEditingStockProduct(null)}
          onUpdate={handleProductUpdate}
        />
      )}

    </div>
  );
}