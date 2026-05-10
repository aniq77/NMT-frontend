import { redirect } from "next/navigation";

// Temporary root — redirects to home once the home screen is built.
// Authenticated users will land here after login.
export default function RootPage() {
  redirect("/login");
}
