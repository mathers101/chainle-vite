import "./App.css";
import Chain from "./components/Chain";
import { ChainProvider, type Guess } from "./components/ChainContext";
import { useEffect, useState } from "react";
import { getTodaysDate } from "./lib/time";
import { createClient } from "@supabase/supabase-js";
import { fetchFromLocalStorage } from "./lib/localStorage";
import { Spinner } from "./components/ui/spinner";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function App() {
  const today = getTodaysDate();
  const [chain, setChain] = useState<string[] | null>(null);
  const [savedData, setSavedData] = useState<Guess[] | null>(null);

  // to anybody reading this, I realize a useEffect is a ridiculous way to fetch data you need on a real app. This app is extremely simple and doesn't currently have other features that would call for bringing in React Query, etc.
  useEffect(() => {
    const saved = fetchFromLocalStorage();
    setSavedData(saved);
    getTodaysChain();
  }, []);

  const getTodaysChain = async () => {
    const { data } = await supabase.from("chains").select().eq("date", today).maybeSingle();
    setChain(data.chain);
  };

  return (
    <>
      {chain ? (
        <ChainProvider correctChain={chain} savedGuesses={savedData}>
          <Chain />
        </ChainProvider>
      ) : (
        <Spinner />
      )}
    </>
  );
}

export default App;
