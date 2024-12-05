"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

/* IMPORTS */

// External imports

import { usePathname, useRouter } from "next/navigation";

/* LOGIC */

export function LeftClientButton({ currentIndex }: { currentIndex: number }) {
  const { push } = useRouter();
  const pathname = usePathname();

  return (
    <button onClick={() => push(`${pathname}?slide=${currentIndex - 1}`)}>
      Prev
    </button>
  );
}

export function RightClientButton({ currentIndex }: { currentIndex: number }) {
  const { push } = useRouter();
  const pathname = usePathname();

  return (
    <button onClick={() => push(`${pathname}?slide=${currentIndex + 1}`)}>
      Next
    </button>
  );
}

/* Notes
Here's the previous button when I thought I could run it entirely on the client, but doing so provokes full page refresh.
<form action={previousIndex}>
  <input type="hidden" name="currentIndex" value={currentIndex} />
  <button type="submit" className="carousel-button prev">
    Previous
  </button>
</form>
This is why partial pre-rendering matters. The whole page can be pre-rendered. But then the new client-side button can be handled by the client. All that needs to be done on the server is to make sure that the fallback does not provoke any layout shift. It could be the exact same button, grayscaled, then replaced by the client-side button that works.
*/
