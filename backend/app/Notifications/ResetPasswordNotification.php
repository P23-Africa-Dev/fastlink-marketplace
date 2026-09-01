<?php

namespace App\Notifications;

use App\Mail\PlatformMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public string $token) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): PlatformMail
    {
        $frontend = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/');
        $url = $frontend.'/set-new-password?token='.urlencode($this->token).'&email='.urlencode($notifiable->getEmailForPasswordReset());

        return (new PlatformMail(
            'Reset your Fastlink password',
            'password-reset',
            [
                'heading' => 'Reset your password',
                'intro' => 'We received a request to reset the password for your Fastlink account. Click the button below to choose a new password. This link expires in 60 minutes.',
                'userName' => $notifiable->name ?? 'there',
                'ctaUrl' => $url,
                'ctaLabel' => 'Reset password',
                'outro' => 'If you did not request this, you can safely ignore this email.',
                'details' => [
                    'Email' => $notifiable->getEmailForPasswordReset(),
                ],
            ],
        ))->to($notifiable->getEmailForPasswordReset());
    }
}
