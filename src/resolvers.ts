import { Context } from "./index"
import { Resolvers, MutationPostCreateArgs, PostPayload, Post } from "./resolvers-types"

export const resolvers : Resolvers  = {
        Mutation : {
            postCreate: async (_: any, {title, content} , {prisma}: Context)  =>{
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
