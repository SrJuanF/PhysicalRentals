import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  avalanche,
  avalancheFuji,
  celo,
  celoAlfajores,
} from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Si no hay projectId, usamos una configuración básica sin WalletConnect
if (!projectId || projectId === "YOUR_PROJECT_ID") {
  console.warn(
    "WalletConnect projectId not found. Some wallet options may not be available."
  );
}

export const config = getDefaultConfig({
  appName: "Physical Artifact Rentals",
  projectId: projectId || "YOUR_PROJECT_ID",
  chains: [
    mainnet,
    sepolia,
    polygon,
    polygonMumbai,
    avalanche,
    avalancheFuji,
    celo,
    celoAlfajores,
  ],
  ssr: true,
});
