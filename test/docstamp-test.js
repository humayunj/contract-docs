const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = ethers;

describe("DocStamp", function () {
  let contract;
  let signers;

  beforeEach(async () => {
    const factory = await ethers.getContractFactory("DocStamp");
    contract = await factory.deploy();
    await contract.deployed();
    signers = await ethers.getSigners();
  });

  it("Should register a doc", async function () {
    const bytes = Uint8Array.from("hello, world!");
    const hash = utils.keccak256(bytes);

    await expect(contract.register(hash, signers[0].address))
      .to.emit(contract, "DocRegistered")
      .withArgs(hash, signers[0].address);

    expect(await contract.docHashes(hash)).to.equal(signers[0].address);
  });
  it("Should unregister a doc", async function () {
    const bytes = Uint8Array.from("hello, world!");
    const hash = utils.keccak256(bytes);

    await expect(contract.register(hash, signers[0].address))
      .to.emit(contract, "DocRegistered")
      .withArgs(hash, signers[0].address);

    expect(await contract.docHashes(hash)).to.equal(signers[0].address);

    // call unregister
    await expect(contract.unregister(hash))
      .to.emit(contract, "DocUnregistered")
      .withArgs(hash);

    expect(await contract.docHashes(hash)).to.equal(
      ethers.constants.AddressZero
    );
  });
  it("Hash collision should revert transaction", async function () {
    const bytes = Uint8Array.from("hello, world!");
    const hash = utils.keccak256(bytes);

    await expect(contract.register(hash, signers[0].address))
      .to.emit(contract, "DocRegistered")
      .withArgs(hash, signers[0].address);

    expect(await contract.docHashes(hash)).to.equal(signers[0].address);

    // register this hash again
    await expect(
      contract.connect(signers[1]).register(hash, signers[0].address)
    ).to.be.revertedWith("AlreadyRegistered");
  });
  it("Unuthorized unregistery should revert", async function () {
    const bytes = Uint8Array.from("hello, world!");
    const hash = utils.keccak256(bytes);

    await expect(contract.register(hash, signers[0].address))
      .to.emit(contract, "DocRegistered")
      .withArgs(hash, signers[0].address);

    expect(await contract.docHashes(hash)).to.equal(signers[0].address);

    // unregister with different signer
    await expect(
      contract.connect(signers[1]).unregister(hash)
    ).to.be.revertedWith("NotAuthorized");
  });
});
