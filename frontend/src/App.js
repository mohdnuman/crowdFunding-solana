import './App.css';
import {useEffect, useState} from 'react';

const App=()=>{
  const [walletAddress, setWalletAddress]=useState(null);
  const checkIfWalletIsConnected=async()=>{
    try{
      const {solana}=window;
      if(solana){
        if(solana.isPhantom){
          console.log("Phantom Wallet Found");
          const response=await solana.connect({
            onlyIfTrusted: true
          });
          console.log("connected with the public key:",response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
      }else{
        alert("Please Intall Phantom Wallet")
      }
    }catch(error){
      console.log("error occured:",error);
    }
  };

  const connectWallet=async()=>{
    const {solana}=window;
    if(solana){
      const response=await solana.connect();
      console.log("connected phantom wallet with the address:",response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  }

  const renderWalletNotConnectedContainer=()=>{
    return <button onClick={connectWallet}>Connect Wallet</button>
  }

  useEffect(()=>{
    const onLoad=async()=>{
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load',onLoad);
    return ()=>window.removeEventListener('load',onLoad);
  },[])

  return <div className='app'>
    {!walletAddress && renderWalletNotConnectedContainer()}
    {walletAddress&& <div>your address is {walletAddress}</div>}

  </div>

};

export default App;
