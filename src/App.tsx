import "./App.css";
import Chain from "./components/Chain";
import { chain } from "./assets/chains";
import { ChainProvider } from "./components/ChainContext";

function App() {
  return (
    <>
      <ChainProvider correctChain={chain}>
        <Chain />
      </ChainProvider>
    </>
  );
}

export default App;
