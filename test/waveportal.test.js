const chai = require('chai');
const hre = require('hardhat');
const { solidity } = require('ethereum-waffle');

chai.use(solidity);
const expect = chai.expect;

describe('WavePortal', () => {
  let wavePortalContract;

  before(async () => {
    const WavePortalContractFactory = await hre.ethers.getContractFactory('WavePortal');
    wavePortalContract = await WavePortalContractFactory.deploy({
      value: hre.ethers.utils.parseEther('10'),
    });
    await wavePortalContract.deployed();
  });

  it('should have totalWaves equal to two', async () => {
    const [_, addr1] = await hre.ethers.getSigners();

    let waveTxn = await wavePortalContract.wave('This is wave #1');
    await waveTxn.wait();

    waveTxn = await wavePortalContract.connect(addr1).wave('This is wave #2');
    await waveTxn.wait();

    const totalWaves = await wavePortalContract.getTotalWaves();
    const waves = await wavePortalContract.getAllWaves();

    waves.forEach(wave => {
      expect(wave.waver).to.be.properAddress;
      expect(typeof wave.message).to.equal('string');
      expect(new Date(wave.timestamp * 1000)).to.be.instanceOf(Date);
      expect(typeof wave.earnings.toNumber()).to.equal('number');
    });

    expect(waves.length).to.equal(2);
    expect(totalWaves.toNumber()).to.equal(2);
  });

  it('should emit NewWave event when wave method is called', async () => {
    const [_, addr1, addr2] = await hre.ethers.getSigners();

    await expect(await wavePortalContract.connect(addr2).wave('This is wave #1')).to.emit(
      wavePortalContract,
      'NewWave'
    );
  });

  it('should throw if user tries to wave more than once in 30 seconds', async () => {
    const [_, addr1, addr2, waveEnthusiast] = await hre.ethers.getSigners();

    let waveTxn = await wavePortalContract.connect(waveEnthusiast).wave('I love to wave');
    await waveTxn.wait();

    await expect(wavePortalContract.connect(waveEnthusiast).wave('lots of waves')).to.be
      .reverted;
  });

  it('should record number of waves for a user', async () => {
    const [_, addr1, addr2, waveEnthusiast] = await hre.ethers.getSigners();

    const waves = await wavePortalContract.connect(waveEnthusiast).getTotalWavesByUser();
    expect(waves.toNumber()).to.equal(1);
  });

  it('should record earnings for a user', async () => {
    const earnings = await wavePortalContract.getTotalEarningsByUser();
    expect(earnings.toNumber()).to.be.at.least(0);
  });
});
