import React, { useState } from 'react';
import axios from 'axios';
import { useOkto } from "okto-sdk-react";

export default function Shop() {
  // Array with 5 different offers
  const offers = [
    { aptos: 1, aptCoins: 10 },
    { aptos: 2, aptCoins: 25 },
    { aptos: 3, aptCoins: 35 },
    { aptos: 5, aptCoins: 60 },
    { aptos: 10, aptCoins: 150 }
  ];

  const { getUserDetails } = useOkto();


  // State to keep track of claimed offers
  const [claimedOffers, setClaimedOffers] = useState(Array(offers.length).fill(false));

  // Handle claim button click
  const handleClaim = async (index) => {

    const url = 'https://sandbox-api.okto.tech/api/v1/transfer/tokens/execute';
    const val = offers[index].aptos.toString();
    console.log(val);
    const options = {
      method: 'POST',
      headers: {Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2luZGN4X2lkIjoiMDUzMWM5ZmMtNTgyYS00NDI2LWFhYjgtNjhkMzA3OTJkZDYzIiwidXNlcl9pZCI6IjA1MzFjOWZjLTU4MmEtNDQyNi1hYWI4LTY4ZDMwNzkyZGQ2MyIsInNoYXJlZF9pZCI6bnVsbCwiZGN4X2NyZWF0ZWRfYXQiOm51bGwsInBvcnRmb2xpb0ZhY3RvciI6IjEiLCJhY2NUeXBlIjoid2ViMyIsImFjY291bnRfb3duZXJfaWQiOiJjNTcwMzA0Yi1hOTkwLTVkMGMtYTViZi1hYTI5ODk0ZjQ4MTciLCJzZXNzaW9uSWQiOiJiZWQxY2NlZS03MDAzLTRkMTAtYWZmNi1hNDAzMzFjYTYyMDgiLCJ1c2VyX2xvZ2luX3ZlbmRvcl9pZCI6IjVmOTQxMDYzLTRjMDMtNGUwYi1iNWE4LTE0NjRhMDQ2YzJiNiIsInMiOiJ3ZWIiLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgMTM7IFBpeGVsIDcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xMTYuMC4wLjAgTW9iaWxlIFNhZmFyaS81MzcuMzYiLCJzaXAiOiIyMTkuNjUuMTEwLjIyMiIsInNjaXR5IjoiQmVuZ2FsdXJ1Iiwic2NvdW50cnkiOiJJTiIsInNyZWdpb24iOiJLQSIsImxvZ2luX21lZGl1bSI6IkdfQVVUSCIsImlhdCI6MTczMzA5MTI4NiwiZXhwIjoxNzMzOTU1Mjg2fQ.zb6Us25tCW7VGzg9AIFT5_2K5M9Wwcls_HQBeblaFH8', 'Content-Type': 'application/json'},
      body: `{"network_name":"APTOS_TESTNET","token_address":"","quantity": "${val}","recipient_address":"0x1e0490dc9eaacd3a95a577f9d700501e490792480c9d7a83e1583fb86f960383"}`
    };
    console.log(offers[index].aptos)
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
      if(data.status === 'success') {
        const newClaimedOffers = [...claimedOffers];
        newClaimedOffers[index] = true;
        setClaimedOffers(newClaimedOffers);
        try{
          const details = await getUserDetails();
          console.log(details.email)
          const response = await fetch('http://localhost:3001/userstorage/updatecoins', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: details.email , coin : offers[index].aptCoins }),
          });
          const data = await response.json();
          console.log('Data:', data);
          // window.location.reload();
        }catch(err){
          console.log(err);
        }
      }
    } catch (error) {
      console.error(error);
    }

    // Set the offer as claimed
    
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4">
      <h1 className="text-2xl font-semibold mb-4">Shop</h1>
      
      {offers.map((offer, index) => (
        <div key={index} className="bg-white p-4 rounded shadow-md text-center">
          <h2 className="text-xl font-bold">Offer {index + 1}</h2>
          <p className="text-lg">{offer.aptos} Aptos = {offer.aptCoins} Apt Coins</p>
          <button
            className={`mt-4 py-2 px-4 rounded ${claimedOffers[index] ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
            onClick={() => handleClaim(index)}
            disabled={claimedOffers[index]}
          >
            {claimedOffers[index] ? 'Claimed' : 'Claim Offer'}
          </button>
        </div>
      ))}
    </div>
  );
}
