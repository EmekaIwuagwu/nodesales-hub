import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";

describe("BelloMundo Flow (AA/Paymaster)", function () {
  let dnrs, paymaster, entryPoint, stabilityModule, admin, user;

  beforeEach(async function () {
    [admin, user] = await ethers.getSigners();

    const DNRSToken = await ethers.getContractFactory("DNRSToken");
    dnrs = await DNRSToken.deploy(admin.address, admin.address);
    await dnrs.waitForDeployment();

    const MockEntryPoint = await ethers.getContractFactory("MockEntryPoint"); 
    entryPoint = await MockEntryPoint.deploy();
    await entryPoint.waitForDeployment();

    const StabilityModule = await ethers.getContractFactory("StabilityModule");
    stabilityModule = await StabilityModule.deploy(await dnrs.getAddress(), admin.address);
    await stabilityModule.waitForDeployment();

    await admin.sendTransaction({
        to: await stabilityModule.getAddress(),
        value: ethers.parseEther("100")
    });

    const initialRate = ethers.parseEther("1"); 
    const DNRSPaymaster = await ethers.getContractFactory("DNRSPaymaster");
    paymaster = await DNRSPaymaster.deploy(
        await entryPoint.getAddress(),
        await dnrs.getAddress(),
        await stabilityModule.getAddress(),
        initialRate
    );
    await paymaster.waitForDeployment();

    await paymaster.deposit({ value: ethers.parseEther("10") });
    await paymaster.addStake(86400, { value: ethers.parseEther("1") });
  });

  it("Paymaster charges correct DNRS for gas", async function () {
    const TREASURY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TREASURY_ROLE"));
    await dnrs.grantRole(TREASURY_ROLE, admin.address);
    const userBalance = ethers.parseEther("100");
    await dnrs.mint(user.address, userBalance);
    await dnrs.connect(user).approve(await paymaster.getAddress(), userBalance);

    const userOpHash = ethers.keccak256(ethers.toUtf8Bytes("userOp"));
    const maxCost = ethers.parseEther("0.1"); 
    
    const expectedPrecharge = ethers.parseEther("0.11");
    
    const mockUserOp = {
        sender: user.address,
        nonce: 0,
        initCode: "0x",
        callData: "0x",
        callGasLimit: 100000,
        verificationGasLimit: 100000,
        preVerificationGas: 0,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        paymasterAndData: "0x",
        signature: "0x"
    };

    await admin.sendTransaction({ to: await entryPoint.getAddress(), value: ethers.parseEther("1") });
    
    await entryPoint.callPaymasterValidate(await paymaster.getAddress(), mockUserOp, userOpHash, maxCost);
    
    expect(await dnrs.balanceOf(user.address)).to.equal(userBalance - expectedPrecharge);
    expect(await paymaster.preChargedDNRS(userOpHash)).to.equal(expectedPrecharge);

    const actualGasCost = ethers.parseEther("0.05");
    const expectedActualCost = ethers.parseEther("0.055"); 
    
    await entryPoint.callPaymasterPostOp(await paymaster.getAddress(), 0, "0x", actualGasCost, user.address, userOpHash, expectedPrecharge);
    
    expect(await dnrs.balanceOf(user.address)).to.equal(userBalance - expectedActualCost);
    expect(await paymaster.accumulatedDNRS()).to.equal(expectedActualCost);
  });
});
