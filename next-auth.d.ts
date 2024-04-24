import { UserRole } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"


export type ExtendedUser = DefaultSession['user'] & {
  id: string
  role: UserRole
}

declare module "next-auth" {
    interface Session {
       user: ExtendedUser
      }}

declare module "next-auth/jwt" {
        /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
        interface JWT {
          /** OpenID ID Token */
          role?: "ADMIN" | "USER"
        }
      }