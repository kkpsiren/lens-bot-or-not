import axios from "axios";

const endpoint = "https://api.lens.dev";
const headers = {
  "content-type": "application/json",
};

function getAddressFromAccessToken(accessToken) {
  try {
    const payload = accessToken.split(".")[1];
    const { id } = JSON.parse(Buffer.from(payload, "base64"));
    return id.toLowerCase();
  } catch (err) {
    console.log(`TOKEN FAILED ${str(err)}`);
    return undefined;
  }
}

export async function getProfile(profileId) {
  try {
    const singleProfileQueryRequest = {
      profileId,
    };

    const graphqlQuery = {
      operationName: "Profile",
      query: `query Profile($singleProfileQueryRequest: SingleProfileQueryRequest!) {
        profile(request: $singleProfileQueryRequest) {
          ownedBy
        }
      }`,
      variables: { singleProfileQueryRequest },
    };

    const response = await axios({
      url: endpoint,
      method: "post",
      headers: headers,
      data: graphqlQuery,
    });
    const owner = response.data.data.profile.ownedBy;
    return { status: "SUCCESS", owner: owner.toLowerCase() };
  } catch (err) {
    console.log(err);
    return { status: "FAILED", msg: "Something went horribly wrong" };
  }
}

async function ownerOf(accessToken, profileId) {
  const address = getAddressFromAccessToken(accessToken);
  if (address) {
    const profile = await getProfile(profileId);
    if (address == profile.owner) {
      return { status: "SUCCESS", isOwner: true, address };
    } else {
      return { status: "SUCCESS", isOwner: false, address };
    }
  } else {
    return { status: "FAILED", msg: "No Address" };
  }
}

async function verify(accessToken) {
  try {
    const verifyRequest = {
      accessToken,
    };

    const graphqlQuery = {
      operationName: "Query",
      query: `query Query($verifyRequest:VerifyRequest!) { verify(request: $verifyRequest) }`,
      variables: { verifyRequest },
    };

    const response = await axios({
      url: endpoint,
      method: "post",
      headers: headers,
      data: graphqlQuery,
    });
    const verified = response.data.data.verify;
    return { status: "SUCCESS", verified: verified };
  } catch (err) {
    console.log(err);
    return { status: "FAILED", msg: "Something went horribly wrong" };
  }
}

export async function verifyOwnerAndAccess(accessToken, profileId) {
  try {
    const results = await Promise.all([
      verify(accessToken),
      ownerOf(accessToken, profileId),
    ]);
    const responseAccess = results[0];
    const responseOwner = results[1];
    const isValid = responseAccess.verified && responseOwner.isOwner;
    return { status: "SUCCESS", isValid, address: responseOwner.address };
  } catch (err) {
    console.log(err);
    return { status: "FAILED", msg: "verification failed" };
  }
}

//
// (async () => {
//   const accessToken =
//     "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjB4YjBkODlFMTE3N0REOGUyY2I5NWVDYWY0RUYyNjY3YzZhN0M1MTE4MiIsInJvbGUiOiJub3JtYWwiLCJpYXQiOjE2NzQ0NTMyMzMsImV4cCI6MTY3NDQ1NTAzM30.T7IvEbAkDeHywKTDV7UDK830TVT6LNmKEzCGumpDdi0";
//   const profileId = "0x3a77";
//
//   // const response = await verify(accessToken);
//
//   const response = await verifyOwnerAndAccess(accessToken, profileId);
//   console.log(response);
//
//   // { status: 'SUCCESS', isValid: false }
// })();
