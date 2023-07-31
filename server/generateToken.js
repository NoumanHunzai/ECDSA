const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

for (let i = 0; i < 3; i++) {
  const privateKeys = secp.secp256k1.utils.randomPrivateKey();

  const publicKeys = secp.secp256k1.getPublicKey(privateKeys);
  console.log(
    `Private Key for User ${i} :${toHex(
      privateKeys
    )} Public Keys for User ${i} : ${toHex(publicKeys)}`
  );
}
