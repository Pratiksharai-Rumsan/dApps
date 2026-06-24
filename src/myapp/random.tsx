// <div className={styles.page}>
    //   <main className={styles.main}>
    //     <h1>Document Management</h1>
    //     <div className={styles.ctas}>
    //       <input
    //         type="file"
    //         onChange={handleFileChange}
    //         className={styles.fileInput}
    //       />
    //       {/* <button className={styles.primaryButton} onClick={handleUploadClick}>
    //         Document upload
    //       </button> */}
    //       <button className={styles.primaryButton} onClick={handleUploadClick}>
    //         Upload Document
    //       </button>
    //       <Web3Button
    //         contractAddress={"0x01a1c045175bDA62F1E246a028353251e0541f45"}
    //         // Calls the "setName" function on your smart contract with "My Name" as the first argument
    //         action={async () => {
    //           if (uploadedURI) {
    //             const ipfsHash = uploadedURI
    //               .replace(/^ipfs:\/\//, "")
    //               .split("/")[0];
    //             console.log(ipfsHash, "hash");
    //             await mutateAsync({ args: [ipfsHash] });
    //           } else {
    //             console.error("No uploaded document URI found");
    //           }
    //         }}
    //       >
    //         Send Transaction
    //       </Web3Button>
    //       <button
    //         className={styles.secondaryButton}
    //         //onClick={handleVerifyClick}
    //       >
    //         Verify Document
    //       </button>
    //     </div>
    //     {uploadedURI && (
    //       <div>
    //         <h2>Uploaded Document</h2>
    //         <MediaRenderer src={uploadedURI} />
    //       </div>
    //     )}
    //   </main>
    // </div>