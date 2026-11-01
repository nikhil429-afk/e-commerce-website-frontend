import { useEffect } from 'react';

/**
 * Touch-device "focus the card in the middle of the screen".
 *
 * Phones and tablets have no hover, so the card options (Quick View / Details ...)
 * used to need a first tap just to reveal them. Instead, while the user scrolls, the
 * product card closest to the vertical centre of the viewport is marked with
 * `data-focused="true"` and the CSS reveals its options - so a single tap on
 * "Quick View" opens it straight away.
 *
 * Mark each card with the `data-focus-card` attribute. Pass anything that changes
 * when the list of cards changes (e.g. the product count) as `dep`.
 * On devices that have a real hover (mouse / trackpad) this does nothing and the
 * normal :hover styling is used.
 */
export function useCenterFocus(dep?: unknown) {
  useEffect(() => {
    const touchOnly = window.matchMedia('(hover: none)');
    let raf = 0;

    const clear = () => {
      document.querySelectorAll<HTMLElement>('[data-focus-card][data-focused]').forEach(el => el.removeAttribute('data-focused'));
    };

    const update = () => {
      raf = 0;
      if (!touchOnly.matches) { clear(); return; }

      const cards = document.querySelectorAll<HTMLElement>('[data-focus-card]');
      const mid = window.innerHeight / 2;
      let best: HTMLElement | null = null;
      let bestDist = Infinity;

      cards.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;      // off-screen
        const centre = r.top + r.height / 2;
        // the card must actually cover the middle band of the screen (middle 40%)
        const covers = r.top < mid + window.innerHeight * 0.2 && r.bottom > mid - window.innerHeight * 0.2;
        if (!covers) return;
        const d = Math.abs(centre - mid);
        if (d < bestDist) { bestDist = d; best = el; }
      });

      cards.forEach(el => {
        if (el === best) el.setAttribute('data-focused', 'true');
        else el.removeAttribute('data-focused');
      });
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    touchOnly.addEventListener?.('change', schedule);

    // cards usually arrive after an API call - re-evaluate whenever the page's DOM changes
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      touchOnly.removeEventListener?.('change', schedule);
      clear();
    };
  }, [dep]);
}
