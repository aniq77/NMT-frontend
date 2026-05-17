import { redirect } from "next/navigation";
import { withToken } from "@/lib/dev";

export default function RootPage() {
  redirect(withToken("/home"));
}
