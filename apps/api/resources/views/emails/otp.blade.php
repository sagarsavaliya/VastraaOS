<x-mail::message>
# {{ $purpose === 'login' ? 'Login Verification Code' : 'Verify Your Account' }}

Hello {{ $user->name }},

@if($purpose === 'registration')
Thank you for signing up **{{ $tenant->business_name }}** on Vastraa OS. Use the code below to verify your account.
@else
A login attempt was made for your **{{ $tenant->business_name }}** account. Use the code below to complete sign-in.
@endif

<x-mail::panel>
<div style="text-align: center; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #4f46e5; padding: 12px 0;">
{{ $otp }}
</div>
</x-mail::panel>

This code is valid for **10 minutes** and can only be used once.

> **Never share this code with anyone.** Vastraa OS will never ask for your OTP over call, chat, or email.

If you did not request this code, you can safely ignore this email.

Best regards,<br>
The Vastraa OS Team
</x-mail::message>
