import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import contractABI from '../assets/abi.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function useContract() {
  const [contract, setContract] = useState();

  useEffect(() => {
    if (!contract) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        signer
      );

      setContract(wavePortalContract);
    }
  }, [contract]);

  return contract;
}
