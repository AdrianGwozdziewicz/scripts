import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';

interface AutocompleteInputProps<T> {
  name: string;
  control: Control;
  options: T[];
  label: string;
  rules?: object; // Dodatkowe zasady walidacji
  optionLabelFn?: (option: T) => string; // Funkcja do generowania label
  optionValueFn?: (option: T) => string | number; // Funkcja do generowania value
  onChange?: (value: T | null) => void; // Funkcja do reagowania na zmianę
  freeSolo?: boolean; // Pozwala na wpisywanie własnych danych
}

function AutocompleteInput<T>({
  name,
  control,
  options,
  label,
  rules,
  optionLabelFn = (option) => String(option), // Domyślnie konwertujemy opcję na string
  optionValueFn = (option) => option, // Domyślnie traktujemy opcję jako wartość
  onChange, // Funkcja do obsługi zmiany
  freeSolo = false, // Domyślnie ustawiamy freeSolo na false
}: AutocompleteInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <Autocomplete
            {...field}
            options={options}
            freeSolo={freeSolo} // Umożliwia wpisywanie własnych danych
            getOptionLabel={(option) => optionLabelFn(option)} // Używamy funkcji do etykiety
            getOptionSelected={(option, value) => optionValueFn(option) === value} // Sprawdzamy, czy opcja jest wybrana
            onChange={(event, newValue) => {
              field.onChange(optionValueFn(newValue)); // Uaktualniamy wartość w formularzu
              if (onChange) {
                onChange(newValue); // Wywołujemy przekazaną funkcję onChange
              }
            }}
            value={options.find(option => optionValueFn(option) === field.value)} // Wartość wybrana przez użytkownika
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                variant="outlined"
                error={!!fieldState?.error}
                helperText={fieldState?.error?.message}
              />
            )}
          />
        </>
      )}
    />
  );
}

export default AutocompleteInput;
