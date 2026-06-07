import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminProductCard from "./AdminProductCard"; // استيراد الكارد هنا

export default function AllProducts() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [products, setProducts] = useState([]);

  const getProducts = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/products`);
      setProducts(data);
    } catch (error) {
      console.log("error fetching data", error);
    }
  };

  // دالة الحذف عند الضغط على زر التخلص من المنتج
  const handleDeleteProduct = async (id) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟")) {
      try {
        await axios.delete(`${baseUrl}/products/${id}`);
        // تحديث الحالة فوراً لحذف المنتج من الشاشة دون إعادة تحميل الصفحة
        setProducts(products.filter((p) => p._id !== id));
        alert("تم حذف المنتج بنجاح");
      } catch (error) {
        console.error("خطأ أثناء الحذف:", error);
        alert("فشل حذف المنتج، يرجى المحاولة لاحقاً");
      }
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* شبكة عرض الكروت المجاورة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <AdminProductCard
              key={product._id}
              product={product}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      </div>
    </div>
  );
}