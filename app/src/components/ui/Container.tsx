import type { ReactNode } from "react";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
