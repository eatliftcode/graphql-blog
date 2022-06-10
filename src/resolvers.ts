import { Context } from "./index"
import { Resolvers, MutationPostCreateArgs, MutationSignUpArgs, PostPayload, Post, PostInput, MutationPostUpdateArgs, MutationPostDeleteArgs } from "./resolvers-types"
import validator from "validator"
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
export const resolvers :Resolvers = {
        Query: {
            posts: async(_:any, __:any, {prisma}: Context) =>{
                return await prisma.post.findMany({
                    orderBy: [{createdAt: 'desc'}]
                })
            }
        },
        Mutation : {
            postCreate: async (_: any, {post} : MutationPostCreateArgs  , {prisma}: Context)  =>{
                const {title, content} = post

                if(!title || !content){
                    return {userErrors: [{message: "Invalid user input"}]}
                }
                const result  = await prisma.post.create({
                    data: {
                        title,
                        content,
                        authorId: 1
                    }
                })
            return {userErrors: [],post: result}
            },
            postUpdate: async (_: any, args: MutationPostUpdateArgs, {prisma}: Context) => {
                const {title, content} = args.post;
                if(!args.postId){
                    return {userErrors: [{message: "Post id not provided"}]}
                }
                if(!title && !content){
                    return{userErrors: [{message: "Please provide either title or content to update"}]}
                }

                const existingPost = await prisma.post.findUnique({where: {id: Number(args.postId)}})
                if(!existingPost){
                    return{userErrors: [{message: "Post not found"}]}
                }

                const postToUpdate = {
                    title : title as string | undefined,
                    content: content as string | undefined
                }
                if(!title) delete postToUpdate.title
                if(!content) delete postToUpdate.content

                const post = await prisma.post.update({
                    where: {id : Number(args.postId)},
                    data: {...postToUpdate}
                })
                return {userErrors: [], post}
            },
            postDelete : async (_:any, args: MutationPostDeleteArgs, {prisma}: Context) => {
                if(!args.postId){
                    return {userErrors: [{message: "Post id not provided"}]}
                }

                const existingPost = await prisma.post.findUnique({where: {id: Number(args.postId)}})
                if(!existingPost){
                    return{userErrors: [{message: "Post not found"}]}
                }
                const post = await prisma.post.delete({
                    where: {
                        id: Number(args.postId)
                    }
                })
                return {userErrors: [], post}
            },
            signUp : async (_:any, args: MutationSignUpArgs, {prisma}: Context) => {
                const {email, password, bio, name} = args
                const isEmail = validator.isEmail(args.email)

                if(!isEmail){
                    return{userErrors: [{message: "Invalid email."}]}
                }
                const isValidPassword = validator.isLength(args.password,{min: 5} )
                if(!isValidPassword){
                    return{userErrors: [{message: "Invalid password."}]}
                } 

                const hashedPassword = await bcrypt.hash(args.password, 10)

                const user = await prisma.user.create({
                    data:{
                        email,
                        password: hashedPassword,
                        name,
                    }
                })
                const secretKey = process.env.JWT_SIGNATURE
                const token = await JWT.sign({
                    userId: user.id,
                    email: user.email
                }, secretKey!, {expiresIn: 360000} )
                return {userErrors: [], token}
            }
    }
}
