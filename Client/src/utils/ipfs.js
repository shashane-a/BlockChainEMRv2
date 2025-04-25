import { PinataSDK } from "pinata";
import pinata_credentials from "./config";

const pinata = new PinataSDK({
  pinataJwt: pinata_credentials.pinataJwt,
  pinataGateway: pinata_credentials.pinataGateway,
});

export default async function uploadJsonToIPFS(jsonData, filename) {
  try {
    const response = await pinata.upload.private.json(jsonData).name(filename);
    console.log("IPFS response:", response);
    return response;
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw error;
  }
}
