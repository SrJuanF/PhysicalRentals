import { Modal, Input, Select, Dropdown, useNotification } from "web3uikit"
import { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import PhysicalRentalAbi from "@/constants/PhysicalRental.json"

export default function UpdateListingModal({ nftAddress, tokenId, isVisible, onClose }) {
    const dispatch = useNotification()
    const [newPriceUSD, setNewPriceUSD] = useState("")
    const [newDepositUSD, setNewDepositUSD] = useState("")
    const [newCondition, setNewCondition] = useState("")

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
    }

    const handleValidationError = () => {
        dispatch({
            type: "error",
            message: "Values must be greater than 0",
            title: "Invalid fields",
            position: "topR",
        })
    }

    const { runContractFunction: RelistTool } = useWeb3Contract({
        abi: PhysicalRentalAbi,
        contractAddress: nftAddress,
        functionName: "RelistTool",
        params: {
            toolId: tokenId,
            newrentalPriceUSday: newPriceUSD,
            newDepositUsd: newDepositUSD,
            newCondition: newCondition,
        },
    })

    const handleSubmit = () => {
        if (+newPriceUSD <= 0 || +newDepositUSD <= 0) {
            handleValidationError()
            return
        }

        const conditionMap = {
            New: 1,
            "Used in good condition": 2,
            "Used with wear, functional": 3,
        }
        const conditionNumeric = conditionMap[newCondition]

        if (!conditionNumeric) {
            dispatch({
                type: "error",
                message: "Invalid condition",
                title: "Validation error",
                position: "topR",
            })
            return
        }

        RelistTool({
            onError: (error) => console.log(error),
            onSuccess: handleSuccess,
        })
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
