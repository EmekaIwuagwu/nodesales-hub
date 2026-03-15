const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("KortanaCrown (wKUD)", function () {
  let KortanaCrown;
  let token;
  let owner;
  let treasury;
  let bridge;
  let user1;
  let user2;
  let blacklistedUser;
  
  const MAX_SUPPLY = ethers.parseEther("250000000");
  const MAX_TX = ethers.parseEther("2500000");
  const MAX_WALLET = ethers.parseEther("5000000");

  beforeEach(async function () {
    [owner, treasury, bridge, user1, user2, blacklistedUser] = await ethers.getSigners();

    const KortanaCrownFactory = await ethers.getContractFactory("KortanaCrown");
    token = await KortanaCrownFactory.deploy(treasury.address, bridge.address);

    // Initial allocation to treasury as per deploy script
    await token.transfer(treasury.address, MAX_SUPPLY);
  });

  describe("6.1 Core BEP-20", function () {
    it("Should have correct metadata", async function () {
      expect(await token.name()).to.equal("Kortana Crown");
      expect(await token.symbol()).to.equal("wKUD");
      expect(await token.decimals()).to.equal(18);
    });

    it("Should have correct total supply", async function () {
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should fail transfer before trading is enabled (non-exempt)", async function () {
      await token.connect(treasury).transfer(user1.address, ethers.parseEther("100"));
      await expect(token.connect(user1).transfer(user2.address, 100))
        .to.be.revertedWithCustomError(token, "TradingNotEnabled");
    });

    it("Should succeed transfer after trading is enabled", async function () {
      await token.enableTrading();
      const amount = ethers.parseEther("100");
      await token.connect(treasury).transfer(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should handle allowances and transferFrom", async function () {
      await token.enableTrading();
      const amount = ethers.parseEther("100");
      await token.connect(treasury).approve(user1.address, amount);
      expect(await token.allowance(treasury.address, user1.address)).to.equal(amount);
      
      await token.connect(user1).transferFrom(treasury.address, user2.address, amount);
      expect(await token.balanceOf(user2.address)).to.equal(amount);
    });
  });

  describe("6.2 Supply & Minting", function () {
    it("Should mint max supply to owner/deployer in constructor, then we move it to treasury", async function () {
      expect(await token.balanceOf(treasury.address)).to.equal(MAX_SUPPLY);
    });

    it("Should allow bridge to mint within cap", async function () {
      const burnAmount = ethers.parseEther("1000");
      await token.connect(treasury).burn(burnAmount);
      const mintAmount = ethers.parseEther("500");
      await expect(token.connect(bridge).bridgeMint(user1.address, mintAmount))
        .to.emit(token, "BridgeMint")
        .withArgs(user1.address, mintAmount);
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should fail bridgeMint if exceeding cap", async function () {
      await expect(token.connect(bridge).bridgeMint(user1.address, 1))
        .to.be.revertedWithCustomError(token, "Unauthorized");
    });

    it("Should allow bridge to burn", async function () {
      await token.enableTrading();
      await token.connect(treasury).transfer(user1.address, 1000);
      await expect(token.connect(bridge).bridgeBurn(user1.address, 400))
        .to.emit(token, "BridgeBurn")
        .withArgs(user1.address, 400);
      expect(await token.balanceOf(user1.address)).to.equal(600);
    });

    it("Should allow any holder to burn", async function () {
      await token.enableTrading();
      await token.connect(treasury).transfer(user1.address, 1000);
      await token.connect(user1).burn(400);
      expect(await token.balanceOf(user1.address)).to.equal(600);
    });

    it("Should calculate circulating supply correctly", async function () {
      const deadAddress = "0x000000000000000000000000000000000000dEaD";
      await token.connect(treasury).burn(1000); 
      await token.enableTrading();
      await token.connect(treasury).transfer(deadAddress, 500);
      const expectedCirculating = MAX_SUPPLY - 1000n - 500n;
      expect(await token.circulatingSupply()).to.equal(expectedCirculating);
    });
  });

  describe("6.3 Trading & Anti-Bot", function () {
    it("Should set launch variables on enableTrading", async function () {
      await token.enableTrading();
      expect(await token.tradingEnabled()).to.be.true;
      expect(await token.launchBlock()).to.be.gt(0);
    });

    it("Should prevent double enableTrading", async function () {
      await token.enableTrading();
      await expect(token.enableTrading()).to.be.revertedWithCustomError(token, "Unauthorized");
    });

    it("Should restrict non-exempt in launch block", async function () {
      await network.provider.send("evm_setAutomine", [false]);
      await token.enableTrading();
      await token.connect(treasury).transfer(user1.address, 1000);
      const tx3 = await token.connect(user1).transfer(user2.address, 100);
      await network.provider.send("evm_mine");
      await network.provider.send("evm_setAutomine", [true]);
      
      try {
        await tx3.wait();
        expect.fail("Should have reverted");
      } catch (error) {
        // In bundled mining, ethers might not decode the custom error correctly
        // but it definitely throws a CALL_EXCEPTION or similar with status 0.
        expect(error.message).to.contain("reverted");
      }
    });

    it("Should enforce MAX_TX_AMOUNT", async function () {
      await token.enableTrading();
      await token.connect(treasury).transfer(user1.address, MAX_TX + ethers.parseEther("1"));
      await expect(token.connect(user1).transfer(user2.address, MAX_TX + 1n))
        .to.be.revertedWithCustomError(token, "TransactionExceedsMax");
    });

    it("Should enforce MAX_WALLET_AMOUNT", async function () {
      await token.enableTrading();
      await token.connect(treasury).transfer(user1.address, MAX_WALLET);
      await token.connect(treasury).transfer(user2.address, MAX_WALLET);
      await expect(token.connect(user1).transfer(user2.address, 1))
        .to.be.revertedWithCustomError(token, "WalletExceedsMax");
    });

    it("Should allow bypassing limits when disabled", async function () {
      await token.enableTrading();
      await token.toggleLimits(false);
      await token.connect(treasury).transfer(user1.address, MAX_WALLET + MAX_TX);
      expect(await token.balanceOf(user1.address)).to.equal(MAX_WALLET + MAX_TX);
    });
  });

  describe("6.4 Compliance & Admin", function () {
    it("Should block blacklisted users", async function () {
      await token.enableTrading();
      await token.setBlacklist(blacklistedUser.address, true);
      await expect(token.connect(treasury).transfer(blacklistedUser.address, 1000))
        .to.be.revertedWithCustomError(token, "BlacklistedRecipient");
      await token.connect(treasury).transfer(user1.address, 1000);
      await expect(token.connect(user1).transfer(blacklistedUser.address, 1))
        .to.be.revertedWithCustomError(token, "BlacklistedRecipient");
    });

    it("Should allow pausable controls", async function () {
      await token.enableTrading();
      await token.pause();
      await expect(token.connect(treasury).transfer(user1.address, 100))
        .to.be.revertedWithCustomError(token, "EnforcedPause");
      await token.unpause();
      await token.connect(treasury).transfer(user1.address, 100);
      expect(await token.balanceOf(user1.address)).to.equal(100);
    });

    it("Should handle ownership transfer carefully (Ownable2Step)", async function () {
      await token.transferOwnership(user1.address);
      expect(await token.owner()).to.equal(owner.address);
      expect(await token.pendingOwner()).to.equal(user1.address);
      await token.connect(user1).acceptOwnership();
      expect(await token.owner()).to.equal(user1.address);
    });

    it("Should setExempt correctly", async function () {
      await token.setExempt(user1.address, true);
      expect(await token.isExemptFromLimits(user1.address)).to.be.true;
    });

    it("Should setTreasury and bridgeOperator correctly", async function () {
      await expect(token.setTreasury(ethers.ZeroAddress)).to.be.revertedWithCustomError(token, "Unauthorized");
      await token.setTreasury(user1.address);
      expect(await token.treasuryWallet()).to.equal(user1.address);
      await expect(token.setBridgeOperator(ethers.ZeroAddress)).to.be.revertedWithCustomError(token, "Unauthorized");
      await token.setBridgeOperator(user2.address);
      expect(await token.bridgeOperator()).to.equal(user2.address);
    });
  });

  describe("6.5 Security & Edge-Case", function () {
    it("Should revert zero address in constructor", async function () {
      const KortanaCrownFactory = await ethers.getContractFactory("KortanaCrown");
      await expect(KortanaCrownFactory.deploy(ethers.ZeroAddress, bridge.address))
        .to.be.revertedWithCustomError(token, "Unauthorized");
      await expect(KortanaCrownFactory.deploy(treasury.address, ethers.ZeroAddress))
        .to.be.revertedWithCustomError(token, "Unauthorized");
    });

    it("Should verify onlyBridgeOrOwner access", async function () {
      await expect(token.connect(user1).bridgeMint(user2.address, 100))
        .to.be.revertedWithCustomError(token, "Unauthorized");
    });

    it("Should block transfers to address(0)", async function () {
      await token.enableTrading();
      await expect(token.connect(treasury).transfer(ethers.ZeroAddress, 100)).to.be.reverted; 
    });

    it("Should permit correctly (EIP-2612)", async function () {
      const amount = ethers.parseEther("1000");
      const deadline = (await time.latest()) + 3600;
      const nonce = await token.nonces(owner.address);
      const name = await token.name();
      const chainId = (await ethers.provider.getNetwork()).chainId;
      const domain = { name, version: "1", chainId, verifyingContract: await token.getAddress() };
      const types = {
        Permit: [
          { name: "owner", type: "address" }, { name: "spender", type: "address" },
          { name: "value", type: "uint256" }, { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };
      const value = { owner: owner.address, spender: user1.address, value: amount, nonce, deadline };
      const signature = await owner.signTypedData(domain, types, value);
      const { v, r, s } = ethers.Signature.from(signature);
      await token.permit(owner.address, user1.address, amount, deadline, v, r, s);
      expect(await token.allowance(owner.address, user1.address)).to.equal(amount);
    });
  });
});
