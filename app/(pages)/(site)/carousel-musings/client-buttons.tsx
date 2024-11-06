"use client";

import { useRouter } from "next/navigation";

export function LeftClientButton({ currentIndex }: { currentIndex: number }) {
  const { push } = useRouter();

  return (
    <button
      className="carousel-button prev"
      onClick={() => push(`/carousel-musings?slide=${currentIndex - 1}`)}
    >
      Prev
    </button>
  );
}

export function RightClientButton({ currentIndex }: { currentIndex: number }) {
  const { push } = useRouter();

  return (
    <button
      className="carousel-button next"
      onClick={() => push(`/carousel-musings?slide=${currentIndex + 1}`)}
    >
      Next
    </button>
  );
}
