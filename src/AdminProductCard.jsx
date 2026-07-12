import React from "react";
import { Pencil, Trash2, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ product, onDelete }) {
  return (
    // أضفنا flex flex-col و h-full هنا لتوحيد ارتفاع الكروت
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
      {/* Product Image */}
      <div className="relative h-64 bg-gray-100 flex-shrink-0">
        <img
          src={product.colors?.[0]?.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      {/* أضفنا flex-1 flex flex-col هنا لتوزيع المساحة المتبقية */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-indigo-600">
          <Package size={18} />
          <span className="text-sm font-medium capitalize">
            {product.category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate capitalize">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {product.description}
        </p>

        {/* Colors */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {product.colors?.map((item) => (
            <div
              key={item._id}
              className="capitalize px-3 py-1 bg-indigo-100 rounded-xl"
              title={item.color}
            >
              {item.color}
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mb-5 ">
          <span
            className={`font-semibold capitalize ${
              product.inStock ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.inStock ? "in Stock" : "sold out"}
          </span>
          <span className="text-2xl font-bold text-indigo-600">
            {product.price} EGP
          </span>
        </div>

        {/* Actions */}
        {/* أضفنا mt-auto ليدفع الأزرار لأسفل الكارد تماماً مهما كان حجم النصوص بالأعلى */}
        <div className="flex gap-3 mt-auto">
          <Link
            to={`/updateproduct/${product._id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg transition"
          >
            <Pencil size={18} />
            Update
          </Link>

          <button
            onClick={() => onDelete(product._id)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg transition"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}