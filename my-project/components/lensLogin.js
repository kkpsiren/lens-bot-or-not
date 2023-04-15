import { useState, useRef, useEffect } from "react";
import { useSignMessage } from "wagmi";
import { verifyMessage } from "ethers/lib/utils";

import {
  client,
  challenge,
  authenticate,
  queryDefaultLensProfile,
} from "../api";

export function LensLogin({
  address,
  handleAccessTokenChange,
  handleProfileChange,
  handleHandleChange,
  handleProfilePic,
  handleLensLoggedIn,
  handleLoadingProfile,
  handleDefaultProfile,
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [response, setResponse] = useState();
  const [apolloError, setApolloError] = useState();
  const defaultLensProfile = useRef();
  const token = useRef();
  const [buttonText, setButtonText] = useState("Login");

  const { data, error, isLoading, isIdle, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      const derivedAddress = verifyMessage(variables.message, data);
      if (derivedAddress !== address) {
        throw new Error("Are you evil?");
      }

      signAndVerify(data, address)
        .then(function (data) {
          if (data) {
            setIsLoggedIn(true);
            handleLensLoggedIn(true);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  });

  useEffect(() => {
    if (!defaultLensProfile.current) {
      token.current = undefined;
      setIsLoggedIn(false);
      handleLensLoggedIn(false);
      handleDefaultProfile(defaultLensProfile);
    }
  }, [defaultLensProfile, handleLensLoggedIn]);

  useEffect(() => {
    async function setupDefaultProfile(ethereumAddress) {
      const response = await client.query({
        query: queryDefaultLensProfile,
        variables: { ethereumAddress },
      });
      return response;
    }

    async function fetcher(address) {
      if (address) {
        try {
          handleLoadingProfile(true);
          const response = await setupDefaultProfile(address);
          handleLoadingProfile(false);

          return response;
        } catch (err) {
          console.log("error in fetching");
        }
      }
    }
    if (address) {
      fetcher(address).then((response) => {
        setResponse(response);
      });
    }
  }, [address]);

  useEffect(() => {
    if (response?.data?.defaultProfile) {
      defaultLensProfile.current = response.data.defaultProfile;
      handleProfileChange(response.data.defaultProfile.id);
      handleHandleChange(response.data.defaultProfile.handle);
      setProfilePic(handleProfilePic);
    } else {
      defaultLensProfile.current = undefined;
      handleProfileChange(undefined);
      handleHandleChange(undefined);
      setProfilePic(handleProfilePic);
    }
  }, [response, handleProfileChange, handleHandleChange, handleProfilePic]);

  useEffect(() => {
    const loadingMsg = (
      <div className="justify-center max-w-screen-sm mx-auto text-semibold">
        <svg
          role="status"
          className="justify-center inline w-6 h-6 mr-2 text-gray-200 align-center animate-spin dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="#E5E7EB"
          />
        </svg>
        Loading...
      </div>
    );
    isLoading
      ? !token.current
        ? setButtonText(loadingMsg)
        : null
      : setButtonText("Login to Lens");
  }, [isLoading, token]);

  async function getMessageToBeSigned(address) {
    const challengeInfo = await client.query({
      query: challenge,
      variables: { address },
    });
    return challengeInfo.data.challenge.text;
  }

  async function authLens(address, signature) {
    const authData = await client.mutate({
      mutation: authenticate,
      variables: {
        address,
        signature,
      },
    });
    const {
      data: {
        authenticate: { accessToken },
      },
    } = authData;
    return { accessToken };
  }

  async function getMessageAndSign(address) {
    const message = await getMessageToBeSigned(address);
    signMessage({ message });
  }

  async function signAndVerify(data, address) {
    if (data && !isIdle) {
      try {
        const { accessToken, refreshToken } = await authLens(address, data);
        handleAccessTokenChange(accessToken);
        token.current = accessToken;

        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  }

  function setProfilePic(handleProfilePic) {
    if (defaultLensProfile) {
      let profile = { ...defaultLensProfile.current };
      let picture = profile.picture;
      if (picture && picture.original && picture.original.url) {
        if (picture.original.url.startsWith("ipfs://")) {
          let result = picture.original.url.substring(
            7,
            picture.original.url.length
          );
          profile.avatarUrl = `https://gateway.ipfscdn.io/ipfs/${result}`;
        } else {
          profile.avatarUrl = picture.original.url;
        }
      }
      handleProfilePic(profile.avatarUrl);
    } else {
      handleProfilePic(undefined);
    }
  }

  return (
    <div className="flex flex-col justify-center w-64 mx-auto align-middle">
      {!isLoggedIn ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            getMessageAndSign(address);
          }}
        >
          <button
            disabled={isLoading}
            className="flex items-center justify-center w-64 h-10 p-2 mx-auto mt-2 mr-2 font-semibold text-center align-middle rounded-full bg-orb-500 hover:bg-orb-700 focus:border-yellow-50"
          >
            {buttonText}
          </button>

          {error && <div className="text-red-500">User rejected signing </div>}
          {apolloError && (
            <>
              <div className="text-center text-red-500">
                Verification Failed. Please reload the Page
              </div>
              <div className="text-sm text-center text-red-500">
                {"error message:"}
                <br />
                {apolloError}
              </div>
            </>
          )}
        </form>
      ) : (
        ""
      )}
    </div>
  );
}
