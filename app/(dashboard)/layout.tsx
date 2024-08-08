export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col-reverse md:flex-row">
      {/* from-blue-500 from-[#5882f2] to-cyan-500 to-[#0fb8cb] */}
      <div>
        <div className="fixed inset-x-0 bottom-0 top-auto z-50 h-[102px] w-auto shrink-0 bg-gradient-to-r from-[#5882f2] to-[#0fb8cb] md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[102px] md:bg-gradient-to-b"></div>
        <div className="h-[102px] w-auto shrink-0 bg-transparent md:h-auto md:w-[102px]"></div>
      </div>
      <div className="h-full">{children}</div>
    </div>
    // <>{children}</>
  );
}

/* Notes
Let's try something for the overscroll.
*/
