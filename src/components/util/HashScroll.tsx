import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function HashScroll() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      // delay in case the page needs to mount child components first
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [hash]);

  return null;
}