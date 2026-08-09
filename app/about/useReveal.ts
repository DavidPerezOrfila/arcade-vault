import { useEffect } from 'react';

// Aplica la clase 'in' a los elementos .reveal cuando entran en el viewport.
// Scope: el subtree pasado en ref (no document.querySelectorAll global — eso
// capturaba reveal de otras paginas si las hubiera).
export function useReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const elements = root.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [rootRef]);
}
