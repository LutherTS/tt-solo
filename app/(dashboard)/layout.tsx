export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col-reverse md:flex-row">
      {/* from-blue-500 from-[#5882f2] to-cyan-500 to-[#0fb8cb] */}
      <div className="h-[102px] w-auto bg-gradient-to-r from-[#5882f2] to-[#0fb8cb] md:h-auto md:w-[102px] md:bg-gradient-to-b"></div>
      <div className="h-full">{children}</div>
    </div>
  );
}
