import { Context } from "./index"
import { Resolvers, MutationPostCreateArgs, PostPayload, Post, PostInput, MutationPostUpdateArgs } from "./resolvers-types"

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
            }
    }
}
