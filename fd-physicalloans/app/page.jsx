"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";
import Header from "./components/Header";
import NFTBox from "./components/NFTBox";
import KYC from "./components/KYC";
import { Card, CardContent } from "../ui/card";
import { Loader2, AlertCircle, Shield } from "lucide-react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const {
    loading,
    error,
    data: listedNfts,
  } = useQuery(GET_ACTIVE_ITEMS, {
    skip: !isClient,
  });

  useEffect(() => {
    setIsClient(true);
    // Check if user is already verified (you can store this in localStorage or check from your backend)
    const verified = localStorage.getItem("kyc-verified");
    if (verified === "true") {
      setIsVerified(true);
    } else {
      // Show KYC modal on first visit
      setShowKYCModal(true);
    }
  }, []);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    localStorage.setItem("kyc-verified", "true");
  };

  const handleCloseKYC = () => {
    setShowKYCModal(false);
  };

  console.log("Listed NFTs:", listedNfts?.length);
  console.log("Loading:", loading, "Error:", error);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* KYC Modal */}
      <KYC
        isOpen={showKYCModal}
        onClose={handleCloseKYC}
        onVerificationSuccess={handleVerificationSuccess}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Physical Artifacts
          </h1>
          <p className="text-gray-600">
            Discover and rent physical tools securely on the blockchain
          </p>

          {/* Verification Status */}
          <div className="mt-4 flex items-center gap-2">
            {isVerified ? (
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Identity Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKYCModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Complete KYC Verification
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Show content only if verified */}
        {!isVerified ? (
          <div className="flex justify-center py-12">
            <Card className="p-8 max-w-md">
              <CardContent className="flex flex-col items-center space-y-4 text-center">
                <Shield className="h-16 w-16 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Identity Verification Required
                </h2>
                <p className="text-gray-600">
                  Please complete the KYC verification to access the platform
                  and view available artifacts.
                </p>
                <button
                  onClick={() => setShowKYCModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Start Verification
                </button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Card className="p-8">
                  <CardContent className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-lg text-gray-600">
                      Loading artifacts...
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : error ? (
              <div className="col-span-full flex justify-center py-12">
                <Card className="p-8">
                  <CardContent className="flex flex-col items-center space-y-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <p className="text-lg text-red-600">Error loading data</p>
                    <p className="text-sm text-gray-600">{error.message}</p>
                  </CardContent>
                </Card>
              </div>
            ) : !listedNfts?.activeItems ||
              listedNfts.activeItems.length === 0 ? (
              <div className="col-span-full flex justify-center py-12">
                <Card className="p-8">
                  <CardContent className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔧</span>
                    </div>
                    <p className="text-lg text-gray-600">
                      No artifacts available yet
                    </p>
                    <p className="text-sm text-gray-500">
                      Be the first to list a tool!
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              listedNfts.activeItems.map((nft) => {
                const {
                  toolId,
                  owner,
                  rentalPriceUSET,
                  depositUsEt,
                  status,
                  renter,
                  rentalDuration,
                  condition,
                } = nft;

                return (
                  <NFTBox
                    key={toolId}
                    nftAddress={nft.nftAddress}
                    tokenId={toolId}
                    Owner={owner}
                    rentalPriceUSET={rentalPriceUSET}
                    depositUsEt={depositUsEt}
                    status={status}
                    renter={renter}
                    rentalDuration={rentalDuration}
                    condition={condition}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
