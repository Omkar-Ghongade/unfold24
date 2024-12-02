import React, { useState, useEffect } from 'react';
import diamond from './diamond.png';
import bomb from './bomb.png';
import './Game.css'; // Import the CSS file
// import { useEffect } from 'react';
import { useOkto } from 'okto-sdk-react';

export default function Game() {
  const [betAmount, setBetAmount] = useState(0);
  const [mines, setMines] = useState(3);
  const [showBetUI, setShowBetUI] = useState(false);
  const [profitMultiplier, setProfitMultiplier] = useState(1.0);
  const [profit, setProfit] = useState(0);
  const [clickedTiles, setClickedTiles] = useState(Array(5).fill().map(() => Array(5).fill(false)));
  const [boardMines, setBoardMines] = useState(Array(5).fill().map(() => Array(5).fill(false)));
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { getUserDetails, getPortfolio } = useOkto();

  const [userdb, setuserdb] = useState({
    email: "",
    address: "",
    quantity: "",
    coin: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await getUserDetails();
        console.log("User details fetched:", details.email);

        const userResponse = await fetch('http://localhost:3001/userstorage/getuser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: details.email }),
        });

        const user = await userResponse.json();
        console.log("User data fetched:", user);
        setuserdb(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [getUserDetails, getPortfolio]);

  const initializeBoard = () => {
    const newBoardMines = Array(5).fill().map(() => Array(5).fill(false));
    let placedMines = 0;

    while (placedMines < mines) {
      const row = Math.floor(Math.random() * 5);
      const col = Math.floor(Math.random() * 5);

      if (!newBoardMines[row][col]) {
        newBoardMines[row][col] = true;
        placedMines++;
      }
    }

    setBoardMines(newBoardMines);
  };

  const handleTileClick = (rowIndex, colIndex) => {
    if (isActive && !gameOver) {
      const updatedTiles = [...clickedTiles];
      updatedTiles[rowIndex][colIndex] = true;
      setClickedTiles(updatedTiles);

      if (boardMines[rowIndex][colIndex]) {
        setGameOver(true);
        setIsActive(false);
        setShowBetUI(false);
      } else {
        const previousIncrement = profitMultiplier - 1;
        const nextIncrement = previousIncrement === 0 ? 0.12 : previousIncrement + 0.02;
        const newMultiplier = profitMultiplier + nextIncrement;

        setProfitMultiplier(newMultiplier);
        setProfit(betAmount * newMultiplier);
      }
    }
  };

  const createBoard = () => {
    let board = [];
    for (let i = 0; i < 5; i++) {
      let row = [];
      for (let j = 0; j < 5; j++) {
        row.push(
          <div
            key={`${i}-${j}`}
            className={`tile ${!isActive && 'inactive'}`}
            onClick={() => handleTileClick(i, j)}
          >
            {clickedTiles[i][j] && (
              boardMines[i][j] ? (
                <img src={bomb} alt="bomb" className="icon" />
              ) : (
                <img src={diamond} alt="diamond" className="icon" />
              )
            )}
          </div>
        );
      }
      board.push(
        <div key={i} className="row">
          {row}
        </div>
      );
    }
    return board;
  };

  const handleBet = async () => {
    if(betAmount <= 0){
      alert("Bet amount must be greater than 0");
      return;
    }
    if(userdb.coin < betAmount){
      alert("Insufficient balance");
      return;
    }
    const url = 'https://sandbox-api.okto.tech/api/v1/transfer/tokens/execute';
    const options = {
      method: 'POST',
      headers: {Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2luZGN4X2lkIjoiMDUzMWM5ZmMtNTgyYS00NDI2LWFhYjgtNjhkMzA3OTJkZDYzIiwidXNlcl9pZCI6IjA1MzFjOWZjLTU4MmEtNDQyNi1hYWI4LTY4ZDMwNzkyZGQ2MyIsInNoYXJlZF9pZCI6bnVsbCwiZGN4X2NyZWF0ZWRfYXQiOm51bGwsInBvcnRmb2xpb0ZhY3RvciI6IjEiLCJhY2NUeXBlIjoid2ViMyIsImFjY291bnRfb3duZXJfaWQiOiJjNTcwMzA0Yi1hOTkwLTVkMGMtYTViZi1hYTI5ODk0ZjQ4MTciLCJzZXNzaW9uSWQiOiJiZWQxY2NlZS03MDAzLTRkMTAtYWZmNi1hNDAzMzFjYTYyMDgiLCJ1c2VyX2xvZ2luX3ZlbmRvcl9pZCI6IjVmOTQxMDYzLTRjMDMtNGUwYi1iNWE4LTE0NjRhMDQ2YzJiNiIsInMiOiJ3ZWIiLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgMTM7IFBpeGVsIDcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xMTYuMC4wLjAgTW9iaWxlIFNhZmFyaS81MzcuMzYiLCJzaXAiOiIyMTkuNjUuMTEwLjIyMiIsInNjaXR5IjoiQmVuZ2FsdXJ1Iiwic2NvdW50cnkiOiJJTiIsInNyZWdpb24iOiJLQSIsImxvZ2luX21lZGl1bSI6IkdfQVVUSCIsImlhdCI6MTczMzA5MTI4NiwiZXhwIjoxNzMzOTU1Mjg2fQ.zb6Us25tCW7VGzg9AIFT5_2K5M9Wwcls_HQBeblaFH8', 'Content-Type': 'application/json'},
      body: `{"network_name":"APTOS_TESTNET","token_address":"","quantity": "1","recipient_address":"0x1e0490dc9eaacd3a95a577f9d700501e490792480c9d7a83e1583fb86f960383"}`
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
      const portfolio = await getPortfolio();
      console.log(portfolio)
      if(data.status === 'success') {
        try{
          const details = await getUserDetails();
          console.log(details.email)
          const portfolio = await getPortfolio();
          console.log("Portfolio fetched:", portfolio.tokens[0].quantity);
          const response = await fetch('http://localhost:3001/userstorage/updatecoins', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: details.email , coin : -betAmount, quantity : portfolio.tokens[0].quantity-0.5}),
          });
          const data = await response.json();
          console.log('Data:', data);
          setShowBetUI(true);
          setIsActive(true);
          setGameOver(false);
          setProfitMultiplier(1.0);
          setProfit(0);
          setClickedTiles(Array(5).fill().map(() => Array(5).fill(false)));

          // Initialize the board after the bet is placed
          initializeBoard();
        }catch(err){
          console.log(err);
        }
      }
    } catch (error) {
      console.error(error);
    }
    
  };

  const handleCashout = async () => {
    try{
      const details = await getUserDetails();
      console.log(details.email)
      const portfolio = await getPortfolio();
      console.log("Portfolio fetched:", portfolio.tokens[0].quantity);
      const response = await fetch('http://localhost:3001/userstorage/updatecoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: details.email , coin : parseInt(profit), quantity : portfolio.tokens[0].quantity}),
      });
      const data = await response.json();
      console.log('Data:', data);
      setShowBetUI(true);
      setIsActive(true);
      setGameOver(false);
      setProfitMultiplier(1.0);
      setProfit(0);
      setClickedTiles(Array(5).fill().map(() => Array(5).fill(false)));

      // Initialize the board after the bet is placed
      initializeBoard();
    }catch(err){
      console.log(err);
    }
    setShowBetUI(false);
    setIsActive(false);
  };

  return (
    <div className="game-container">
      <div className="betting-section">
        <div className="bet-input">
          <label>Bet Amount</label>
          <div className="input-container">
            <input
              type="number"
              step="0.00000001"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
            />
            <span>APT</span>
          </div>
        </div>

        <div className="mines-selector">
          <label>Mines</label>
          <select
            value={mines}
            onChange={(e) => setMines(parseInt(e.target.value))}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <button className="bet-button" onClick={handleBet}>
          Bet
        </button>

        {showBetUI && (
          <div className="profit-display">
            <p>
              Total profit ({profitMultiplier.toFixed(2)}x):
              <span>${profit.toFixed(2)}</span>
            </p>
            <div className="profit">
              {profit.toFixed(8)} <span>APT</span>
            </div>
            <button
              className="random-pick"
              onClick={() => handleTileClick(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5))}
              disabled={gameOver}
            >
              Pick random tile
            </button>
            <button
              className="cashout-button"
              onClick={handleCashout}
              disabled={gameOver}
            >
              Cashout
            </button>
          </div>
        )}
      </div>

      <div className="game-board">
        <h1 className="game-title">Mines</h1>
        {createBoard()}
      </div>
    </div>
  );
}
