"use client";

import { useState } from "react";

export const useAuthForm = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return {
    email,
    setEmail,
    userName,
    setUserName,
    password,
    setPassword,
  };
};
