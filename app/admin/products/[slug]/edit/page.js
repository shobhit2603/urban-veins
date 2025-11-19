"use client";

import { useState, useEffect, use } from "react"; // Updated import
import { useRouter } from "next/navigation";
import { 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditProductPage({ params }) {
  // Unwrap params using React.use() as per Next.js 15+ requirement
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState([]);

  // --- FORM STATE ---
  const [name, setName] = useState("");
  // We don't allow editing the slug easily to prevent breaking URLs
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState([]); 
  const [variants, setVariants] = useState([]);

  // --- 1. FETCH DATA ON LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Categories
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }

        // Fetch Product Details
        const prodRes = await fetch(`/api/products/${slug}`);
        if (prodRes.ok) {
          const product = await prodRes.json();
          
          // Populate Form
          setName(product.name);
          setDescription(product.description);
          setPrice(product.price);
          // Handle populated category object vs ID
          setSelectedCategory(product.category?._id || product.category);
          setImages(product.images || []);
          setVariants(product.variants || []);
        } else {
          alert("Product not found");
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [slug, router]);


  // --- IMAGE UPLOAD LOGIC (Same as Add Page) ---
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const newImages = [...images];

    try {
      const signRes = await fetch('/api/admin/cloudinary-sign', { method: 'POST' });
      const { signature, timestamp } = await signRes.json();

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
        formData.append('folder', 'urban-veins-products');

        const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
        
        const uploadRes = await fetch(url, { method: 'POST', body: formData });
        const data = await uploadRes.json();
        
        if (data.secure_url) {
          newImages.push(data.secure_url);
        }
      }
      setImages(newImages);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  // --- VARIANT HANDLERS ---
  const addVariant = () => {
    setVariants([...variants, { color: "", size: "", stock: 0 }]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  // --- SUBMIT FORM (PUT Request) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const productData = {
      name,
      description,
      price: Number(price),
      category: selectedCategory,
      images,
      variants: variants.map(v => ({
        ...v,
        stock: Number(v.stock)
      }))
    };

    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "PUT", // <-- Using PUT for update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        alert("Product updated successfully!");
        router.push("/admin/products");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <p className="p-8">Loading product details...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="p-2 hover:bg-gray-200 rounded-full">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* BASIC INFO */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (Cannot be changed)</label>
              <input 
                type="text" 
                disabled
                value={slug}
                className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input 
                type="number" 
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* IMAGES */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Product Images</h2>
          <div className="flex flex-wrap gap-4">
            {images.map((url, idx) => (
              <div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                <Image 
                  src={url} 
                  alt="Preview" 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <button 
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors">
              <Upload className="text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Upload</span>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden" 
              />
            </label>
          </div>
          {isLoading && <p className="text-sm text-blue-600">Uploading...</p>}
        </div>

        {/* VARIANTS */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Variants & Stock</h2>
            <button 
              type="button" 
              onClick={addVariant}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-7 gap-4 items-end border-b pb-4 last:border-0">
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Color</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={variant.color}
                  onChange={(e) => updateVariant(index, 'color', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Size</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={variant.size}
                  onChange={(e) => updateVariant(index, 'size', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Stock</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-lg"
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button 
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                  disabled={variants.length === 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {isLoading ? "Updating..." : "Update Product"}
          </button>
        </div>

      </form>
    </div>
  );
}