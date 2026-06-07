import React from "react";
import AddProductForm from "./AddProductForm";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import AllProducts from "./AllProducts";
import UpdateProduct from "./UpdateProduct";
import UpdateProductForm from "./UpdateProduct";

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <AllProducts /> },
        { path: "/addProduct", element: <AddProductForm /> },
        { path: "/updateproduct/:id", element: <UpdateProductForm /> },
      ],
    },
  ]);

  return (
    <>
    <RouterProvider router={router}/>
    </>
  );
}
