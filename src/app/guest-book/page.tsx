// src/app/guest-book/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './page.module.css';
import guestBookAbi from '../../../artifacts-export/GuestBook.abi.json';
import deploymentInfo from '../../../artifacts-export/deployment.guestbook-app.json';
import Data from '../../components/Data';

interface MessageEvent {
  author: string;
  message: string;
}

export default function GuestBookPage() {
  // Wallet state
  const [address, setAddress] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // UI state for posting messages
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On‑chain messages (fallback & live updates)
  const [messages, setMessages] = useState<MessageEvent[]>([]);

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const walletAddress = await signer.getAddress();
        setAddress(walletAddress);
        const guestBook = new ethers.Contract(
          deploymentInfo.contractAddress,
          guestBookAbi,
          signer,
        );
        setContract(guestBook);
      } catch (err) {
        console.error('⚠️ Wallet connection error', err);
      }
    } else {
      alert('MetaMask not detected');
    }
  };

  const disconnect = () => {
    setAddress(null);
    setContract(null);
  };

  // Load on‑chain messages when contract is ready
  const loadContractMessages = async (c: ethers.Contract) => {
    try {
      const filter = c.filters.MessagePosted();
      const events = await c.queryFilter(filter, 0, 'latest');
      const msgs = events.map((e: any) => ({
        author: e.args.author,
        message: e.args.message,
      }));
      // Reverse to show newest first
      setMessages((prev) => [...msgs.reverse(), ...prev]);
    } catch (err) {
      console.error('⚠️ Failed to load contract messages', err);
    }
  };

  // Listen for live events
  useEffect(() => {
    if (contract) {
      loadContractMessages(contract);
      const filter = contract.filters.MessagePosted();
      const onMessage = (author: string, message: string) => {
        setMessages((prev) => [{ author, message }, ...prev]);
      };
      contract.on(filter, onMessage);
      return () => {
        contract.off(filter, onMessage);
      };
    }
  }, [contract]);

  // Post a new message via contract
  const postMessage = async () => {
    if (!contract || !newMessage.trim()) return;
    setIsSubmitting(true);
    try {
      const tx = await contract.postMessage(newMessage.trim());
      await tx.wait();
      setNewMessage('');
    } catch (err) {
      console.error('⚠️ Message post failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🗒️</span>
          <span className={styles.logoText}>GuestBook</span>
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
            <button className={styles.connectBtn} onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>
      <main className={styles.main}>
        {/* Input for new message */}
        <div className={styles.hero}>
          <input
            type="text"
            placeholder="Write something nice…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSubmitting}
            className={styles.messageInput}
            maxLength={200}
          />
          <button
            onClick={postMessage}
            disabled={!newMessage.trim() || isSubmitting}
            className={styles.connectBtn}
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Submitting…' : 'Post Message'}
          </button>
        </div>
        {/* Subgraph data displayed via Data component */}
        <div className={styles.subgraphSection}>
          <Data />
        </div>
        {/* On‑chain messages for fallback / live updates */}
        <div className={styles.grid}>
          {messages.map((msg, idx) => (
            <div key={idx} className={styles.card}>
              <p className={styles.messageText}>{msg.message}</p>
              <p className={styles.candidateRole}>— {msg.author.slice(0, 6)}...{msg.author.slice(-4)}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className={styles.footer}>
        <p>Powered by ethers.js • GuestBook dApp</p>
      </footer>
    </div>
  );
}
