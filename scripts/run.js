const hre = require("hardhat");

async function main() {
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy();
  await waveContract.deployed();

  console.log("Contract deployed to:", waveContract.address);

  let waveCount;
  waveCount = await waveContract.getTotalWaves();
  console.log(waveCount.toNumber());

  let waveTxn = await waveContract.wave("A message!");
  await waveTxn.wait();

  waveCount = await waveContract.getTotalWaves();

  const [_, randoPerson] = await hre.ethers.getSigners();
  waveTxn = await waveContract.connect(randoPerson).wave("Another message!");
  await waveTxn.wait();

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
