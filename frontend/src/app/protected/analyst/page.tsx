import { redirect } from "next/navigation";

export default function AnalystPage() {
  redirect("/protected/admin/dashboard");
}
