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

