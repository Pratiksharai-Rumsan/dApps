"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { useAddress, useDisconnect, ConnectWallet, Web3Button } from "@thirdweb-dev/react";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

const VOTING_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "candidateId", type: "uint256" }],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

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
    id: 0,
    name: "Alice Johnson",
    role: "Technology & Innovation",
    description: "Advocating for a decentralized digital future powered by open-source tools and AI governance.",
    votes: 1247,
    color: "#6366f1",
    initials: "AJ",
  },
  {
    id: 1,
    name: "Bob Martinez",
    role: "Environmental Policy",
    description: "Committed to building a greener planet through sustainable blockchain infrastructure.",
    votes: 983,
    color: "#10b981",
    initials: "BM",
  },
  {
    id: 2,
    name: "Carol Chen",
    role: "Economic Reform",
    description: "Driving financial inclusion and full transparency through DeFi-first solutions.",
    votes: 1105,
    color: "#f59e0b",
    initials: "CC",
  },
];

const TX_STEPS = ["Click Vote", "Wallet Popup", "Sign Transaction", "Broadcasting", "Confirmed"];

type TxStatus = "idle" | "signing" | "processing" | "confirmed" | "error";

export default function VotingApp() {
  const address = useAddress();
  const disconnect = useDisconnect();

  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const [voteCounts, setVoteCounts] = useState(CANDIDATES.map((c) => c.votes));
  const [activeVoteId, setActiveVoteId] = useState<number | null>(null);

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

  const handleSuccess = (candidateId: number) => {
    setTxStatus("processing");
    setTimeout(() => {
      setVotedFor(candidateId);
      setVoteCounts((prev) => prev.map((v, i) => (i === candidateId ? v + 1 : v)));
      setTxStatus("confirmed");
      setTimeout(() => {
        setTxStatus("idle");
        setActiveVoteId(null);
      }, 5000);
    }, 1200);
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
              <button className={styles.disconnectBtn} onClick={() => disconnect()}>
                Disconnect
              </button>
            </div>
          ) : (
            <ConnectWallet
              theme="dark"
              btnTitle="Connect Wallet"
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            />
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
                  ) : (
                    <Web3Button
                      contractAddress={CONTRACT_ADDRESS}
                      contractAbi={VOTING_ABI}
                      action={async (contract) => {
                        setActiveVoteId(candidate.id);
                        setTxStatus("signing");
                        await contract.call("vote", [candidate.id]);
                      }}
                      onSuccess={() => handleSuccess(candidate.id)}
                      onError={handleError}
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
                    </Web3Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Transaction Flow ── */}
        {txStatus !== "idle" && (
          <div
            className={`${styles.txFlow} ${
              txStatus === "confirmed" ? styles.txConfirmed : ""
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
                        className={`${styles.stepCircle} ${
                          state === "done"
                            ? styles.stepDone
                            : state === "active"
                            ? styles.stepActive
                            : styles.stepWaiting
                        }`}
                      >
                        {state === "done" ? "✓" : i + 1}
                      </div>
                      <span
                        className={`${styles.stepLabel} ${
                          state === "active"
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
                        className={`${styles.connector} ${
                          state === "done" ? styles.connectorDone : ""
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
        <p>Powered by Thirdweb &bull; On-chain governance</p>
      </footer>
    </div>
  );
}
