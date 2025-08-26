"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useChainId,
  useWaitForTransactionReceipt,
} from "wagmi";
import PhysicalRental from "../../constants/PhysicalRental.json";
import networkMapping from "../../constants/networkMapping.json";
import { ethers } from "ethers";
import Header from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Upload, Plus, Download, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CreateTool() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const chainString = chainId ? chainId.toString() : null;
  const PhysicalRentalAddress = chainId
    ? networkMapping[chainString]?.PhysicalRental[0]
    : null;

  const [earnings, setEarnings] = useState("0");
  const [imageFile, setImageFile] = useState(null);
  const [minMint, setMinMint] = useState("0.009");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    condition: "",
    rentalPrice: "",
    deposit: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const overrides = {
    value: ethers.utils.parseEther("0.0002"),
  };

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: PhysicalRentalAddress,
    abi: PhysicalRental,
    functionName: "getBalance",
    args: [address],
    query: {
      enabled: !!address && !!PhysicalRentalAddress,
    },
  });

  const { writeContract: withdrawEarnings, data: withdrawHash } =
    useWriteContract();

  const { isLoading: isWithdrawing, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawHash,
    });

  const { writeContract: listTool, data: listHash } = useWriteContract();

  const { isLoading: isListing, isSuccess: isListSuccess } =
    useWaitForTransactionReceipt({
      hash: listHash,
    });

  async function setupUI() {
    if (balance) {
      setEarnings(ethers.utils.formatEther(balance.toString()));
    }
    const auxMint = chainId === 43113 ? "1.5" : "0.009";
    setMinMint(auxMint);
  }

  useEffect(() => {
    setupUI();
  }, [balance, address, chainId]);

  useEffect(() => {
    if (isWithdrawSuccess) {
      toast.success("Funds successfully withdrawn!");
      refetchBalance();
    }
  }, [isWithdrawSuccess, refetchBalance]);

  useEffect(() => {
    if (isListSuccess) {
      toast.success("Tool listed successfully!");
      setFormData({
        name: "",
        description: "",
        type: "",
        condition: "",
        rentalPrice: "",
        deposit: "",
      });
      setImageFile(null);
    }
  }, [isListSuccess]);

  const handleListTools = async (
    tokenURI,
    rentalPriceUSday,
    depositUsd,
    condition
  ) => {
    if (!PhysicalRentalAddress) {
      toast.error("Contract address not found for this network");
      return;
    }

    try {
      listTool({
        address: PhysicalRentalAddress,
        abi: PhysicalRental,
        functionName: "listTool",
        args: [
          tokenURI,
          ethers.BigNumber.from(rentalPriceUSday.toString()),
          ethers.BigNumber.from(depositUsd.toString()),
          Number(condition),
        ],
        value: ethers.utils.parseEther("0.0002"),
      });
    } catch (error) {
      console.error("Error listing tool:", error);
      toast.error("Failed to list tool");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleWithdraw = async () => {
    const earningsInWei = ethers.utils.parseEther(earnings);

    if (earningsInWei.gt(0)) {
      withdrawEarnings({
        address: PhysicalRentalAddress,
        abi: PhysicalRental,
        functionName: "withdrawEarnings",
      });
    } else {
      toast.info("You have no available funds");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const { name, description, type, condition, rentalPrice, deposit } =
      formData;

    const conditionMap = {
      New: 1,
      "Used in good condition": 2,
      "Used with wear, functional": 3,
    };

    if (!conditionMap[condition]) {
      toast.error("Please select a valid condition");
      return;
    }

    if (!rentalPrice || +rentalPrice <= 0 || !deposit || +deposit <= 0) {
      toast.error("Please enter valid rental values greater than zero");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", name);
      formDataToSend.append("description", description);
      formDataToSend.append("type", type);
      formDataToSend.append("image", imageFile);

      const res = await fetch("/api/createMetaURI", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();
      const tokenURI = data?.tokenURI;

      if (tokenURI) {
        await handleListTools(
          tokenURI,
          rentalPrice,
          deposit,
          conditionMap[condition]
        );
      } else {
        toast.error("Failed to create metadata");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create tool");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Wallet Not Connected
              </h2>
              <p className="text-gray-600">
                Please connect your wallet to create a tool
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-6 w-6" />
                <span>Tokenize a Tool for Rentals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Tool Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : "Click to upload image"}
                    </p>
                  </label>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Tool name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tool Type</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      placeholder="e.g., Drill, Saw, etc."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your tool..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) =>
                        handleInputChange("condition", value)
                      }
                    >
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

                  <div className="space-y-2">
                    <Label htmlFor="rentalPrice">Price per day (USD)</Label>
                    <Input
                      id="rentalPrice"
                      type="number"
                      value={formData.rentalPrice}
                      onChange={(e) =>
                        handleInputChange("rentalPrice", e.target.value)
                      }
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit">Required deposit (USD)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      value={formData.deposit}
                      onChange={(e) =>
                        handleInputChange("deposit", e.target.value)
                      }
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isListing}
                >
                  {isLoading || isListing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isListing ? "Listing Tool..." : "Creating..."}
                    </>
                  ) : (
                    "Create Tool"
                  )}
                </Button>
              </form>

              {/* Funds Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available funds:</p>
                    <p className="text-lg font-semibold">
                      {earnings} {chainId === 43113 ? "AVAX" : "ETH"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || +earnings === 0}
                  >
                    {isWithdrawing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Withdraw Funds
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
