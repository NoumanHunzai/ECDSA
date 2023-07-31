const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const data = require("./data.json");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const {
  utf8ToBytes,
  hexToBytes,
  toHex,
} = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

// const balances = {
//   [data.user1.publicKey]: 100,
//   [data.user2.publicKey]: 50,
//   [data.user3.publicKey]: 75,
// };

let balances = {};
app.post("/createWallet", (req, res) => {
  const { publicKey, balance } = req.body;
  balances = { ...balances, [publicKey]: balance };
  res.status(200).send("WalletAddress Created!");
});

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  console.log(balances, "balances");
  res.send({ balance });
});

function formatePublicKey(publicKeyRaw) {
  const pubKeyHash = keccak256(publicKeyRaw.slice(1));
  const length = pubKeyHash.length;
  return "0x" + toHex(pubKeyHash.slice(length - 20, length));
}

// hash the message
function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

async function recoverKey(message, signature, recoveryBit) {
  let hash = await hashMessage(message);
  const recovery = await secp.recoverPublicKey(hash, signature, recoveryBit);
  return formatePublicKey(recovery);
}

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature, recoveryBit, message } =
    req.body;

  const signatureWallet = await recoverKey(message, signature, recoveryBit);

  if (sender !== signatureWallet)
    return res.status(400).send({
      message: "signature wallet and selected account do not match",
    });
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
