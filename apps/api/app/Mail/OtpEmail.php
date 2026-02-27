<?php

namespace App\Mail;

use App\Models\Tenant;
use App\Models\TenantOtp;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public TenantOtp $otpRecord;
    public User $user;
    public Tenant $tenant;

    public function __construct(TenantOtp $otpRecord, User $user, Tenant $tenant)
    {
        $this->otpRecord = $otpRecord;
        $this->user      = $user;
        $this->tenant    = $tenant;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your VastraaOS Verification Code',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.otp',
            with: [
                'otp'       => $this->otpRecord->otp,
                'user'      => $this->user,
                'tenant'    => $this->tenant,
                'purpose'   => $this->otpRecord->purpose,
                'expiresAt' => $this->otpRecord->expires_at,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
