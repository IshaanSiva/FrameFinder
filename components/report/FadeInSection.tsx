"use client";

import { useEffect, useRef, useState } from "react";

interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
  /**
   * "load"   — animate once immediately on page load (hero content)
   * "scroll" — animate whenever the element enters the viewport (default)
   */
  trigger?: "load" | "scroll";
}

export default function FadeInSection({
  children,
  delay = 0,
  trigger = "scroll",
}: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    if (trigger === "load") {
      // useEffect fires after the browser has already painted the opacity:0
      // state, so scheduling the reveal on the next animation frame gives
      // the CSS transition a clear starting frame to animate FROM.
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }

    // trigger === "scroll"
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(14px)",
        transition: visible
          ? `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`
          : "opacity 0.6s ease-out 0ms, transform 0.6s ease-out 0ms",
      }}
    >
      {children}
    </div>
  );
}
