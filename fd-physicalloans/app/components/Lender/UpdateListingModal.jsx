"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import PhysicalRental from "../../../constants/PhysicalRental.json";
import { ethers } from "ethers";
import { toast } from "sonner";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { X, Save } from "lucide-react";

export default function UpdateListingModal({
  nftAddress,
  tokenId,
  isVisible,
  onClose,
}) {
  const { address, isConnected } = useAccount();
  const [newPriceUSD, setNewPriceUSD] = useState("");
  const [newDepositUSD, setNewDepositUSD] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract: updateListing, data: updateHash } = useWriteContract();

  const { isLoading: isUpdating, isSuccess: isUpdateSuccess } =
    useWaitForTransactionReceipt({
      hash: updateHash,
    });

  useEffect(() => {
    if (isUpdateSuccess) {
      toast.success("Listing updated successfully!");
      handleClose();
    }
  }, [isUpdateSuccess]);

  const handleClose = () => {
    onClose && onClose();
    setNewPriceUSD("");
    setNewDepositUSD("");
    setNewCondition("");
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (isLoading || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);

    if (
      !newPriceUSD ||
      +newPriceUSD <= 0 ||
      !newDepositUSD ||
      +newDepositUSD <= 0 ||
      !Number.isInteger(+newPriceUSD) ||
      !Number.isInteger(+newDepositUSD)
    ) {
      toast.error("Values must be greater than 0 and integers");
      setIsLoading(false);
      return;
    }

    const conditionMap = {
      New: 1,
      "Used in good condition": 2,
      "Used with wear, functional": 3,
    };

    const conditionNumeric = conditionMap[newCondition];

    if (!conditionNumeric) {
      toast.error("Please select a valid condition");
      setIsLoading(false);
      return;
    }

    try {
      updateListing({
        address: nftAddress,
        abi: PhysicalRental,
        functionName: "updateListing",
        args: [
          ethers.BigNumber.from(tokenId.toString()),
          ethers.BigNumber.from(newPriceUSD.toString()),
          ethers.BigNumber.from(newDepositUSD.toString()),
          conditionNumeric,
        ],
      });
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing");
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">Update Tool Listing</CardTitle>
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
            <Label htmlFor="price">New Price per Day (USD)</Label>
            <Input
              id="price"
              type="number"
              value={newPriceUSD}
              onChange={(e) => setNewPriceUSD(e.target.value)}
              placeholder="Enter new price"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit">New Deposit (USD)</Label>
            <Input
              id="deposit"
              type="number"
              value={newDepositUSD}
              onChange={(e) => setNewDepositUSD(e.target.value)}
              placeholder="Enter new deposit"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">New Condition</Label>
            <Select value={newCondition} onValueChange={setNewCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Used in good condition">
                  Used in good condition
                </SelectItem>
                <SelectItem value="Used with wear, functional">
                  Used with wear, functional
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading || isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                isUpdating ||
                !newPriceUSD ||
                !newDepositUSD ||
                !newCondition
              }
              className="flex-1"
            >
              {isLoading || isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
