import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";

function Transfer({ address, setBalance, privateAddress }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  // hash the message
  function hashMessage(message) {
    return keccak256(utf8ToBytes(message));
  }

  // send Sign Message so Function is
  const signMessage = async (msg) => {
    let hash = await hashMessage(msg);
    const signature = await secp.sign(hash, privateAddress, {
      recovered: true,
    });
    return signature;
  };

  async function transfer(evt) {
    evt.preventDefault();
    const message = `Transfer ${sendAmount} to ${recipient}`;
    const [signature, recoveryBit] = await signMessage(message);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        message,
        signature: toHex(signature),
        recoveryBit,
      });
      setBalance(balance);
    } catch (ex) {
      // alert(ex.response.data.message);
      alert(ex);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
