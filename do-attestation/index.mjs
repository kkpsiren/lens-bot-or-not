import { ethers, Wallet } from "ethers";
import { verifyOwnerAndAccess } from "./verify-jwt.mjs";
import abi from "./abi.json" assert { type: "json" };

import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(
  "https://alpha-rpc.scroll.io/l2"
);

const getSigner = () => {
  return new Wallet(process.env.PAYER_PK, provider);
};

const attestationStationContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  getSigner()
);

// console.log(attestationStationContract);

async function doTransaction(attestor, lensProfileId, value) {
  try {
    const strBytes = JSON.stringify(value);
    const bytes = Buffer.from(strBytes, "utf8");
    const tx = await attestationStationContract.functions[
      "attest(address,bytes32,bytes)"
    ](attestor, ethers.utils.formatBytes32String(lensProfileId), bytes);
    return tx;
  } catch (err) {
    console.error(err);
  }
}

function getData({ attestorAddress, attestorLensProfileId, data }) {
  return {
    attestor: attestorAddress,
    lensProfileId: attestorLensProfileId,
    value: data,
  };
}

function getTestData() {
  return {
    attestor: process.env.CONTRACT_ADDRESS,
    lensProfileId: "0x0",
    value: {
      ownerOfLensProfileId: process.env.CONTRACT_ADDRESS,
      type: "test",
      attestorLensProfileId: "0x0",
    },
  };
}

async function run(obj) {
  const tx = await doTransaction(obj.attestor, obj.lensProfileId, obj.value);

  // const encodedData = encodeCallData(parsedData);
  //
  // const task = await postAttestation(encodedData);

  if (tx.hash) {
    return {
      status: "SUCCESS",
      data: {
        txHash: tx.hash,
        url: `${process.env.BLOCK_EXPLORER_URL}/tx/${tx.hash}`,
      },
    };
  } else {
    const response = {
      status: "FAILED",
      data: {
        tx,
      },
    };
    console.log(response);
    return response;
  }
}

export const handler = async (event) => {
  try {
    const { attestor, lensProfileId, value } = JSON.parse(event.body);

    const accessToken = event.headers["x-access-token"].split(" ")[1];
    const verifyResponse = await verifyOwnerAndAccess(accessToken, profileId);
    const verified = verifyResponse?.isValid ? verifyResponse.isValid : false;

    if (verified) {
      const response = await run({ attestor, lensProfileId, value });
      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    } else {
      const response = { status: "FAILED", msg: "NOT VERIFIED" };
      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    }
  } catch (err) {
    console.log(err);
    const response = { status: "FAILED", msg: "UNAUTHORIZED" };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  }
};
