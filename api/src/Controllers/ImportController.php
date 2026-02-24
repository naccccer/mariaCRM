<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\CrmRepository;
use App\Services\AuditLogger;
use App\Support\Auth;
use App\Support\HttpException;
use App\Support\Request;

final class ImportController
{
    public function __construct(private readonly Request $request, private readonly CrmRepository $repository)
    {
    }

    public function contacts(): array
    {
        $user = Auth::requirePermission('contacts.write');
        $file = $this->request->file('file');

        if (!$file || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new HttpException('Valid CSV file is required', 422);
        }

        $rows = $this->readCsv((string) $file['tmp_name']);
        $result = $this->repository->importContacts($rows, (int) $user['id']);

        AuditLogger::log((int) $user['id'], 'import', null, 'contacts.import', $result);

        return [
            'status' => 200,
            'data' => $result,
        ];
    }

    private function readCsv(string $path): array
    {
        $handle = fopen($path, 'rb');
        if ($handle === false) {
            throw new HttpException('Cannot open CSV file', 422);
        }

        $headers = fgetcsv($handle);
        if (!$headers) {
            fclose($handle);
            return [];
        }

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($headers, $row);
        }
        fclose($handle);

        return $rows;
    }
}
