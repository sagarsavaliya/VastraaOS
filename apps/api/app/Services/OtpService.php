<?php

namespace App\Services;

use App\Mail\OtpEmail;
use App\Models\Tenant;
use App\Models\TenantOtp;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    /**
     * Generate a fresh OTP for a tenant+purpose, invalidating any prior unverified OTP.
     */
    public function generate(int $tenantId, ?int $userId, string $purpose): TenantOtp
    {
        // Invalidate existing unverified OTPs for this tenant+purpose
        TenantOtp::where('tenant_id', $tenantId)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->update(['verified_at' => now()]); // soft-close them

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        return TenantOtp::create([
            'tenant_id'    => $tenantId,
            'user_id'      => $userId,
            'purpose'      => $purpose,
            'otp'          => $code,
            'expires_at'   => now()->addMinutes(10),
            'attempts'     => 0,
            'resend_count' => 0,
        ]);
    }

    /**
     * Send OTP via email.
     */
    public function sendEmail(TenantOtp $otpRecord, User $user, Tenant $tenant): void
    {
        Mail::to($user->email)->send(new OtpEmail($otpRecord, $user, $tenant));
    }

    /**
     * Send OTP via SMS. Logs OTP when no SMS provider is configured.
     */
    public function sendSms(TenantOtp $otpRecord, string $mobile): void
    {
        $provider = env('SMS_PROVIDER');

        if (!$provider) {
            Log::info("[OtpService] SMS not configured. OTP for {$mobile}: {$otpRecord->otp}");
            return;
        }

        // Future: route to MSG91, Twilio, Fast2SMS drivers based on $provider
        Log::warning("[OtpService] SMS provider '{$provider}' is configured but driver is not yet implemented.");
    }

    /**
     * Verify an OTP. Returns true on success or a string error code.
     *
     * @return true|'not_found'|'expired'|'invalid'
     */
    public function verify(int $tenantId, string $purpose, string $code): bool|string
    {
        $record = TenantOtp::where('tenant_id', $tenantId)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (!$record) {
            return 'not_found';
        }

        if ($record->isExpired()) {
            return 'expired';
        }

        $record->increment('attempts');

        if ($record->otp !== $code) {
            return 'invalid';
        }

        $record->update(['verified_at' => now()]);

        return true;
    }

    /**
     * Resend OTP — generates a new code if resend limit not reached.
     *
     * @return TenantOtp|false  Returns new OTP record, or false if limit exhausted.
     */
    public function resend(int $tenantId, ?int $userId, string $purpose): TenantOtp|false
    {
        $existing = TenantOtp::where('tenant_id', $tenantId)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if ($existing && $existing->isExhausted()) {
            return false;
        }

        // Carry forward the current resend_count + 1 into a new OTP
        $resendCount = $existing ? $existing->resend_count + 1 : 0;

        // Invalidate previous OTPs
        TenantOtp::where('tenant_id', $tenantId)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->update(['verified_at' => now()]);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        return TenantOtp::create([
            'tenant_id'    => $tenantId,
            'user_id'      => $userId,
            'purpose'      => $purpose,
            'otp'          => $code,
            'expires_at'   => now()->addMinutes(10),
            'attempts'     => 0,
            'resend_count' => $resendCount,
        ]);
    }
}
