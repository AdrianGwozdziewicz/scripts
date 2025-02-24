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
