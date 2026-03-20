import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";

describe("Death Spiral Simulation", function () {
  let dnrs, dnrBond, treasury, oracle, boardroom, devFund, admin;
  const EPOCH_DURATION = 12n * 3600n;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    admin = signers[0];
    devFund = signers[3];

    oracle = await ethers.deployContract("PriceOracle", [ethers.parseEther("1.0"), admin.address]);
    dnrs = await ethers.deployContract("DNRSToken", [admin.address, admin.address]);
    dnrBond = await ethers.deployContract("DNRBond", [admin.address]);
    
    await Promise.all([
        oracle.waitForDeployment(),
        dnrs.waitForDeployment(),
        dnrBond.waitForDeployment()
    ]);

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockDNR = await MockERC20.deploy("mDNR", "mDNR", 18);
    await mockDNR.waitForDeployment();
    
    boardroom = await ethers.deployContract("BoardroomStaking", [await mockDNR.getAddress(), await dnrs.getAddress(), admin.address]);
    await boardroom.waitForDeployment();

    const startTime = BigInt(await time.latest()) + 100n;
    treasury = await ethers.deployContract("Treasury", [
      await dnrs.getAddress(),
      await dnrBond.getAddress(),
      await boardroom.getAddress(),
      await oracle.getAddress(),
      devFund.address,
      startTime,
      admin.address
    ]);
    await treasury.waitForDeployment();

    const TREASURY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TREASURY_ROLE"));
    const PRICE_UPDATER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PRICE_UPDATER_ROLE"));

    await dnrs.grantRole(TREASURY_ROLE, await treasury.getAddress());
    await dnrBond.grantRole(TREASURY_ROLE, await treasury.getAddress());
    await boardroom.grantRole(TREASURY_ROLE, await treasury.getAddress());
    await oracle.grantRole(PRICE_UPDATER_ROLE, admin.address);

    await time.increaseTo(startTime + 1n);
  });

  it("Should halt after 3 epochs below $0.80", async function () {
    const criticalPrice = ethers.parseEther("0.75"); 

    for (let i = 0; i < 3; i++) {
        await oracle.emergencyPriceUpdate(criticalPrice);
        await time.increase(EPOCH_DURATION + 1n);
        await treasury.executeEpoch();
    }
    
    expect(await treasury.paused()).to.be.true;
    expect(await treasury.epochsBelowCriticalPeg()).to.equal(3n);
  });
});
