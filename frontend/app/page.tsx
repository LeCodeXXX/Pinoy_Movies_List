"use client";

import {useEffect, useState} from "react";
import api from "./utils/api";
import DisplayMovies from "./components/DisplayMovies";

export default function Home() {
  const [data, setData] = useState(null);

   useEffect(() => {
    const getinfo = async () => {
      try {
        const response = await api("/");
        const data = await response.json();
        setData(data.message);
      }
      catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    void getinfo();
  }, []);


  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-red-500 selection:text-white">
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-2 py-4 sm:px-6 lg:px-8">
        {data && (
          <div className="mx-4 mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Backend API Status:</span> {data}
          </div>
        )}
        <DisplayMovies />
      </main>
    </div>
  );
}
