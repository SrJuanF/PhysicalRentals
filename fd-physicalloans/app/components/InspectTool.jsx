"use client";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import PhysicalRental from "../../constants/PhysicalRental.json";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

const ToolActionModal = ({
  isVisible,
  nftAddress,
  tokenId,
  status,
  role,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // resultado del intento actual
  const [attempts, setAttempts] = useState(0);
  const [resultsHistory, setResultsHistory] = useState([]);
  const [finalResult, setFinalResult] = useState(null); // 'Work' o 'No Work'

  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract: sendTool, data: sendHash } = useWriteContract();
  const { writeContract: receiveTool, data: receiveHash } = useWriteContract();

  const { isLoading: isSending, isSuccess: isSendSuccess } =
    useWaitForTransactionReceipt({
      hash: sendHash,
    });

  const { isLoading: isReceiving, isSuccess: isReceiveSuccess } =
    useWaitForTransactionReceipt({
      hash: receiveHash,
    });

  useEffect(() => {
    if (isSendSuccess || isReceiveSuccess) {
      toast.success("Tool successfully analyzed and registered");
      handleClose();
    }
  }, [isSendSuccess, isReceiveSuccess]);

  const simulateAnalysis = () => {
    if (loading || finalResult) return;
    setLoading(true);
    setTimeout(() => {
      const isBuena = Math.random() < 0.7;
      const analysis = isBuena ? "Work" : "No Work";
      const updatedHistory = [...resultsHistory, analysis];
      const countBuena = updatedHistory.filter((r) => r === "Work").length;
      const countMala = updatedHistory.filter((r) => r === "No Work").length;

      setResult(analysis);
      setResultsHistory(updatedHistory);
      setAttempts(updatedHistory.length);
      setLoading(false);

      if (countBuena === 2) {
        setFinalResult("Work");
      } else if (countMala === 2) {
        setFinalResult("No Work");
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

  const handleClose = () => {
    onClose && onClose();
    setLoading(false);
    setResult(null);
    setAttempts(0);
    setResultsHistory([]);
    setFinalResult(null);
  };

  const handleError = (error) => {
    toast.error(error || "Error in registryInspect");
    console.error("Error in registryInspect:", error);
  };

  const STATUS_LABELS = {
    Available: 0,
    Requested: 1,
    Sended: 2,
    Rented: 3,
    Returned: 4,
    Inspected: 5,
  };

  const handleProceed = async () => {
    if (isLoading || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);

    try {
      if (
        (role === "Owner" && status === "Requested") ||
        (role === "Renter" && status === "Rented")
      ) {
        const send = finalResult === "Work";

        // Registrar inspección
        const result = await registryInspect(
          tokenId,
          STATUS_LABELS[status],
          send,
          null
        );

        if (result?.error) {
          handleError(result.error);
          return;
        }

        // Enviar herramienta
        sendTool({
          address: nftAddress,
          abi: PhysicalRental,
          functionName: "sendTool",
          args: [ethers.BigNumber.from(tokenId.toString()), send],
        });
      } else if (
        (role === "Owner" && status === "Returned") ||
        (role === "Renter" && status === "Sended")
      ) {
        const receive = finalResult === "Work";

        // Registrar inspección
        const result = await registryInspect(
          tokenId,
          STATUS_LABELS[status],
          null,
          receive
        );

        if (result?.error) {
          handleError(result.error);
          return;
        }

        // Recibir herramienta
        receiveTool({
          address: nftAddress,
          abi: PhysicalRental,
          functionName: "receiveTool",
          args: [ethers.BigNumber.from(tokenId.toString()), receive],
        });
      }
    } catch (error) {
      console.error("Error in transaction:", error);
      toast.error("Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRetry = !finalResult && attempts < 3;
  const canProceed =
    finalResult === "Work" || role !== "Owner" || status !== "Requested";

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                Action:{" "}
                {status === "Requested"
                  ? "Send"
                  : status === "Rented"
                  ? "Return"
                  : "Receive"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Role: {role}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center space-y-2 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Analyzing tool...</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p
                  className={`text-lg font-semibold ${
                    result === "Work" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Result of attempt: {result?.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Attempts made: {attempts}
                </p>
              </div>

              {finalResult && (
                <div className="text-center">
                  <p
                    className={`text-xl font-bold ${
                      finalResult === "Work" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Final result: {finalResult.toUpperCase()}
                  </p>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                {shouldRetry && (
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    disabled={loading}
                  >
                    Try Again ({3 - attempts} attempts remaining)
                  </Button>
                )}

                {finalResult && canProceed && (
                  <Button
                    onClick={handleProceed}
                    disabled={isLoading || isSending || isReceiving}
                    className="w-full"
                  >
                    {isLoading || isSending || isReceiving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                )}

                {finalResult === "No Work" && !canProceed && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">
                      You cannot proceed with this action because the final
                      result was NO WORK.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

async function registryInspect(toolId, status, send, receive) {
  try {
    const result = await fetch("/api/registry", {
      method: "POST",
      body: JSON.stringify({
        address: process.env.NEXT_PUBLIC_APP_CREATOR_ADDRESS,
        toolId: toolId,
        status: status,
        send: send,
        receive: receive,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error in registryInspect:", error);
    return { error: error.message };
  }
}

export default ToolActionModal;
