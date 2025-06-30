import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import PhysicalRentalAbi from "@/constants/PhysicalRental.json"
import Image from "next/image"
import { Card } from "web3uikit"
import { ethers } from "ethers"
import ToolActionModal from "./InspectTool"
import UpdateListingModal from "./Lender/UpdateListingModal"
import RentToolModal from "./Renter/RentToolModal"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTBox({
    nftAddress,
    tokenId,
    Owner,
    rentalPriceUSET,
    depositUsEt,
    status,
    renter,
    rentalDuration,
    condition
}) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState(
        "https://ethic.es/wp-content/uploads/2023/03/imagen.jpg"
    )
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")

    const [showMododalUpdate, setShowMododalUpdate] = useState(false)
    const [showModalRent, setShowModalRent] = useState(false)
    const [showModalInspect, setShowModalInspect] = useState(false)
    const conditionMap = {
        1: "New",
        2: "Used in good condition",
        3: "Used with wear, functional",
    }
    const ShowCondition = conditionMap[condition]
    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: PhysicalRentalAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    })
    async function updateUI() {
        const tokenURI = await getTokenURI()
        console.log(`The TokenURI is ${tokenURI}`)
        if (tokenURI) {
            // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
            //const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(tokenURI)).json()
            const imageURI = tokenURIResponse.image
            //const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI(imageURI)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)

        }
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const STATUS_LABELS = {
        0: "Available",
        1: "Requested",
        2: "Sended",
        3: "Rented",
        4: "Returned",
        5: "Inspected",
    }

    const isOwnedByUser = Owner.toLocaleLowerCase() == account.toLocaleLowerCase()
    const formattedOwnerAddress = isOwnedByUser ? "you" : truncateStr(Owner || "", 15)

    const isRenterByUser = renter.toLocaleLowerCase() == account.toLocaleLowerCase()


    const handleCardClick = () => {
        if (isOwnedByUser) {
            if (STATUS_LABELS[status] == "Available" || STATUS_LABELS[status] == "Inspected") { //****** STUTS SENDEEED */
                setShowMododalUpdate(true)
            } else if (
                STATUS_LABELS[status] == "Requested" ||
                STATUS_LABELS[status] == "Returned"
            ) {
                setShowModalInspect(true)
            }
        } else if (isRenterByUser) {
            if (STATUS_LABELS[status] == "Rented" || STATUS_LABELS[status] == "Requested") {
                setShowModalInspect(true)
            }
        } else if (STATUS_LABELS[status] == "Available") {
            setShowModalRent(true)
        }
    }

    const statusLabel = STATUS_LABELS[status]

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showMododalUpdate}
                            tokenId={tokenId}
                            nftAddress={nftAddress}
                            onClose={() => setShowMododalUpdate(false)}
                        />
                        <RentToolModal
                            isVisible={showModalRent}
                            tokenId={tokenId}
                            nftAddress={nftAddress}
                            rentalPriceUSET={rentalPriceUSET}
                            depositUsEt={depositUsEt}
                            onClose={() => setShowModalRent(false)}
                        />
                        <ToolActionModal
                            isVisible={showModalInspect}
                            tokenId={tokenId}
                            nftAddress={nftAddress}
                            action={STATUS_LABELS[status]}
                            onClose={() => setShowModalInspect(false)}
                        />

                        <div className="custom-card" onClick={handleCardClick}>
                            <h3 className="card-title">{tokenName}</h3>
                            <p className="card-description">{tokenDescription}</p>

                            <div className="card-content">
                                <div className="card-meta">#{tokenId}</div>
                                <div className="card-owner">Owned by {formattedOwnerAddress}</div>

                                <Image
                                    loader={() => imageURI}
                                    src={imageURI}
                                    alt={tokenName}
                                    height="200"
                                    width="200"
                                    className="card-image"
                                />

                                <div className={`card-status status-${statusLabel.toLowerCase()}`}>
                                    {statusLabel}
                                </div>

                                <div className="card-info">
                                    {ShowCondition}
                                </div>

                                {(statusLabel === "Available" || statusLabel === "Requested") && (
                                    <>
                                        <div className="card-info">
                                            Daily Rental Price: {rentalPriceUSET} USD
                                        </div>
                                        <div className="card-info">
                                            Security Deposit: {depositUsEt} USD
                                        </div>
                                    </>
                                )}

                                {(statusLabel === "Rented" || statusLabel === "Returned") && (
                                    <>
                                        <div className="card-info">
                                            Tenant: {truncateStr(renter || "", 15)}
                                        </div>
                                        <div className="card-info">
                                            Loan Days: {rentalDuration / 86400}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
    //ethers.utils.formatUnits(price, "ether")
}
