import Skulpt from 'skulpt';

export const validatePythonWithSkulpt = (code: string): boolean => {
  try {
    // Try to run the code using Skulpt
    Skulpt.misceval.asyncToPromise(() => {
      return Skulpt.run(code); // Executes the code
    });
    return true; // No errors, code is valid
  } catch (error) {
    console.error('Python Syntax Error:', error);
    return false; // Syntax error
  }
};
