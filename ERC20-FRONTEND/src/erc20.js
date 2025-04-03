import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xf625EE35dCD8c2D6bd2d4f2eE54c8cB32BfD674f"; // Replace with actual address
const CONTRACT_ABI = [
  "function mint(uint256 amount)",
  "function burn(uint256 amount)",
  "function transferToken(address to, uint256 amount)",
  "function getBalance(address account) view returns (uint256)",
  "function getTotalSupply() view returns (uint256)",
  "function getAllUsers() view returns (address[])",
  "function getUserTokenAddress(address user) view returns (address)",
  "function getTotalMinted(address user) view returns (uint256)"
];

export const getContract = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return null;
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};