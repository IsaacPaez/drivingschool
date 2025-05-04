"use client";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn redirectUrl={redirectUrl} routing="hash" />
    </div>
  );
}
