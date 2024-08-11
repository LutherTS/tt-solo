export default function Home({
  params,
}: Readonly<{
  params: {
    username: string;
  };
}>) {
  const username = params.username;
  console.log(username);

  return (
    <main>
      <div>Hello {username}!</div>
    </main>
  );
}
