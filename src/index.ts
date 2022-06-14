import  DataLoader  from 'dataloader';
import { getUserFromJwtToken } from './utils/getUserFromJwtToken';
import 'dotenv/config'
import { ApolloServer} from "apollo-server";
import { PrismaClient, Prisma, User } from "@prisma/client";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { resolvers } from "./resolvers";
import { userLoader } from './loaders/userLoader';

const typeDefs = loadSchemaSync("src/schema.graphql", {
    loaders: [new GraphQLFileLoader()]
})
export const prisma = new PrismaClient();

export interface Context {
    userId: number | undefined
    userLoader: DataLoader<number, User>
    prisma : PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>
}

const server = new ApolloServer({
    typeDefs,
    resolvers ,
    context: ({req} : any) => {
        const user = getUserFromJwtToken(req.headers.authorization) 
        return{
            userId: user?.userId,
            userLoader,
            prisma
        }
    }   
})

server.listen().then(({url}) =>{
    console.log(`Server ready on ${url}`);
})