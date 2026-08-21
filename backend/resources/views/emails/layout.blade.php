<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Fastlink Marketplace' }}</title>
</head>
<body style="margin:0;padding:0;background:#f3eafb;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3eafb;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ebd7fa;">
                    <tr>
                        <td style="background:#7a3dbf;padding:20px 28px;">
                            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">Fastlink Marketplace</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 28px 24px;border-top:1px solid #f1eafc;">
                            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                                You’re receiving this because of activity on your Fastlink account.
                                Manage notification preferences in your dashboard settings.
                            </p>
                            <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">
                                © {{ date('Y') }} Fastlink Marketplace
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
