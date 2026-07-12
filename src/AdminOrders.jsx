import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import {
  Eye,
  Package,
  Phone,
  MapPin,
  User,
  Calendar,
  Trash2,
  DollarSign,
} from "lucide-react";

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 1. جلب جميع الطلبات من السيرفر
  const getOrders = async () => {
    const cleanUrl = baseUrl.endsWith("/")
      ? `${baseUrl}orders`
      : `${baseUrl}/orders`;
    const { data } = await axios.get(cleanUrl);
    return data;
  };

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: getOrders,
  });

  // 2. تغيير حالة الطلب (مثال: من Pending إلى Shipped)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const cleanUrl = baseUrl.endsWith("/")
        ? `${baseUrl}orders/${orderId}`
        : `${baseUrl}/orders/${orderId}`;
      // افتراضاً أن الـ Endpoint لديك تدعم تحديث الحالة عبر PATCH أو PUT
      const { data } = await axios.patch(cleanUrl, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminOrders"]);
      alert("Order status updated successfully!");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to update status");
    },
  });

  // Mutation لحذف الطلب نهائياً
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const cleanUrl = baseUrl.endsWith("/")
        ? `${baseUrl}orders/${orderId}`
        : `${baseUrl}/orders/${orderId}`;
      const { data } = await axios.delete(cleanUrl);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminOrders"]);
      setSelectedOrder(null); // إغلاق شق التفاصيل الجانبي إذا كان مفتوحاً
      alert("🗑️ Order deleted successfully!");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to delete order");
    },
  });

  // دالة تأكيد الحذف لمنع الحذف بالخطأ
  const handleDelete = (e, orderId) => {
    e.stopPropagation(); // منع فتح تفاصيل الطلب عند الضغط على زر الحذف
    if (
      window.confirm("Are you sure you want to permanently delete this order?")
    ) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Loading Orders...</div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading orders: {error.message}
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-burgundy" /> Orders Management (
          {orders.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* جدول الطلبات الرئيسي */}
        <div
          className={`bg-white rounded-xl shadow-md border overflow-hidden ${selectedOrder ? "xl:col-span-7" : "xl:col-span-12"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  {/* <th className="p-4">Status</th> */}
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-600">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap ${selectedOrder?._id === order._id ? "bg-burgundy/5" : ""}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                    </td>
                    <td className="p-4 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4 font-bold text-burgundy">
                      {order.totalPrice} EGP
                    </td>
                    {/* <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          order.status === "Pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : order.status === "Delivered"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td> */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* زر عرض التفاصيل */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 hover:text-burgundy transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        {/* زر الحذف الجديد 👈 */}
                        <button
                          onClick={(e) => handleDelete(e, order._id)}
                          disabled={deleteOrderMutation.isPending}
                          className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* القسم الأيمن الجانبي: تفاصيل الطلب المختار والمقاسات للمصنع */}
        {selectedOrder && (
          <div className="xl:col-span-5 bg-white rounded-xl shadow-md border p-6 sticky top-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="font-bold text-lg text-gray-800">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Close ×
              </button>
            </div>

            {/* معلومات العميل */}
            <div className="space-y-3 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <User size={16} className="text-burgundy" />
                <span className="font-medium text-gray-800">
                  {selectedOrder.customerName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span>{selectedOrder.phone}</span>
              </div>
              <div className="flex items-center gap-2 items-start">
                <MapPin
                  size={16}
                  className="text-gray-400 mt-0.5 flex-shrink-0"
                />
                <span className="text-xs leading-relaxed">
                  {selectedOrder.address}
                </span>
              </div>
            </div>

            {/* المنتجات داخل هذا الطلب */}
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">
              Items To Prepare
            </h4>
            <div className="divide-y border-y max-h-60 overflow-y-auto mb-6">
              {selectedOrder.items.map((item) => (
                <div key={item._id} className="flex gap-4 py-3 items-start">
                  <img
                    src={item.selectedColor?.image}
                    alt=""
                    className="w-12 h-16 object-cover rounded bg-gray-100 border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-sm text-gray-800 truncate capitalize">
                      {item.product?.name || item.name}
                    </h5>

                    {/* تفاصيل التفصيل والمقاسات الحساسة */}
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-1">
                      <span className="capitalize bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                        Color: <strong>{item.selectedColor?.color}</strong>
                      </span>
                      {item.selectedWeight && (
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                          Weight: <strong>{item.selectedWeight} </strong>
                        </span>
                      )}
                      {item.selectedLength && (
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                          Length: <strong>{item.selectedLength} cm</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span>
                        Qty:{" "}
                        <strong className="text-gray-900">
                          {item.quantity}
                        </strong>
                      </span>
                      <span className="font-medium text-gray-700">
                        {item.priceAtAddition || item.price} EGP
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* التحكم في الحالة والإجمالي */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-base font-bold text-gray-900">
                <span>Total Revenue:</span>
                <span className="text-burgundy">
                  {selectedOrder.totalPrice} EGP
                </span>
              </div>

              {/* <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Update Order Status
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateStatusMutation.mutate({
                      orderId: selectedOrder._id,
                      status: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-burgundy"
                >
                  <option value="Pending">Pending (قيد المراجعة)</option>
                  <option value="Processing">Processing (جاري التجهيز)</option>
                  <option value="Shipped">Shipped (تم الشحن)</option>
                  <option value="Delivered">Delivered (تم التوصيل)</option>
                  <option value="Cancelled">Cancelled (ملغي)</option>
                </select>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
