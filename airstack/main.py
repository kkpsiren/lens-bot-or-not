import requests
import json
import os
import pandas as pd
from dotenv import load_dotenv


load_dotenv()


def run_airstack(address1, address2):
    # Define the GraphQL query string
    query = """
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
    """.replace(
        "CHANGEADDRESS1", address1
    ).replace(
        "CHANGEADDRESS2", address2
    )

    # Define the GraphQL endpoint URL
    url = os.getenv("ENDPOINT")

    # Define the headers for the request
    headers = {
        "Content-Type": "application/json",
        "Authorization": os.getenv("API_KEY"),
    }

    # Define the request body
    data = {"query": query}

    # Send the GraphQL query request
    response = requests.post(url, headers=headers, json=data)
    result = response.json()
    return result


def ownership(ser):
    if len(ser["owner"]["addresses"]) == 1:
        return ser["owner"]["addresses"][0]
    else:
        return "both"


def get_name(ser):
    try:
        if ser["tokenType"] == "ERC20":
            return ser["token"]["symbol"]
        else:
            return ser["token"]["name"]
    except:
        return ser["tokenAddress"]


def get_amount(ser):
    try:
        return float(ser["formattedAmount"])
    except Exception as e:
        print(e)
        return 1


def get_response():
    a = run_airstack(
        "0x2E21f5d32841cf8C7da805185A041400bF15f21A".lower(),
        "0x3F08f17973aB4124C73200135e2B675aB2D263D9".lower(),
    )

    df = pd.DataFrame(a["data"]["TokenBalances"]["TokenBalance"])

    df["amount"] = df.apply(get_amount, axis=1)

    df["ownership"] = df.apply(ownership, axis=1)
    df["name"] = df.apply(get_name, axis=1)

    df = df.pivot_table(
        columns="ownership", index="name", values="amount", aggfunc="sum"
    )

    if "shared" in df.columns:
        sharedData = df[~df["shared"].isnull()]
        shared = sharedData.shape[0]
    else:
        shared = 0
        sharedData = []

    returnResponse = {
        "data": df.sort_values(df.columns[0]).reset_index().to_dict("records"),
        "shared": shared,
        "sharedData": sharedData,
    }
    return returnResponse
