"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

// I had made it Client Components Module for some reason.

/* LOGIC */

export default function Home() {
  // throw new Error("Test error");

  return (
    <main>
      <div>Hello world!</div>
      {/* <form action="">
        <input type="search" name="q" id="" />
        <input type="text" name="r" id="" />
        <button>Submit</button>
      </form> */}
    </main>
  );
}

/* Notes
When a form is submitted, its input are added to the searchParams with their respective names as keys. https://www.youtube.com/watch?v=WLHHzsqGSVQ
*/
