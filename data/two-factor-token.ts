import { db } from "@/lib/db";

export const getFactorTokenbyToken = async (token: string) =>{
    try {
        const twoFactorToken = await db.twoFactorToken.findUnique({
            where: {token}
        })

        return twoFactorToken
    } catch (error) {
        return null
    }
}


export const getFactorTokenbyEmail = async (email: string) =>{
    try {
        const twoFactorToken = await db.twoFactorToken.findFirst({
            where: {email}
        })

        return twoFactorToken
    } catch (error) {
        return null
    }
}