import "./App.css";
import { ChainProvider, type SaveData } from "./components/ChainContext";
import { useEffect, useState } from "react";
import { getTodaysDate } from "./lib/time";
import { createClient } from "@supabase/supabase-js";
import { fetchFromLocalStorage } from "./lib/localStorage";
import { Spinner } from "./components/ui/spinner";
import Game from "./components/Game";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function App() {
  const today = getTodaysDate();
  const [chain, setChain] = useState<string[] | null>(null);
  const [savedData, setSavedData] = useState<SaveData | null>(null);

  // to anybody reading this, I realize a useEffect is a ridiculous way to fetch data you need on a real app. This app is extremely simple and doesn't currently have other features that would call for bringing in React Query, etc.
  useEffect(() => {
    const saved = fetchFromLocalStorage();
    if (saved?.userGuesses && saved?.hints) {
      setSavedData(saved);
    }
    getTodaysChain();
  }, []);

  const getTodaysChain = async () => {
    const { data } = await supabase.from("chains").select().eq("date", today).maybeSingle();
    setChain(data.chain);
  };

  return (
    <div className="flex flex-col justify-center min-h-[90vh] pt-8 items-center">
      {/* <Spinner size="large" className="text-blue-300" /> */}
      {chain ? (
        <ChainProvider correctChain={chain} savedData={savedData}>
          <Game />
        </ChainProvider>
      ) : (
        <Spinner size="large" className="text-blue-300" />
      )}
    </div>
  );
}

export default App;
