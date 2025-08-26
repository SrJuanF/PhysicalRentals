"use client";

import React, { useState, useEffect, useMemo } from "react";
import { countries, getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";
import { X } from "lucide-react";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
}

export default function KYC({ isOpen, onClose, onVerificationSuccess }: KYCModalProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId, setUserId] = useState("0xc060DbB08Cd8980479bFfe829236Bcb9a1D9bD06");
  const [activeTab, setActiveTab] = useState('patient');
  
  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.NORTH_KOREA], []);

  // Use useEffect to ensure code only executes on the client side
  useEffect(() => {
    if (!isOpen) return;
    
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME,
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE,
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
        logoBase64:
          "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
        userId: userId,
        endpointType: "staging_celo", //staging_https o staging_celo
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: "Bonjour Cannes!",
        disclosures: {
          // what you want to verify from users' identity
          minimumAge: 18,
          ofac: false,
          excludedCountries: [],

          //what you want users to reveal
          // name: false,
          // issuing_state: true,
          //nationality: false,
          // date_of_birth: true,
          // passport_number: false,
          //gender: false,
          // expiry_date: false,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  const handleSuccessfulVerification = () => {
    displayToast("Verification successful! Access granted.");
    setTimeout(() => {
      onVerificationSuccess();
      onClose();
    }, 1500);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-modal-fade-in"
        onClick={handleBackdropClick}
      >
        {/* Modal Content */}
        <div className="bg-[#0f1a16] rounded-lg border border-[#2f6a55] max-w-[512px] w-full max-h-[90vh] overflow-y-auto animate-modal-slide-in">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-[#2f6a55]">
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight">
              Identity Verification (KYC)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-[#8ecdb7] text-center pb-6">
              Complete your verification to access the platform
            </p>

            {/* Self Protocol KYC Section */}
            <div className="py-6">
              <div className="bg-[#17352b] rounded-lg border border-[#2f6a55] p-6">
                <h3 className="text-white text-xl font-bold mb-4 text-center">
                  {process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop"}
                </h3>
                <p className="text-[#8ecdb7] text-center mb-6">
                  Scan QR code with Self Protocol App to verify your identity
                </p>

                <div className="flex justify-center mb-6">
                  {selfApp ? (
                    <SelfQRcodeWrapper
                      selfApp={selfApp}
                      onSuccess={handleSuccessfulVerification}
                      onError={() => {
                        displayToast("Error: Failed to verify identity");
                      }}
                    />
                  ) : (
                    <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Loading QR Code...</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    disabled={!universalLink}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {linkCopied ? "Copied!" : "Copy Universal Link"}
                  </button>

                  <button
                    type="button"
                    onClick={openSelfApp}
                    disabled={!universalLink}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-2 rounded-md text-sm mt-2 sm:mt-0 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    Open Self App
                  </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">User Address</span>
                  <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-gray-800 border border-gray-200">
                    {userId ? userId : <span className="text-gray-400">Not connected</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm z-[60]">
          {toastMessage}
        </div>
      )}
    </>
  );
}