import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import User from "@/models/User";
import Instructor from "@/models/Instructor";
import { connectDB } from "@/lib/mongodb";
import { NextAuthOptions } from "next-auth";

interface CustomUser {
  id?: string;
  email?: string;
  role?: string;
  instructorId?: string;
  instructorName?: string;
  instructorPhoto?: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
      authorization: {
        params: {
          prompt: "login"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      await connectDB();
      // Buscar primero en instructores
      const instructor = await Instructor.findOne({ email: user.email });
      if (instructor) {
        (user as CustomUser).role = "instructor";
        (user as CustomUser).instructorId = instructor._id.toString();
        (user as CustomUser).instructorName = instructor.name;
        (user as CustomUser).instructorPhoto = instructor.photo;
        return true;
      }
      // Si no es instructor, buscar en users
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        (user as CustomUser).role = "user";
        return true;
      }
      // Si no existe, permitir completar perfil
      (user as CustomUser).role = "new";
      return "/complete-profile?email=" + encodeURIComponent(user.email || "");
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as CustomUser).role;
        token.instructorId = (user as CustomUser).instructorId;
        token.instructorName = (user as CustomUser).instructorName;
        token.instructorPhoto = (user as CustomUser).instructorPhoto;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        await connectDB();
        // Si es instructor, pasar la id, nombre y foto
        if (token.role === "instructor") {
          (session.user as CustomUser).role = "instructor";
          (session.user as CustomUser).instructorId = token.instructorId;
          (session.user as CustomUser).instructorName = token.instructorName;
          (session.user as CustomUser).instructorPhoto = token.instructorPhoto;
        } else {
          // Busca el usuario en la base de datos por email
          const dbUser = await User.findOne({ email: token.email });
          (session.user as CustomUser).id = dbUser?._id?.toString();
          (session.user as CustomUser).role = "user";
        }
        (session.user as CustomUser).email = token.email;
      }
      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 