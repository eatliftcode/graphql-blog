import { ApolloServer} from "apollo-server";
import { PrismaClient, Prisma } from "@prisma/client";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { resolvers } from "./resolvers";

const typeDefs = loadSchemaSync("src/schema.graphql", {
    loaders: [new GraphQLFileLoader()]
})
const prisma = new PrismaClient();

export interface Context {
    prisma : PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>
}

const server = new ApolloServer({
    typeDefs,
    resolvers ,
    context: {
        prisma
    }
})

server.listen().then(({url}) =>{
    console.log(`Server ready on ${url}`);
})