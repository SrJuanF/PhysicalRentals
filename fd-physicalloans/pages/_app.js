import "@/styles/globals.css";
import "@/styles/artefacts.css"
import "@/styles/header.css"
import "@/styles/createTool.css"
import "@/styles/card.css"
import "@/styles/modalDiv.css"
import "@/styles/inspection.css";
import { MoralisProvider } from "react-moralis"
import Header from "@/components/Header"
import Head from "next/head"
import { NotificationProvider } from "web3uikit"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
})

export default function App({ Component, pageProps }) {
  return (
        <div>
            <Head>
                <title>NFT Physical Loans</title>
                <meta name="description" content="NFT Physical Loans" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Header />
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
            
        </div>
    )

}

