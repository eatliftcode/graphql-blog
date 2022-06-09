import { Context } from "./index"
import { Resolvers, MutationPostCreateArgs, PostPayload, Post } from "./resolvers-types"

export const resolvers : Resolvers  = {
        Query: {
            posts: async(_:any, __:any, {prisma}: Context) =>{
                return await prisma.post.findMany({
                    orderBy: [{createdAt: 'desc'}]
                })
            }
        },
        Mutation : {
            postCreate: async (_: any, {title, content} : MutationPostCreateArgs  , {prisma}: Context)  =>{
                const post  = await prisma.post.create({
                    data: {
                        title,
                        content,
                        authorId: 1
                    }
                })
            return {userErrors: [],post}
        }
    }
}
