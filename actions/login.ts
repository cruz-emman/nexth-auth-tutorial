'use server'

import * as z from 'zod'
import { LoginSchema } from '@/schemas'
import { signIn } from 'next-auth/react'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { AuthError } from 'next-auth'

export const login = async (values:z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values)

    if(!validatedFields.success){
        return {error: "Invalid fields!"}

    }

    const {email, password} = validatedFields.data;

    try {
        console.log("Login")
        await signIn("credentials", {
            email,
            password
        })
    } catch (error) {
        
        // if(error instanceof AuthError){
        //     switch(error.type){
        //         case 'CredentialsSignin':
        //             return {error: "Invalid credentials!"}
        //         default: 
        //             return {error: "Something went wrong!"}
        //     }
        // }

        throw error
    }
}