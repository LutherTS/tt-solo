import { Divider, PageTitle } from "../components";

export function CRUD() {
  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between align-baseline">
          <PageTitle title="Vos destinations" />
        </div>
        <Divider />
      </div>
    </>
  );
}
