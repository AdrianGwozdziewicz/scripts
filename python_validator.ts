import "brython"; // Importuje Brython z node_modules

export const validatePythonCode = (code: string): true | string => {
  if (typeof window.brython_run !== "function") {
    return "Brython nie został poprawnie załadowany.";
  }

  try {
    const validationScript = `
try:
    exec("""${code}""")
    result = "OK"
except Exception as e:
    result = str(e)
`;
    const result = window.brython_run(validationScript);
    return result === "OK" ? true : result;
  } catch (error) {
    return "Błąd walidacji: " + String(error);
  }
};




module.exports = function override(config, env) {
  config.module.rules.push({
    test: /brython\.js$/,
    use: "raw-loader",
  });

  return config;
};



 // Funkcja submit, która po pomyślnym zwalidowaniu kodu uruchamia go
  const onSubmit = (data: { code: string }) => {
    console.log('Wysłany kod:', data.code);

    // Uruchamiamy kod Pythona po zatwierdzeniu formularza
    const script = document.createElement('script');
    script.type = 'text/python';
    script.text = data.code;
    document.body.appendChild(script);
  };



import { FieldValues } from "react-hook-form";

// Funkcja walidująca kod Pythona
export const validatePythonCode = (value: string) => {
  try {
    // Tworzymy element <script> do osadzenia kodu Pythona
    const script = document.createElement('script');
    script.type = 'text/python';
    script.text = value;
    document.body.appendChild(script);

    // Jeżeli kod przejdzie bez błędów, zwróci prawdę
    return true;
  } catch (error) {
    // Zwracamy komunikat o błędzie, jeśli coś poszło nie tak
    return "Błąd składni Pythona!";
  }
};


export const validatePythonCode = async (pyodide: any, userCode: string): Promise<true | string> => {
  if (!pyodide) {
    return "Pyodide nie jest jeszcze załadowany.";
  }

  const wrappedCode = `
def on_event(input, data):
    ${userCode.replace(/\n/g, "\n    ")}  # Dodajemy wcięcie, żeby pasowało do funkcji

# Sprawdzamy, czy kod ma poprawną składnię
try:
    compile('''${wrappedCode}''', '<string>', 'exec')
    result = "OK"
except SyntaxError as e:
    result = str(e)
`;

  try {
    const result = await pyodide.runPythonAsync(wrappedCode);
    return result === "OK" ? true : `Błąd składni: ${result}`;
  } catch (error) {
    return `Błąd walidacji: ${String(error)}`;
  }
};
