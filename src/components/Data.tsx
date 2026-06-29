'use client'
import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
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
export default function Data() {
    // the data is already pre-fetched on the server and immediately available here,
    // without an additional network call
    const { data } = useQuery({
        queryKey: ['data'],
        async queryFn() {
            console.log(headers, 'headers')
            return await request(url, query, {}, headers)
        }
    })
    return <div>{JSON.stringify(data ?? {})}</div>
}