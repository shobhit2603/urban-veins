"use client";

import { useState } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";

export default function StockEditModal({ product, onClose, onUpdate }) {
  // Initialize variants from the product, or start empty
  const [variants, setVariants] = useState(product.variants || []);
  const [isSaving, setIsSaving] = useState(false);

  // Handle changes for Color, Size, OR Stock
  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    // If stock, convert to number, otherwise keep string
    updated[index][field] = field === 'stock' ? Number(value) : value;
    setVariants(updated);
  };

  // Add a new empty row
  const handleAddVariant = () => {
    setVariants([...variants, { color: "", size: "", stock: 0 }]);
  };

  // Remove a specific row
  const handleRemoveVariant = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  // Send the ENTIRE updated variants array to the backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants }), // Replaces the old variants array
      });

      if (res.ok) {
        const updatedProduct = await res.json();
        onUpdate(updatedProduct); // Update the UI list immediately
        onClose();
      } else {
        alert("Failed to update variants");
      }
    } catch (error) {
      console.error("Update error", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div>
            <h3 className="font-bold text-lg">Manage Variants</h3>
            <p className="text-xs text-gray-500">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Body - Scrollable Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {variants.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <p>No variants added yet.</p>
              <button 
                onClick={handleAddVariant}
                className="text-blue-600 text-sm font-medium mt-2 hover:underline"
              >
                Add your first variant
              </button>
            </div>
          )}

          {variants.map((variant, index) => (
            <div key={index} className="flex items-end gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              
              {/* Color Input */}
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Color</label>
                <input 
                  type="text" 
                  placeholder="Color"
                  className="w-full p-1.5 text-sm border rounded focus:ring-2 focus:ring-black outline-none"
                  value={variant.color}
                  onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                />
              </div>

              {/* Size Input */}
              <div className="w-20">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Size</label>
                <input 
                  type="text" 
                  placeholder="Size"
                  className="w-full p-1.5 text-sm border rounded focus:ring-2 focus:ring-black outline-none"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                />
              </div>

              {/* Stock Input */}
              <div className="w-24">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Stock</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full p-1.5 text-sm border rounded focus:ring-2 focus:ring-black outline-none"
                  value={variant.stock}
                  onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                />
              </div>

              {/* Delete Button */}
              <button 
                onClick={() => handleRemoveVariant(index)}
                className="p-2 mb-[1px] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Remove Variant"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <button 
            onClick={handleAddVariant}
            className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add Variant
          </button>

          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-black text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}