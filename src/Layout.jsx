import React, { useEffect } from "react";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);
  return (
    <>
     <ScrollToTop />
      <Navbar />
      <Outlet />
    </>
  );
}
