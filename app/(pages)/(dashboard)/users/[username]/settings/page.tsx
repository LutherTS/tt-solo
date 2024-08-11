import { CRUD } from "./crud";

export default function SettingsPage({
  params,
}: {
  params: {
    username: string;
  };
}) {
  return <CRUD />;
}
