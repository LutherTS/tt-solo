import { Divider, PageTitle } from "../moments/crud";

export function CRUD() {
  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between align-baseline">
          <PageTitle title="Vos paramètres" />
        </div>
        <Divider />
      </div>
    </>
  );
}
