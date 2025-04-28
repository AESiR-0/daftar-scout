import { auth } from "@/auth";
import UserProfileForm from "./userProfileForm";

export default async function page() {
  const session = await auth();
  if (!session?.user) {
    return <div>Unauthorized</div>;
  }
  return (
    <div className="flex flex-col items-center p-4 justify-center min-h-screen">
      <UserProfileForm userMail={session?.user?.email || ""} />
    </div>
  );
}
