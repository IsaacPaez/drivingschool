import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

const handler = NextAuth({
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
      let existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        // Solo redirige a completar perfil, NO crear usuario aquí
        return "/complete-profile?email=" + encodeURIComponent(user.email || "");
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.id = user.id;
        token.email = user.email;
        // Obtener el rol del usuario desde la base de datos
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        token.role = dbUser?.role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Busca el usuario en la base de datos por email
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        (session.user as any).id = dbUser?._id?.toString(); // Usa el _id de MongoDB
        (session.user as any).email = token.email;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Obtener el token manualmente desde la cookie si es necesario
      // Pero NextAuth no pasa el token directamente aquí, así que solo podemos redirigir por URL
      // Si quieres lógica por rol, deberías hacerlo en el frontend después del login
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST }; 