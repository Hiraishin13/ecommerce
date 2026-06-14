<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;

class AdminUploadController extends Controller
{
    private const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private const MAX_SIZE     = 5 * 1024 * 1024; // 5 MB

    public function upload(Request $request, Response $response): void
    {
        if (empty($_FILES['file'])) {
            $response->error('No file provided.', 400);
            return;
        }

        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $response->error('Upload error code ' . $file['error'] . '.', 400);
            return;
        }

        if ($file['size'] > self::MAX_SIZE) {
            $response->error('File too large. Max 5 MB.', 422);
            return;
        }

        $mime = mime_content_type($file['tmp_name']);
        if (!in_array($mime, self::ALLOWED_MIME, true)) {
            $response->error('Invalid file type. Only JPEG, PNG, WebP, GIF allowed.', 422);
            return;
        }

        $ext = match ($mime) {
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
            default      => 'jpg',
        };

        $filename  = 'product_' . bin2hex(random_bytes(8)) . '.' . $ext;
        $uploadDir = __DIR__ . '/../../../public/uploads/products/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            $response->error('Failed to save file.', 500);
            return;
        }

        $response->success(['url' => '/uploads/products/' . $filename], 'Uploaded.');
    }

    public function destroy(Request $request, Response $response): void
    {
        $data     = $request->body();
        $url      = $data['url'] ?? '';
        $filename = basename((string) $url);

        if (!$filename || !preg_match('/^product_[a-f0-9]+\.(jpg|png|webp|gif)$/', $filename)) {
            $response->error('Invalid file reference.', 422);
            return;
        }

        $path = __DIR__ . '/../../../public/uploads/products/' . $filename;
        if (file_exists($path)) {
            unlink($path);
        }

        $response->success(null, 'Deleted.');
    }
}
