import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

import { MainPage } from "../components/mainPage";
import { LensLogin } from "../components/lensLogin";
import { RenderProfile } from "../components/lensProfile";
import { BotButton, CheckBot } from "../components/botButton";

export default function Home() {
  const [profileId, setProfileId] = useState();
  const [profileHandle, setProfileHandle] = useState();
  const [profilePic, setProfilePic] = useState();
  const [lensLoggedIn, setLensLogin] = useState(false);
  const [accessToken, setAccessToken] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [defaultLensProfile, setDefaultLensProfile] = useState(true);
  const [queryLensProfile, setQueryLensProfile] = useState(true);

  const { address, isConnected } = useAccount();
  //
  //   console.log({
  //     profileId,
  //     profileHandle,
  //     profilePic,
  //     lensLoggedIn,
  //     address,
  //   });
  //
  const lensLoadingProfile = (event) => {
    setLoadingProfile(event);
  };

  const lensProfileHandler = (event) => {
    setDefaultLensProfile(event);
  };

  const lensQueryProfileHandler = (event) => {
    setQueryLensProfile(event);
  };

  const accessTokenHandler = (event) => {
    setAccessToken(event);
  };

  const profileHandler = (event) => {
    setProfileId(event);
  };

  const profileHandleHandler = (event) => {
    setProfileHandle(event);
  };

  const profilePicHandler = (event) => {
    setProfilePic(event);
  };

  const lensLoginHandler = (event) => {
    setLensLogin(event);
  };

  useEffect(() => {
    if (!profileId) {
      setLensLogin(false);
    }
  }, [profileId]);

  /*   return (
    <div className="flex justify-center w-64 mx-auto mt-2 mb-10 align-middle">
      <MainPage />
      {isConnected && (
        <div
          className={`flex flex-col justify-center w-screen mx-auto mt-10 ${
            !profileId ? "invisible" : ""
          }`}
        >
          <LensLogin
            address={address}
            handleAccessTokenChange={accessTokenHandler}
            handleProfileChange={profileHandler}
            handleHandleChange={profileHandleHandler}
            handleProfilePic={profilePicHandler}
            handleLensLoggedIn={lensLoginHandler}
            handleLoadingProfile={lensLoadingProfile}
            handleDefaultProfile={lensProfileHandler}
          />
        </div>
      )}
      {lensLoggedIn && (
        <div
          className={`flex flex-col justify-center w-screen mx-auto mt-10 mb-10`}
        >
          <RenderProfile
            defaultLensProfile={defaultLensProfile}
            isLoggedIn={lensLoggedIn}
          />
        </div>
      )}
      {<CheckBot />}
      <div className="flex flex-col w-screen pl-10 ml-10">
        {<BotButton text={"Bot or Not? 👀"} />}
        {<BotButton text={"Compare your assets"} />}
        {<BotButton text={"Attest your result on-chain "} />}
        {<BotButton text={"Help us make the data better"} />}
      </div>
    </div>
  );
}
 */
  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="flex-grow bg-gray-800">
        <div>
          <MainPage />
          {isConnected && (
            <div
              className={`flex flex-col justify-center w-screen mx-auto mt-10 ${
                !profileId ? "invisible" : ""
              }`}
            />
          )}
          {isConnected && (
            <LensLogin
              address={address}
              handleAccessTokenChange={accessTokenHandler}
              handleProfileChange={profileHandler}
              handleHandleChange={profileHandleHandler}
              handleProfilePic={profilePicHandler}
              handleLensLoggedIn={lensLoginHandler}
              handleLoadingProfile={lensLoadingProfile}
              handleDefaultProfile={lensProfileHandler}
            />
          )}
          {lensLoggedIn && (
            <RenderProfile
              defaultLensProfile={defaultLensProfile}
              isLoggedIn={lensLoggedIn}
            />
          )}
        </div>
      </div>
      <div className="flex-grow bg-gray-800">
        <CheckBot
          handleQueryProfile={lensQueryProfileHandler}
          address={address}
          profileId={profileId}
          accessToken={accessToken}
        />
      </div>
      <div className="flex-grow bg-gray-600"></div>
      <div className="flex-grow bg-gray-800"></div>
    </div>
  );
}
