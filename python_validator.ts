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
