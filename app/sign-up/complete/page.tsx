import { auth } from "@/app/auth";
import UserProfileForm from "./userProfileForm";

export default async function page() {
  const session = await auth();
  if (!session?.user) {
    return <div>Unauthorized</div>;
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">
        Welcome to the Sign-Up Completion Page
      </h1>
      <p className="mt-4 text-lg">Your sign-up is almost complete!</p>
      <p className="mt-2 text-lg">Please fill out your profile information.</p>
      <UserProfileForm userMail={session?.user?.email || ""} />
    </div>
  );
}
