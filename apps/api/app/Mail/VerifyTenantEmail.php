<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyTenantEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tenant;
    public $user;
    public $verificationUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($tenant, $user, $verificationUrl)
    {
        $this->tenant = $tenant;
        $this->user = $user;
        $this->verificationUrl = $verificationUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify your Vastraa OS Account',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.verify-tenant',
            with: [
                'tenant' => $this->tenant,
                'user' => $this->user,
                'url' => $this->verificationUrl,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
