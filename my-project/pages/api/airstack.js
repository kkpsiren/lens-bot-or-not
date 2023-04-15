import axios from "axios";

function runAirstack(address1, address2) {
  // Define the GraphQL query string
  const query = `
  query MyQuery {
    TokenBalances(
      input: {
        filter: {owner: {_in: ["CHANGEADDRESS1","CHANGEADDRESS2"]}, },
        blockchain: ethereum,
        limit: 50
      }
    ) {
      TokenBalance {
        tokenAddress
        amount
        formattedAmount
        tokenType
        owner {
          addresses
        }
        token {
          name
          symbol
        }
        tokenNfts {
          address
          tokenId
          metaData {
            name
            image
          }
        }
      }
    }
  }
  `
    .replace("CHANGEADDRESS1", address1)
    .replace("CHANGEADDRESS2", address2);
  const url = process.env.ENDPOINT;

  const headers = {
    "Content-Type": "application/json",
    Authorization: process.env.API_KEY,
  };

  const data = { query };

  return axios
    .post(url, data, { headers })
    .then((response) => response.data)
    .catch((error) => console.error(error));
}

function ownership(ser) {
  if (ser.owner.addresses.length === 1) {
    return ser.owner.addresses[0];
  } else {
    return "both";
  }
}

function getName(ser) {
  try {
    if (ser.tokenType === "ERC20") {
      return ser.token.symbol;
    } else {
      return ser.token.name;
    }
  } catch {
    return ser.tokenAddress;
  }
}

function getAmount(ser) {
  try {
    return parseFloat(ser.formattedAmount);
  } catch (e) {
    console.error(e);
    return 1;
  }
}

async function getResponse(address1, address2) {
  const a = await runAirstack(address1.toLowerCase(), address2.toLowerCase());
  return a.data.TokenBalances.TokenBalance;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { address1, address2 } = req.body;
  try {
    const verified = true;
    if (verified) {
      const response = await getResponse(address1, address2);

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
