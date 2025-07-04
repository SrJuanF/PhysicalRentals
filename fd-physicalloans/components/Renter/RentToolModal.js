import { Modal, Input, useNotification } from "web3uikit"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import PhysicalRental from "@/constants/PhysicalRental.json"
import { ethers } from "ethers"

export default function RentToolModal({ isVisible, tokenId, nftAddress, rentalPriceUSET, depositUsEt, onClose}) {
    const dispatch = useNotification()
    const { chainId, isWeb3Enabled, web3, account } = useMoralis()
    const [contract, setEtherContract] = useState(null)

    const [rentalDays, setRentalDays] = useState("")
    const [ethToSend, setEthToSend] = useState("")
    const [nativeTokenPriceUSD, setNativeTokenPriceUSD] = useState(null)
    const coinGeckoTokenIdByChain = {
        11155111: "ethereum", // Sepolia → ETH
        43113: "avalanche-2", // Fuji → AVAX
    }
    const [isLoading, setIsLoading] = useState(false)
    // Load the contract
    useEffect(() => {
        if (isWeb3Enabled && web3.provider && account) {
            try {
                const provider = new ethers.providers.Web3Provider(web3.provider);
                const signer = provider.getSigner();
                const contractEthers = new ethers.Contract(nftAddress, PhysicalRental, signer);
                setEtherContract(contractEthers);
                console.log("Contract created and set in useEffect.");
            } catch (error) {
                console.error("Error creating contract:", error);
                setEtherContract(null); // Set to null if an error occurs
            }
        } else {
            console.log("Conditions not met for contract creation. Setting contract to null.");
            setEtherContract(null);
        }
    }, [isWeb3Enabled, web3, account]);

    const totalUSD = rentalDays ? rentalDays * Number(rentalPriceUSET) + Number(depositUsEt) : 0
    const totalETH = nativeTokenPriceUSD ? totalUSD / nativeTokenPriceUSD : 0

    useEffect(() => {
        async function fetchTokenPriceUSD() {
            if (!chainId) return
            const tokenIdSear = coinGeckoTokenIdByChain[parseInt(chainId).toString()]
            if (!tokenIdSear) return
            try {
                const res = await fetch(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIdSear}&vs_currencies=usd`
                )
                const data = await res.json()
                setNativeTokenPriceUSD(data[tokenIdSear]?.usd)
            } catch (err) {
                console.error("Error fetching token price:", err)
            }
        }
        if (isWeb3Enabled) {
            fetchTokenPriceUSD()
        }
    }, [chainId, isWeb3Enabled])
    useEffect(() => {
        if (nativeTokenPriceUSD && +rentalDays > 0) {
            const suggestedEth = (
                (Number(rentalPriceUSET) * rentalDays + Number(depositUsEt)) /
                nativeTokenPriceUSD
            ).toFixed(6)
            setEthToSend(suggestedEth)
        }
    }, [rentalDays, nativeTokenPriceUSD])

    const handleSuccess = () => {
        dispatch({
            type: "success",
            message: "Tool rented successfully",
            title: "Success",
            position: "topR",
        })
        handleClose()
    }
    const handleClose = () => {
        onClose && onClose()
        setRentalDays("")
        setEthToSend("")
        setIsLoading(false)
    }
    const handleSubmit = async () => {
        if(isLoading) return
        setIsLoading(true)
        if (+rentalDays <= 0) {
            dispatch({
                type: "error",
                message: "You must enter at least 1 day",
                title: "Invalid days",
                position: "topR",
            })
            return
        }

        const totalUSD = Number(rentalPriceUSET) * rentalDays + Number(depositUsEt)
        const requiredETH = nativeTokenPriceUSD ? totalUSD / nativeTokenPriceUSD : 0

        if (+ethToSend < requiredETH) {
            dispatch({
                type: "error",
                message: `You must send at least ${requiredETH.toFixed(4)} ETH/AVAX`,
                title: "Insufficient funds",
                position: "topR",
            })
            return
        }

        try {
            const seconds = parseInt(rentalDays) * 86400
            const tx = await contract.rentTool(
                ethers.BigNumber.from(tokenId.toString()),
                ethers.BigNumber.from(seconds.toString()),
                { value: ethers.utils.parseEther(ethToSend.toString())}
            )
            const receipt = await tx.wait()
            //console.log("Transaction confirmed:", receipt)
            handleSuccess()
        } catch (error) {
            console.error("Error listing tool:", error)
            dispatch({ type: "error", message: error.message || String(error), title: "Transaction Failed", position: "topR",})
        }
    }

    return (
        <Modal
            title={"Rent the tool"}
            isVisible={isVisible}
            onCancel={handleClose}
            onCloseButtonPressed={handleClose}
            onOk={handleSubmit}
            isCentered={true}
            canOverflow={true}
            okButtonProps={{ loading: isLoading, disabled: isLoading }}
        >
            <div className="form-group-parent">
                <div className="rental-form">
                    <div className="form-field">
                        <Input
                            label="How many days do you want to rent?"
                            name="rentalDays"
                            type="number"
                            value={rentalDays}
                            onChange={(e) => setRentalDays(e.target.value)}
                        />
                    </div>

                    {nativeTokenPriceUSD && (
                        <p className="token-reference">
                            Reference: 1{" "}
                            {parseInt(chainId).toString() === "43113" ? "AVAX" : "ETH"} ≈ $
                            {nativeTokenPriceUSD} USD
                        </p>
                    )}

                    {rentalDays && +rentalDays > 0 && Number.isInteger(+rentalDays) ? (
                        <>
                            <p className="payment-summary">
                                Total to pay: <strong>${totalUSD} USD</strong> ≈{" "}
                                <strong>
                                    {totalETH.toFixed(4)}{" "}
                                    {parseInt(chainId).toString() === "43113" ? "AVAX" : "ETH"}
                                </strong>
                            </p>

                            <div className="form-field">
                                <Input
                                    label={`Amount of ${
                                        parseInt(chainId).toString() === "43113" ? "AVAX" : "ETH"
                                    } to send`}
                                    name="ethToSend"
                                    type="number"
                                    value={ethToSend}
                                    onChange={(e) => setEthToSend(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        rentalDays && ( // Solo muestra el mensaje si hay algún valor en rentalDays
                            <p className="error-message">
                                Please enter a number of rental days that is integer and greater than zero.
                            </p>
                        )
                    )}
                </div>
            </div>
        </Modal>
    )
}
