@extends('emails.layout')

@section('content')
    <h1 style="margin:0 0 12px;font-size:22px;color:#3B1C5A;">Welcome to Fastlink, {{ $userName ?? 'there' }}!</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        {{ $intro ?? 'Thanks for joining Fastlink Marketplace. Discover products from verified local and nationwide sellers across Nigeria.' }}
    </p>
    <p style="margin:0 0 8px;">
        <a href="{{ $ctaUrl ?? $frontendUrl.'/products' }}" style="display:inline-block;background:#7a3dbf;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:10px;">
            {{ $ctaLabel ?? 'Start shopping' }}
        </a>
    </p>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#64748b;">Happy shopping!</p>
@endsection
