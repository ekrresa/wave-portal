import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { FiPower } from 'react-icons/fi';
import { GiWaveCrest } from 'react-icons/gi';
import { SiEthereum } from 'react-icons/si';
import { formatDistanceToNowStrict } from 'date-fns';

import { useContract } from '../hooks/useContract';

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [totalWaves, setTotalWaves] = useState(0);
  const [wavesByUser, setWavesByUser] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const wavePortalContract = useContract();

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    (() => {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', async accounts => {
          if (accounts.length > 0) {
            await Promise.all([getAllWaves(), getWavesByUser(), getEarningsByUser()]);
            setCurrentAccount(accounts[0]);
          }
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (wavePortalContract && currentAccount) {
      wavePortalContract.on('NewWave', (from, timestamp, message) => {
        setAllWaves(prevState => [
          ...prevState,
          {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message,
          },
        ]);
      });
    }
  }, [wavePortalContract, currentAccount]);

  const checkIfWalletIsConnected = async () => {
    setLoading(true);

    if (!window.ethereum) {
      toast.error('Please make sure you have metamask!', { position: 'top-center' });
      setLoading(false);
      return;
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length && wavePortalContract) {
      const account = accounts[0];
      setCurrentAccount(account);
      await Promise.all([getAllWaves(), getWavesByUser(), getEarningsByUser()]);

      const count = await wavePortalContract.getTotalWaves();
      setTotalWaves(count.toNumber());
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!window.ethereum) {
        toast.error('Please get Metamask');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setCurrentAccount(accounts[0]);
      await Promise.all([getAllWaves(), getWavesByUser(), getEarningsByUser()]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllWaves = async () => {
    try {
      if (window.ethereum && wavePortalContract) {
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

  const getWavesByUser = async () => {
    try {
      if (window.ethereum && wavePortalContract) {
        const wavesByUser = await wavePortalContract.getTotalWavesByUser();
        setWavesByUser(wavesByUser.toNumber());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getEarningsByUser = async () => {
    try {
      if (window.ethereum && wavePortalContract) {
        const earningsByUser = await wavePortalContract.getTotalEarningsByUser();
        setEarnings(ethers.utils.formatEther(earningsByUser.toString()));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async e => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message');

    if (!message) {
      toast.error('Wave at me with a message, please!');
      return;
    }

    try {
      if (window.ethereum && wavePortalContract) {
        setLoading(true);
        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        });

        await waveTxn.wait();

        let count = await wavePortalContract.getTotalWaves();

        setLoading(false);
        setTotalWaves(count.toNumber());
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="min-h-screen flex flex-col max-w-[40rem] mx-auto px-4 text-gray-600">
      <div className="flex items-baseline py-4">
        <div className="flex items-center gap-x-2">
          <span>Total 👋</span>
          <span className="grid place-items-center font-light text-black">
            {totalWaves}
          </span>
        </div>

        <div className="mx-auto">
          <h1 className="flex items-center justify-center mb-1 text-2xl font-light">
            <GiWaveCrest color="#1D4ED8" />
            <span>WavePortal</span>
          </h1>

          {currentAccount ? (
            <div className="bg-purple-300 font-light px-2 py-[0.1rem] mx-auto rounded-lg text-white text-sm w-max">
              {currentAccount.substr(0, 6) + '...' + currentAccount.substr(-6)}
            </div>
          ) : null}
        </div>

        {currentAccount ? (
          <div className="flex gap-x-2">
            <div className="flex items-center">
              <span className="mr-1">👋</span>
              {wavesByUser}
            </div>
            <div className="flex items-center">
              <SiEthereum className="" />
              {earnings}
            </div>
          </div>
        ) : (
          <button
            className="bg-purple-700 border border-purple-900 rounded-full p-[0.4rem] shadow-md text-white"
            onClick={connectWallet}
          >
            <FiPower />
          </button>
        )}
      </div>

      <div className="font-semibold mt-8 text-xl">👋 Hello, Welcome to Wave Portal!</div>

      <p className="px-2 mt-4 mb-8 rounded leading-6">
        I'm Ochuko and I'm having fun with Web3. Wave at me with a nice message and you
        just might win some fake ether.{' '}
        {!currentAccount ? 'Connect your Ethereum wallet and wave at me!' : null}
      </p>

      {currentAccount ? (
        <div className="px-4 py-3 bg-white h-80 mt-auto mb-4 overflow-auto rounded">
          {allWaves.map((wave, index) => {
            const address = wave.address;
            return (
              <div
                key={index}
                className={`bg-purple-100 mb-4 px-3 py-2 rounded-2xl rounded-tl-sm`}
              >
                <div className="text-sm text-gray-400">
                  {address.substr(0, 5) + '...' + address.substr(-4)}
                </div>
                <div>{wave.message}</div>
                <div className="text-sm text-right text-gray-400">
                  {formatDistanceToNowStrict(new Date(wave.timestamp.toString()))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <button
          className="bg-purple-700 py-2 mb-4 rounded-md text-center text-white w-full"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}

      <form className={`pb-8 ${currentAccount ? 'mt-auto' : null}`} onSubmit={wave}>
        <textarea
          className="border border-gray-300 rounded p-4 text-sm w-full focus:outline-none focus:border-purple-600"
          name="message"
          rows="2"
          placeholder="Enter message..."
        ></textarea>

        <button
          className="bg-purple-900 py-2 rounded-md text-center text-white w-full"
          type="submit"
        >
          {loading ? 'Mining...' : 'Wave at Me'}
        </button>
      </form>
    </section>
  );
}
