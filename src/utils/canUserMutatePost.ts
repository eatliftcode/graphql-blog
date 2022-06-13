import { UserError } from './../resolvers-types';
import { Context } from './../index';



export const canUserMutatePost = async(
    userId: number,
    postId: number,
    prisma: Context["prisma"]
 ) =>{
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if(!user){
        return false;
    }
    const post = await prisma.post.findUnique({
        where:{id: postId}
    })

    return post?.authorId == user.id

}