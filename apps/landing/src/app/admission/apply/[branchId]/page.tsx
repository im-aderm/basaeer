import { redirect } from "next/navigation";

export default async function BranchAdmissionApplyPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (appUrl) {
    redirect(`${appUrl}/admission/apply/${branchId}`);
  }
  redirect("/admission");
}
