"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { ethers } from "ethers";
import votingAbi from "../../../artifacts-export/Voting.abi.json"
import deploymentInfo from "../../../artifacts-export/deployment.voting-app.json"

const CONTRACT_ADDRESS = deploymentInfo.contractAddress;

const VOTING_ABI = votingAbi as any;

interface Candidate {
  id: number;
  name: string;
  role: string;
  description: string;
  votes: number;
  color: string;
  initials: string;
}

const CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "Technology & Innovation",
    description: "Advocating for a decentralized digital future powered by open-source tools and AI governance.",
    votes: 0,
    color: "#6366f1",
    initials: "AJ",
  },
  {
    id: 2,
    name: "Bob Martinez",
    role: "Environmental Policy",
    description: "Committed to building a greener planet through sustainable blockchain infrastructure.",
    votes: 0,
    color: "#10b981",
    initials: "BM",
  },
  {
    id: 3,
    name: "Carol Chen",
    role: "Economic Reform",
    description: "Driving financial inclusion and full transparency through DeFi-first solutions.",
    votes: 0,
    color: "#f59e0b",
    initials: "CC",
  },
];

const TX_STEPS = ["Click Vote", "Wallet Popup", "Sign Transaction", "Broadcasting", "Confirmed"];

type TxStatus = "idle" | "signing" | "processing" | "confirmed" | "error";

