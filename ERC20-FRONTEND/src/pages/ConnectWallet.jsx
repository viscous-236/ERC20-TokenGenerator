import React, { useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

function ConnectWallet() {
    const [account, setAccount] = useState(null);
    const navigate = useNavigate();

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const signer = await provider.getSigner();
                const address = signer.address;
                setAccount(address);
                console.log("Connected account:", address);
                navigate("/token-creation");
            } catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        } else {
            alert("MetaMask is not installed. Please install it to proceed!");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <MinimalBackground />

            <div className="relative bg-black/50 backdrop-blur-sm border border-blue-900/40 rounded-lg p-15 text-center w-100 shadow-md">
                <h1 className="text-blue-100 text-3xl font-bold mb-6">
                    ERC-20 Token Generator
                </h1>
                <p className="text-gray-300 text-lg mb-8">Connect Your Wallet</p>
                <button
                    onClick={connectWallet}
                    className="w-full px-6 py-3 bg-blue-600 text-white text-lg rounded-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:scale-105 hover:cursor-pointer"
                >
                    {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect'}
                </button>
            </div>
        </div>
    );
}

export default ConnectWallet;