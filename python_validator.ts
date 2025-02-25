// src/utils/pythonValidator.ts

// Definicja interfejsu Pyodide
export interface PyodideInterface {
  runPython: (code: string) => any;
}

// Typ zwracany przez funkcję walidatora: albo true, albo komunikat błędu.
export type ValidatorResult = true | string;

/**
 * Asynchroniczna funkcja walidatora kodu Python.
 * @param code - kod Pythona do walidacji.
 * @param pyodide - instancja Pyodide (powinna być już załadowana).
 * @returns Promise, które rozwiązuje się true, gdy kod jest poprawny lub komunikatem błędu.
 */
export const validatePythonCode = async (
  code: string,
  pyodide: PyodideInterface | null
): Promise<ValidatorResult> => {
  if (!pyodide) {
    return "Pyodide nie jest jeszcze załadowany.";
  }
  try {
    // Zabezpieczamy kod – np. zamieniając backslashe lub inne znaki
    const safeCode = code.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
    const validationScript = `
def validate():
    code = """${safeCode}"""
    try:
        compile(code, '<string>', 'exec')
        return "OK"
    except Exception as e:
        return f"Błąd: {e}"
result = validate()
result
    `;
    const result = pyodide.runPython(validationScript);
    if (result === "OK") {
      return true;
    }
    return String(result);
  } catch (error: any) {
    return "Błąd walidacji: " + String(error);
  }
};





import React, { useEffect, useState } from "react";
import { useForm, Controller, FieldError } from "react-hook-form";
import { validatePythonCode, PyodideInterface } from "../utils/pythonValidator";

// Deklaracja globalna dla TS
declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface FormValues {
  code: string;
}

const PythonValidatorForm: React.FC = () => {
  const { control, handleSubmit } = useForm<FormValues>({
    mode: "onChange",
  });
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [loadingPyodide, setLoadingPyodide] = useState<boolean>(true);

  useEffect(() => {
    const loadPyodideScript = () => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js";
      script.onload = async () => {
        if (!window.loadPyodide) {
          console.error("Brak window.loadPyodide");
          setLoadingPyodide(false);
          return;
        }
        try {
          const pyodideInstance = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.3/full/",
          });
          setPyodide(pyodideInstance);
          setLoadingPyodide(false);
        } catch (error) {
          console.error("Błąd ładowania Pyodide:", error);
          setLoadingPyodide(false);
        }
      };
      script.onerror = () => {
        console.error("Błąd ładowania skryptu Pyodide.");
        setLoadingPyodide(false);
      };
      document.body.appendChild(script);
    };

    loadPyodideScript();
  }, []);

  const onSubmit = (data: FormValues) => {
    alert("Kod przesłany:\n" + data.code);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>Formularz z walidacją kodu Python</h2>
      {loadingPyodide && <p>Ładowanie Pyodide...</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="code"
          control={control}
          defaultValue=""
          rules={{
            required: "Kod jest wymagany",
            // Używamy funkcji walidatora z osobnego pliku.
            validate: async (value) => await validatePythonCode(value, pyodide),
          }}
          render={({ field, fieldState }) => (
            <div>
              <textarea
                {...field}
                rows={10}
                cols={50}
                placeholder="Wpisz kod Python..."
                style={{ fontFamily: "monospace", fontSize: "14px" }}
              />
              {fieldState.error && (
                <p style={{ color: "red" }}>
                  {(fieldState.error as FieldError).message}
                </p>
              )}
            </div>
          )}
        />
        <button type="submit" disabled={loadingPyodide}>
          Wyślij kod
        </button>
      </form>
    </div>
  );
};

export default PythonValidatorForm;
