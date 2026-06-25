// "use client";

// import styles from "../page.module.css";
// import { ethers } from "ethers";
// import { useState, useEffect } from "react";

// export default function Home() {
//   const [message, setMessage] = useState("Hello, Everyone");
//   const [isEditing, setIsEditing] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const [address, setAddress] = useState<string | null>(null);

//   const connectWallet = async () => {
//     if (typeof window !== "undefined" && (window as any).ethereum) {
//       try {
//         const provider = new ethers.providers.Web3Provider((window as any).ethereum);
//         await provider.send("eth_requestAccounts", []);
//         const signer = provider.getSigner();
//         const walletAddress = await signer.getAddress();
//         setAddress(walletAddress);
//       } catch (err) {
//         console.error("Wallet connection failed", err);
//       }
//     } else {
//       console.error("MetaMask not detected");
//     }
//   };

//   const disconnect = () => {
//     setAddress(null);
//   };

//   useEffect(() => {
//     if (typeof window !== "undefined" && (window as any).ethereum) {
//       const handleAccountsChanged = (accounts: string[]) => {
//         if (accounts.length === 0) {
//           setAddress(null);
//         } else {
//           setAddress(accounts[0]);
//         }
//       };
//       (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
//       return () => {
//         (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
//       };
//     }
//   }, []);

//   const handleSubmit = () => {
//     if (inputValue.trim()) {
//       setMessage(inputValue.trim());
//       setInputValue("");
//       setIsEditing(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") handleSubmit();
//     if (e.key === "Escape") {
//       setIsEditing(false);
//       setInputValue("");
//     }
//   };

//   return (
//     <div className={styles.page}>
//       <header className={styles.header}>
//         <div className={styles.logo}>
//           <span className={styles.logoIcon}>💬</span>
//           <span className={styles.logoText}>MessageBoard</span>
//         </div>

//         <div className={styles.walletSection}>
//           {address ? (
//             <div className={styles.connectedWallet}>
//               <span className={styles.walletDot} />
//               <span className={styles.walletAddress}>
//                 {address.slice(0, 6)}...{address.slice(-4)}
//               </span>
//               <button className={styles.disconnectBtn} onClick={disconnect}>
//                 Disconnect
//               </button>
//             </div>
//           ) : (
//             <button className={styles.connectBtn} onClick={connectWallet}>
//               Connect  your wallet
//             </button>
//           )}
//         </div>
//       </header>

//       <main className={styles.main}>
//         <div className={styles.hero}>
//           <p className={styles.subtitle}>Decentralized Message Board</p>
//           <h1 className={styles.heroTitle}>Current Message</h1>
//         </div>

//         <div className={styles.messageCard}>
//           <div className={styles.messageGlow} />
//           <div className={styles.messageContent}>
//             <span className={styles.quoteLeft}>“</span>
//             <p className={styles.messageText} key={message}>
//               {message}
//             </p>
//             <span className={styles.quoteRight}>”</span>
//           </div>
//         </div>

//         <div className={styles.actionSection}>
//           {!isEditing ? (
//             <button className={styles.changeBtn} onClick={() => setIsEditing(true)}>
//               <span>✏️</span>
//               Change Message
//             </button>
//           ) : (
//             <div className={styles.editPanel}>
//               <div className={styles.inputWrapper}>
//                 <input
//                   type="text"
//                   className={styles.messageInput}
//                   placeholder="Type your new message..."
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   autoFocus
//                   maxLength={150}
//                 />
//                 <span className={styles.charCount}>{inputValue.length}/150</span>
//               </div>
//               <div className={styles.editActions}>
//                 <button
//                   className={styles.cancelBtn}
//                   onClick={() => {
//                     setIsEditing(false);
//                     setInputValue("");
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className={styles.submitBtn}
//                   onClick={handleSubmit}
//                   disabled={!inputValue.trim()}
//                 >
//                   Submit Message
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>

//       <footer className={styles.footer}>
//         <p>Built on Web3 • Powered by Ethers.js</p>
//       </footer>
//     </div>
//   );
// }
