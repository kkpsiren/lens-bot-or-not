import { ethers, Wallet } from "ethers";
import { verifyOwnerAndAccess } from "../../verify-jwt.mjs";
import abi from "../../abi.json" assert { type: "json" };

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

async function run(obj) {
  const tx = await doTransaction(obj.attestor, obj.lensProfileId, obj.value);

  if (tx.hash) {
    return {
      status: "SUCCESS",
      data: {
        transactionHash: tx.hash,
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { attestor, lensProfileId, value } = req.body;
  console.log({ attestor, lensProfileId, value });
  try {
    const accessToken = req.headers["x-access-token"].split(" ")[1];
    const verifyResponse = await verifyOwnerAndAccess(
      accessToken,
      lensProfileId
    );
    const verified = verifyResponse?.isValid ? verifyResponse.isValid : false;
    if (verified) {
      const response = await run({ attestor, lensProfileId, value });

      res.status(200).json(response);
    } else {
      const response = { status: "FAILED", msg: "NOT VERIFIED" };
      res.status(500).json(response);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
}
