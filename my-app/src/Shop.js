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
    const token = JSON.parse(localStorage.getItem('AUTH_DETAILS'));
    console.log(token.authToken);
    const options = {
      method: 'POST',
      headers: {Authorization: `Bearer ${token.authToken}`, 'Content-Type': 'application/json'},
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
