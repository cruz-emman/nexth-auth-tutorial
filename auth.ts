import NextAuth, { DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "./auth.config"
import { db } from "./lib/db"
import { getUserById } from "./data/user"
import { UserRole } from "@prisma/client"
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation"
import { getAccountByUserId } from "./data/accounts"


 
export const { handlers: {GET, POST}, auth, signIn, signOut, unstable_update } = NextAuth({
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Error code passed in query string as ?error=
 
  },
  events: {
    async linkAccount({user}){
      await db.user.update({ 
        where: {id: user.id},
        data: {emailVerified: new Date()}
      })
    }
  },
  callbacks: {
    async signIn({user,account}){
      
      if(account?.provider !== 'credentials') return true
      

      const existingUser = await getUserById(user.id)

      if(!existingUser?.emailVerified) return false

      //TODO: ADD 2FA Check

      if(existingUser.isTwoFactorEnabled){
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)

        if(!twoFactorConfirmation) return false;

        console.log({twoFactorConfirmation})

        await db.twoFactorConfirmation.delete({
          where: {id: twoFactorConfirmation.id}
        })

      }
      
    

      return true
    },
    async session ({token, session}){


      if(token.sub && session.user){
        session.user.id = token.sub
      }

      //nag dagdag ako ng data  sa token object so
      if(token.role && session.user){
        session.user.role = token.role as UserRole;
      }
    
      if( session.user){
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
      }

      if(session.user){
        session.user.name = token.name;
        session.user.email = token.email as string
        session.user.isOAuth = token.isOAuth as boolean
      }
    
      return session

    },
    async jwt({token}){
      if(!token.sub) return token;
      
      const existingUser = await getUserById(token.sub)

      if(!existingUser) return token

      const existingAccount = await getAccountByUserId(existingUser.id)


      token.isOAuth = !!existingAccount
      token.name = existingUser.name
      token.email = existingUser.email
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled
      return token
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})