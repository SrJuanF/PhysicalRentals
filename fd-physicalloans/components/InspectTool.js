import { useNotification } from "web3uikit"
import { useMoralis } from "react-moralis"
import PhysicalRental from "@/constants/PhysicalRental.json"
import { ethers } from "ethers"
import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

const ToolActionModal = ({ isVisible, nftAddress, tokenId, status, role, onClose}) => {
  const dispatch = useNotification()
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null); // resultado del intento actual
  const [attempts, setAttempts] = useState(0);
  const [resultsHistory, setResultsHistory] = useState([]);
  const [finalResult, setFinalResult] = useState(null); // 'Work' o 'No Work'

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

  const simulateAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      const isBuena = Math.random() < 0.7;
      const analysis = isBuena ? 'Work' : 'No Work';

      const updatedHistory = [...resultsHistory, analysis];
      const countBuena = updatedHistory.filter((r) => r === 'Work').length;
      const countMala = updatedHistory.filter((r) => r === 'No Work').length;

      setResult(analysis);
      setResultsHistory(updatedHistory);
      setAttempts(updatedHistory.length);
      setLoading(false);

      if (countBuena === 2) {
        setFinalResult('Work');
      } else if (countMala === 2) {
        setFinalResult('No Work');
      }
    }, 3000);
  };
  useEffect(() => {
    simulateAnalysis();
  }, [isVisible]);
  const handleRetry = () => {
    simulateAnalysis();
  };
  
  const handleSuccess = () => {
    dispatch({
        type: "success",
        message: "Tool successfully analyzed and registered",
        title: "Success",
        position: "topR",
    })
    handleClose();
  }
  const handleClose = () => {
    onClose && onClose();
    setLoading(false);
    setResult(null);
    setAttempts(0);
    setResultsHistory([]);
    setFinalResult(null);
  }
  const handleError = (error) => {
    dispatch({
      type: "error",
      message: error || "Error in registryInspect",
      title: "Error in registryInspect",
      position: "topR",
    })
    console.error("Error in registryInspect:", error);
  }
  const STATUS_LABELS = {
    "Available": 0,
    "Requested": 1,
    "Sended": 2,
    "Rented": 3,
    "Returned": 4,
    "Inspected": 5,
  }
  const handleProceed = async () => {

    if ((role === 'Owner' && status === 'Requested') || (role === 'Renter' && status === 'Rented')) {
      try {
        const send = finalResult === 'Work' ? true : false;
        const result = await registryInspect(tokenId, STATUS_LABELS[status], send, null); // validar receive
        if(result?.error) {
          handleError(result.error);
          return;
        }
        const tx = await contract.sendTool(
          ethers.BigNumber.from(tokenId.toString()),
          send
        )
        const receipt = await tx.wait()
        console.log("Transaction confirmed:", receipt)
        handleSuccess()
      } catch (error) {
        console.error("Error sending tool:", error)
        dispatch({ type: "error", message: error.message || String(error), title: "Transaction Failed", position: "topR",})
      }
    } else if ((role === 'Owner' && status === 'Returned') || (role === 'Renter' && status === 'Sended')) {
      try {
        const receive = finalResult === 'Work' ? true : false;
        const result = await registryInspect(tokenId, STATUS_LABELS[status], null, receive); // validar send
        if(result?.error) {
          handleError(result.error);
          return;
        }
        console.log("Tool ID: ", tokenId.toString())
        const tool = await contract.getTool(ethers.BigNumber.from(tokenId.toString()))
        const minMint = await contract.getMinMint()
        console.log("Estado actual del tool:", tool.status)
        console.log("Cuenta conectada:", account)
        console.log("Owner:", tool.owner)
        console.log("Renter:", tool.renter)
        console.log("Min Mint:", minMint.toString())

        console.log("Sender autorizado:", 
          account.toLowerCase() === tool.owner.toLowerCase() || 
          account.toLowerCase() === tool.renter.toLowerCase()
        )

        const tx = await contract.receiveTool(
          ethers.BigNumber.from(tokenId.toString()),
          receive
        )
        const receipt = await tx.wait()
        console.log("Transaction confirmed:", receipt)
        handleSuccess()
      } catch (error) {
        //console.error("Error sending tool:", error)
        //dispatch({ type: "error", message: error.message || String(error), title: "Transaction Failed", position: "topR",})
        console.error("Transaction failed!");
        console.error("Error details:", error);

        // --- IMPORTANT: How to get more precise error details ---

        // 1. Check for 'error.reason' or 'error.data.message' (Ethers v5)
        //    This often contains the string passed to require() or the custom error name.
        if (error.reason) {
            console.error("Revert reason (error.reason):", error.reason);
        } else if (error.data && error.data.message) {
            // For older Ethers versions or specific RPC errors
            console.error("Revert reason (error.data.message):", error.data.message);
        } else if (error.message) {
            // Generic error message from MetaMask/RPC
            console.error("Error message (error.message):", error.message);
        }

        // 2. Check for custom errors (Ethers v6+)
        //    Ethers v6 provides a more structured way to decode custom errors.
        //    You might need to enable error decoding on your contract instance.
        if (error.code === 'CALL_EXCEPTION' && error.data) {
            try {
                // Assuming `contract.interface` is available and has the ABI
                const decodedError = contract.interface.parseError(error.data);
                if (decodedError) {
                    console.error("Decoded Custom Error Name:", decodedError.name);
                    console.error("Decoded Custom Error Args:", decodedError.args);

                    // Check for your specific custom errors
                    if (decodedError.name === "AccessNotPermited") {
                        console.error("AccessNotPermited Error: Sender:", decodedError.args[0]);
                    } else if (decodedError.name === "toolNotSended") {
                        console.error("Tool Not Sended Error occurred.");
                    }
                }
            } catch (decodeError) {
                console.warn("Could not decode custom error from data:", decodeError);
                console.error("Raw error data:", error.data); // Log raw data if decoding fails
            }
        } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT' || error.code === 'TRANSACTION_REPLACED') {
            // These codes often indicate that the transaction would revert.
            // Check the nested error for the actual revert reason.
            if (error.receipt && error.receipt.status === 0) {
                console.error("Transaction reverted on-chain (status 0 in receipt).");
                console.error("Receipt:", error.receipt);
            }
            if (error.error && error.error.data) {
                 // For errors like "execution reverted" that come wrapped
                 console.error("Nested error data:", error.error.data);
            }
        }


        // 3. For the "MetaMask - RPC Error: Internal JSON-RPC error."
        //    The `error.data` field is crucial here, as it contains the nested 'execution reverted' message.
        if (error.data && error.data.code && error.data.message) {
            console.error("Nested RPC Error Code:", error.data.code);
            console.error("Nested RPC Error Message:", error.data.message);
            if (error.data.data) { // This is the '0x...' revert data
                console.error("Nested RPC Error Data (Revert Hex):", error.data.data);
            }
        }

        // If you're on a local development network (like Hardhat Network),
        // you might get very detailed revert reasons directly.

        throw error; // Re-throw the error if you want calling code to handle it
      }
    }
    //onComplete(finalResult);
  };

  const shouldRetry = !finalResult && attempts < 3;

  const canProceed =
    finalResult === 'Work' ||
    (role !== 'Owner' || status !== 'Requested'); // owner-Send necesita buena

  return (
    <div className="modal-overlay" style={{ display: isVisible ? 'flex' : 'none' }}>
      <div className="modal">

        <button className="modal-close-btn" onClick={handleClose} aria-label="Cerrar modal">
          <X className="modal-close-icon" />
        </button>

        <h2 className="modal-title">Action: {status === 'Requested' ? 'Send' : status === 'Rented' ? 'Return' : 'Receive'}</h2>
        <p className="modal-role">Role: {role}</p>

        {loading ? (
          <div className="modal-loading">
            <Loader2 className="loader-icon" />
            <p>Analyzing tool...</p>
          </div>
        ) : (
          <>
            <p className={`modal-result ${result === 'Work' ? 'good' : 'bad'}`}>
              Result of attempt: {result?.toUpperCase()}
            </p>

            <p className="modal-attempts">Attempts made: {attempts}</p>

            {finalResult && (
              <p className={`modal-final ${finalResult === 'Work' ? 'good' : 'bad'}`}>
                Final result: {finalResult.toUpperCase()}
              </p>
            )}

            {shouldRetry && (
              <button onClick={handleRetry} className="btn retry-btn">
                Try Again ({3 - attempts} attempts remaining)
              </button>
            )}

            {finalResult && canProceed && (
              <button onClick={handleProceed} className="btn continue-btn">
                Continue
              </button>
            )}

            {finalResult === 'No Work' && !canProceed && (
              <p className="modal-error">
                You cannot proceed with this action because the final result was NO WORK.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

async function registryInspect(toolId, status, send, receive) {
    // desde el cliente
    await fetch('/api/registry', {
        method: 'POST',
        body: JSON.stringify({
            address: process.env.NEXT_PUBLIC_APP_CREATOR_ADDRESS,
            toolId: toolId,
            status: status,
            send: send,
            receive: receive
        }),
        headers: { 'Content-Type': 'application/json' }
    })
}

export default ToolActionModal;
