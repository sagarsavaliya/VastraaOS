<x-mail::message>
# Welcome to Vastraa OS!

Hello {{ $user->name }},

Thank you for choosing Vastraa OS for your business, **{{ $tenant->business_name }}**.

We're excited to help you streamline your production and growth. To get started, please verify your email address by clicking the button below.

<x-mail::button :url="$url">
Verify Email Address
</x-mail::button>

If you did not create an account, no further action is required.

Best regards,<br>
The Vastraa OS Team
</x-mail::message>
