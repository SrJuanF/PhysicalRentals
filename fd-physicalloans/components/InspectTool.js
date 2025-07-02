import { Modal, Input, useNotification } from "web3uikit"
import { useWeb3Contract } from "react-moralis"
import PhysicalRental from "@/constants/PhysicalRental.json"
import { ethers } from "ethers"
import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';


const ToolActionModal = ({ isVisible, nftAddress, tokenId, status, role, onClose}) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null); // resultado del intento actual
  const [attempts, setAttempts] = useState(0);
  const [resultsHistory, setResultsHistory] = useState([]);
  const [finalResult, setFinalResult] = useState(null); // 'Work' o 'No Work'

  const { runContractFunction: sendTool } = useWeb3Contract({ // Owner or Renter?
    abi: PhysicalRental,
    contractAddress: nftAddress,
    functionName: "sendTool",
    params: {
      toolId: ethers.BigNumber.from(tokenId.toString()),
      actualWorked: true,
    },
  });
  const { runContractFunction: receiveTool } = useWeb3Contract({ //Owner or Renter?
    abi: PhysicalRental,
    contractAddress: nftAddress,
    functionName: "receiveTool",
    params: {
        toolId: tokenId,
        actualWorked: true,
    },
  });
  const handleSuccess = () => {
    dispatch({
        type: "success",
        message: "Tool successfully analyzed and registered",
        title: "Success",
        position: "topR",
    })
    onClose && onClose()
    setLoading(true);
    setResult(null);
    setAttempts(0);
    setResultsHistory([]);
    setFinalResult(null);
  }

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
    }, 2000);
  };
  useEffect(() => {
    simulateAnalysis();
  }, []);
  const handleRetry = () => {
    simulateAnalysis();
  };

  const handleProceed = () => {
    if ((role === 'Owner' && status === 'Requested') || (role === 'Renter' && status === 'Rented')) {
      sendTool({
        onSuccess: handleSuccess,
        onError: (error) => console.error("Error sending tool:", error),
      });
    } else if ((role === 'Owner' && status === 'Returned') || (role === 'Renter' && status === 'Sended')) {
      receiveTool({
        onSuccess: handleSuccess,
        onError: (error) => console.error("Error receiving tool:", error),
      });
    }
    //onComplete(finalResult);
  };

  const shouldRetry =
    !finalResult && attempts < 3;

  const canProceed =
    finalResult === 'Work' ||
    (role !== 'Owner' || status !== 'Requested'); // owner-Send necesita buena

  return (
    <div className="modal-overlay" style={{ display: isVisible ? 'block' : 'none' }}>
      <div className="modal">

        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
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

export default ToolActionModal;




async function registryInspect(){
    // desde el cliente
    await fetch('/api/create-tool', {
        method: 'POST',
        body: JSON.stringify({
            tool_id: 101,
            condition: "buena",
            status: "activa",
            send: "2025-06-25T10:00:00Z",
            receive: "2025-06-25T16:00:00Z"
        }),
        headers: { 'Content-Type': 'application/json' }
    })
}