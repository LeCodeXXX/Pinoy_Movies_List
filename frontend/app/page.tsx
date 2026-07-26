"use client";

import {useEffect, useState} from "react";
import api from "./utils/api";

export default function Home() {
  const [data, setData] = useState(null);

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

   useEffect(() => {
    getinfo();
  }, []);


  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        Hello world, {data}
      </main>
    </div>
  );
}
