import { useEffect, useState } from "react";
import { ethers } from "ethers";

import contractABI from "../../artifacts/contracts/WavePortal.sol/WavePortal.json";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [totalWaves, setTotalWaves] = useState(0);
  const [loading, setLoading] = useState(false);

  const CONTRACT_ADDRESS = "0x6e92BC7487b5DD84056C9444156b16cCEA10CCf3";

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    setLoading(true);
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      setLoading(false);
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length) {
      const account = accounts[0];
      setCurrentAccount(account);
      await getAllWaves();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        signer
      );

      const count = await wavePortalContract.getTotalWaves();
      console.log("Found an authorized account:", account);
      setTotalWaves(count.toNumber());
      setLoading(false);
    } else {
      setLoading(false);
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          signer
        );

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      if (window.ethereum) {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          signer
        );

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave("sample message");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();

        setLoading(false);
        setTotalWaves(count.toNumber());
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          I am Ochuko and I worked on self-driving cars so that's pretty cool
          right? Connect your Ethereum wallet and wave at me!
        </div>

        <div className="waveDisplay">
          {loading ? "Loading..." : `Total Waves: ${totalWaves}`}
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
