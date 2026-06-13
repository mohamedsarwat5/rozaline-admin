import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 👈 إصلاح: استيراد الـ Provider الصحيح هنا

import Layout from "./Layout";
import AllProducts from "./AllProducts";
import AddProductForm from "./AddProductForm";
import UpdateProductForm from "./UpdateProduct"; // 👈 تنظيف: إزالة الـ import المكرر والملغي للـ UpdateProduct
import AdminOrders from "./AdminOrders";

// إنشاء الـ queryClient خارج الـ Component لمنع إعادة إنشائه مع كل Render (أفضل للأداء)
const queryClient = new QueryClient();

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <AllProducts /> },
        { path: "/addProduct", element: <AddProductForm /> },
        { path: "/updateproduct/:id", element: <UpdateProductForm /> },
        { path: "/orders", element: <AdminOrders /> }, // 👈 مسار لوحة تحكم الطلبات الجديد
      ],
    },
  ]);

  return (
    // 👈 إصلاح: تعديل الحروف المكتوبة بشكل خاطئ (QueryClientProvider)
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}