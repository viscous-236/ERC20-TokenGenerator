import React from "react";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { getContract } from "../erc20.js";
import Button from "../Components/Button.jsx";

const MinimalBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions
        const setCanvasDimensions = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        setCanvasDimensions();
        window.addEventListener("resize", setCanvasDimensions);

        // Draw static grid
        const drawGrid = () => {
            ctx.strokeStyle = "rgba(30, 60, 100, 0.07)";
            ctx.lineWidth = 0.5;

            // Vertical lines
            const cellSize = 40;
            for (let x = 0; x < canvas.width; x += cellSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = 0; y < canvas.height; y += cellSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        };

        // Create subtle floating dots
        const dots = [];
        const dotCount = 40; // Reduced number of dots

        for (let i = 0; i < dotCount; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5, // Smaller dots
                color: `rgba(50, 100, 180, ${Math.random() * 0.15 + 0.05})`, // Very subtle blue
                speedX: (Math.random() - 0.5) * 0.2, // Slower movement
                speedY: (Math.random() - 0.5) * 0.2,
            });
        }

        // Create stars
        const stars = [];
        const starCount = 100; // Number of stars

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 0.7 + 0.1, // Tiny stars
                color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`, // White with varying opacity
                twinkleSpeed: Math.random() * 0.02 + 0.005, // How fast it twinkles
                twinkleDirection: Math.random() > 0.5 ? 1 : -1, // Increasing or decreasing brightness
                opacity: Math.random() * 0.5 + 0.3, // Starting opacity
            });
        }

        // Animation function
        let animationId;
        const animate = () => {
            // Clear canvas with very subtle fade effect
            ctx.fillStyle = "rgba(10, 15, 25, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Redraw grid
            drawGrid();

            // Update and draw stars with twinkling effect
            stars.forEach(star => {
                // Update star opacity for twinkling effect
                star.opacity += star.twinkleSpeed * star.twinkleDirection;

                // Reverse direction when reaching opacity limits
                if (star.opacity >= 0.8 || star.opacity <= 0.1) {
                    star.twinkleDirection *= -1;
                }

                // Draw star
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.fill();
            });

            // Update and draw dots
            dots.forEach(dot => {
                // Update position
                dot.x += dot.speedX;
                dot.y += dot.speedY;

                // Wrap around edges
                if (dot.x < 0) dot.x = canvas.width;
                if (dot.x > canvas.width) dot.x = 0;
                if (dot.y < 0) dot.y = canvas.height;
                if (dot.y > canvas.height) dot.y = 0;

                // Draw dot
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx.fillStyle = dot.color;
                ctx.fill();
            });

            // Draw very subtle connections between close dots
            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 80) { // Shorter connection distance
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(50, 100, 180, ${0.03 * (1 - distance / 80)})`; // Very subtle connections
                        ctx.lineWidth = 0.3;
                        ctx.moveTo(dots[i].x, dots[i].y);
                        ctx.lineTo(dots[j].x, dots[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        // Draw initial background
        ctx.fillStyle = "#0a0f19"; // Dark blue-black
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        animate();

        // Cleanup function
        return () => {
            window.removeEventListener("resize", setCanvasDimensions);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />;
};

function TokenCreation() {
    const [account, setAccount] = useState("");
    const [balance, setBalance] = useState("0");
    const [mintAmount, setMintAmount] = useState("");
    const [burnAmount, setBurnAmount] = useState("");
    const [transferAddress, setTransferAddress] = useState("");
    const [transferAmount, setTransferAmount] = useState("");
    const [mintedTokens, setMintedTokens] = useState("0");
    const [loading, setLoading] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const refreshData = () => {
        setRefreshCounter(prev => prev + 1);
    };

    useEffect(() => {
        const connectWallet = async () => {
            try {
                if (window.ethereum) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.send("eth_requestAccounts", []);
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                    }
                } else {
                    alert("MetaMask is not installed. Please install it to proceed!");
                }
            } catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        };

        connectWallet();
    }, []);

    useEffect(() => {
        const updateAccountData = async () => {
            if (account) {
                await fetchBalance();
                await fetchMintedTokens();
                await gettingUsers();
            }
        };

        updateAccountData();
    }, [account, refreshCounter]);

    const fetchBalance = async () => {
        try {
            const contract = await getContract();
            if (contract && account) {
                const balance = await contract.getBalance(account);
                const formattedBalance = ethers.formatUnits(balance, 18);
                setBalance(formattedBalance);
                console.log("Updated balance:", formattedBalance);
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const fetchMintedTokens = async () => {
        try {
            const contract = await getContract();
            if (contract && account) {
                const tokens = await contract.getTotalMinted(account);
                const formattedTokens = ethers.formatUnits(tokens, 18);
                setMintedTokens(formattedTokens);
            }
        } catch (error) {
            console.error("Error fetching minted tokens:", error);
        }
    };

    const handleMint = async () => {
        try {
            if (!mintAmount || isNaN(mintAmount) || mintAmount <= 0) {
                alert("Please enter a valid mint amount.");
                return;
            }
            setLoading(true);
            const contract = await getContract();
            if (contract) {
                console.log("Minting tokens:", mintAmount);
                const tx = await contract.mint(ethers.parseUnits(mintAmount, 18));
                await tx.wait();
                console.log("Mint transaction complete");
                alert("Minting successful!");
                setMintAmount("");
                refreshData();
                await gettingUsers();
            }
        } catch (error) {
            console.error("Error minting tokens:", error);
            alert("Error minting tokens: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const handleBurn = async () => {
        try {
            if (!burnAmount || isNaN(burnAmount) || burnAmount <= 0) {
                alert("Please enter a valid burn amount.");
                return;
            }
            setLoading(true);
            const contract = await getContract();
            if (!contract) {
                alert("Contract not found.");
                return;
            }

            const userBalance = await contract.getBalance(account);
            const burnAmountInUnits = ethers.parseUnits(burnAmount, 18);

            if (userBalance.toString() === "0") {
                alert("You have no tokens to burn.");
                return;
            }

            if (burnAmountInUnits > userBalance) {
                alert("Burn amount exceeds balance.");
                return;
            }

            console.log("Burning tokens:", burnAmount);
            const tx = await contract.burn(burnAmountInUnits);
            await tx.wait();
            console.log("Burn transaction complete");
            alert("Burning successful!");
            setBurnAmount("");
            refreshData();
        } catch (error) {
            console.error("Error burning tokens:", error);
            alert("An error occurred while burning tokens: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        try {
            if (!transferAddress || !transferAmount || isNaN(transferAmount) || transferAmount <= 0) {
                alert("Please enter a valid address and amount.");
                return;
            }
            const contract = await getContract();

            const userBalance = await contract.getBalance(account);
            const transferAmountInUnits = ethers.parseUnits(transferAmount, 18);
            if (transferAmountInUnits > userBalance) {
                alert("Transfer amount exceeds balance.");
                return;
            }

            if (transferAddress.toLowerCase() == account.toLowerCase()) {
                alert("You cannot transfer tokens to yourself.");
                return;
            }

            if (!transferAddress.startsWith("0x")) {
                alert("Please enter a valid Ethereum address.");
                return;
            }

            setLoading(true);
            if (contract) {
                console.log("Transferring tokens:", transferAmount, "to", transferAddress);
                const tx = await contract.transferToken(transferAddress, ethers.parseUnits(transferAmount, 18));
                await tx.wait();
                console.log("Transfer transaction complete");
                alert("Transfer successful!");
                setTransferAddress("");
                setTransferAmount("");
                refreshData();
                await gettingUsers();
            }
        } catch (error) {
            console.error("Error transferring tokens:", error);
            alert("Error transferring tokens: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const gettingUsers = async () => {
        try {
            const contract = await getContract();
            if (contract) {
                console.log("Fetching all users...");
                const users = await contract.getAllUsers();

                if (!users || users.length === 0) {
                    console.log("No users found.");
                    setUsers([]);
                    return;
                }


                const formattedUsers = await Promise.all(
                    users.map(async (user) => {
                        const tokenAddress = await contract.getUserTokenAddress(user);
                        const minted = await contract.getTotalMinted(user);
                        return {
                            address: user,
                            tokenAddress,
                            minted: ethers.formatUnits(minted, 18), // Format minted tokens
                        };
                    })
                );

                console.log("Formatted users:", formattedUsers);
                setUsers(formattedUsers); // Store the result in state
            }
        } catch (error) {
            console.error("Error getting users:", error);
        }
    };

    useEffect(() => {
        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                console.log("Account: Disconnected");
                setAccount("");
                navigate("/");
            } else {
                const newAccount = accounts[0];
                if (newAccount !== account) {
                    console.log("Account changed:", newAccount);
                    setAccount(newAccount);
                }
            }
        };

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            }
        };
    }, [account, navigate]);


    const formatAddress = (address) => {
        if (!address) return "";
        return `${address}`;
    };


    return (
        <div className="min-h-screen text-white font-mono">
            <MinimalBackground />

            <div className=" text-white text-center py-2 font-bold">
                ⚠️ This application works only on the Sepolia Testnet. Please ensure your wallet is connected to Sepolia.
            </div>


            <div className="container mx-auto px-4 py-8">
                <div className="border border-gray-700 rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <h1 className="text-4xl mb-4 md:mb-0">ERC-20 Token Generator</h1>
                        <div className="bg-gray-900 px-4 py-2 rounded border border-gray-700">
                            Connected: {formatAddress(account)}
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <div className="border border-gray-700 rounded-lg p-4 mb-4">
                            <div className="flex justify-between items-center">
                                <div>MintedTokens: {mintedTokens} ether</div>
                                <div>Balance: {balance} ether</div>
                            </div>
                        </div>


                        <div className="border border-gray-700 rounded-lg p-4 mb-4">
                            <h2 className="text-2xl mb-4 text-center">Mint Tokens</h2>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter Tokens"
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 mb-4"
                                    value={mintAmount}
                                    onChange={(e) => setMintAmount(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    className="w-full bg-green-800 hover:bg-green-700 rounded p-3 transition-colors"
                                    onClick={handleMint}
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : "Mint"}
                                </Button>
                            </div>
                        </div>

                        <div className="border border-gray-700 rounded-lg p-4">
                            <h2 className="text-2xl mb-4 text-center">Handle Burn</h2>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter Tokens"
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 mb-4"
                                    value={burnAmount}
                                    onChange={(e) => setBurnAmount(e.target.value)}
                                />
                                <Button
                                    className="w-full bg-green-800 hover:bg-green-700 rounded p-3 transition-colors"
                                    onClick={handleBurn}
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : "Burn"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <div className="border border-gray-700 rounded-lg p-4 h-full">
                            <h2 className="text-2xl mb-6 text-center">TransferTokens</h2>

                            <div className="mb-6">
                                <label className="block mb-2 text-lg">Enter TransferAddress</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2"
                                    value={transferAddress}
                                    onChange={(e) => setTransferAddress(e.target.value)}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block mb-2 text-lg">Enter TransferAmount</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                />
                            </div>

                            <Button
                                className="w-full bg-green-800 hover:bg-green-700 rounded p-3 transition-colors mt-8"
                                onClick={handleTransfer}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Transfer"}
                            </Button>
                        </div>
                    </div>


                    <div className="md:col-span-1">
                        <div className="border border-gray-700 rounded-lg p-4 h-full">
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="font-bold">UserAddress</div>
                                <div className="font-bold">Minted</div>
                                <div className="font-bold">TokenAddress</div>
                            </div>

                            {users.length > 0 ? (
                                users.map((user, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                                        <div
                                            className="truncate cursor-pointer text-blue-400 hover:underline"
                                            title={user.address} // Show full address on hover
                                            onClick={() => {
                                                navigator.clipboard.writeText(user.address);
                                                alert("Copied User Address: " + user.address);
                                            }}
                                        >
                                            {user.address}
                                        </div>
                                        <div className="truncate">{user.minted} ether</div>
                                        <div
                                            className="truncate cursor-pointer text-blue-400 hover:underline"
                                            title={user.tokenAddress} // Show full address on hover
                                            onClick={() => {
                                                navigator.clipboard.writeText(user.tokenAddress);
                                                alert("Copied Token Address: " + user.tokenAddress);
                                            }}
                                        >
                                            {user.tokenAddress}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500">No users found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TokenCreation;