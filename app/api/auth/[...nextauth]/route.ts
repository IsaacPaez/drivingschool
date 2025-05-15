import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import User from "@/models/User";
import Instructor from "@/models/Instructor";
import { connectDB } from "@/lib/mongodb";
import { NextAuthOptions } from "next-auth";

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
    async signIn({ user, account }) {
      await connectDB();
      // Buscar primero en instructores
      const instructor = await Instructor.findOne({ email: user.email });
      if (instructor) {
        (user as any).role = "instructor";
        (user as any).instructorId = instructor._id.toString();
        (user as any).instructorName = instructor.name;
        (user as any).instructorPhoto = instructor.photo;
        return true;
      }
      // Si no es instructor, buscar en users
      let existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        (user as any).role = "user";
        return true;
      }
      // Si no existe, permitir completar perfil
      (user as any).role = "new";
      return "/complete-profile?email=" + encodeURIComponent(user.email || "");
    },
    async jwt({ token, account, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role;
        token.instructorId = (user as any).instructorId;
        token.instructorName = (user as any).instructorName;
        token.instructorPhoto = (user as any).instructorPhoto;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        await connectDB();
        // Si es instructor, pasar la id, nombre y foto
        if (token.role === "instructor") {
          (session.user as any).role = "instructor";
          (session.user as any).instructorId = token.instructorId;
          (session.user as any).instructorName = token.instructorName;
          (session.user as any).instructorPhoto = token.instructorPhoto;
        } else {
          // Busca el usuario en la base de datos por email
          const dbUser = await User.findOne({ email: token.email });
          (session.user as any).id = dbUser?._id?.toString();
          (session.user as any).role = "user";
        }
        (session.user as any).email = token.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 