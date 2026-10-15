import { redirect } from "next/navigation";

export default function AdmissionApplyPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (appUrl) {
    redirect(`${appUrl}/admission/apply`);
  }
  redirect("/admission");
}
