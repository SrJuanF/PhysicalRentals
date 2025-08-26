"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import PhysicalRental from "../../../constants/PhysicalRental.json";
import { ethers } from "ethers";
import { toast } from "sonner";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { X, ShoppingCart, Calendar } from "lucide-react";

export default function RentToolModal({
  isVisible,
  tokenId,
  nftAddress,
  rentalPriceUSET,
  depositUsEt,
  onClose,
}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [rentalDays, setRentalDays] = useState("");
  const [ethToSend, setEthToSend] = useState("");
  const [nativeTokenPriceUSD, setNativeTokenPriceUSD] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const coinGeckoTokenIdByChain = {
    11155111: "ethereum", // Sepolia → ETH
    43113: "avalanche-2", // Fuji → AVAX
  };

  const { writeContract: rentTool, data: rentHash } = useWriteContract();

  const { isLoading: isRenting, isSuccess: isRentSuccess } =
    useWaitForTransactionReceipt({
      hash: rentHash,
    });

  useEffect(() => {
    if (isRentSuccess) {
      toast.success("Tool rented successfully!");
      handleClose();
    }
  }, [isRentSuccess]);

  const totalUSD = rentalDays
    ? rentalDays * Number(rentalPriceUSET) + Number(depositUsEt)
    : 0;
  const totalETH = nativeTokenPriceUSD ? totalUSD / nativeTokenPriceUSD : 0;

  useEffect(() => {
    async function fetchTokenPriceUSD() {
      if (!chainId) return;
      const tokenIdSear = coinGeckoTokenIdByChain[chainId.toString()];
      if (!tokenIdSear) return;
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIdSear}&vs_currencies=usd`
        );
        const data = await res.json();
        setNativeTokenPriceUSD(data[tokenIdSear]?.usd);
      } catch (err) {
        console.error("Error fetching token price:", err);
      }
    }
    if (isConnected) {
      fetchTokenPriceUSD();
    }
  }, [chainId, isConnected]);

  useEffect(() => {
    if (nativeTokenPriceUSD && +rentalDays > 0) {
      const suggestedEth = (
        (Number(rentalPriceUSET) * rentalDays + Number(depositUsEt)) /
        nativeTokenPriceUSD
      ).toFixed(6);
      setEthToSend(suggestedEth);
    }
  }, [rentalDays, nativeTokenPriceUSD, rentalPriceUSET, depositUsEt]);

  const handleClose = () => {
    onClose && onClose();
    setRentalDays("");
    setEthToSend("");
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (isLoading || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!rentalDays || +rentalDays <= 0) {
      toast.error("Please enter a valid number of rental days");
      return;
    }

    if (!ethToSend || +ethToSend <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);

    try {
      rentTool({
        address: nftAddress,
        abi: PhysicalRental,
        functionName: "rentTool",
        args: [
          ethers.BigNumber.from(tokenId.toString()),
          ethers.BigNumber.from(rentalDays.toString()),
        ],
        value: ethers.utils.parseEther(ethToSend.toString()),
      });
    } catch (error) {
      console.error("Error renting tool:", error);
      toast.error("Failed to rent tool");
      setIsLoading(false);
    }
  };

  const getTokenSymbol = () => {
    return chainId === 43113 ? "AVAX" : "ETH";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">Rent Tool</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Tool #{tokenId}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="days">Rental Days</Label>
            <Input
              id="days"
              type="number"
              value={rentalDays}
              onChange={(e) => setRentalDays(e.target.value)}
              placeholder="Enter number of days"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Send ({getTokenSymbol()})</Label>
            <Input
              id="amount"
              type="number"
              value={ethToSend}
              onChange={(e) => setEthToSend(e.target.value)}
              placeholder="Enter amount"
              step="0.000001"
            />
          </div>

          {rentalDays && ethToSend && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span>${rentalPriceUSET} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Rental Cost:</span>
                  <span>
                    ${(rentalDays * Number(rentalPriceUSET)).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit:</span>
                  <span>${depositUsEt} USD</span>
                </div>
                <div className="border-t pt-1">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${totalUSD.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>
                      ≈ {ethToSend} {getTokenSymbol()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading || isRenting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || isRenting || !rentalDays || !ethToSend}
              className="flex-1"
            >
              {isLoading || isRenting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Renting...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Rent Tool
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
