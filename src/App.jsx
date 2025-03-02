import React, { useState } from "react";

import walletConnect from "./walletConnect.js";
import createDid from "./create-did.js";

import "./assets/App.css";

function App() {
	const [walletData, setWalletData] = useState();
	const [accountId, setAccountId] = useState();
	
	const [connectTextSt, setConnectTextSt] = useState("Connect here...");
	const [createTextSt, setCreateTextSt] = useState("");
	
	const [connectLinkSt, setConnectLinkSt] = useState("");
	
	async function connectWallet() {
		if (accountId !== undefined) {
			setConnectTextSt(`Account ${accountId} is connected`);
		} else {
			const walletData = await walletConnect();
			walletData[0].pairingEvent.once((pairingData) => {
				pairingData.accountIds.forEach((id) => {
					setAccountId(id);
					console.log(`- Paired account id: ${id}`);
					setConnectTextSt(`Account ${id} has been connected`);
					setConnectLinkSt(`https://hashscan.io/#/testnet/account/${id}`);
				});
			});
			setWalletData(walletData);
			setCreateTextSt();
		}
	}

	
	async function handleCreateDid() {
		try {
			
			await createDid();
			
		} catch (error) {
			
			console.error(error);
		}
	}

	return (
		<div className="App">
			<h1 className="header">Hedera Hackathon Dapp</h1>

			<div className="content-container">
				<a href={connectLinkSt} target={"_blank"} rel="noreferrer"></a>
				<p className="sub-text">{connectTextSt}</p>
				<button onClick={connectWallet} className="cta-button">
					Connect Wallet
				</button>

				{/* Add the Create DID button */}
				<button onClick={handleCreateDid} className="cta-button">
					Create DID
				</button>
				<p className="sub-text">{createTextSt}</p>
			</div>
		</div>
	);
}

export default App;
