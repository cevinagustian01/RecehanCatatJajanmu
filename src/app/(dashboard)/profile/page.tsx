import { getProfile } from "@/app/actions/profile";
import ProfileClient from "./ProfileClient";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getProfile();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <ProfileClient initialUser={JSON.parse(JSON.stringify(user))} />
  );
}
