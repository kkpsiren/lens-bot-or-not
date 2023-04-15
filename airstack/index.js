const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

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

  // Define the GraphQL endpoint URL
  const url = process.env.ENDPOINT;

  // Define the headers for the request
  const headers = {
    "Content-Type": "application/json",
    Authorization: process.env.API_KEY,
  };

  // Define the request body
  const data = { query };

  // Send the GraphQL query request
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

async function getResponse() {
  const a = await runAirstack(
    "0x2E21f5d32841cf8C7da805185A041400bF15f21A".toLowerCase(),
    "0x3F08f17973aB4124C73200135e2B675aB2D263D9".toLowerCase()
  );
  return a.data.TokenBalances.TokenBalance;
}

(async () => {
  const response = await getResponse();
  console.log(response);
})();
