
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
