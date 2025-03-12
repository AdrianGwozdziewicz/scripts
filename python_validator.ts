export const runPythonFunction = async (
  pyodide: any,
  userCode: string,
  input: any,
  data: any
): Promise<any> => {
  if (!pyodide) {
    return "Pyodide nie jest załadowany.";
  }

  // Offset: kod użytkownika zaczyna się od 2. linii w wrappedCode
  const userCodeOffset = 1; 

  // Opakowanie kodu użytkownika
  const wrappedCode = `def on_event(input, data):\n    ${userCode.replace(/\n/g, "\n    ")}`;

  try {
    pyodide.globals.set("wrappedCode", wrappedCode);
    pyodide.globals.set("input_data", input);
    pyodide.globals.set("event_data", data);
    pyodide.globals.set("userCodeOffset", userCodeOffset);

    await pyodide.runPythonAsync(`
import traceback

try:
    # Wykonanie kodu
    local_scope = {}
    exec(wrappedCode, {}, local_scope)

    # Pobranie funkcji on_event
    on_event_func = local_scope.get("on_event")
    if on_event_func is None:
        raise NameError("Funkcja on_event nie została zdefiniowana")

    # Uruchomienie kodu użytkownika
    execution_result = on_event_func(input_data, event_data)
except Exception as e:
    tb = traceback.format_exc().splitlines()
    
    # Szukamy linii, w której wystąpił błąd
    error_line = next((line for line in tb if "on_event" in line), None)
    if error_line:
        line_number = int(error_line.split("line ")[1].split(",")[0])
        corrected_lineno = line_number - userCodeOffset
        execution_result = f"Błąd w linii {corrected_lineno}: {str(e)}"
    else:
        execution_result = f"Błąd: {str(e)}"
`);

    return pyodide.globals.get("execution_result");
  } catch (error) {
    return `Błąd wykonania: ${String(error)}`;
  }
};
