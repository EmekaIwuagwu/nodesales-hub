const { expect, anyValue } = require("chai");
const { ethers }  = require("hardhat");
const { time }    = require("@nomicfoundation/hardhat-network-helpers");

const EPOCH_DURATION = 86400; // 24 h

describe("Kortana Node Sale Platform", () => {
  let owner, distributor, treasury, buyer1, buyer2;
  let usdt, dnr;
  let genesis, early, full, premium;
  let nodeSale, vault;

  const tierPrices    = [300e6, 500e6, 1000e6, 2000e6]; // USDT 6-dec
  const tierSupplies  = [1000, 2000, 1000, 500];
  const dnrPerEpoch   = [1n, 2n, 5n, 10n].map(x => x * 10n ** 18n);

  beforeEach(async () => {
    [owner, distributor, treasury, buyer1, buyer2] = await ethers.getSigners();

    // Mock tokens
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    usdt = await MockUSDT.deploy();

    const MockDNR = await ethers.getContractFactory("MockDNR");
    dnr = await MockDNR.deploy();

    // 4× NodeLicense contracts
    const NodeLicense = await ethers.getContractFactory("NodeLicense");
    genesis = await NodeLicense.deploy("Kortana Genesis License", "KGL", 1000, 0);
    early   = await NodeLicense.deploy("Kortana Early License",   "KEL", 2000, 1);
    full    = await NodeLicense.deploy("Kortana Full License",    "KFL", 1000, 2);
    premium = await NodeLicense.deploy("Kortana Premium License", "KPL", 500,  3);

    // NodeSale
    const NodeSale = await ethers.getContractFactory("NodeSale");
    nodeSale = await NodeSale.deploy(
      await usdt.getAddress(),
      treasury.address,
      [
        await genesis.getAddress(),
        await early.getAddress(),
        await full.getAddress(),
        await premium.getAddress(),
      ]
    );

    // Wire NodeSale into each license
    for (const lic of [genesis, early, full, premium]) {
      await lic.setNodeSaleContract(await nodeSale.getAddress());
    }

    // RewardVault
    const RewardVault = await ethers.getContractFactory("RewardVault");
    vault = await RewardVault.deploy(
      await dnr.getAddress(),
      distributor.address,
      EPOCH_DURATION
    );

    // Fund vault with 1M DNR
    const vaultAddress = await vault.getAddress();
    await dnr.approve(vaultAddress, ethers.parseUnits("1000000", 18));
    await vault.depositRewards(ethers.parseUnits("1000000", 18));

    // Give buyers USDT
    for (const buyer of [buyer1, buyer2]) {
      await usdt.faucet(buyer.address, 50_000 * 1e6);
      await usdt.connect(buyer).approve(await nodeSale.getAddress(), ethers.MaxUint256);
    }
  });

  // ─── NodeLicense ────────────────────────────────────────────────────────────

  describe("NodeLicense", () => {
    it("has correct metadata", async () => {
      expect(await genesis.name()).to.equal("Kortana Genesis License");
      expect(await genesis.symbol()).to.equal("KGL");
      expect(await genesis.decimals()).to.equal(0);
      expect(await genesis.maxSupply()).to.equal(1000);
      expect(await genesis.tierId()).to.equal(0);
    });

    it("only NodeSale can mint", async () => {
      await expect(genesis.connect(buyer1).mint(buyer1.address, 1))
        .to.be.revertedWith("NodeLicense: caller is not NodeSale");
    });

    it("enforces supply cap", async () => {
      // set a cap-1 state directly via NodeSale
      const NodeLicense2 = await ethers.getContractFactory("NodeLicense");
      const tiny = await NodeLicense2.deploy("Tiny", "TINY", 2, 0);
      await tiny.setNodeSaleContract(owner.address);
      await tiny.mint(buyer1.address, 2);
      await expect(tiny.mint(buyer1.address, 1))
        .to.be.revertedWith("NodeLicense: supply cap exceeded");
    });

    it("owner can burn", async () => {
      await genesis.setNodeSaleContract(owner.address);
      await genesis.mint(buyer1.address, 3);
      expect(await genesis.balanceOf(buyer1.address)).to.equal(3);
      await genesis.burn(buyer1.address, 2);
      expect(await genesis.balanceOf(buyer1.address)).to.equal(1);
    });
  });

  // ─── NodeSale ───────────────────────────────────────────────────────────────

  describe("NodeSale", () => {
    it("purchases correctly update balances", async () => {
      await nodeSale.connect(buyer1).purchaseNode(0, 2); // 2× Genesis = $600 USDT
      expect(await genesis.balanceOf(buyer1.address)).to.equal(2);
      expect(await usdt.balanceOf(treasury.address)).to.equal(600 * 1e6);
      expect(await nodeSale.totalRaised()).to.equal(600 * 1e6);
    });

    it("emits NodePurchased event", async () => {
      const tx = nodeSale.connect(buyer1).purchaseNode(1, 1);
      await expect(tx)
        .to.emit(nodeSale, "NodePurchased")
        .withArgs(buyer1.address, 1n, 1n, 500n * 1_000_000n, (v) => typeof v === "bigint");
    });

    it("reverts on sold-out tier", async () => {
      // Request more than maxSupply in a single call — NodeSale rejects before minting
      await expect(nodeSale.connect(buyer1).purchaseNode(0, 1001))
        .to.be.revertedWith("NodeSale: supply exhausted");
    });

    it("reverts on inactive tier", async () => {
      await nodeSale.setTierActive(0, false);
      await expect(nodeSale.connect(buyer1).purchaseNode(0, 1))
        .to.be.revertedWith("NodeSale: tier not active");
    });

    it("admin can update price", async () => {
      await nodeSale.updateTierPrice(0, 350 * 1e6);
      const tier = await nodeSale.getTier(0);
      expect(tier.priceUSDT).to.equal(350 * 1e6);
    });

    it("non-owner cannot pause", async () => {
      await expect(nodeSale.connect(buyer1).pause())
        .to.be.revertedWithCustomError(nodeSale, "OwnableUnauthorizedAccount");
    });
  });

  // ─── RewardVault ────────────────────────────────────────────────────────────

  describe("RewardVault", () => {
    it("distributor can distribute after epoch", async () => {
      await time.increase(EPOCH_DURATION);

      const amounts = [ethers.parseUnits("10", 18), ethers.parseUnits("20", 18)];
      await expect(vault.connect(distributor).distributeRewards(
        [buyer1.address, buyer2.address],
        amounts
      )).to.emit(vault, "RewardsDistributed");

      expect(await vault.getPendingRewards(buyer1.address)).to.equal(amounts[0]);
      expect(await vault.getPendingRewards(buyer2.address)).to.equal(amounts[1]);
    });

    it("reverts if epoch has not elapsed", async () => {
      await expect(vault.connect(distributor).distributeRewards(
        [buyer1.address],
        [ethers.parseUnits("10", 18)]
      )).to.be.revertedWith("RewardVault: epoch not elapsed");
    });

    it("user can claim rewards", async () => {
      await time.increase(EPOCH_DURATION);
      const amount = ethers.parseUnits("100", 18);
      await vault.connect(distributor).distributeRewards([buyer1.address], [amount]);

      const before = await dnr.balanceOf(buyer1.address);
      await vault.connect(buyer1).claimRewards();
      const after  = await dnr.balanceOf(buyer1.address);

      expect(after - before).to.equal(amount);
      expect(await vault.getPendingRewards(buyer1.address)).to.equal(0);
    });

    it("accumulates across multiple epochs", async () => {
      const amount = ethers.parseUnits("50", 18);
      for (let i = 0; i < 3; i++) {
        await time.increase(EPOCH_DURATION);
        await vault.connect(distributor).distributeRewards([buyer1.address], [amount]);
      }
      expect(await vault.getPendingRewards(buyer1.address)).to.equal(amount * 3n);
      expect(await vault.getTotalEarned(buyer1.address)).to.equal(amount * 3n);
    });

    it("emergency withdraw clears vault", async () => {
      const before = await dnr.balanceOf(owner.address);
      await vault.emergencyWithdraw(ethers.parseUnits("500000", 18));
      const after  = await dnr.balanceOf(owner.address);
      expect(after - before).to.equal(ethers.parseUnits("500000", 18));
    });

    it("only owner can emergency-withdraw", async () => {
      await expect(vault.connect(buyer1).emergencyWithdraw(1))
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  // ─── End-to-end ─────────────────────────────────────────────────────────────

  describe("End-to-end: buy → distribute → claim", () => {
    it("full cycle", async () => {
      // 1. buyer1 buys 1 Genesis + 1 Early
      await nodeSale.connect(buyer1).purchaseNode(0, 1);
      await nodeSale.connect(buyer1).purchaseNode(1, 2);
      expect(await genesis.balanceOf(buyer1.address)).to.equal(1);
      expect(await early.balanceOf(buyer1.address)).to.equal(2);

      // 2. advance epoch and distribute: 1×1 + 2×2 = 5 DNR
      await time.increase(EPOCH_DURATION);
      const dnrAmount = ethers.parseUnits("5", 18);
      await vault.connect(distributor).distributeRewards([buyer1.address], [dnrAmount]);

      expect(await vault.getPendingRewards(buyer1.address)).to.equal(dnrAmount);

      // 3. claim
      await vault.connect(buyer1).claimRewards();
      expect(await dnr.balanceOf(buyer1.address)).to.equal(dnrAmount);

      // 4. nothing left to claim
      await expect(vault.connect(buyer1).claimRewards())
        .to.be.revertedWith("RewardVault: nothing to claim");
    });
  });
});
