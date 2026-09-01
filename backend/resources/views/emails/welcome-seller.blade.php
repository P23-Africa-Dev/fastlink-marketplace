@extends('emails.layout')

@section('content')
    <h1 style="margin:0 0 12px;font-size:22px;color:#3B1C5A;">Welcome, seller!</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        {{ $intro ?? 'Your seller account is ready. Complete store onboarding and KYC so you can publish products and receive payouts.' }}
    </p>
    <ol style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.7;color:#475569;">
        <li>Finish store profile &amp; bank details</li>
        <li>Submit KYC for verification</li>
        <li>Add products (drafts are allowed while under review)</li>
        <li>Publish and start selling once approved</li>
    </ol>
    <p style="margin:0 0 8px;">
        <a href="{{ $ctaUrl ?? $frontendUrl.'/vendor/register' }}" style="display:inline-block;background:#7a3dbf;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:10px;">
            {{ $ctaLabel ?? 'Complete store setup' }}
        </a>
    </p>
@endsection
