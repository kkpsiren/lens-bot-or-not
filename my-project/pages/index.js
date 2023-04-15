import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

import { MainPage } from "../components/mainPage";
import { LensLogin } from "../components/lensLogin";
import { RenderProfile } from "../components/lensProfile";
import { BotButton } from "../components/botButton";

export default function Home() {
  const [profileId, setProfileId] = useState();
  const [profileHandle, setProfileHandle] = useState();
  const [profilePic, setProfilePic] = useState();
  const [lensLoggedIn, setLensLogin] = useState(false);
  const [accessToken, setAccessToken] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [defaultLensProfile, setDefaultLensProfile] = useState(true);

  const { address, isConnected } = useAccount();

  console.log({
    profileId,
    profileHandle,
    profilePic,
    lensLoggedIn,
    address,
  });

  const lensLoadingProfile = (event) => {
    setLoadingProfile(event);
  };

  const lensProfileHandler = (event) => {
    setDefaultLensProfile(event);
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

  return (
    <div>
      <MainPage />
      {isConnected ? (
        <>
          <div
            className={`flex flex-col justify-center w-screen mx-auto mt-2 ${
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
        </>
      ) : (
        ""
      )}
      <div
        className={`flex flex-col justify-center w-screen mx-auto mt-2 ${
          !lensLoggedIn ? "invisible" : ""
        }`}
      >
        <RenderProfile
          defaultLensProfile={defaultLensProfile}
          isLoggedIn={lensLoggedIn}
        />
      </div>
      <div>
        <BotButton text={"test1"} />
        <BotButton text={"test2"} />
        <BotButton text={"test3"} />
      </div>
    </div>
  );
}
