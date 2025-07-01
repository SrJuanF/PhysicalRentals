"use client";
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react";
import NFTBox from "@/components/NFTBox"
import networkMapping from "@/constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "@/constants/subgraphQueries"
import { useQuery } from "@apollo/client"

export default function Home() {
    const { chainId, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : null
    const PhysicalRentalAddress = chainId ? networkMapping[chainString].PhysicalRental[0] : null
    const [isClient, setIsClient] = useState(false)

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS, {
        skip: !isWeb3Enabled || !isClient,
    })

    useEffect(() => {
        setIsClient(true)
    }, [])

    console.log("Listed NFTs:", listedNfts)
    console.log("Loading:", loading, "Error:", error)

    /*useEffect(() => {
        fetch(process.env.NEXT_PUBLIC_SUBGRAPH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    {
                        activeItems(first: 5) {
                            id
                            toolId
                            owner
                            rentalPriceUSET
                            depositUsEt
                            renter
                            rentalDuration
                            status
                            condition
                        }
                    }
                `,
            }),
        })
            .then(res => res.json())
            .then(data => console.log("Manual fetch result:", data))
            .catch(err => console.error("Fetch error:", err))
    }, [])*/

    return (
        <div className="main-container">
            <h1 className="title">Artifacts</h1>
            <div className="nft-grid">
                {isWeb3Enabled && chainId ? (
                    loading || (!listedNfts?.activeItems || listedNfts === undefined) ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            const { toolId, owner, rentalPriceUSET, depositUsEt, status, renter, rentalDuration, condition} = nft

                            return PhysicalRentalAddress ? (
                                <NFTBox
                                    nftAddress={PhysicalRentalAddress}
                                    tokenId={toolId}
                                    Owner={owner}
                                    rentalPriceUSET={rentalPriceUSET}
                                    depositUsEt={depositUsEt}
                                    status={status}
                                    renter={renter}
                                    rentalDuration={rentalDuration}
                                    condition={condition}
                                    key={`${PhysicalRentalAddress}${toolId}`}
                                />
                            ) : (
                                <div className="network-error">
                                    Network error, please switch to a supported network.
                                </div>
                            )
                        })
                    )
                ) : (
                    <div className="web3-disabled">Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )

    /*
    const loading = true
    const listedNfts = {
        activeItems: [
            {
                toolId: 0,
                owner: "0xc060DbB08Cd8980479bFfe829236Bcb9a1D9bD06",
                rentalPriceUSET: 50,
                depositUsEt: 50,
                status: 0,
                renter: "0x00",//"0x70DD1FDf265766E7aE67AcD2011D263Ce654E42b",
                rentalDuration: 100000,
                condition: 2,
            },
        ],
    }
    */
}
