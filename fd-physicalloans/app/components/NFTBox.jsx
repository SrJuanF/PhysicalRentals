"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useChainId } from "wagmi";
import PhysicalRentalAbi from "../../constants/PhysicalRental.json";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import ToolActionModal from "./InspectTool";
import UpdateListingModal from "./Lender/UpdateListingModal";
import RentToolModal from "./Renter/RentToolModal";
import { ethers } from "ethers";
import { Eye, Edit, ShoppingCart } from "lucide-react";

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = "...";
  const seperatorLength = separator.length;
  const charsToShow = strLen - seperatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};

export default function NFTBox({
  nftAddress,
  tokenId,
  Owner,
  rentalPriceUSET,
  depositUsEt,
  status,
  renter,
  rentalDuration,
  condition,
}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [imageURI, setImageURI] = useState();
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");

  const [showMododalUpdate, setShowMododalUpdate] = useState(false);
  const [showModalRent, setShowModalRent] = useState(false);
  const [showModalInspect, setShowModalInspect] = useState(false);

  const conditionMap = {
    1: "New",
    2: "Used in good condition",
    3: "Used with wear, functional",
  };
  const ShowCondition = conditionMap[condition];

  const { data: tokenURI } = useReadContract({
    address: nftAddress,
    abi: PhysicalRentalAbi,
    functionName: "tokenURI",
    args: [tokenId],
    query: {
      enabled: !!nftAddress && !!tokenId,
    },
  });

  async function updateUI() {
    if (tokenURI) {
      try {
        const tokenURIResponse = await (await fetch(tokenURI)).json();
        const imageURI = tokenURIResponse.image;
        setImageURI(imageURI);
        setTokenName(tokenURIResponse.name);
        setTokenDescription(tokenURIResponse.description);
      } catch (error) {
        console.error("Error fetching token metadata:", error);
      }
    }
  }

  useEffect(() => {
    if (tokenURI) {
      updateUI();
    }
  }, [tokenURI]);

  const STATUS_LABELS = {
    0: "Available",
    1: "Requested",
    2: "Sended",
    3: "Rented",
    4: "Returned",
    5: "Inspected",
  };

  const isOwnedByUser =
    isConnected && Owner?.toLowerCase() === address?.toLowerCase();
  const formattedOwnerAddress = isOwnedByUser
    ? "you"
    : truncateStr(Owner || "", 15);

  const isRenterByUser =
    isConnected && renter?.toLowerCase() === address?.toLowerCase();

  const handleCardClick = () => {
    if (isOwnedByUser) {
      if (
        STATUS_LABELS[status] == "Available" ||
        STATUS_LABELS[status] == "Inspected"
      ) {
        setShowMododalUpdate(true);
      } else if (
        STATUS_LABELS[status] == "Requested" ||
        STATUS_LABELS[status] == "Returned"
      ) {
        setShowModalInspect(true);
      }
    } else if (isRenterByUser) {
      if (
        STATUS_LABELS[status] == "Rented" ||
        STATUS_LABELS[status] == "Sended"
      ) {
        setShowModalInspect(true);
      }
    } else if (STATUS_LABELS[status] == "Available") {
      setShowModalRent(true);
    }
  };

  const statusLabel = STATUS_LABELS[status];

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Requested":
        return "bg-yellow-100 text-yellow-800";
      case "Sended":
        return "bg-blue-100 text-blue-800";
      case "Rented":
        return "bg-purple-100 text-purple-800";
      case "Returned":
        return "bg-gray-100 text-gray-800";
      case "Inspected":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {imageURI ? (
        <div>
          <UpdateListingModal
            isVisible={showMododalUpdate}
            tokenId={tokenId}
            nftAddress={nftAddress}
            onClose={() => setShowMododalUpdate(false)}
          />
          <RentToolModal
            isVisible={showModalRent}
            tokenId={tokenId}
            nftAddress={nftAddress}
            rentalPriceUSET={rentalPriceUSET}
            depositUsEt={depositUsEt}
            onClose={() => setShowModalRent(false)}
          />
          <ToolActionModal
            isVisible={showModalInspect}
            nftAddress={nftAddress}
            tokenId={tokenId}
            role={isOwnedByUser ? "Owner" : "Renter"}
            status={STATUS_LABELS[status]}
            onClose={() => setShowModalInspect(false)}
          />

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleCardClick}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">#{tokenId}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Owned by {formattedOwnerAddress}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    statusLabel
                  )}`}
                >
                  {statusLabel}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{tokenName}</h3>
                <p className="text-gray-600 text-sm mb-4">{tokenDescription}</p>

                <div className="relative">
                  <Image
                    loader={() => imageURI}
                    src={imageURI}
                    alt={tokenName}
                    height="200"
                    width="200"
                    className="rounded-lg mx-auto"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Condition:</strong> {ShowCondition}
                </p>

                {(statusLabel === "Available" ||
                  statusLabel === "Requested" ||
                  statusLabel === "Sended") && (
                  <>
                    <p className="text-sm text-gray-600">
                      <strong>Daily Rental Price:</strong>{" "}
                      {status == 0
                        ? rentalPriceUSET
                        : ethers.utils.formatEther(rentalPriceUSET)}{" "}
                      {status == 0 ? "USD" : chainId === 43113 ? "AVAX" : "ETH"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Security Deposit:</strong>{" "}
                      {status == 0
                        ? depositUsEt
                        : ethers.utils.formatEther(depositUsEt)}{" "}
                      {status == 0 ? "USD" : chainId === 43113 ? "AVAX" : "ETH"}
                    </p>
                  </>
                )}

                {(statusLabel === "Rented" || statusLabel === "Returned") && (
                  <>
                    <p className="text-sm text-gray-600">
                      <strong>Tenant:</strong> {truncateStr(renter || "", 15)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Loan Days:</strong> {rentalDuration / 86400}
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-center pt-2">
                {isOwnedByUser ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Edit size={16} />
                    <span>Manage</span>
                  </Button>
                ) : statusLabel === "Available" ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <ShoppingCart size={16} />
                    <span>Rent</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </Card>
      )}
    </div>
  );
}
