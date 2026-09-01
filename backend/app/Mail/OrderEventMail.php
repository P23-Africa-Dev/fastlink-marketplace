<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * @deprecated Use PlatformMail with a typed template instead.
 */
class OrderEventMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $mailSubject,
        public string $mailBody,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->mailSubject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.generic',
            with: [
                'subject' => $this->mailSubject,
                'heading' => $this->mailSubject,
                'intro' => $this->mailBody,
                'body' => $this->mailBody,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
            ],
        );
    }
}
