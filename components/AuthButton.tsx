"use client";

import React from "react";
import { SignInButton } from "@clerk/nextjs";
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";

interface AuthButtonProps {
  route: string;
  text: string;
  className?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({ route, text, className }) => {
  const { handleRedirect, isSignedIn } = useAuthRedirect();

  return (
    <>
      <button onClick={() => handleRedirect(route)} className={className}>
        {text}
      </button>

      {/* Modal oculto de Clerk para iniciar sesión */}
      {!isSignedIn && (
        <SignInButton mode="modal">
          <button id="signInModal" className="hidden"></button>
        </SignInButton>
      )}
    </>
  );
};

export default AuthButton;
