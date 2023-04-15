import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getProfile } from "../verify-jwt.mjs";
import { ethers } from "ethers";

export function CheckBot({
  handleQueryProfile,
  address,
  profileId,
  accessToken,
  handleQueryAddress,
}) {
  const [id, setHandle] = useState("");
  const [gettingData, setGettingData] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);
  const [data, setData] = useState(null);
  const [attestResponse, setAttestResponse] = useState();
  const [error, setError] = useState(null);
  const [countHumans, setCountHumans] = useState(0);
  const [countBots, setCountBots] = useState(0);
  const [attestList, setAttestList] = useState({});

  useEffect(() => {
    if (data?.id) {
      getProfile(ethers.utils.hexlify(data.id))
        .then((response) => {
          handleQueryAddress(response.owner);
          handleQueryProfile({ picture: response.picture });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [data?.id]);
  const handleAddHuman = () => {
    handleSubmitRandom();
    setCountHumans(countHumans + 1);
    attestList[data.id] = 1;
  };

  const handleAddBot = () => {
    handleSubmitRandom();
    setCountBots(countBots + 1);
    attestList[data.id] = 0;
  };

  const handleSubmitAttestation = async (e) => {
    console.log("triggered");
    setIsAttesting(true);
    e.preventDefault();

    try {
      const response = await fetch("/api/attest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          attestor: address,
          lensProfileId: profileId,
          value: attestList,
        }),
      });

      const jsonData = await response.json();
      setAttestResponse(jsonData);
      setError(null);
      setIsAttesting(false);
      console.log(jsonData);
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
      setData(null);
      setIsAttesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/findBot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
      setData(null);
    }
  };

  const handleSubmitRandom = async () => {
    try {
      const response = await fetch("/api/findBot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
      setData(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mx-auto mt-4 text-semibold">
      <form onSubmit={handleSubmit} className="flex flex-row">
        <label className="flex-col mx-3">
          ProfileId:
          <input
            type="text"
            placeholder="0x05"
            className="flex-col mx-3 text-center text-black placeholder-gray-500"
            value={id}
            onChange={(e) => setHandle(e.target.value)}
          />
        </label>
        <button className="flex-col mx-3" type="submit">
          Submit
        </button>
      </form>
      {error && <p>{error}</p>}
      {data && (
        <div className="flex flex-col items-center justify-center mt-4">
          <div>
            <h2 className="flex flex-col text-2xl text-center">
              {data.textResponse}{" "}
            </h2>
          </div>
          <div className="flex text-center">
            <button
              disabled={
                !data?.textResponse ||
                data.textResponse.slice(data.textResponse.length - 3) === "zed"
              }
              onClick={
                data?.textResponse.slice(data.textResponse.length - 5) ===
                "HUMAN"
                  ? handleAddHuman
                  : handleAddBot
              }
              className="flex flex-col items-center justify-center w-64 h-10 p-2 mx-auto mt-2 mr-2 font-semibold text-center align-middle bg-green-500 rounded-full focus:border-yellow-50"
            >
              True
            </button>
            <button
              disabled={
                !data?.textResponse ||
                data.textResponse.slice(data.textResponse.length - 3) === "zed"
              }
              onClick={
                data?.textResponse.slice(data.textResponse.length - 5) ===
                "HUMAN"
                  ? handleAddBot
                  : handleAddHuman
              }
              className="flex flex-col items-center justify-center w-64 h-10 p-2 mx-auto mt-2 mr-2 font-semibold text-center align-middle bg-red-500 rounded-full focus:border-yellow-50"
            >
              False
            </button>
          </div>
          <div className="flex text-center">
            <button className="flex flex-col items-center justify-center w-64 h-10 p-2 mx-auto mt-2 mr-2 font-semibold text-center text-black align-middle bg-green-100 rounded-full focus:border-yellow-50">
              Humans {countHumans}
            </button>
            <button className="flex flex-col items-center justify-center w-64 h-10 p-2 mx-auto mt-2 mr-2 font-semibold text-center text-black align-middle bg-red-100 rounded-full focus:border-yellow-50">
              Bots {countBots}
            </button>
          </div>

          <div>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              className="flex-col mt-10 text-xl text-blue-500 place-items-center hover:text-blue-700 hover:underline"
              href={`https://lenster.xyz/u/${data.handle}`}
            >
              View Profile
            </Link>
          </div>
          <button
            onClick={handleSubmitAttestation}
            disabled={!address || !profileId || !accessToken || isAttesting}
            className="flex flex-col items-center justify-center w-64 h-10 p-2 mx-auto mt-2 mr-2 font-semibold text-center text-black align-middle bg-red-100 rounded-full focus:border-yellow-50"
          >
            Attest!
          </button>

          {attestResponse?.data?.url ? (
            <Link
              target="_blank"
              rel="noopener noreferrer"
              className="flex-col mt-10 text-xl text-blue-500 place-items-center hover:text-blue-700 hover:underline"
              href={`${attestResponse?.data?.url}`}
            >
              View Transaction
            </Link>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
}

export function BotButton({ text }) {
  return (
    <button
      disabled={false}
      className="flex items-center justify-center w-64 h-10 p-2 mx-auto mt-2 mr-2 font-semibold text-center align-middle rounded-full focus:border-yellow-50"
    >
      {text ? text : ""}
    </button>
  );
}
