import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import contractABI from '../../artifacts/contracts/WavePortal.sol/WavePortal.json';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [totalWaves, setTotalWaves] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    setLoading(true);

    if (!window.ethereum) {
      alert('Make sure you have metamask!');
      setLoading(false);
      return;
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

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
      console.log('Found an authorized account:', account);
      setTotalWaves(count.toNumber());
      setLoading(false);
    } else {
      setLoading(false);
      alert('No authorized account found');
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
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

        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on('NewWave', (from, timestamp, message) => {
          console.log('NewWave', from, timestamp, message);

          setAllWaves(prevState => [
            ...prevState,
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
            },
          ]);
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async e => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message');

    if (!message) {
      alert('Wave at me with a message, please!');
      return;
    }

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
        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        });
        console.log('Mining...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setLoading(false);
        setAllWaves(wavesCleaned);
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
          I am Ochuko and I worked on self-driving cars so that's pretty cool right?
          Connect your Ethereum wallet and wave at me!
        </div>

        <div className="waveDisplay">
          {loading ? 'Loading...' : `Total Waves: ${totalWaves}`}
        </div>

        <form className="waveForm" onSubmit={wave}>
          <textarea
            className="textarea"
            name="message"
            rows="4"
            placeholder="Enter message..."
          ></textarea>

          <button className="waveButton" type="submit">
            Wave at Me
          </button>
        </form>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="message">
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
