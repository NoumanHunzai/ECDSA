import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState } from "react";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateAddress, setPrivateAddress] = useState("");

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
        privateAddress={privateAddress}
        setPrivateAddress={setPrivateAddress}
      />
      <Transfer
        setBalance={setBalance}
        address={address}
        privateAddress={privateAddress}
      />
    </div>
  );
}

export default App;
