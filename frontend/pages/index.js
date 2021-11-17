import { useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { IoWallet } from 'react-icons/io5';
import { GiWaveCrest } from 'react-icons/gi';
import { SiEthereum } from 'react-icons/si';
import { formatDistanceToNowStrict } from 'date-fns';
import { useMediaQuery } from 'react-responsive';

import { useContract } from '../hooks/useContract';

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [totalWaves, setTotalWaves] = useState(0);
  const [wavesByUser, setWavesByUser] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);

  const wavePortalContract = useContract();
  const formRef = useRef();
  const isMobile = useMediaQuery({
    query: '(max-width: 660px)',
  });

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    (async function () {
      if (currentAccount) {
        getWalletBalance();
      }
    })();
  }, [currentAccount]);

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

  const getWalletBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balInBigNumber = await provider.getBalance(currentAccount);
    const balanceInEth = Number(ethers.utils.formatEther(balInBigNumber)).toFixed(4);
    setAccountBalance(balanceInEth);
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
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
        formRef.current.reset();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="h-screen max-w-[80rem] mx-auto px-4">
      <header className="flex justify-between py-8">
        <h1 className="text-3xl font-semibold whitespace-nowrap sm:text-4xl">
          <GiWaveCrest className="inline-block align-top" color="#eebbc3" />
          <span>Wave Portal</span>
        </h1>

        {currentAccount ? (
          <div className="flex items-center justify-center sm:justify-end">
            <div className="bg-dark-purple2 items-center font-light mr-4 px-3 py-1 rounded text-light-beige hidden sm:flex">
              <SiEthereum className="mr-1" color="#b8e7ec" />
              {accountBalance}
            </div>
            <div className="bg-dark-purple2 flex items-center font-light px-3 py-1 rounded text-light-beige">
              <IoWallet className="mr-2" color="#b8e7ec" />
              {currentAccount.substr(0, 4) + '...' + currentAccount.substr(-4)}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center sm:justify-end">
            <button
              className="border border-light-beige rounded-md px-4 py-1 shadow-md text-light-beige"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </header>

      <div className="flex justify-center mt-[-1.5rem] text-[1rem] sm:text-lg sm:mt-4">
        <div className="flex items-center gap-x-2">
          <span>Total Waves: </span>
          <span className="grid place-items-center font-light text-light-ray">
            {totalWaves}
          </span>
        </div>

        <div className="flex gap-x-2 ml-4">
          <div className="flex items-center">
            <span className="mr-1">👋</span>
            {wavesByUser}
          </div>
          <div className="flex items-center">
            <SiEthereum className="" />
            {earnings}
          </div>
        </div>
      </div>

      <div className={`grid mt-16 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 gap-8'}`}>
        <section className="">
          <h2 className={`font-medium text-center text-3xl ${isMobile ? '' : 'mt-20'}`}>
            Welcome to Wave Portal!
          </h2>

          <p className="font-light px-2 mt-8 rounded leading-6 text-center">
            Hey, I'm Ochuko and I'm having fun with Web3. Wave at me with a nice message
            and you just might win some fake ether.{' '}
            {!currentAccount ? 'Connect your Ethereum wallet and wave at me!' : null}
          </p>

          {isMobile && currentAccount && (
            <section className="flex flex-col h-[20rem] my-8">
              <div className="px-4 py-3 bg-blue-choo flex-auto overflow-auto rounded shadow-inner">
                {allWaves.map((wave, index) => {
                  const address = wave.address;
                  return (
                    <div
                      key={index}
                      className={`bg-dark-purple3 mb-4 px-3 py-2 rounded-2xl rounded-tl-sm`}
                    >
                      <div className="text-sm text-gray-400">
                        {address.substr(0, 5) + '...' + address.substr(-4)}
                      </div>
                      <div className="text-white">{wave.message}</div>
                      <div className="text-sm text-right text-gray-400">
                        {formatDistanceToNowStrict(new Date(wave.timestamp.toString()), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {currentAccount && (
            <form className="pb-8 max-w-lg mx-auto mt-8" ref={formRef} onSubmit={wave}>
              <textarea
                className="border border-gray-300 rounded p-4 text-dark-purple text-sm w-full focus:outline-none focus:border-light-beige"
                name="message"
                rows="3"
                placeholder="Enter message..."
              ></textarea>

              <button
                className="bg-light-beige py-3 mt-2 rounded text-center text-dark-purple w-full"
                type="submit"
              >
                {loading ? 'Mining...' : 'Wave at Me'}
              </button>
            </form>
          )}
        </section>

        {!isMobile && (
          <section className="flex flex-col h-[35rem]">
            <div className="px-4 py-3 bg-blue-choo flex-auto overflow-auto rounded shadow-inner">
              {allWaves.map((wave, index) => {
                const address = wave.address;
                return (
                  <div
                    key={index}
                    className={`bg-dark-purple3 mb-4 px-3 py-2 rounded-2xl rounded-tl-sm`}
                  >
                    <div className="text-sm text-gray-400">
                      {address.substr(0, 5) + '...' + address.substr(-4)}
                    </div>
                    <div className="text-white">{wave.message}</div>
                    <div className="text-sm text-right text-gray-400">
                      {formatDistanceToNowStrict(new Date(wave.timestamp.toString()), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
