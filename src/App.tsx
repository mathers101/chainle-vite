import "./App.css";
import Chain from "./components/Chain";
import { ChainProvider, type ChainState } from "./components/ChainContext";
import { useEffect, useState } from "react";
import { getTodaysDate } from "./lib/getToday";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function App() {
  const [chain, setChain] = useState<string[] | null>(null);
  const [savedData, setSavedData] = useState<ChainState | null>(null);

  useEffect(() => {
    getTodaysChain();
  }, []);

  const getTodaysChain = async () => {
    const today = getTodaysDate();
    const { data } = await supabase.from("chains").select().eq("date", today).maybeSingle();
    setChain(data.chain);
  };

  return (
    <>
      {chain ? (
        <ChainProvider correctChain={chain}>
          <Chain />
        </ChainProvider>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-gray-500">Loading today's chain...</div>
        </div>
      )}
    </>
  );
}

export default App;
