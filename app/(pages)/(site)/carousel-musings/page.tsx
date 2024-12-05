// "use server";
// Proposes "use server" to enforce a Server Module.

import { redirect } from "next/navigation";
import { LeftClientButton, RightClientButton } from "./client-buttons";
import Form from "next/form";

export default async function Page({
  searchParams,
}: {
  searchParams: { slide?: string };
}) {
  searchParams = await searchParams;

  const items = ["Item 1", "Item 2", "Item 3"];
  const currentIndex = parseInt(searchParams.slide || "0", 10) || 0;

  return (
    <div>
      <h1>Carousel Example</h1>
      <Carousel items={items} currentIndex={currentIndex} />
    </div>
  );
}

const Carousel = ({
  items,
  currentIndex,
}: {
  items: string[];
  currentIndex: number;
}) => {
  return (
    <div>
      <div
        // It works, I can actually get this done in CSS and it's not even complicated, even with transform being on the style prop.
        // AND it even has interruptability. I simply won't be able to use spring animations at this time.
        className="transition-all duration-1000"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
      {/* <LeftClientButton currentIndex={currentIndex} /> */}
      <PreviousIndexFormAndButton currentIndex={currentIndex} />
      <RightClientButton currentIndex={currentIndex} />
    </div>
  );
};

const PreviousIndexFormAndButton = ({
  currentIndex,
}: {
  currentIndex: number;
}) => {
  async function previousIndex() {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.
    // On top of modules, "use server functions" would enforce a Server Functions Module.

    console.log("Previous.", currentIndex);
    redirect("/carousel-musings");
  }

  return (
    <Form action={previousIndex}>
      <button type="submit">Previous</button>
    </Form>
  );
};

/* Notes
Switching pages with redirect provokes a full refresh. (Which is weird because I don't remember it being like this on my moments page?) So that's why a client component as usual would be required for navigation.
Exactly. So always prefer useRouter to get navigation client-side without hard refreshes.
...
Wait. What if I was using the Form component to enforce client-side animations on... I has no effect, it's redirect that makes a GET 303 which has to be a full page refresh. It's only logical that client-side navigation requires Client Components.
*/
