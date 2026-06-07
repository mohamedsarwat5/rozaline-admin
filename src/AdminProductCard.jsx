import React from "react";
import { Pencil, Trash2, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ product, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
      {/* Product Image */}
      <div className="relative h-64 bg-gray-100">
        <img
          src={product.colors?.[0]?.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {/* <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium text-white ${
            product.inStock === "sold out"
              ? "bg-red-500"
              : "bg-green-500"
          }`}
        >
          {product.inStock}
        </span> */}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 text-indigo-600">
          <Package size={18} />
          <span className="text-sm font-medium capitalize">
            {product.category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate capitalize">{product.name}</h3>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {product.description}
        </p>

        {/* Colors */}
        <div className="flex gap-2 mb-4">
          {product.colors?.map((item) => (
            <div
              key={item._id}
              className="capitalize px-3 py-1 bg-indigo-100 rounded-xl"
              //   style={{ backgroundColor: item.color }}
              title={item.color}
            >
              {" "}
              {item.color}
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mb-5">
          <span
            className={`font-semibold capitalize ${
              product.inStock
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {product.inStock?"in Stock":"sold out"}
          </span>
          <span className="text-2xl font-bold text-indigo-600">
            {product.price} EGP
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
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
