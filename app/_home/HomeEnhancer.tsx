"use client";

import { useEffect } from "react";

// ponytail: único useEffect del Home — activa el IntersectionObserver que
// marca `.reveal` cuando entra en el viewport. Mantenido aparte para que
// `app/page.tsx` siga siendo Server Component y pueda montar los helpers
// async (`RecentActivity`, `TopPlayersToday`).
export default function HomeEnhancer() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLDivElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
