<?php

declare(strict_types=1);

namespace App\Helpers;

use PHPMailer\PHPMailer\PHPMailer;
use RuntimeException;

class MailHelper
{
    private static function mailer(): PHPMailer
    {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host       = $_ENV['MAIL_HOST'] ?? 'localhost';
        $mail->SMTPAuth   = !empty($_ENV['MAIL_USERNAME']);
        $mail->Username   = $_ENV['MAIL_USERNAME'] ?? '';
        $mail->Password   = $_ENV['MAIL_PASSWORD'] ?? '';

        $encryption = strtolower($_ENV['MAIL_ENCRYPTION'] ?? 'tls');
        $mail->SMTPSecure = ($encryption === 'ssl')
            ? PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer::ENCRYPTION_STARTTLS;

        $mail->Port    = (int) ($_ENV['MAIL_PORT'] ?? 587);
        $mail->CharSet = 'UTF-8';

        // Support both MAIL_FROM_ADDRESS (existing .env.example) and MAIL_FROM
        $fromAddress = $_ENV['MAIL_FROM_ADDRESS'] ?? $_ENV['MAIL_FROM'] ?? 'noreply@localhost';
        $fromName    = $_ENV['MAIL_FROM_NAME'] ?? 'E-Commerce';

        $mail->setFrom($fromAddress, $fromName);

        return $mail;
    }

    public static function send(string $to, string $subject, string $htmlBody, string $altBody = ''): void
    {
        try {
            $mail = static::mailer();
            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->AltBody = $altBody !== '' ? $altBody : strip_tags($htmlBody);
            $mail->send();
        } catch (\Throwable $e) {
            throw new RuntimeException('Mail send failed: ' . $e->getMessage());
        }
    }

    public static function sendPasswordReset(string $to, string $name, string $resetUrl): void
    {
        $subject = 'Reset your password';
        $html    = <<<HTML
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h2>Password Reset Request</h2>
  <p>Hello {$name},</p>
  <p>We received a request to reset your password. Click the button below to set a new password:</p>
  <p style="margin:30px 0;">
    <a href="{$resetUrl}"
       style="background:#4f46e5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">
      Reset Password
    </a>
  </p>
  <p>This link will expire in <strong>1 hour</strong>.</p>
  <p>If you did not request a password reset, you can safely ignore this email.</p>
</body>
</html>
HTML;
        static::send($to, $subject, $html);
    }

    public static function sendEmailVerification(string $to, string $name, string $verifyUrl): void
    {
        $subject = 'Verify your email address';
        $html    = <<<HTML
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h2>Welcome, {$name}!</h2>
  <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
  <p style="margin:30px 0;">
    <a href="{$verifyUrl}"
       style="background:#4f46e5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">
      Verify Email
    </a>
  </p>
  <p>If you did not create an account, you can safely ignore this email.</p>
</body>
</html>
HTML;
        static::send($to, $subject, $html);
    }
}
