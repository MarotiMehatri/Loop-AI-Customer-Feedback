// export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
//   return <>{children}</>;
// }
import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}