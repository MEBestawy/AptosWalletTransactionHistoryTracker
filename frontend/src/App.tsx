import { Dispatch, SetStateAction, useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';


const fetchWalletData = async (walletAddress: string, 
  setErrorWithWalletAddress: { (value: SetStateAction<boolean>): void; (arg0: boolean): void; },
  setTransactionsData: Dispatch<SetStateAction<never[]>>) => {
    const {status, response:resp } = await fetch(
      `${process.env.REACT_APP_DATA_FETCH_API_ENDPOINT}/wallet/?` + new URLSearchParams({
        address: walletAddress
      }))
      .then(async res => { 
        console.log(res.status);
        return {status: res.status, response: await res.json()}
      });
    
    if (status !== 200) {
      setErrorWithWalletAddress(true);
      return;
    }

    setTransactionsData(resp)
};

const App = () => {

  const [ walletAddress, setWalletAddress ] = useState("");
  const [ errorWithWalletAddress, setErrorWithWalletAddress ] = useState(false);
  const [transactionsData, setTransactionsData] = useState([]);
  const [showTransactionsData, setShowTransactionsData] = useState(false);

  return (
    <>
      <h1>Demo of Service:</h1>

      <center>
        <div>
          <TextField
            label="Aptos Wallet Address..."
            value={walletAddress}
            onChange={(e) => {
              setErrorWithWalletAddress(false);
              setShowTransactionsData(false);
              setWalletAddress(e.target.value);
            }}
          />
          <br />
          <Button 
            variant="text"
            onClick={() => {
              setShowTransactionsData(true);
              fetchWalletData(walletAddress, setErrorWithWalletAddress, setTransactionsData)
            }}
          >
            Search
          </Button>
        </div>
        <br />
        {errorWithWalletAddress && <p>An error occurred while proccessing Wallet Address :/</p>}

      </center>
        <br />
        <pre>
          {showTransactionsData && JSON.stringify(transactionsData, null, 2)}
        </pre>
    </>
  );
}

export default App;
