import { ArrowUp } from "lucide-react";
import React from "react";

export default function ScrollToTop() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div onClick={scrollToTop} className="bg-pink5 h-12 w-12 flex items-center justify-center fixed right-4 bottom-4 z-10 rounded-full">
      <ArrowUp color="white" />
    </div>
  );
}
