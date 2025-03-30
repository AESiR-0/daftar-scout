import { auth } from "@/auth";
import UserProfileForm from "./userProfileForm";

export default async function page() {
  const session = await auth();
  if (!session?.user) {
    return <div>Unauthorized</div>;
  }
  return (
    <div className="flex flex-col items-center p-4 justify-center min-h-screen">
      <h2 className="mt-4 text-2xl font-semibold">You are almost there!</h2>
      <UserProfileForm userMail={session?.user?.email || ""} />
    </div>
  );
}
