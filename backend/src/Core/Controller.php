<?php

declare(strict_types=1);

namespace App\Core;

abstract class Controller
{
    protected function validate(array $data, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $rule) {
            $parts = explode('|', $rule);

            foreach ($parts as $constraint) {
                if ($constraint === 'required' && empty($data[$field])) {
                    $errors[$field][] = "Le champ {$field} est requis.";
                }

                if (str_starts_with($constraint, 'min:')) {
                    $min = (int) substr($constraint, 4);
                    if (isset($data[$field]) && strlen((string) $data[$field]) < $min) {
                        $errors[$field][] = "Le champ {$field} doit contenir au moins {$min} caractères.";
                    }
                }

                if (str_starts_with($constraint, 'max:')) {
                    $max = (int) substr($constraint, 4);
                    if (isset($data[$field]) && strlen((string) $data[$field]) > $max) {
                        $errors[$field][] = "Le champ {$field} ne doit pas dépasser {$max} caractères.";
                    }
                }

                if ($constraint === 'email' && !filter_var($data[$field] ?? '', FILTER_VALIDATE_EMAIL)) {
                    $errors[$field][] = "Le champ {$field} doit être un email valide.";
                }
            }
        }

        return $errors;
    }
}
