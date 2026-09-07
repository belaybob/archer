"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { createOrganization } from "@/server/organizations";

export async function createOrganizationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "");
  const contactEmail = String(formData.get("contactEmail") || "");

  const org = await createOrganization({ name, contactEmail, ownerId: user.id });
  redirect(`/app/tournaments/new?organizationId=${org.id}`);
}
