import { Divider, PageTitle } from "../moments/crud";

export function CRUD() {
  return (
    // w-full replacing w-screen with w-full on parent in layout
    <main className="flex w-full flex-col items-center">
      <div className="min-h-screen w-full max-w-4xl space-y-8 overflow-clip px-8 pb-12 pt-8 md:pb-24">
        <div className="space-y-8">
          <div className="flex justify-between align-baseline">
            <PageTitle title="Vos paramètres" />
          </div>
          <Divider />
        </div>
      </div>
    </main>
  );
}
