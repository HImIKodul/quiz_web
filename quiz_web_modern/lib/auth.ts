import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Phone Number", type: "text" },
        password: { label: "Password", type: "password" },
        deviceId: { label: "Device ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Phone number and password are required.");
        }

        let phone = credentials.identifier.trim();
        if (phone.length === 8 && /^\d+$/.test(phone)) {
          phone = "+976" + phone;
        }

        const user = await prisma.user.findUnique({
          where: { identifier: phone },
          include: { devices: true },
        });

        if (!user) {
          throw new Error("Бүртгэлтэй хэрэглэгч байхгүй байна.");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordCorrect) {
          throw new Error("Нууц үг буруу байна.");
        }

        // --- Device Tracking Logic ---
        const deviceId = credentials.deviceId;
        if (deviceId) {
          const knownDevice = user.devices.find((d) => d.deviceToken === deviceId);
          if (!knownDevice) {
            const limit = user.maxDevices ?? 3;
            if (user.devices.length >= limit) {
              throw new Error(`Та ${limit}-аас олон төхөөрөмжөөс нэвтрэх боломжгүй. Админтай холбогдоно уу.`);
            }
            
            // Register new device
            await prisma.userDevice.create({
              data: {
                userId: user.id,
                deviceToken: deviceId,
                deviceName: "Modern Web Browser", // Default, can be improved with user-agent
              },
            });
          }
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.identifier, // We use identifier (phone) as the unique email field for NextAuth
          role: user.role,
          plan: user.plan,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).plan = token.plan;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