export default function VotingApp() {
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        setAddress(accounts[0]);
      } catch (err) {
        console.error("Wallet connection failed", err);
      }
    } else {
      alert("MetaMask not detected");
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length) setAddress(accounts[0]);
        })
        .catch((err: any) => console.error("Error checking accounts", err));
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length) setAddress(accounts[0]); else setAddress(null);
      });
    }
  }, []);

  const disconnect = () => setAddress(null);

  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const [voteCounts, setVoteCounts] = useState(CANDIDATES.map((c) => c.votes));
  const [activeVoteId, setActiveVoteId] = useState<number | null>(null);

  // Fetch vote counts from blockchain for each candidate
  const fetchVoteCounts = async () => {
    if (!address) return;
    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VOTING_ABI, provider);
      const counts = await Promise.all(CANDIDATES.map((c) => contract.votes(c.id)));
      setVoteCounts(counts.map((c: any) => Number(c)));
    } catch (err) {
      console.error("Failed to fetch vote counts", err);
    }
  };

  useEffect(() => {
    if (address) {
      fetchVoteCounts();
    }
  }, [address]);

  const totalVotes = voteCounts.reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...voteCounts);

  // Steps 0 & 1 are shown as "already done" once action fires (wallet already connected/popup opened)
  const activeStep =
    txStatus === "signing" ? 2
      : txStatus === "processing" ? 3
        : txStatus === "confirmed" ? TX_STEPS.length  // all done
          : -1;

  const getStepState = (i: number): "done" | "active" | "waiting" => {
    if (i < activeStep) return "done";
    if (i === activeStep) return "active";
    return "waiting";
  };

  const handleSuccess = async (candidateId: number) => {
    // Refresh vote counts from chain after a successful vote
    await fetchVoteCounts();
    setVotedFor(candidateId);
    setTxStatus("confirmed");
    setTimeout(() => {
      setTxStatus("idle");
      setActiveVoteId(null);
    }, 5000);
  };

  const handleError = () => {
    setTxStatus("error");
    setTimeout(() => {
      setTxStatus("idle");
      setActiveVoteId(null);
    }, 3500);
  };

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🗳️</span>
          <span className={styles.logoText}>VoteChain</span>
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
            <button className={styles.connectBtn} onClick={connectWallet} style={{
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 600,
            }}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {/* ── Hero ── */}
        <div className={styles.hero}>
          <p className={styles.subtitle}>Decentralized Voting</p>
          <h1 className={styles.heroTitle}>Cast Your Vote</h1>
          <p className={styles.heroDesc}>
            Your vote is recorded permanently on the blockchain. Each wallet can only vote once.
          </p>
          <div className={styles.totalBadge}>
            {totalVotes.toLocaleString()} total votes cast
          </div>
        </div>

        {/* ── Candidate Cards ── */}
        <div className={styles.grid}>
          {CANDIDATES.map((candidate, idx) => {
            const count = voteCounts[idx];
            const pct = Math.round((count / totalVotes) * 100);
            const isLeading = count === maxVotes;
            const hasVoted = votedFor === candidate.id;
            const isThisVoting =
              activeVoteId === candidate.id &&
              txStatus !== "idle" &&
              txStatus !== "error";

            return (
              <div
                key={candidate.id}
                className={`${styles.card} ${isLeading ? styles.cardLeading : ""} ${hasVoted ? styles.cardVoted : ""}`}
              >
                {/* Badge row */}
                <div className={styles.badgeRow}>
                  {isLeading && (
                    <span
                      className={styles.badge}
                      style={{ background: candidate.color + "22", color: candidate.color }}
                    >
                      🏆 Leading
                    </span>
                  )}
                  {hasVoted && (
                    <span
                      className={styles.badge}
                      style={{ background: "#22c55e22", color: "#22c55e" }}
                    >
                      ✔ You Voted
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={styles.avatar}
                  style={{
                    background: candidate.color + "18",
                    border: `2px solid ${candidate.color}44`,
                  }}
                >
                  <span style={{ color: candidate.color, fontSize: 22, fontWeight: 800 }}>
                    {candidate.initials}
                  </span>
                </div>

                <h3 className={styles.candidateName}>{candidate.name}</h3>
                <p className={styles.candidateRole} style={{ color: candidate.color }}>
                  {candidate.role}
                </p>
                <p className={styles.candidateDesc}>{candidate.description}</p>

                {/* Vote stats */}
                <div className={styles.voteStats}>
                  <div className={styles.statRow}>
                    <span className={styles.pct} style={{ color: candidate.color }}>
                      {pct}%
                    </span>
                    <span className={styles.voteNum}>{count.toLocaleString()} votes</span>
                  </div>
                  <div className={styles.bar}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${pct}%`, background: candidate.color }}
                    />
                  </div>
                </div>

                {/* Vote button */}
                <div className={styles.btnWrap}>
                  {votedFor !== null ? (
                    <button className={styles.disabledBtn} disabled>
                      {hasVoted ? "✔ Voted" : "Voting Closed"}
                    </button>
                  ) : <button
                    disabled={isThisVoting}
                    onClick={async () => {
                      try {
                        setActiveVoteId(candidate.id);
                        setTxStatus("signing");
                        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
                        const signer = provider.getSigner();
                        const contract = new ethers.Contract(CONTRACT_ADDRESS, VOTING_ABI, signer);
                        const tx = await contract.vote(candidate.id);
                        console.log('Vote transaction sent:', tx.hash);
                        await tx.wait();
                        handleSuccess(candidate.id);
                      } catch (err) {
                        console.error(err);
                        handleError();
                      }
                    }}
                    style={{
                      width: "100%",
                      background: isThisVoting
                        ? `${candidate.color}33`
                        : `linear-gradient(135deg, ${candidate.color}, ${candidate.color}bb)`,
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "13px 24px",
                      fontSize: "15px",
                      fontWeight: 700,
                      cursor: isThisVoting ? "wait" : "pointer",
                      boxShadow: `0 4px 20px ${candidate.color}35`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isThisVoting ? "Processing..." : "Cast Vote →"}
                  </button>
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Transaction Flow ── */}
        {txStatus !== "idle" && (
          <div
            className={`${styles.txFlow} ${txStatus === "confirmed" ? styles.txConfirmed : ""
              } ${txStatus === "error" ? styles.txError : ""}`}
          >
            <p className={styles.txTitle}>
              {txStatus === "error"
                ? "❌ Transaction Failed — Please try again"
                : txStatus === "confirmed"
                  ? "🎉 Vote Confirmed on Blockchain!"
                  : "🔄 Transaction in Progress..."}
            </p>
            <div className={styles.steps}>
              {TX_STEPS.map((step, i) => {
                const state = getStepState(i);
                return (
                  <React.Fragment key={step}>
                    <div className={styles.stepItem}>
                      <div
                        className={`${styles.stepCircle} ${state === "done"
                          ? styles.stepDone
                          : state === "active"
                            ? styles.stepActive
                            : styles.stepWaiting
                          }`}
                      >
                        {state === "done" ? "✓" : i + 1}
                      </div>
                      <span
                        className={`${styles.stepLabel} ${state === "active"
                          ? styles.stepLabelActive
                          : state === "done"
                            ? styles.stepLabelDone
                            : ""
                          }`}
                      >
                        {step}
                      </span>
                    </div>
                    {i < TX_STEPS.length - 1 && (
                      <div
                        className={`${styles.connector} ${state === "done" ? styles.connectorDone : ""
                          }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Powered by ethers.js &bull; On-chain governance</p>
      </footer>
    </div>
  );
}
