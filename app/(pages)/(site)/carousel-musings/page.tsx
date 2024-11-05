// app/page.tsx or app/carousel/page.tsx

// import { redirect } from "next/navigation";
import { LeftClientButton, RightClientButton } from "./client-buttons";

export default async function Page({
  searchParams,
}: {
  searchParams: { slide?: string };
}) {
  searchParams = await searchParams;

  const items = ["Item 1", "Item 2", "Item 3"];
  const currentIndex = parseInt(searchParams.slide || "0", 10) || 0;

  // async function nextIndex(formData: FormData) {
  //   "use server";

  //   const currentIndex = Number(formData.get("currentIndex") || 0);
  //   const next = currentIndex + 1;
  //   redirect("/carousel?slide=" + next);
  // }

  // async function previousIndex(formData: FormData) {
  //   "use server";

  //   const currentIndex = Number(formData.get("currentIndex") || 0);
  //   const prev = currentIndex - 1;
  //   redirect("/carousel?slide=" + prev);
  // }

  return (
    <div>
      <h1>Carousel Example</h1>
      <Carousel
        items={items}
        currentIndex={currentIndex}
        // nextIndex={nextIndex}
        // previousIndex={previousIndex}
      />
    </div>
  );
}

const Carousel = ({
  items,
  currentIndex,
  // nextIndex,
  // previousIndex,
}: {
  items: string[];
  currentIndex: number;
  // nextIndex: any;
  // previousIndex: any;
}) => {
  return (
    <>
      <div className="carousel">
        <div
          // it works, I can actually get this done in CSS and it's not even complicated, even with transform being on the style prop
          className="carousel-container transition-all duration-1000"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div className="carousel-item" key={index}>
              {item}
            </div>
          ))}
        </div>
        {/* <form action={previousIndex}>
          <input type="hidden" name="currentIndex" value={currentIndex} />
          <button type="submit" className="carousel-button prev">
            Previous
          </button>
        </form> */}
        <LeftClientButton currentIndex={currentIndex} />
        {/* <form action={nextIndex}>
          <input type="hidden" name="currentIndex" value={currentIndex} />
          <button type="submit" className="carousel-button next">
            Next
          </button>
        </form> */}
        <RightClientButton currentIndex={currentIndex} />
      </div>
    </>
  );
};

/* Notes
Switch pages with redirect provokes a full refresh. (Which is weird because I don't remember it being like this on my moments page?) So that's why a client component as usual would be required for navigation.
Exactly. So always prefer useRouter to get navigation client-side without hard refreshes.
*/
