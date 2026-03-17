import { useState } from "react";

export function useWelcome() {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      console.log("Name submitted:", name);
    }
  };

  return { name, setName, handleSubmit };
}