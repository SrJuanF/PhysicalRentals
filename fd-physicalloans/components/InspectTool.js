import { useNotification } from "web3uikit"
import { useMoralis } from "react-moralis"
import PhysicalRental from "@/constants/PhysicalRental.json"
import { ethers } from "ethers"
import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

const ToolActionModal = ({ isVisible, nftAddress, tokenId, status, role, onClose}) => {
  const dispatch = useNotification()
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // resultado del intento actual
  const [attempts, setAttempts] = useState(0);
  const [resultsHistory, setResultsHistory] = useState([]);
  const [finalResult, setFinalResult] = useState(null); // 'Work' o 'No Work'

  const { isWeb3Enabled, account, web3 } = useMoralis()
  const [contract, setEtherContract] = useState(null)
  const [isLoading, setIsLoading] = useState(false);

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
    if (loading || finalResult) return;
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
    }, 2000);
  };
  useEffect(() => {
    if (isVisible && attempts === 0 && !finalResult) {
      simulateAnalysis();
    }
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
    if(isLoading) return;
    setIsLoading(true);
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
        const tx = await contract.receiveTool(
          ethers.BigNumber.from(tokenId.toString()),
          receive
        )
        const receipt = await tx.wait()
        console.log("Transaction confirmed:", receipt)
        handleSuccess()
      } catch (error) {
        console.error("Error sending tool:", error)
        dispatch({ type: "error", message: error.message || String(error), title: "Transaction Failed", position: "topR",})
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
    console.log(process.env.NEXT_PUBLIC_APP_CREATOR_ADDRESS, toolId, status, send, receive);
    const result = await fetch('/api/registry', {
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
    const data = await result.json();
    console.log(data)
    return data;
}

export default ToolActionModal;
