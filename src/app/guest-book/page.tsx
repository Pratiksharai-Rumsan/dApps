// // Guest Book page with GraphQL subgraph integration


// import React, { useState, useEffect } from "react";
// import {
//   dehydrate,
//   HydrationBoundary,
//   QueryClient,
// } from '@tanstack/react-query'

// import { gql, request } from 'graphql-request'

// import { ethers } from "ethers";

// import guestBookAbi from "../../../artifacts-export/GuestBook.abi.json";
// import deploymentInfo from "../../../artifacts-export/deployment.guestbook-app.json";
// import styles from "./page.module.css";

// interface MessageEvent {
//   author: string;
//   message: string;
// }


// const MESSAGES_QUERY = gql`
//   query GetGuestBookMessages {
//     messagePosteds(
//       first: 100
//       orderBy: blockTimestamp
//       orderDirection: desc
//     ) {
//       id
//       author
//       message
//       blockNumber
//       blockTimestamp
//       transactionHash
//     }
//   }
// `;




// export default function GuestBookPage() {
//   const [address, setAddress] = useState<string | null>(null);
//   const [contract, setContract] = useState<ethers.Contract | null>(null);
//   const [messages, setMessages] = useState<MessageEvent[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const connectWallet = async () => {
//     if (typeof window !== "undefined" && (window as any).ethereum) {
//       try {
//         const provider = new ethers.providers.Web3Provider(
//           (window as any).ethereum,
//         );
//         await provider.send("eth_requestAccounts", []);
//         const signer = provider.getSigner();
//         const walletAddress = await signer.getAddress();
//         setAddress(walletAddress);
//         const guestBook = new ethers.Contract(
//           deploymentInfo.contractAddress,
//           guestBookAbi,
//           signer,
//         );
//         setContract(guestBook);
//       } catch (err) {
//         console.error("⚠️ Wallet connection error", err);
//       }
//     } else {
//       alert("MetaMask not detected");
//     }
//   };

//   const disconnect = () => {
//     setAddress(null);
//     setContract(null);
//   };

//   // ----- Load messages from subgraph -----
//   const loadSubgraphMessages = async () => {
//     try {
//       console.log("Subgraph URL:", process.env.NEXT_PUBLIC_SUBGRAPH_URL);
//       const result = await subgraphClient.query(MESSAGES_QUERY, {}).toPromise();
//       console.log(result, "from subgraph");
//       if (result.data && result.data.messagePosteds) {
//         const subgraphMsgs: MessageEvent[] = result.data.messagePosteds.map(
//           (msg: any) => ({
//             author: msg.author,
//             message: msg.message,
//           }),
//         );
//         setMessages(subgraphMsgs);
//       }
//     } catch (err) {
//       console.error("⚠️ Subgraph fetch error", err);
//     }
//   };

//   // ----- Load messages from on‑chain contract (fallback) -----
//   const loadContractMessages = async (c: ethers.Contract) => {
//     try {
//       const filter = c.filters.MessagePosted();
//       const events = await c.queryFilter(filter, 0, "latest");
//       const msgs = events.map((e: any) => ({
//         author: e.args.author,
//         message: e.args.message,
//       }));
//       setMessages((prev) => [...msgs.reverse(), ...prev]);
//     } catch (err) {
//       console.error("⚠️ Failed to load contract messages", err);
//     }
//   };

//   // Fetch subgraph messages on mount
//   useEffect(() => {
//     loadSubgraphMessages();
//   }, []);

//   // When contract is ready, load on‑chain messages & listen for new events
//   useEffect(() => {
//     if (contract) {
//       loadContractMessages(contract);
//       const filter = contract.filters.MessagePosted();
//       const onMessage = (author: string, message: string) => {
//         setMessages((prev) => [{ author, message }, ...prev]);
//       };
//       contract.on(filter, onMessage);
//       return () => {
//         contract.off(filter, onMessage);
//       };
//     }
//   }, [contract]);

//   // ----- Post a new message -----
//   const postMessage = async () => {
//     if (!contract || !newMessage.trim()) return;
//     setIsSubmitting(true);
//     try {
//       const tx = await contract.postMessage(newMessage.trim());
//       await tx.wait();
//       setNewMessage("");
//     } catch (err) {
//       console.error("⚠️ Message post failed", err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className={styles.page}>
//       <header className={styles.header}>
//         <div className={styles.logo}>
//           <span className={styles.logoIcon}>🗒️</span>
//           <span className={styles.logoText}>GuestBook</span>
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
//               Connect Wallet
//             </button>
//           )}
//         </div>
//       </header>
//       <main className={styles.main}>
//         <div className={styles.hero}>
//           <input
//             type="text"
//             placeholder="Write something nice…"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             disabled={isSubmitting}
//             className={styles.messageInput}
//             maxLength={200}
//           />
//           <button
//             onClick={postMessage}
//             disabled={!newMessage.trim() || isSubmitting}
//             className={styles.connectBtn}
//             style={{ marginTop: "12px" }}
//           >
//             {isSubmitting ? "Submitting…" : "Post Message"}
//           </button>
//         </div>
//         <div className={styles.grid}>
//           {messages.map((msg, idx) => (
//             <div key={idx} className={styles.card}>
//               <p className={styles.messageText}>{msg.message}</p>
//               <p className={styles.candidateRole}>
//                 — {msg.author.slice(0, 6)}...{msg.author.slice(-4)}
//               </p>
//             </div>
//           ))}
//         </div>
//       </main>
//       <footer className={styles.footer}>
//         <p>Powered by ethers.js • GuestBook dApp</p>
//       </footer>
//     </div>
//   );
// }

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import Data from '../../components/Data'
const query = gql`{
  messagePosteds(first: 5) {
    id
    author
    message
    blockNumber
  }
}`
const apiKey = process.env.NEXT_PUBLIC_GRAPH_API_KEY;
console.log(apiKey, 'key')
const url = `https://api.studio.thegraph.com/query/1755809/indexing-data/version/latest`;
const headers = { Authorization: `${apiKey}` }
export default async function GuestBook() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['data'],
    async queryFn() {
      return await request(url, query, {}, headers)
    }
  })
  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Data />
    </HydrationBoundary>
  )
}


