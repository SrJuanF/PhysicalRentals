import { Modal, Input, useNotification } from "web3uikit"
import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import PhysicalRentalAbi from "@/constants/PhysicalRental.json"
import { ethers } from "ethers"

export default function RentToolModal({
    isVisible,
    tokenId,
    nftAddress,
    rentalPriceUSET,
    depositUsEt,
    onClose,
}) {
    const dispatch = useNotification()
    const { chainId, isWeb3Enabled } = useMoralis()
    const [rentalDays, setRentalDays] = useState("")
    const [ethToSend, setEthToSend] = useState("")
    const [nativeTokenPriceUSD, setNativeTokenPriceUSD] = useState(null)

    const coinGeckoTokenIdByChain = {
        11155111: "ethereum", // Sepolia → ETH
        43113: "avalanche-2", // Fuji → AVAX
    }

    const handleSuccess = () => {
        dispatch({
            type: "success",
            message: "Tool rented successfully",
            title: "Success",
            position: "topR",
        })
        onClose && onClose()
        setRentalDays("")
        setEthToSend("")
    }

    const handleValidationError = () => {
        dispatch({
            type: "error",
            message: "You must enter at least 1 day",
            title: "Invalid days",
            position: "topR",
        })
    }

    const { runContractFunction: rentTool } = useWeb3Contract({
        abi: PhysicalRentalAbi,
        contractAddress: nftAddress,
        functionName: "rentTool",
        params: {},
    })

    const totalUSD = rentalDays ? rentalDays * rentalPriceUSET + depositUsEt : 0
    const totalETH = nativeTokenPriceUSD ? totalUSD / nativeTokenPriceUSD : 0

    const handleSubmit = () => {
        if (+rentalDays <= 0) {
            handleValidationError()
            return
        }

        const totalUSD = rentalPriceUSET * rentalDays + depositUsEt
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

        rentTool({
            params: {
                toolId: tokenId,
                rentalDurationSeconds: parseInt(rentalDays) * 86400,
            },
            msgValue: ethers.utils.parseEther(ethToSend).toString(),
            onError: (error) => console.log(error),
            onSuccess: handleSuccess,
        })
    }

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
        if (nativeTokenPriceUSD && rentalDays > 0) {
            const suggestedEth = (
                (rentalPriceUSET * rentalDays + depositUsEt) /
                nativeTokenPriceUSD
            ).toFixed(6)
            setEthToSend(suggestedEth)
        }
    }, [rentalDays, nativeTokenPriceUSD])

    return (
        <Modal
            title={"Rent the tool"}
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={handleSubmit}
            isCentered={true}
            canOverflow={true}
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
                            Referencia: 1{" "}
                            {parseInt(chainId).toString() === "43113" ? "AVAX" : "ETH"} ≈ $
                            {nativeTokenPriceUSD} USD
                        </p>
                    )}

                    {rentalDays && +rentalDays > 0 && (
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
                    )}
                </div>
            </div>
        </Modal>
    )
}
