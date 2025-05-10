export {};

// Create a type for the roles
export type Roles = "teachers_admin" | "Member";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}

// Extiende el tipo de sesión de NextAuth para incluir 'id' en el usuario
import NextAuth from "next-auth";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
