
function validateMultipleWrapperExpressions(input: string): boolean {
    // Wyrażenie regularne do wykrywania wielu $wrapper{...}
    const regex = /\$wrapper\{(.+?)\}/g;

    // Dopasowania do wzorca
    const matches = input.matchAll(regex);

    for (const match of matches) {
        const innerContent = match[1]; // Zawartość wewnątrz {...}

        // Jeśli dowolna zawartość wewnątrz jest nieprawidłowa, walidacja całego inputu nie przejdzie
        if (!validateInnerContent(innerContent)) {
            return false;
        }
    }

    // Jeśli przeszliśmy przez wszystkie wyrażenia bez błędów
    return true;
}

function validateInnerContent(content: string): boolean {
    // Przykładowa walidacja: sprawdź, czy zawartość składa się tylko z liter lub cyfr
    return /^[a-zA-Z0-9]+$/.test(content);
}

function isValidJsonPath(jsonPath) {
    const jsonPathRegex = /^\$([.\[][^.\[]+)*$/; // Basic JSONPath syntax

    // Ensure it matches the general JSONPath structure
    if (!jsonPathRegex.test(jsonPath)) {
        return false;
    }

    // Additional validation for filters
    const filterRegex = /\[\?\(.*?\)\]/g;
    const filters = jsonPath.match(filterRegex);

    if (filters) {
        for (const filter of filters) {
            try {
                // Evaluate filter syntax using `new Function`
                const condition = filter.slice(3, -2); // Extract the filter content
                new Function(`return ${condition.replace(/@/g, 'this')};`); // Validate syntax
            } catch {
                return false; // Invalid filter syntax
            }
        }
    }

    return true; // Valid JSONPath
}

// Example Usage
console.log(isValidJsonPath("$.store.book[?(@.price < 20)]")); // true
console.log(isValidJsonPath("$.store.book[?(@.price < )]"));   // false
console.log(isValidJsonPath("$.store.book[?(@.price &&)]"));   // false
console.log(isValidJsonPath("$.invalid[@"));                  // false
