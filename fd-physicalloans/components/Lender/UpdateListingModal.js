import { Modal, Input, Select, Dropdown, useNotification } from "web3uikit"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import PhysicalRental from "@/constants/PhysicalRental.json"
import {ethers} from "ethers"

export default function UpdateListingModal({ nftAddress, tokenId, isVisible, onClose }) {
    const dispatch = useNotification()
    const [newPriceUSD, setNewPriceUSD] = useState("")
    const [newDepositUSD, setNewDepositUSD] = useState("")
    const [newCondition, setNewCondition] = useState("")
    const { isWeb3Enabled, account, web3 } = useMoralis()
    const [contract, setEtherContract] = useState(null)

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
    

    const handleSuccess = () => {
        dispatch({
            type: "success",
            message: "Listing updated",
            title: "Tool updated",
            position: "topR",
        })
        onClose && onClose()
        setNewPriceUSD("")
        setNewDepositUSD("")
        setNewCondition("")
    }

    const handleSubmit = async () => {
        if (+newPriceUSD <= 0 || +newDepositUSD <= 0) {
            dispatch({
                type: "error",
                message: "Values must be greater than 0",
                title: "Invalid fields",
                position: "topR",
            })
            return
        }
        const conditionMap = {
            "New": 1,
            "Used in good condition": 2,
            "Used with wear, functional": 3,
        }
        const conditionNumeric = conditionMap[newCondition]
        setNewCondition(conditionNumeric)
        if (!conditionNumeric) {
            dispatch({
                type: "error",
                message: "Invalid condition",
                title: "Validation error",
                position: "topR",
            })
            return
        }
        
        try {
            const tx = await contract.RelistTool(
                ethers.BigNumber.from(tokenId.toString()),
                ethers.BigNumber.from(newPriceUSD.toString()),
                ethers.BigNumber.from(newDepositUSD.toString()),
                Number(conditionNumeric),
            )
            const receipt = await tx.wait()
            console.log("Transaction confirmed:", receipt)
            handleSuccess()
        } catch (error) {
            console.error("Error listing tool:", error)
            dispatch({ type: "error", message: error.message || String(error), title: "Transaction Failed", position: "topR",
            })
        }
        
    }

    return (
        <Modal
            title={"Tool Update"}
            isVisible={isVisible}
            isCentered={true}
            canOverflow={true}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={handleSubmit}
        >
            <div className="form-group-parent">
                <div className="form-group">
                    <div className="form-field">
                        <Input
                            label="New price per day (USD)"
                            name="newPrice"
                            type="number"
                            value={newPriceUSD}
                            onChange={(e) => setNewPriceUSD(e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <Input
                            label="New deposit required (USD)"
                            name="newDeposit"
                            type="number"
                            value={newDepositUSD}
                            onChange={(e) => setNewDepositUSD(e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <Select
                            label="Tool condition"
                            name="condition"
                            options={[
                                { id: "New", label: "New" },
                                { id: "Used in good condition", label: "Used in good condition" },
                                {
                                    id: "Used with wear, functional",
                                    label: "Used with wear, functional",
                                },
                            ]}
                            onChange={(e) => setNewCondition(e.id)}
                            value={newCondition}
                            width="300px"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}
