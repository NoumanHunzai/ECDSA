import { useRef, useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { hexToBytes, toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  setPrivateAddress,
  privateAddress,
}) {
  const [walletAddresses, setWalletAddresses] = useState([]);

  function formatePublicKey(publicKeyRaw) {
    const pubKeyHash = keccak256(publicKeyRaw.slice(1));
    const length = pubKeyHash.length;
    return "0x" + toHex(pubKeyHash.slice(length - 20, length));
  }

  async function generateAddress() {
    const privateKey = toHex(secp.utils.randomPrivateKey());
    const address = formatePublicKey(secp.getPublicKey(hexToBytes(privateKey)));
    setAddress(address);
    setWalletAddresses([...walletAddresses, { address, privateKey }]);
    try {
      await server.post(`/createWallet`, {
        publicKey: address,
        balance: 100,
      });
    } catch (ex) {
      alert(ex.response.data.message);
    }

    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateAddress(privateKey);
    const address = formatePublicKey(secp.getPublicKey(hexToBytes(privateKey)));
    setAddress(address);

    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  const copyButtonRef = useRef(null);
  const setTimeoutId = useRef(null);

  const onCopy = () => {
    navigator.clipboard.writeText(address).then(
      function () {
        copyButtonRef.current.style.display = "inline-block";
        clearTimeout(setTimeoutId.current);

        setTimeoutId.current = setTimeout(() => {
          copyButtonRef.current.style.display = "none";
        }, 1000);
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  };

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Addresses
        <select onChange={onChange} defaultValue="Select a Wallet">
          <option>Select a Wallet</option>
          {walletAddresses.map((wallet) => (
            <option key={wallet.address} value={wallet.privateKey}>
              {wallet.address}
            </option>
          ))}
        </select>
      </label>
      <button className="button-gen-outline" onClick={onCopy}>
        Copy Address&nbsp;
        <span ref={copyButtonRef} style={{ display: "none" }}>
          &#x2705;
        </span>
      </button>

      <div className="balance">Balance: {balance}</div>

      <div>
        <input
          type="submit"
          className="button"
          value="Generate"
          onClick={generateAddress}
        />
      </div>
    </div>
  );
}

export default Wallet;
