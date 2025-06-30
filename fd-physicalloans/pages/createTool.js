import { useState, useEffect } from "react"
import { Form, useNotification, Button, Input as UiInput } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import PhysicalRental from "@/constants/PhysicalRental.json"
import networkMapping from "@/constants/networkMapping.json"
import { ethers } from "ethers"


export default function CreateTool() {
    const dispatch = useNotification()
    const { chainId, isWeb3Enabled, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : null
    const PhysicalRentalAddress = chainId ? networkMapping[chainString].PhysicalRental[0] : null
    const [earnings, setEarnings] = useState("0")
    const [imageFile, setImageFile] = useState(null)
    const [minMint, setMinMint] = useState("0.009")


    const { runContractFunction } = useWeb3Contract();

    const { runContractFunction: withdrawEarnings } = useWeb3Contract({
        abi: PhysicalRental,
        contractAddress: PhysicalRentalAddress,
        functionName: "withdrawEarnings",
        params: {},
    })

    const { runContractFunction: getBalance } = useWeb3Contract({
        abi: PhysicalRental,
        contractAddress: PhysicalRentalAddress,
        functionName: "getBalance",
        params: { user: account },
    })

    async function setupUI() {
        const returnedProceeds = await getBalance({
            onError: (error) => console.log(error),
        })
        if (returnedProceeds) {
            setEarnings(ethers.utils.formatEther(returnedProceeds.toString()))
        }
        const auxMint = parseInt(chainId).toString() === "43113" ? "1.5" : "0.009"
        setMinMint(auxMint)
    }

    useEffect(() => {
        setupUI();
    }, [earnings, account, isWeb3Enabled, chainId]);


    const handleListTools = async (tokenURI, rentalPriceUSday, depositUsd, condition) => {

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const signer = provider.getSigner();
            const contract = new ethers.Contract(PhysicalRentalAddress, PhysicalRental, signer);

            const overrides = {
                value: ethers.utils.parseEther("1.6"), // Equivalent to msgValue: ethers.utils.parseEther("1.7")
            };
            const tx = await contract.listTool(
                tokenURI,
                ethers.BigNumber.from(rentalPriceUSday.toString()),
                ethers.BigNumber.from(depositUsd.toString()),
                Number(condition),
                overrides
            );
            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt);

        } catch (error) {
            console.error("Error listing tool:", error);
        }

        /*
        await runContractFunction({
                    abi: PhysicalRental,
                    contractAddress: PhysicalRentalAddress,
                    functionName: "listTool",
                    params: {
                        tokenURI: tokenURI,
                        rentalPriceUSday: ethers.BigNumber.from(rentalPriceUSday.toString()),
                        depositUsd: ethers.BigNumber.from(depositUsd.toString()),
                        condition: Number(condition),
                    },
                    msg: ethers.utils.parseEther("1.7"),
                    onSuccess: () => {
                        dispatch({ type: "success", message: "Tool listed successfully", title: "Success", position: "topR" });
                    },
                    onError: (error) => {
                        //dispatch({ type: "error", message: error.message || String(error), title: "Transaction Failed", position: "topR"})
                        console.log("AQUII")
                        console.log(error)
                    },
        });
*/
    }


    async function handleSubmit(data) {

        const formValues = data.data.map(data => {return data.inputResult});
        const name = formValues[0]
        const description = formValues[1]
        const type = formValues[2]
        const valCondition = formValues[3]
        const rentalPriceUSday = formValues[4]
        const depositUsd = formValues[5]

        const conditionMap = {
            "New": 1,
            "Used in good condition": 2,
            "Used with wear, functional": 3,
        }
        if(valCondition == undefined || !conditionMap[valCondition]){
             dispatch({
                type: "error",
                message: "Enter a valid condition",
                title: "Invalid condition",
                position: "topR",
            })
            return
        }
        const condition = conditionMap[valCondition]

        if (!imageFile) {
            dispatch({
                type: "error",
                message: "You must upload an image",
                title: "Missing image",
                position: "topR",
            })
            return
        }
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("description", description)
            formData.append("type", type)
            formData.append("image", imageFile) // 👈 archivo real

            const res = await fetch("/api/createMetaURI", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            const tokenURI = data?.tokenURI
            //console.log(tokenURI)

            if (tokenURI) {
                await handleListTools(tokenURI, rentalPriceUSday, depositUsd, condition);
                
            } else {
                dispatch({
                    type: "error",
                    message: "Error loading",
                    title: "Failed",
                    position: "topR",
                })
                return
            }
        } catch (err) {
            console.error(err)
            dispatch({
                type: "error",
                message: "Error loading",
                title: "Failed",
                position: "topR",
            })
            return
        }
    }

    const handleImageUpload = (image) => {
        if (image) setImageFile(image)
    }

    const handleWithdraw = async () => {
        const earningsInWei = ethers.utils.parseEther(earnings)

        if (earningsInWei.gt(0)) {
            await withdrawEarnings({
                onSuccess: () =>
                    dispatch({
                        type: "success",
                        message: "Funds successfully withdrawn",
                        title: "Withdrawal completed",
                        position: "topR",
                    }),
                onError: (err) => console.error(err),
            })
        } else {
            dispatch({
                type: "info",
                message: "You have no available funds",
                title: "No funds",
                position: "topR",
            })
        }
    }

    return (
        <div className="register-container">
            <h1 className="register-title">Tokenize a tool for rentals</h1>
            <FancyFileInput onChange={handleImageUpload} />
            <Form
                onSubmit={handleSubmit}
                data={[
                    {
                        name: "Name",
                        type: "text",
                        inputWidth: "100%",
                        id: "name",
                        validation: { required: true },
                    },
                    {
                        name: "Description",
                        type: "textarea",
                        id: "description",
                        inputWidth: "100%",
                        validation: { required: true },
                    },
                    {
                        name: "Tool type",
                        type: "text",
                        id: "type",
                        validation: { required: true },
                    },
                    {
                        name: "Condition",
                        type: "select",
                        id: "condition",
                        selectOptions: [
                            { id: "New", label: "New" },
                            { id: "Used in good condition", label: "Used in good condition" },
                            {
                                id: "Used with wear, functional",
                                label: "Used with wear, functional",
                            },
                        ],
                        validation: { required: true },
                    },
                    {
                        name: "Price per day (USD)",
                        type: "number",
                        id: "rentalPriceUSday",
                        validation: { required: true, min: 1 },
                    },
                    {
                        name: "Required deposit (USD)",
                        type: "number",
                        id: "depositUsd",
                        validation: { required: true, min: 1 },
                    },
                ]}
            />

            <div className="funds-section">
                <h2 className="funds-info">
                    Your available funds: {earnings}{" "}
                    {parseInt(chainId).toString() === "43113" ? "AVAX" : "ETH"}
                </h2>
                <Button text="Withdraw Funds" theme="primary" onClick={handleWithdraw} />
            </div>
        </div>
    )
}

function FancyFileInput({ onChange }) {
    const [fileName, setFileName] = useState("No file selected");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            onChange(file); // ⚠️ ahora se pasa el file directamente
        }
    };

    return (
        <div className="image-upload">
            <label htmlFor="imageUpload" className="upload-button">
                📁 Upload Image
            </label>
            <input
                id="imageUpload"
                type="file"
                name="imageUpload"
                onChange={handleFileChange}
                className="hidden-input"
            />
            <span className="file-name">{fileName}</span>
        </div>
    );
}

