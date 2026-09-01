@extends('emails.layout')

@section('content')
    <h1 style="margin:0 0 12px;font-size:22px;color:#3B1C5A;">{{ $heading ?? $subject }}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">{{ $intro ?? $body ?? '' }}</p>
    @if(!empty($details) && is_array($details))
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#faf6ff;border-radius:12px;border:1px solid #ebd7fa;">
            @foreach($details as $label => $value)
                <tr>
                    <td style="padding:10px 14px;font-size:13px;color:#64748b;width:40%;">{{ $label }}</td>
                    <td style="padding:10px 14px;font-size:13px;color:#1e293b;font-weight:600;">{{ $value }}</td>
                </tr>
            @endforeach
        </table>
    @endif
    @if(!empty($ctaUrl) && !empty($ctaLabel))
        <p style="margin:0 0 8px;">
            <a href="{{ $ctaUrl }}" style="display:inline-block;background:#7a3dbf;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:10px;">
                {{ $ctaLabel }}
            </a>
        </p>
    @endif
    @if(!empty($outro))
        <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#64748b;">{{ $outro }}</p>
    @endif
@endsection
