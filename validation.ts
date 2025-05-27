
const SIMPLE_REGEX = /^@\.([a-zA-Z0-9_.]+)(?:\s*(==|!=|<|>|<=|>=)\s*(?:"([^"\\]*?(?:\\.[^"\\]*)*)"|'([^'\\]*?(?:\\.[^'\\]*)*)'|true|false|null|\d+(?:\.\d+)?))?$/
/^@\.([a-zA-Z0-9_.]+)\s*(==|!=|<|>|<=|>=|in|nin)?\s*(null|true|false|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+(\.\d+)?|\[(?:\s*(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\d+(\.\d+)?|true|false|null)\s*,?)*\]))?$/;
  const regex = /^@\.([a-zA-Z0-9_.]+)\s*(==|!=|<|>|<=|>=|=~|in|nin|subsetof|anyof|noneof|size|empty)\s*(\('.*'\)|".*")$/;

const simpleFilterPattern = /^
  (?:size|empty)?\(?\s*
  (?:@(?:\.[\w]+)+|true|false|null|-?\d+(?:\.\d+)?|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*\)?
  \s*(==|!=|<|<=|>|>=|=~|in|nin|subsetof|anyof|noneof)\s*
  (\/.*?\/[gimsuy]*|true|false|null|-?\d+(?:\.\d+)?|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\[.*\])
$/;

const simpleFilterPattern = /^(?:(?:size|empty)?\(?\s*@(?:\.[\w]+)+\s*\)?|@(?:\.[\w]+)+|\d+(?:\.\d+)?|true|false|null|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")(?:\s*(==|!=|<|<=|>|>=|=~|in|nin|subsetof|anyof|noneof)\s*(\/.*?\/[gimsuy]*|true|false|null|-?\d+(?:\.\d+)?|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\[.*\]))?$/;

   const allowedFunctionPattern = /\.(sum|min|max|avg|stddev|length|keys|first|last|append|concat|index)(\([^()]*\))?$/;

// Dozwolone funkcje
const FUNC_NAMES = '(?:min|max|avg|stddev|length|sum|keys|concat|append|first|last|index)';

// Ścieżka JSONPath po znaku $
const JSON_PATH = '(?:\\.[a-zA-Z_][\\w]*)+';

// Argument funkcji (dowolny, bez nawiasów w środku)
const FUNC_ARG = '[^()]*';

// Finalny wzorzec
export const functionCallPattern = new RegExp(
  `^\\$(${JSON_PATH})\\.${FUNC_NAMES}\\s*\\(\\s*(${FUNC_ARG})\\s*\\)$`
);


/**
 *  Operand:
 *    1) funkcja z argumentem ścieżkowym, np. length(@.arr)
 *    2) ścieżka z metodą bez‑argumentową, np. @.arr.length()
 *    3) zwykła ścieżka @.a.b
 *    4) literały: liczby, true/false/null, string‑quoted
 */
const FUNC_NAMES        = '(?:size|empty|length|min|max|avg|stddev|sum|keys|first|last)';
const PATH              = '@(?:\\.[\\w]+)+';                    // @.foo.bar
const FUNC_PREFIX_CALL  = `${FUNC_NAMES}\\s*\\(\\s*${PATH}\\s*\\)`;               // length(@.arr)
const FUNC_SUFFIX_CALL  = `${PATH}\\.${FUNC_NAMES}\\s*\\(\\s*\\)`;                // @.arr.length()
const NUMBER            = '-?\\d+(?:\\.\\d+)?';
const STRING_SINGLE     = `'(?:[^'\\\\]|\\\\.)*'`;
const STRING_DOUBLE     = `"(?:[^"\\\\]|\\\\.)*"`;
const LITERAL           = `${NUMBER}|true|false|null|${STRING_SINGLE}|${STRING_DOUBLE}`;

const OPERAND           = `(?:${FUNC_PREFIX_CALL}|${FUNC_SUFFIX_CALL}|${PATH}|${LITERAL})`;

/**
 *  Operator i prawy operand
 */
const OPERATOR          = '==|!=|<|<=|>|>=|=~|in|nin|subsetof|anyof|noneof';
const REGEX_LITERAL     = '\\/.*?\\/[gimsuy]*';
const ARRAY_LITERAL     = '\\[.*?\\]';      // proste dopasowanie; nie rekurencyjne
const RIGHT_OPERAND     = `(?:${OPERAND}|${REGEX_LITERAL}|${ARRAY_LITERAL})`;

/**
 *  Końcowy wzorzec
 */
export const simpleFilterPattern = new RegExp(
  `^${OPERAND}(?:\\s*(?:${OPERATOR})\\s*${RIGHT_OPERAND})?$`
);


const isValidJsonPath = (jsonPath) => {
    // Enhanced regex for JSONPath structure including array indices and filters
    const jsonPathRegex = /^\$([.\[][^.\[]+)*$/; // Basic JSONPath syntax

    // Validate the general JSONPath structure
    if (!jsonPathRegex.test(jsonPath)) {
        return false;
    }

    // Additional validation for filters and array indices
    const arrayAndFilterRegex = /(\[\d+\])?(\[\?\(.*?\)\])?/g;
    const filters = jsonPath.match(arrayAndFilterRegex);

    if (filters) {
        for (const filter of filters) {
            // Check array index validity
            if (filter.startsWith('[') && filter.endsWith(']') && !filter.includes('?')) {
                if (!/^\[\d+\]$/.test(filter)) {
                    return false; // Invalid array index
                }
            }

            // Check filter syntax
            if (filter.includes('?')) {
                try {
                    const condition = filter.slice(3, -2); // Extract the filter content
                    new Function(`return ${condition.replace(/@/g, 'this')};`); // Validate syntax
                } catch {
                    return false; // Invalid filter syntax
                }
            }
        }
    }

    return true; // Valid JSONPath
};

// Example Usage
console.log(isValidJsonPath("$.input.array[0].[?(@.filter == true)]")); // true
console.log(isValidJsonPath("$.input.array[10].[?(@.filter && @.value)]")); // true
console.log(isValidJsonPath("$.input.array[?(@.filter == )]")); // false
console.log(isValidJsonPath("$.input.array[abc].[?(@.filter)]")); // false
console.log(isValidJsonPath("$.input.array[0].[?(@.filter == 'yes')]")); // true


export function hasBalancedBrackets(path: string): boolean {
  const stack: string[] = [];

  for (const char of path) {
    switch (char) {
      case '(':
      case '[':
        stack.push(char);
        break;
      case ')':
        if (stack.pop() !== '(') return false;
        break;
      case ']':
        if (stack.pop() !== '[') return false;
        break;
    }
  }

  return stack.length === 0;
}




const validateComplexFilter = (filter) => {
    // Step 1: Basic structure check (ensure it starts with ?(@ and ends with )).
    if (!filter.startsWith('?(@') || !filter.endsWith(')')) {
        return false; // Invalid structure
    }

    // Step 2: Strip the surrounding ?(@ and ) for easier processing
    let expression = filter.slice(3, -1).trim(); // remove "?(@" and ")"

    // Step 3: Recursively validate the sub-expressions
    return validateSubExpression(expression);
};

const validateSubExpression = (expression) => {
    // Step 4: Check if the expression contains logical operators (&& or ||).
    const logicalOperators = ['&&', '||'];

    // If the expression contains logical operators, we split it into sub-expressions
    if (containsLogicalOperator(expression, logicalOperators)) {
        return validateLogicalExpression(expression, logicalOperators);
    }

    // Otherwise, it's a simple filter expression, e.g., @.price < 10
    return validateSimpleExpression(expression);
};

const containsLogicalOperator = (expression, operators) => {
    // Check if any of the logical operators exist in the expression
    return operators.some(operator => expression.includes(operator));
};

const validateLogicalExpression = (expression, operators) => {
    // Split the expression by the logical operators (keep the operator in the result)
    for (const operator of operators) {
        const parts = splitByOperator(expression, operator);
        if (parts.length > 1) {
            // Recursively validate both parts
            return parts.every(part => validateSubExpression(part.trim()));
        }
    }
    return false; // If no valid operator was found
};

const splitByOperator = (expression, operator) => {
    // Split the expression by the operator, keeping the operator in the result
    let parts = [];
    let depth = 0;
    let currentPart = '';
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];

        // Handle parentheses to avoid splitting inside them
        if (char === '(') depth++;
        if (char === ')') depth--;

        // If we encounter an operator and we're not inside parentheses, split
        if (depth === 0 && expression.slice(i, i + operator.length) === operator) {
            parts.push(currentPart.trim());
            currentPart = '';
            i += operator.length - 1;
        } else {
            currentPart += char;
        }
    }
    if (currentPart.trim()) parts.push(currentPart.trim());
    return parts;
};

const validateSimpleExpression = (expression) => {
    // A basic regular expression to validate a simple filter expression like `@.price < 10`
    const simpleFilterPattern = /^@\.([a-zA-Z0-9_.]+)\s*(==|!=|<|>|<=|>=)\s*(("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|true|false|\d+(\.\d+)?))$/;
    return simpleFilterPattern.test(expression);
};

// Test cases

const validFilter1 = '[?(@.price < 10)]';
const validFilter2 = '[?(@.price == "apple" && @.quantity > 50)]';
const validFilter3 = '[?(@.name == "apple" || @.age > 20)]';
const validFilter4 = '[?(@.price < 10 && (@.quantity > 50 || @.type == "fruit") && @.name == "apple")]';
const invalidFilter1 = '[?(@.price < 10 && )]'; // Incomplete expression
const invalidFilter2 = '[?(@.price < 10 && @.name == )]'; // Missing value
const invalidFilter3 = '[?(@.price < 10 ||)]'; // Invalid filter syntax

console.log(validateComplexFilter(validFilter1)); // true
console.log(validateComplexFilter(validFilter2)); // true
console.log(validateComplexFilter(validFilter3)); // true
console.log(validateComplexFilter(validFilter4)); // true (valid nested logical conditions)
console.log(validateComplexFilter(invalidFilter1)); // false
console.log(validateComplexFilter(invalidFilter2)); // false
console.log(validateComplexFilter(invalidFilter3)); // false

