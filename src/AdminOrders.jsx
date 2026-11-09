import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { Eye, Package, Phone, MapPin, User, Trash2 } from "lucide-react";
import ScrollToTop from "./ScrollToTop";

const baseUrl = import.meta.env.VITE_BASE_URL || "";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Reference لجزء التفاصيل
  const detailsRef = useRef(null);

  // عمل Scroll تلقائي عند تحديد طلب
  useEffect(() => {
    if (selectedOrderId && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedOrderId]);

  // 1. جلب جميع الطلبات
  const getOrders = async () => {
    const { data } = await axios.get(`${cleanBaseUrl}orders`);
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

  const selectedOrder = orders.find((order) => order._id === selectedOrderId);

  // 2. تغيير حالة الطلب
  // const updateStatusMutation = useMutation({
  //   mutationFn: async ({ orderId, status }) => {
  //     const { data } = await axios.patch(`${cleanBaseUrl}orders/${orderId}`, {
  //       status,
  //     });
  //     return data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
  //     alert("Order status updated successfully!");
  //   },
  //   onError: (err) => {
  //     alert(err.response?.data?.message || "Failed to update status");
  //   },
  // });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const { data } = await axios.patch(
        `${cleanBaseUrl}orders/${orderId}/status`,
        { status },
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },

    onError: (err) => {
      alert(err.response?.data?.message || "Failed to update status");
    },
  });

  // 3. حذف الطلب
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const { data } = await axios.delete(`${cleanBaseUrl}orders/${orderId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      setSelectedOrderId(null);
      alert("🗑️ Order deleted successfully!");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to delete order");
    },
  });

  const handleDelete = (e, orderId) => {
    e.stopPropagation();
    if (
      window.confirm("Are you sure you want to permanently delete this order?")
    ) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  // دالة جديدة لاختيار الطلب والسكرول في الحالتين
  const handleSelectOrder = (orderId) => {
    if (selectedOrderId === orderId) {
      // إذا كان الاوردر مفتوحاً بالفعل، قم بالسكرول مباشرة
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // إذا كان اوردر جديد، غير الـ State وسوف تتكفل الـ useEffect بالسكرول
      setSelectedOrderId(orderId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading Orders...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading orders: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="px-6 pt-6 pb-14 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-burgundy" /> Orders Management (
            {orders.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* جدول الطلبات الرئيسي */}
          <div
            className={`bg-white rounded-xl shadow-md border overflow-hidden transition-all duration-300 ${
              selectedOrder ? "xl:col-span-7" : "xl:col-span-12"
            }`}
          >
            {orders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Package size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No orders found yet.</p>
              </div>
            ) : (
              // main table
              <div className="overflow-x-auto">
                {/* <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                    <tr>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-gray-600">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap ${
                          selectedOrderId === order._id ? "bg-burgundy/5" : ""
                        }`}
                        onClick={() => handleSelectOrder(order._id)}
                      >
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.phone}
                          </div>
                        </td>
                        <td className="p-4 text-xs">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </td>
                        <td className="p-4 font-bold text-burgundy">
                          {order.totalPrice} EGP
                        </td>

                        <td
                          className="p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={order.status || "none"}
                            onChange={(e) =>
                              updateStatusMutation.mutate({
                                orderId: order._id,
                                status: e.target.value,
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                            className="border border-gray-300 rounded-lg px-2 py-2 text-xs
               bg-white text-gray-700 cursor-pointer
               focus:outline-none focus:ring-2 focus:ring-pink-300
               disabled:opacity-50"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOrder(order._id);
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 hover:text-burgundy transition-all cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>

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
                </table> */}

                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      {["Customer", "Date", "Total", "Status", "Actions"].map(
                        (header) => (
                          <th
                            key={header}
                            className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell"
                          >
                            {header}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-700">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        onClick={() => handleSelectOrder(order._id)}
                        className={`flex flex-col md:table-row mb-4 md:mb-0 border-b md:border-b-0 border-gray-700 md:border-none p-2 md:p-0 cursor-pointer transition-colors ${
                          selectedOrderId === order._id
                            ? "bg-burgundy/5"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Mobile View */}
                        <td className="md:hidden px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col space-y-1.5">
                              <div className="text-sm font-semibold text-gray-900">
                                {order.customerName}
                              </div>

                              <div className="text-xs text-gray-500 ">
                                {order.phone}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectOrder(order._id);
                                }}
                                className="text-gray-500 hover:text-burgundy p-1.5 rounded-md cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                onClick={(e) => handleDelete(e, order._id)}
                                disabled={deleteOrderMutation.isPending}
                                className="text-red-500 hover:text-red-600 p-1.5 rounded-md cursor-pointer disabled:opacity-50"
                                title="Delete Order"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-gray-600 space-y-1">
                            <div className="font-bold text-burgundy">
                              Total: {order.totalPrice} EGP
                            </div>

                            <div className="flex items-center gap-1">
                              Status:
                              <select
                                value={order.status || "Pending"}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  updateStatusMutation.mutate({
                                    orderId: order._id,
                                    status: e.target.value,
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                                className={`appearance-none px-2 py-1 text-xs font-semibold rounded-2xl border-0 cursor-pointer focus:outline-none ${
                                  order.status === "Delivered"
                                    ? "bg-green-200 text-gray-800"
                                    : order.status === "Pending"
                                      ? "bg-yellow-200 text-yellow-800"
                                      : order.status === "Shipped"
                                        ? "bg-blue-200 text-blue-800"
                                        : "bg-red-200 text-red-800"
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>

                            <div>
                              Date:{" "}
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Desktop View */}

                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div>{order.customerName}</div>
                          <div className="text-xs text-gray-500">
                            {order.phone}
                          </div>
                        </td>

                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>

                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm font-bold text-burgundy">
                          {order.totalPrice} EGP
                        </td>

                        <td
                          className="hidden md:table-cell px-6 py-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={order.status || "Pending"}
                            onChange={(e) =>
                              updateStatusMutation.mutate({
                                orderId: order._id,
                                status: e.target.value,
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                            className={`appearance-none px-2 py-2 text-xs font-semibold rounded-lg border-0 cursor-pointer focus:outline-none ${
                              order.status === "Delivered"
                                ? "bg-green-200 text-gray-800"
                                : order.status === "Pending"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : order.status === "Shipped"
                                    ? "bg-blue-200 text-blue-800"
                                    : "bg-red-200 text-red-800"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOrder(order._id);
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 hover:text-burgundy transition-all cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>

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
            )}
          </div>

          {/* القسم الأيمن الجانبي: تفاصيل الطلب */}
          {selectedOrder && (
            <div
              ref={detailsRef}
              className="xl:col-span-5 bg-white rounded-xl shadow-md border p-6 sticky top-6 transition-all duration-300"
            >
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  Order Details
                </h3>
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold cursor-pointer"
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
                  <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-xs leading-relaxed">
                    {selectedOrder.address} - {selectedOrder.governorate}
                  </span>
                </div>
              </div>

              {/* المنتجات داخل الطلب */}
              <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">
                Items To Prepare
              </h4>
              <div className="divide-y border-y max-h-60 overflow-y-auto mb-6">
                {selectedOrder.items?.map((item) => (
                  <div key={item._id} className="flex gap-4 py-3 items-start">
                    <img
                      src={item.selectedColor?.image}
                      alt=""
                      className="w-12 h-16 object-cover rounded bg-gray-100 border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-sm text-gray-800 truncate capitalize">
                        {item.product?.name || item.name}
                      </h5>

                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-1">
                        <span className="capitalize bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                          Color: <strong>{item.selectedColor?.color}</strong>
                        </span>
                        {item.selectedWeight && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                            Weight: <strong>{item.selectedWeight}</strong>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
