<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlatformMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public string $mailSubject,
        public string $template,
        public array $data = [],
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->mailSubject,
            from: config('mail.from.address'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.'.$this->template,
            with: array_merge($this->data, [
                'subject' => $this->mailSubject,
                'appName' => config('app.name', 'Fastlink Marketplace'),
                'frontendUrl' => rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/'),
            ]),
        );
    }
}
