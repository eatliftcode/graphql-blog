import { canUserMutatePost } from './utils/canUserMutatePost';
import { getJwtToken } from './utils/getJwtToken';
import { Context } from "./index"
import { Resolvers, MutationPostCreateArgs, MutationSignUpArgs, PostPayload, Post, PostInput, MutationPostUpdateArgs, MutationPostDeleteArgs, MutationPostPublishUnPublishArgs, QueryProfileArgs, Profile } from "./resolvers-types"
import validator from "validator"
import bcrypt from "bcryptjs"
import { printSchema } from 'graphql';
export const resolvers :Resolvers = {
        Query: {
            me: async(_:any, __: any, {userId, prisma}: Context) =>{
                if(!userId) return null;

                return prisma.user.findUnique({
                    where:{
                        id: Number(userId)
                    }
                })
            },
            posts: async(_:any, __:any, {prisma}: Context) =>{
                return await prisma.post.findMany({
                    where:{published: true},
                    orderBy: [{createdAt: 'desc'}]
                })
            },
            profile: async(_:any, {userId}: QueryProfileArgs, {prisma}: Context)=>{
                return prisma.profile.findUnique({
                    where: {
                        userId: Number(userId)
                    }
                })
            }
        },
        Profile : {
            user: async (parent: any, __:any, {prisma}: Context) => {
                return prisma.user.findUnique({
                    where: {
                        id: parent.userId
                    }
                })
            }
        },
        Post: {
            user: async(parent:any, __: any, {prisma}: Context)=>{
                return prisma.user.findUnique({
                    where:{
                        id: parent.authorId
                    }
                })
            }
        },
        User: {
            posts: async(parent: any, __:any,{userId, prisma}: Context)=>{
                const isOwnProfile = parent.id == userId;
                if(isOwnProfile){
                    return prisma.post.findMany({
                        where: {
                            authorId: parent.id
                        }
                    })
                }
                return prisma.post.findMany({
                    where: {
                        published: true,
                        authorId: parent.id
                    }
                })
            }
        },
        Mutation : {
            postCreate: async (_: any, {post} : MutationPostCreateArgs  , {userId, prisma}: Context)  =>{
                if(!userId){
                    return {userErrors: [{message: "Fotbidden access"}]}
                }
                console.log(userId)
                const {title, content} = post

                if(!title || !content){
                    return {userErrors: [{message: "Invalid user input"}]}
                }
                const result  = await prisma.post.create({
                    data: {
                        title,
                        content,
                        authorId: userId
                    }
                })
            return {userErrors: [],post: result}
            },
            postUpdate: async (_: any, args: MutationPostUpdateArgs, {userId, prisma}: Context) => {
                if(!userId){
                    return {userErrors: [{message: "Fotbidden access"}]}
                }
                const userCan = await canUserMutatePost(userId, Number(args.postId), prisma)
               
                if(!userCan){
                    return {userErrors: [{message: "User not authorized to update the post"}]}
                }
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
            postDelete : async (_:any, args: MutationPostDeleteArgs, {userId, prisma}: Context) => {
                if(!args.postId){
                    return {userErrors: [{message: "Post id not provided"}]}
                }

                if(!userId){
                    return {userErrors: [{message: "Fotbidden access"}]}
                }
                const userCan = await canUserMutatePost(userId, Number(args.postId), prisma)
               
                if(!userCan){
                    return {userErrors: [{message: "User not authorized to update the post"}]}
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
            postPublishUnPublish: async (_: any, {postId, publish}: MutationPostPublishUnPublishArgs, {userId,prisma}: Context) =>{
                if(!postId){
                    return {userErrors: [{message: "Post id not provided"}]}
                }

                if(!userId){
                    return {userErrors: [{message: "Fotbidden access"}]}
                }
                const userCan = await canUserMutatePost(userId, Number(postId), prisma)
               
                const post = prisma.post.update({
                    data: {
                        published: publish
                    },
                    where: {
                        id: Number(postId)
                    }
                })
                return {userErrors:[], post}
            },
            signUp : async (_:any, args: MutationSignUpArgs, {prisma}: Context) => {
                const { bio, name} = args
                const {email, password} = args.credentials
                const isEmail = validator.isEmail(email)

                if(!isEmail){
                    return{userErrors: [{message: "Invalid email."}]}
                }
                const isValidPassword = validator.isLength(password,{min: 5} )
                if(!isValidPassword){
                    return{userErrors: [{message: "Invalid password."}]}
                } 

                const hashedPassword = await bcrypt.hash(password, 10)

                const user = await prisma.user.create({
                    data:{
                        email,
                        password: hashedPassword,
                        name,
                    }
                })

                await prisma.profile.create({
                    data:{
                        bio,
                        userId: user.id
                    }
                })
                const token = getJwtToken(user.id)

                return {userErrors: [], token}
            },
            signIn: async(_: any, {credentials}, {prisma}: Context) =>{
                const {email, password} = credentials;

                const user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    }
                })
                if(!user){
                    return {userErrors: [{message: "user not found"}]}
                }
                const isMatch = await  bcrypt.compare(password, user.password)
                if(!isMatch){
                    return {userErrors: [{message: "Invalid credentials"}]}
                }
                const token = getJwtToken(user.id)

                return {userErrors: [], token}
            }
    }
}
