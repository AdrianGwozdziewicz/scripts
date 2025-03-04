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

  // Tworzymy kod funkcji Python z wcięciem
  const wrappedCode = `def on_event(input, data):\n    ${userCode.replace(/\n/g, "\n    ")}`;

  try {
    // Używamy 'exec' i przekazujemy kod jako argument, aby uniknąć interpolacji
    pyodide.globals.set("wrappedCode", wrappedCode);
    const result = await pyodide.runPythonAsync(`
try:
    compile(wrappedCode, '<string>', 'exec')
    result = "OK"
except SyntaxError as e:
    result = str(e)
`);

    return result === "OK" ? true : `Błąd składni: ${result}`;
  } catch (error) {
    return `Błąd walidacji: ${String(error)}`;
  }
};



export const validatePythonCode = async (pyodide: any, userCode: string): Promise<true | string> => {
  if (!pyodide) {
    return "Pyodide nie jest jeszcze załadowany.";
  }

  // Formatowanie kodu użytkownika z poprawnym wcięciem
  const wrappedCode = `def on_event(input, data):\n    ${userCode.replace(/\n/g, "\n    ")}`;

  try {
    // Przekazujemy kod do Pyodide
    pyodide.globals.set("wrappedCode", wrappedCode);

    // Uruchamiamy walidację składni i literówek
    await pyodide.runPythonAsync(`
import ast

try:
    # 1. Sprawdzenie składni
    compile(wrappedCode, '<string>', 'exec')

    # 2. Analiza AST - sprawdzenie niezadeklarowanych zmiennych
    tree = ast.parse(wrappedCode)
    names = {node.id for node in ast.walk(tree) if isinstance(node, ast.Name)}

    # 3. Wymuszenie wykonania bez kontekstu globalnego
    exec(wrappedCode, {}, {})

    validation_result = "OK"
except SyntaxError as e:
    validation_result = "Błąd składni: " + str(e)
except NameError as e:
    validation_result = "Błąd zmiennej (możliwa literówka): " + str(e)
except Exception as e:
    validation_result = "Błąd: " + str(e)
`);

    // Pobieramy wynik walidacji
    const result = pyodide.globals.get("validation_result");

    return result === "OK" ? true : result;
  } catch (error) {
    return `Błąd walidacji: ${String(error)}`;
  }
};
