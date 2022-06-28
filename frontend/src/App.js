import "./App.css";
import { useEffect, useState } from "react";
import idl from "./idl.json";
import {
  Connection,
  publicKey,
  clusterApiUrl,
  PublicKey,
} from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";
import { Buffer } from "buffer";
window.Buffer = Buffer;

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed", //you can choose when to recieve a confirmation of the transaction like you may choose to get a confirmation after only one node has oncfirmed your transaction or you may choose to recieve the confirmation when the whole network has confirmed the transactions
};
const { SystemProgram } = web3;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom Wallet Found");
          const response = await solana.connect({
            onlyIfTrusted: true,
          });
          console.log(
            "connected with the public key:",
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Please Intall Phantom Wallet");
      }
    } catch (error) {
      console.log("error occured:", error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log(
        "connected phantom wallet with the address:",
        response.publicKey.toString()
      );
      setWalletAddress(response.publicKey.toString());
    }
  };

  const getCampaigns = async () => {
    const provider = getProvider();
    const connection = new Connection(network, opts.preflightCommitment);
    const program = new Program(idl, programID, provider);
    Promise.all(
      (await connection.getProgramAccounts(programID)).map(
        async (campaign) => ({
          ...(await program.account.campaign.fetch(campaign.pubkey)),
          pubkey: campaign.pubkey,
        })
      )
    ).then((campaigns) => setCampaigns(campaigns));
  };

  const createCampaign = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const [campaign] = await PublicKey.findProgramAddress(
        [
          utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );
      await program.rpc.create("Campaign name", "Campaign description", {
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log("created a new campaign with address:", campaign.toString());
    } catch (error) {
      console.log("error occured", error);
    }
  };

  const renderWalletNotConnectedContainer = () => {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  };
  const renderWalletConnectedContainer = () => {
    return(
      <>
        <button onClick={createCampaign}>Create Campaign</button>
        <button onClick={getCampaigns}>Get all the campaigns</button>
        {campaigns.map((campaign)=>{
            return(
            <div>
              <p>{campaign.pubkey.toString()}</p>
              <p>{(campaign.amountDonated/web3.LAMPORTS_PER_SOL).toString()}</p>
              <p>{campaign.name}</p>
              <p>{campaign.description}</p>
              </div>)
          })}
      </>
    )
    
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className="app">
      {!walletAddress && renderWalletNotConnectedContainer()}
      {walletAddress && <div>your address is {walletAddress}</div>}
      {walletAddress && renderWalletConnectedContainer()}

    </div>
  );
};

export default App;
