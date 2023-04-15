import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";

import Link from "next/link";

export function AirStackTracker({ address1, address2 }) {
  const [data, setData] = useState();
  const [isGetting, setIsGetting] = useState();
  const [error, setError] = useState();
  const [isHidden, setIsHidden] = useState(true);

  const toggleTable = () => {
    setIsHidden(!isHidden);
  };

  const handleSubmitAirstack = async (e) => {
    setIsGetting(true);

    try {
      const response = await fetch("/api/airstack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address1,
          address2,
        }),
      });

      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
      setIsGetting(false);
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
      setData(null);
      setIsGetting(false);
    }
  };

  useEffect(() => {
    if (address1 && address2) {
      handleSubmitAirstack();
    }
  }, [address1, address2]);
  return (
    <div>
      <button
        className="flex flex-col items-center justify-center w-64 h-10 p-2 mx-auto mt-2 mr-2 font-semibold text-center text-black align-middle bg-red-100 rounded-full focus:border-yellow-50"
        onClick={toggleTable}
      >
        Toggle Assets
      </button>

      {!isHidden && data ? (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-sm font-semibold text-left bg-gray-100 border-b">
                Name
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-left bg-gray-100 border-b">
                Token Address
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-left bg-gray-100 border-b">
                Symbol
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-left bg-gray-100 border-b">
                Owner
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-left bg-gray-100 border-b">
                Amount
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-left bg-gray-100 border-b">
                Token Type
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={nanoid()}>
                <td className="px-4 py-2 border-b">{item.token.name}</td>
                <td className="px-4 py-2 border-b">
                  <Link
                    href={`https://etherscan.io/token/${item.tokenAddress}`}
                    target="_blank"
                    className="text-blue-500"
                  >
                    {item.tokenAddress}
                  </Link>
                </td>
                <td className="px-4 py-2 border-b">{item.token.symbol}</td>
                <td className="px-4 py-2 border-b">
                  {item.owner.addresses.length}
                </td>
                <td className="px-4 py-2 border-b">{item.amount}</td>
                <td className="px-4 py-2 border-b">{item.tokenType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        ""
      )}
    </div>
  );
}
