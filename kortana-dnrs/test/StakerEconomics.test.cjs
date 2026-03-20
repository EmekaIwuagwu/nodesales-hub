const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Staker Economics", function () {
  let signers;
  beforeEach(async function () {
    signers = await ethers.getSigners();
    console.log("SIGNERS COUNT:", signers.length);
  });
  it("dummy", async function() {});
});
