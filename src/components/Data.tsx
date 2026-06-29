// src/components/Data.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import styles from './Data.module.css';

// GraphQL query for recent messages
const query = gql`{
  messagePosteds(first: 5, orderBy: blockNumber, orderDirection: desc) {
    id
    author
    message
    blockNumber
  }
}`;

const apiKey = process.env.NEXT_PUBLIC_GRAPH_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_SUBGRAPH_URL || "";
const headers = { Authorization: `${apiKey}` };

export default function Data() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['subgraphData'],
        async queryFn() {
            return await request(apiUrl, query, {}, headers);
        },

        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return <div className={styles.loading}>Loading subgraph data…</div>;
    }

    if (isError) {
        console.error(error);
        return <div className={styles.error}>Failed to load data.</div>;
    }


    const messages = data?.messagePosteds ?? [];

    return (
        <section className={styles.container}>
            {messages.map((msg: any) => (
                <article key={msg.id} className={styles.card}>
                    <p className={styles.message}>{msg.message}</p>
                    <p className={styles.author}>— {msg.author.slice(0, 6)}…{msg.author.slice(-4)}</p>
                </article>
            ))}
        </section>
    );
}