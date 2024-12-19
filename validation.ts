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
