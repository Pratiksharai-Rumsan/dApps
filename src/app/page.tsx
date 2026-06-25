"use client";

import styles from "./page.module.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import greetingAbi from "../../artifacts-export/Greeting.abi.json";
import deploymentInfo from "../../artifacts-export/deployment.baseSepolia.json";

export default function Home() {
  const [message, setMessage] = useState("Hello, Everyone");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [address, setAddress] = useState<string | null>(null);
  const [greetingContract, setGreetingContract] = useState<ethers.Contract | null>(null);
  // Persist wallet connection across page refreshes
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      // Only auto‑connect if we previously stored a connected address
      const stored = window.localStorage.getItem("connectedAddress");
      if (!stored) return;
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      provider
        .listAccounts()
        .then(async (accounts) => {
          if (accounts.length > 0) {
            const walletAddress = accounts[0];
            setAddress(walletAddress);
            window.localStorage.setItem("connectedAddress", walletAddress);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
              deploymentInfo.contractAddress,
              greetingAbi,
              signer
            );
            setGreetingContract(contract);
            try {
              const greeting = await contract.greeting();
              setMessage(greeting);
            } catch (err) {
              console.error("❌ Auto‑load greeting failed:", err);
            }
          }
        })
        .catch((err) => console.error("❌ Failed to list accounts:", err));
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setIsConnecting(true);
      try {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        await provider.send("eth_requestAccounts", []);
        // Network sanity checks
        const network = await provider.getNetwork();
        console.log('🔗 Connected to network:', network.name, `(chainId ${network.chainId})`);
        const bytecode = await provider.getCode(deploymentInfo.contractAddress);
        if (bytecode === '0x') {
          console.error('⚠️ No contract bytecode at the supplied address. Check deploymentInfo!');
        }
        const signer = provider.getSigner();

        const walletAddress = await signer.getAddress();
        setAddress(walletAddress);
        window.localStorage.setItem("connectedAddress", walletAddress);
        console.log("🦊 Connected wallet:", walletAddress);

        // Verify you are using the right address from the JSON
        console.log("📦 Contract address from deploymentInfo:", deploymentInfo.contractAddress);

        const contractWithSigner = new ethers.Contract(
          deploymentInfo.contractAddress,
          greetingAbi,
          signer
        );

        setGreetingContract(contractWithSigner);

        // Fetch the current greeting – log the result or any error
        contractWithSigner
          .greeting()
          .then((greeting: string) => {
            console.log("🔔 Greeting from contract:", greeting);
            setMessage(greeting);
          })
          .catch((err: any) => {
            console.error("❌ Failed to read greeting:", err);
          });
      } catch (err) {
        console.error("⚠️ Wallet connection failed:", err);
      } finally {
        setIsConnecting(false);
      }
    } else {
      console.error("⚠️ MetaMask not detected");
    }
  };


  const disconnect = () => {
    setAddress(null);
    window.localStorage.removeItem("connectedAddress");
    setGreetingContract(null);
  };

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      if (greetingContract) {
        try {
          setIsLoading(true);
          const tx = await greetingContract.setGreeting(inputValue.trim());
          await tx.wait();
          const newGreeting = await greetingContract.greeting();
          setMessage(newGreeting);
        } catch (err) {
          console.error("Failed to set greeting", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Fallback if contract not ready
        setMessage(inputValue.trim());
      }
      setInputValue("");
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue("");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💬</span>
          <span className={styles.logoText}>MessageBoard</span>
        </div>

        <div className={styles.walletSection}>
          {address ? (
            <div className={styles.connectedWallet}>
              <span className={styles.walletDot} />
              <span className={styles.walletAddress}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button className={styles.disconnectBtn} onClick={disconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <button
            className={styles.connectBtn}
            onClick={connectWallet}
            disabled={isConnecting}
            style={{
              backgroundColor: isConnecting ? "#555" : "#007bff",
              color: "black",
              padding: "8px 16px",
              borderRadius: "5px",
              border: "none",
              fontSize: "14px",
              cursor: isConnecting ? "default" : "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            {isConnecting ? "Connecting..." : "Connect wallet"}
          </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <p className={styles.subtitle}>Decentralized Message Board</p>
          <h1 className={styles.heroTitle}>Current Message</h1>
        </div>

        <div className={styles.messageCard}>
          <div className={styles.messageGlow} />
          <div className={styles.messageContent}>
            <span className={styles.quoteLeft}>&ldquo;</span>
            <p className={styles.messageText} key={message}>
              {message}
            </p>
            <span className={styles.quoteRight}>&rdquo;</span>
          </div>
        </div>

        <div className={styles.actionSection}>
          {!isEditing ? (
            <button
              className={styles.changeBtn}
              onClick={() => setIsEditing(true)}
            >
              <span>✏️</span>
              Change Message
            </button>
          ) : (
            <div className={styles.editPanel}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={styles.messageInput}
                  placeholder="Type your new message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  maxLength={150}
                />
                {isLoading && (
                  <p className={styles.loading}>Transaction pending, please wait...</p>
                )}
                <span className={styles.charCount}>{inputValue.length}/150</span>
              </div>
              <div className={styles.editActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    setIsEditing(false);
                    setInputValue("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isLoading}
                >
                  Submit Message
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Built on Web3 &bull; Powered by Thirdweb</p>
      </footer>
    </div>
  );
}
