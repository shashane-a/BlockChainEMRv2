import { ethers } from "ethers";

import {
  contractAddress as userRegistryAddress,
  contractABI as userRegistryABI,
} from "../contracts/UserRegistryContract";

const iface = new ethers.utils.Interface(userRegistryABI);

import {
  contractAddress as patientRegistryAddress,
  contractABI as patientRegistryABI,
} from "../contracts/PatientRegistryContract";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const ifaceUser = new ethers.utils.Interface(userRegistryABI);
const ifacePatient = new ethers.utils.Interface(patientRegistryABI);

const userRegistry = new ethers.Contract(
  userRegistryAddress,
  userRegistryABI,
  provider
);
const patientRegistry = new ethers.Contract(
  patientRegistryAddress,
  patientRegistryABI,
  provider
);

// You can also specify a block range like fromBlock: 0 toBlock: 'latest'
async function fetchEvents() {
  const userEvents = await userRegistry.queryFilter("*", 0, "latest");
  const patientEvents = await patientRegistry.queryFilter("*", 0, "latest");

  const formattedUserEvents = userEvents.map((e) => {
    const parsed = ifaceUser.parseLog(e);
    return {
      name: parsed.name,
      args: parsed.args,
      blockNumber: e.blockNumber,
      txHash: e.transactionHash,
      contract: "UserRegistry",
    };
  });

  const formattedPatientEvents = patientEvents.map((e) => {
    const parsed = ifacePatient.parseLog(e);
    return {
      name: parsed.name,
      args: parsed.args,
      blockNumber: e.blockNumber,
      txHash: e.transactionHash,
      contract: "PatientRegistry",
    };
  });

  const allEvents = [...formattedUserEvents, ...formattedPatientEvents];
  allEvents.sort((a, b) => a.blockNumber - b.blockNumber);
  return allEvents;
}
