// src/app/page.tsx
"use client";

import React, { useEffect } from "react";

const Home = () => {

  const init = useInitHooks()
  useEffect(()=>{init()}, [])

  return (
    <main></main>
  );
}

const useInitHooks = ()=>{
  return async ()=>{}
}

export default Home