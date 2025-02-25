import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import AceEditor from 'react-ace';
import { loadPyodide } from 'pyodide';  // Pyodide for Python 3 validation

// Python 3 validation function using Pyodide
export const validatePythonWithPyodide = async (code: string): Promise<boolean> => {
  try {
    // Load Pyodide and execute the code
    const pyodide = await loadPyodide();
    await pyodide.runPythonAsync(code);
    return true; // Python code is valid
  } catch (error) {
    console.error('Python 3 Syntax Error:', error);
    return false; // Syntax error detected
  }
};


import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPython: (code: string) => any;
  // inne metody, np. loadPackage, FS, itp.
}

function App() {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    // Wczytujemy skrypt Pyodide dopiero w momencie działania aplikacji
    const script = document.createElement("script");
    // Najnowszą wersję sprawdzisz w repo Pyodide. Poniżej przykładowa 0.23.3
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js";
    script.onload = async () => {
      if (!window.loadPyodide) {
        setResult("Nie można znaleźć window.loadPyodide");
        return;
      }
      try {
        const pyodideObj = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.3/full/",
        });
        setPyodide(pyodideObj);
      } catch (err) {
        setResult("Błąd ładowania Pyodide: " + String(err));
      }
    };
    document.body.appendChild(script);
  }, []);

  const runCode = () => {
    if (!pyodide) {
      setResult("Pyodide jeszcze się ładuje...");
      return;
    }
    try {
      const output = pyodide.runPython(`
def greet(name):
    return f"Hello, {name}!"

greet("React with TS")
`);
      setResult(String(output));
    } catch (error) {
      setResult("Błąd wykonania kodu: " + String(error));
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Pyodide w React + TypeScript + CRA</h1>
      {!pyodide ? (
        <p>Ładowanie Pyodide...</p>
      ) : (
        <button onClick={runCode}>Uruchom kod Pythona</button>
      )}
      <div style={{ marginTop: "1rem" }}>Wynik: {result}</div>
    </div>
  );
}

export default App;
