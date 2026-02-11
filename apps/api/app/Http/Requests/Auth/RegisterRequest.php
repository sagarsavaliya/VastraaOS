<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_name' => 'required|string|max:255',
            'display_name' => 'nullable|string|max:100',
            'subdomain' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                'unique:tenants,subdomain',
            ],
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'mobile' => 'nullable|string|max:15',
        ];
    }

    public function messages(): array
    {
        return [
            'subdomain.unique' => 'This subdomain is already taken.',
            'email.unique' => 'An account with this email already exists.',
        ];
    }
}
