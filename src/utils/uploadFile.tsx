import axios from "axios";

const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT as string;

 export const uploadFile = async (file: File): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data,
        {
          headers: {
            Authorization: `Bearer ${pinataJwt}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response, "responseinside the uploadfile");

      if (response.data.IpfsHash) {
        console.log("File uploaded successfully:", response.data.IpfsHash);
        resolve([`ipfs://${response.data.IpfsHash}`]);
      } else {
        reject(new Error("Failed to upload file to IPFS"));
      }
    } catch (error) {
      console.log(error);
    }
  });
};
