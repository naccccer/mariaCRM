<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Database;
use App\Support\HttpException;
use PDO;
use Throwable;

final class CrmRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    public function listUsers(): array
    {
        $sql = 'SELECT u.id, u.full_name, u.email, u.is_active, u.created_at,
                GROUP_CONCAT(DISTINCT r.code ORDER BY r.id SEPARATOR ",") AS role_codes
                FROM users u
                LEFT JOIN user_roles ur ON ur.user_id = u.id
                LEFT JOIN roles r ON r.id = ur.role_id
                WHERE u.deleted_at IS NULL
                GROUP BY u.id
                ORDER BY u.created_at DESC';

        $rows = $this->pdo->query($sql)->fetchAll();

        return array_map(static function (array $row): array {
            return [
                'id' => (int) $row['id'],
                'full_name' => $row['full_name'],
                'email' => $row['email'],
                'is_active' => (int) $row['is_active'] === 1,
                'created_at' => $row['created_at'],
                'role_codes' => $row['role_codes'] ? explode(',', $row['role_codes']) : [],
            ];
        }, $rows);
    }

    public function listRoles(): array
    {
        return $this->pdo->query('SELECT id, name, code FROM roles ORDER BY id')->fetchAll();
    }

    public function createUser(array $data, int $actorId): int
    {
        $stmt = $this->pdo->prepare('INSERT INTO users (full_name, email, password_hash, is_active, created_at, updated_at) VALUES (:full_name, :email, :password_hash, :is_active, UTC_TIMESTAMP(), UTC_TIMESTAMP())');
        $stmt->execute([
            ':full_name' => trim((string) ($data['full_name'] ?? '')),
            ':email' => mb_strtolower(trim((string) ($data['email'] ?? ''))),
            ':password_hash' => password_hash((string) $data['password'], PASSWORD_DEFAULT),
            ':is_active' => !empty($data['is_active']) ? 1 : 0,
        ]);

        $userId = (int) $this->pdo->lastInsertId();
        $this->replaceUserRoles($userId, $data['role_ids'] ?? []);

        return $userId;
    }

    public function updateUser(int $id, array $data): void
    {
        $fields = [];
        $params = [':id' => $id];

        if (array_key_exists('full_name', $data)) {
            $fields[] = 'full_name = :full_name';
            $params[':full_name'] = trim((string) $data['full_name']);
        }

        if (array_key_exists('email', $data)) {
            $fields[] = 'email = :email';
            $params[':email'] = mb_strtolower(trim((string) $data['email']));
        }

        if (array_key_exists('is_active', $data)) {
            $fields[] = 'is_active = :is_active';
            $params[':is_active'] = !empty($data['is_active']) ? 1 : 0;
        }

        if (!empty($data['password'])) {
            $fields[] = 'password_hash = :password_hash';
            $params[':password_hash'] = password_hash((string) $data['password'], PASSWORD_DEFAULT);
        }

        if ($fields !== []) {
            $sql = 'UPDATE users SET ' . implode(', ', $fields) . ', updated_at = UTC_TIMESTAMP() WHERE id = :id';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
        }

        if (array_key_exists('role_ids', $data)) {
            $this->replaceUserRoles($id, is_array($data['role_ids']) ? $data['role_ids'] : []);
        }
    }

    public function listLeads(array $filters): array
    {
        $sql = 'SELECT l.id, l.full_name, l.phone, l.status, l.budget, l.interest, l.created_at,
                u.full_name AS owner_name
                FROM leads l
                LEFT JOIN users u ON u.id = l.owner_id
                WHERE l.deleted_at IS NULL';

        $params = [];

        if (!empty($filters['search'])) {
            $sql .= ' AND (l.full_name LIKE :search OR l.phone LIKE :search)';
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['status'])) {
            $sql .= ' AND l.status = :status';
            $params[':status'] = $filters['status'];
        }

        $sql .= ' ORDER BY l.created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function createLead(array $data, int $actorId): int
    {
        $ownerId = !empty($data['owner_id']) ? (int) $data['owner_id'] : $actorId;

        $stmt = $this->pdo->prepare('INSERT INTO leads (full_name, phone, email, source, status, budget, interest, owner_id, created_at, updated_at)
                VALUES (:full_name, :phone, :email, :source, :status, :budget, :interest, :owner_id, UTC_TIMESTAMP(), UTC_TIMESTAMP())');

        $stmt->execute([
            ':full_name' => trim((string) $data['full_name']),
            ':phone' => trim((string) $data['phone']),
            ':email' => !empty($data['email']) ? mb_strtolower(trim((string) $data['email'])) : null,
            ':source' => trim((string) ($data['source'] ?? 'manual')),
            ':status' => trim((string) ($data['status'] ?? 'new')),
            ':budget' => $data['budget'] ?? null,
            ':interest' => $data['interest'] ?? null,
            ':owner_id' => $ownerId,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function updateLead(int $id, array $data): void
    {
        $allowed = ['full_name', 'phone', 'email', 'source', 'status', 'budget', 'interest', 'owner_id'];
        $this->patchEntity('leads', $id, $allowed, $data);
    }

    public function convertLead(int $leadId, int $actorId): array
    {
        $lead = $this->getLead($leadId);
        if (!$lead) {
            throw new HttpException('Lead not found', 404);
        }

        $this->pdo->beginTransaction();

        try {
            $contactStmt = $this->pdo->prepare('INSERT INTO contacts (full_name, phone, email, type, budget, interest, status, owner_id, lead_id, created_at, updated_at)
                    VALUES (:full_name, :phone, :email, :type, :budget, :interest, :status, :owner_id, :lead_id, UTC_TIMESTAMP(), UTC_TIMESTAMP())');
            $contactStmt->execute([
                ':full_name' => $lead['full_name'],
                ':phone' => $lead['phone'],
                ':email' => $lead['email'],
                ':type' => 'lead_converted',
                ':budget' => $lead['budget'],
                ':interest' => $lead['interest'],
                ':status' => 'active',
                ':owner_id' => (int) $lead['owner_id'],
                ':lead_id' => $leadId,
            ]);

            $contactId = (int) $this->pdo->lastInsertId();
            $stageId = $this->resolveDefaultStageId();

            $dealStmt = $this->pdo->prepare('INSERT INTO deals (title, contact_id, amount, status, stage_id, owner_id, expected_close_at, created_at, updated_at)
                    VALUES (:title, :contact_id, :amount, :status, :stage_id, :owner_id, :expected_close_at, UTC_TIMESTAMP(), UTC_TIMESTAMP())');
            $dealStmt->execute([
                ':title' => 'Opportunity - ' . $lead['full_name'],
                ':contact_id' => $contactId,
                ':amount' => $lead['budget'] ?: 0,
                ':status' => 'open',
                ':stage_id' => $stageId,
                ':owner_id' => (int) $lead['owner_id'],
                ':expected_close_at' => null,
            ]);

            $dealId = (int) $this->pdo->lastInsertId();

            $historyStmt = $this->pdo->prepare('INSERT INTO deal_stage_history (deal_id, from_stage_id, to_stage_id, moved_by, moved_at) VALUES (:deal_id, NULL, :to_stage_id, :moved_by, UTC_TIMESTAMP())');
            $historyStmt->execute([
                ':deal_id' => $dealId,
                ':to_stage_id' => $stageId,
                ':moved_by' => $actorId,
            ]);

            $leadStmt = $this->pdo->prepare('UPDATE leads SET status = :status, updated_at = UTC_TIMESTAMP() WHERE id = :id');
            $leadStmt->execute([
                ':status' => 'converted',
                ':id' => $leadId,
            ]);

            $this->pdo->commit();

            return ['contact_id' => $contactId, 'deal_id' => $dealId];
        } catch (Throwable $exception) {
            $this->pdo->rollBack();
            throw $exception;
        }
    }

    public function listContacts(array $filters): array
    {
        $sql = 'SELECT c.id, c.full_name AS name, c.phone, c.type, c.budget, c.interest, c.status, c.created_at,
                u.full_name AS agent,
                d.id AS deal_id,
                ps.name AS pipeline_stage,
                ps.position AS pipeline_position
                FROM contacts c
                LEFT JOIN users u ON u.id = c.owner_id
                LEFT JOIN deals d ON d.contact_id = c.id AND d.deleted_at IS NULL
                LEFT JOIN pipeline_stages ps ON ps.id = d.stage_id
                WHERE c.deleted_at IS NULL';

        $params = [];

        if (!empty($filters['search'])) {
            $sql .= ' AND (c.full_name LIKE :search OR c.phone LIKE :search)';
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $sql .= ' ORDER BY c.created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function getContact(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT c.id, c.full_name AS name, c.phone, c.email, c.type, c.budget, c.interest, c.status, c.created_at,
                u.full_name AS agent
                FROM contacts c
                LEFT JOIN users u ON u.id = c.owner_id
                WHERE c.id = :id AND c.deleted_at IS NULL
                LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    public function createContact(array $data, int $actorId): int
    {
        $stmt = $this->pdo->prepare('INSERT INTO contacts (full_name, phone, email, type, budget, interest, status, owner_id, created_at, updated_at)
            VALUES (:full_name, :phone, :email, :type, :budget, :interest, :status, :owner_id, UTC_TIMESTAMP(), UTC_TIMESTAMP())');
        $stmt->execute([
            ':full_name' => trim((string) $data['full_name']),
            ':phone' => trim((string) $data['phone']),
            ':email' => !empty($data['email']) ? mb_strtolower(trim((string) $data['email'])) : null,
            ':type' => (string) ($data['type'] ?? 'buyer'),
            ':budget' => $data['budget'] ?? null,
            ':interest' => $data['interest'] ?? null,
            ':status' => (string) ($data['status'] ?? 'active'),
            ':owner_id' => !empty($data['owner_id']) ? (int) $data['owner_id'] : $actorId,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function updateContact(int $id, array $data): void
    {
        $allowed = ['full_name', 'phone', 'email', 'type', 'budget', 'interest', 'status', 'owner_id'];
        $this->patchEntity('contacts', $id, $allowed, $data);
    }

    public function getContactTimeline(int $contactId): array
    {
        $activitiesStmt = $this->pdo->prepare('SELECT id, title, description AS text, due_at AS happened_at, status, "activity" AS item_type
                FROM activities
                WHERE contact_id = :contact_id AND deleted_at IS NULL');
        $activitiesStmt->execute([':contact_id' => $contactId]);
        $activities = $activitiesStmt->fetchAll();

        $notesStmt = $this->pdo->prepare('SELECT id, body AS text, created_at AS happened_at, "note" AS item_type
                FROM notes
                WHERE contact_id = :contact_id AND deleted_at IS NULL');
        $notesStmt->execute([':contact_id' => $contactId]);
        $notes = $notesStmt->fetchAll();

        $historyStmt = $this->pdo->prepare('SELECT dsh.id,
                CONCAT("Stage moved to ", ps_to.name) AS text,
                dsh.moved_at AS happened_at,
                "deal_stage" AS item_type
                FROM deal_stage_history dsh
                INNER JOIN deals d ON d.id = dsh.deal_id
                INNER JOIN pipeline_stages ps_to ON ps_to.id = dsh.to_stage_id
                WHERE d.contact_id = :contact_id
                ORDER BY dsh.moved_at DESC');
        $historyStmt->execute([':contact_id' => $contactId]);
        $history = $historyStmt->fetchAll();

        $timeline = array_merge($activities, $notes, $history);
        usort($timeline, static fn(array $a, array $b): int => strcmp((string) ($b['happened_at'] ?? ''), (string) ($a['happened_at'] ?? '')));

        return $timeline;
    }

    public function listDeals(array $filters): array
    {
        $sql = 'SELECT d.id, d.title, d.amount, d.status, d.expected_close_at, d.created_at,
                c.full_name AS contact_name,
                u.full_name AS owner_name,
                ps.id AS stage_id,
                ps.name AS stage_name,
                ps.position AS stage_position
                FROM deals d
                INNER JOIN contacts c ON c.id = d.contact_id
                LEFT JOIN users u ON u.id = d.owner_id
                LEFT JOIN pipeline_stages ps ON ps.id = d.stage_id
                WHERE d.deleted_at IS NULL';

        $params = [];
        if (!empty($filters['pipeline_id'])) {
            $sql .= ' AND ps.pipeline_id = :pipeline_id';
            $params[':pipeline_id'] = (int) $filters['pipeline_id'];
        }

        if (!empty($filters['status'])) {
            $sql .= ' AND d.status = :status';
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['contact_id'])) {
            $sql .= ' AND d.contact_id = :contact_id';
            $params[':contact_id'] = (int) $filters['contact_id'];
        }

        $sql .= ' ORDER BY ps.position ASC, d.created_at DESC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function listPipelineStages(): array
    {
        return $this->pdo->query('SELECT id, pipeline_id, name, position FROM pipeline_stages ORDER BY position ASC')->fetchAll();
    }

    public function createDeal(array $data, int $actorId): int
    {
        $stageId = !empty($data['stage_id']) ? (int) $data['stage_id'] : $this->resolveDefaultStageId();
        $stmt = $this->pdo->prepare('INSERT INTO deals (title, contact_id, amount, status, stage_id, owner_id, expected_close_at, created_at, updated_at)
            VALUES (:title, :contact_id, :amount, :status, :stage_id, :owner_id, :expected_close_at, UTC_TIMESTAMP(), UTC_TIMESTAMP())');
        $stmt->execute([
            ':title' => (string) $data['title'],
            ':contact_id' => (int) $data['contact_id'],
            ':amount' => (float) ($data['amount'] ?? 0),
            ':status' => (string) ($data['status'] ?? 'open'),
            ':stage_id' => $stageId,
            ':owner_id' => !empty($data['owner_id']) ? (int) $data['owner_id'] : $actorId,
            ':expected_close_at' => $data['expected_close_at'] ?? null,
        ]);

        $dealId = (int) $this->pdo->lastInsertId();
        $historyStmt = $this->pdo->prepare('INSERT INTO deal_stage_history (deal_id, from_stage_id, to_stage_id, moved_by, moved_at) VALUES (:deal_id, NULL, :to_stage_id, :moved_by, UTC_TIMESTAMP())');
        $historyStmt->execute([
            ':deal_id' => $dealId,
            ':to_stage_id' => $stageId,
            ':moved_by' => $actorId,
        ]);

        return $dealId;
    }

    public function updateDeal(int $id, array $data): void
    {
        $allowed = ['title', 'contact_id', 'amount', 'status', 'stage_id', 'owner_id', 'expected_close_at'];
        $this->patchEntity('deals', $id, $allowed, $data);
    }

    public function moveDealStage(int $dealId, int $toStageId, int $actorId): void
    {
        $dealStmt = $this->pdo->prepare('SELECT id, stage_id FROM deals WHERE id = :id AND deleted_at IS NULL LIMIT 1');
        $dealStmt->execute([':id' => $dealId]);
        $deal = $dealStmt->fetch();
        if (!$deal) {
            throw new HttpException('Deal not found', 404);
        }

        $fromStageId = $deal['stage_id'] ? (int) $deal['stage_id'] : null;

        $this->pdo->beginTransaction();
        try {
            $updateStmt = $this->pdo->prepare('UPDATE deals SET stage_id = :stage_id, updated_at = UTC_TIMESTAMP() WHERE id = :id');
            $updateStmt->execute([
                ':stage_id' => $toStageId,
                ':id' => $dealId,
            ]);

            $historyStmt = $this->pdo->prepare('INSERT INTO deal_stage_history (deal_id, from_stage_id, to_stage_id, moved_by, moved_at)
                VALUES (:deal_id, :from_stage_id, :to_stage_id, :moved_by, UTC_TIMESTAMP())');
            $historyStmt->execute([
                ':deal_id' => $dealId,
                ':from_stage_id' => $fromStageId,
                ':to_stage_id' => $toStageId,
                ':moved_by' => $actorId,
            ]);

            $this->pdo->commit();
        } catch (Throwable $exception) {
            $this->pdo->rollBack();
            throw $exception;
        }
    }

    public function listActivities(array $filters): array
    {
        $sql = 'SELECT a.id, a.title, a.description AS description, a.due_at, a.status, a.type,
                c.id AS contact_id, c.full_name AS client,
                u.full_name AS agent
                FROM activities a
                LEFT JOIN contacts c ON c.id = a.contact_id
                LEFT JOIN users u ON u.id = a.owner_id
                WHERE a.deleted_at IS NULL';

        $params = [];
        if (!empty($filters['status'])) {
            $sql .= ' AND a.status = :status';
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['contact_id'])) {
            $sql .= ' AND a.contact_id = :contact_id';
            $params[':contact_id'] = (int) $filters['contact_id'];
        }

        $sql .= ' ORDER BY a.due_at ASC, a.created_at DESC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function createActivity(array $data, int $actorId): int
    {
        $stmt = $this->pdo->prepare('INSERT INTO activities (contact_id, title, description, due_at, status, type, owner_id, created_at, updated_at)
                VALUES (:contact_id, :title, :description, :due_at, :status, :type, :owner_id, UTC_TIMESTAMP(), UTC_TIMESTAMP())');

        $stmt->execute([
            ':contact_id' => !empty($data['contact_id']) ? (int) $data['contact_id'] : null,
            ':title' => (string) $data['title'],
            ':description' => $data['description'] ?? null,
            ':due_at' => $data['due_at'] ?? null,
            ':status' => (string) ($data['status'] ?? 'todo'),
            ':type' => (string) ($data['type'] ?? 'follow_up'),
            ':owner_id' => !empty($data['owner_id']) ? (int) $data['owner_id'] : $actorId,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function updateActivity(int $id, array $data): void
    {
        $allowed = ['contact_id', 'title', 'description', 'due_at', 'status', 'type', 'owner_id'];
        $this->patchEntity('activities', $id, $allowed, $data);
    }

    public function completeActivity(int $id): void
    {
        $stmt = $this->pdo->prepare('UPDATE activities SET status = :status, completed_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP() WHERE id = :id AND deleted_at IS NULL');
        $stmt->execute([
            ':status' => 'done',
            ':id' => $id,
        ]);
    }

    public function listTickets(array $filters): array
    {
        $sql = 'SELECT t.id, t.subject, t.priority, t.status, t.sla_due_at, t.created_at,
                c.full_name AS contact_name,
                u.full_name AS assignee_name
                FROM tickets t
                LEFT JOIN contacts c ON c.id = t.contact_id
                LEFT JOIN users u ON u.id = t.assignee_id
                WHERE t.deleted_at IS NULL';

        $params = [];
        if (!empty($filters['status'])) {
            $sql .= ' AND t.status = :status';
            $params[':status'] = $filters['status'];
        }

        $sql .= ' ORDER BY t.created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function createTicket(array $data, int $actorId): int
    {
        $stmt = $this->pdo->prepare('INSERT INTO tickets (contact_id, subject, description, priority, status, assignee_id, sla_due_at, created_by, created_at, updated_at)
            VALUES (:contact_id, :subject, :description, :priority, :status, :assignee_id, :sla_due_at, :created_by, UTC_TIMESTAMP(), UTC_TIMESTAMP())');
        $stmt->execute([
            ':contact_id' => !empty($data['contact_id']) ? (int) $data['contact_id'] : null,
            ':subject' => (string) $data['subject'],
            ':description' => $data['description'] ?? null,
            ':priority' => (string) ($data['priority'] ?? 'normal'),
            ':status' => (string) ($data['status'] ?? 'open'),
            ':assignee_id' => !empty($data['assignee_id']) ? (int) $data['assignee_id'] : null,
            ':sla_due_at' => $data['sla_due_at'] ?? null,
            ':created_by' => $actorId,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function updateTicket(int $id, array $data): void
    {
        $allowed = ['subject', 'description', 'priority', 'status', 'assignee_id', 'sla_due_at'];
        $this->patchEntity('tickets', $id, $allowed, $data);
    }

    public function addTicketComment(int $ticketId, int $userId, string $body): int
    {
        $stmt = $this->pdo->prepare('INSERT INTO ticket_comments (ticket_id, user_id, body, created_at) VALUES (:ticket_id, :user_id, :body, UTC_TIMESTAMP())');
        $stmt->execute([
            ':ticket_id' => $ticketId,
            ':user_id' => $userId,
            ':body' => $body,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function listProjects(array $filters): array
    {
        $sql = 'SELECT id, name, location, type, total_units, available_units, progress, base_price, status, created_at
                FROM projects
                WHERE deleted_at IS NULL';
        $params = [];

        if (!empty($filters['search'])) {
            $sql .= ' AND (name LIKE :search OR location LIKE :search)';
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $sql .= ' ORDER BY created_at DESC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function createProject(array $data): int
    {
        $stmt = $this->pdo->prepare('INSERT INTO projects (name, location, type, total_units, available_units, progress, base_price, status, created_at, updated_at)
            VALUES (:name, :location, :type, :total_units, :available_units, :progress, :base_price, :status, UTC_TIMESTAMP(), UTC_TIMESTAMP())');
        $stmt->execute([
            ':name' => (string) $data['name'],
            ':location' => $data['location'] ?? null,
            ':type' => $data['type'] ?? null,
            ':total_units' => (int) ($data['total_units'] ?? 0),
            ':available_units' => (int) ($data['available_units'] ?? 0),
            ':progress' => (int) ($data['progress'] ?? 0),
            ':base_price' => $data['base_price'] ?? null,
            ':status' => (string) ($data['status'] ?? 'planning'),
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function updateProject(int $id, array $data): void
    {
        $allowed = ['name', 'location', 'type', 'total_units', 'available_units', 'progress', 'base_price', 'status'];
        $this->patchEntity('projects', $id, $allowed, $data);
    }

    public function reportKpi(): array
    {
        $totals = $this->pdo->query('SELECT
            (SELECT COUNT(*) FROM contacts WHERE deleted_at IS NULL) AS total_contacts,
            (SELECT COUNT(*) FROM deals WHERE deleted_at IS NULL AND status = "open") AS open_deals,
            (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) AS total_projects,
            (SELECT COUNT(*) FROM activities WHERE deleted_at IS NULL AND status = "done") AS completed_activities')->fetch();

        return [
            'total_contacts' => (int) ($totals['total_contacts'] ?? 0),
            'open_deals' => (int) ($totals['open_deals'] ?? 0),
            'total_projects' => (int) ($totals['total_projects'] ?? 0),
            'completed_activities' => (int) ($totals['completed_activities'] ?? 0),
        ];
    }

    public function reportPipeline(): array
    {
        $sql = 'SELECT ps.id, ps.name, ps.position, COUNT(d.id) AS deals_count
                FROM pipeline_stages ps
                LEFT JOIN deals d ON d.stage_id = ps.id AND d.deleted_at IS NULL
                GROUP BY ps.id
                ORDER BY ps.position ASC';

        $rows = $this->pdo->query($sql)->fetchAll();

        return array_map(static fn(array $row): array => [
            'stage_id' => (int) $row['id'],
            'stage_name' => $row['name'],
            'position' => (int) $row['position'],
            'deals_count' => (int) $row['deals_count'],
        ], $rows);
    }

    public function reportUsers(): array
    {
        $sql = 'SELECT u.id, u.full_name,
                COUNT(DISTINCT d.id) AS deals_count,
                COUNT(DISTINCT a.id) AS activities_count,
                COUNT(DISTINCT t.id) AS tickets_count
                FROM users u
                LEFT JOIN deals d ON d.owner_id = u.id AND d.deleted_at IS NULL
                LEFT JOIN activities a ON a.owner_id = u.id AND a.deleted_at IS NULL
                LEFT JOIN tickets t ON t.assignee_id = u.id AND t.deleted_at IS NULL
                WHERE u.deleted_at IS NULL
                GROUP BY u.id
                ORDER BY u.full_name ASC';

        $rows = $this->pdo->query($sql)->fetchAll();

        return array_map(static fn(array $row): array => [
            'user_id' => (int) $row['id'],
            'full_name' => $row['full_name'],
            'deals_count' => (int) $row['deals_count'],
            'activities_count' => (int) $row['activities_count'],
            'tickets_count' => (int) $row['tickets_count'],
        ], $rows);
    }

    public function importContacts(array $rows, int $actorId): array
    {
        $inserted = 0;
        $errors = [];

        $stmt = $this->pdo->prepare('INSERT INTO contacts (full_name, phone, email, type, budget, interest, status, owner_id, created_at, updated_at)
            VALUES (:full_name, :phone, :email, :type, :budget, :interest, :status, :owner_id, UTC_TIMESTAMP(), UTC_TIMESTAMP())');

        foreach ($rows as $index => $row) {
            $fullName = trim((string) ($row['full_name'] ?? $row['name'] ?? ''));
            $phone = trim((string) ($row['phone'] ?? ''));

            if ($fullName === '' || $phone === '') {
                $errors[] = [
                    'row' => $index + 1,
                    'message' => 'full_name and phone are required',
                ];
                continue;
            }

            $stmt->execute([
                ':full_name' => $fullName,
                ':phone' => $phone,
                ':email' => !empty($row['email']) ? mb_strtolower(trim((string) $row['email'])) : null,
                ':type' => (string) ($row['type'] ?? 'buyer'),
                ':budget' => $row['budget'] ?? null,
                ':interest' => $row['interest'] ?? null,
                ':status' => (string) ($row['status'] ?? 'active'),
                ':owner_id' => $actorId,
            ]);

            $inserted++;
        }

        return [
            'inserted' => $inserted,
            'failed' => count($errors),
            'errors' => $errors,
        ];
    }

    private function patchEntity(string $table, int $id, array $allowedColumns, array $data): void
    {
        $set = [];
        $params = [':id' => $id];

        foreach ($allowedColumns as $column) {
            if (!array_key_exists($column, $data)) {
                continue;
            }

            $paramName = ':' . $column;
            $set[] = $column . ' = ' . $paramName;
            $params[$paramName] = $data[$column];
        }

        if ($set === []) {
            return;
        }

        $sql = sprintf('UPDATE %s SET %s, updated_at = UTC_TIMESTAMP() WHERE id = :id AND deleted_at IS NULL', $table, implode(', ', $set));
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
    }

    private function getLead(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, full_name, phone, email, budget, interest, owner_id FROM leads WHERE id = :id AND deleted_at IS NULL LIMIT 1');
        $stmt->execute([':id' => $id]);

        $lead = $stmt->fetch();
        return $lead ?: null;
    }

    private function replaceUserRoles(int $userId, array $roleIds): void
    {
        $this->pdo->prepare('DELETE FROM user_roles WHERE user_id = :user_id')->execute([':user_id' => $userId]);

        if ($roleIds === []) {
            return;
        }

        $insert = $this->pdo->prepare('INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, :role_id)');
        foreach ($roleIds as $roleId) {
            $insert->execute([
                ':user_id' => $userId,
                ':role_id' => (int) $roleId,
            ]);
        }
    }

    private function resolveDefaultStageId(): int
    {
        $stmt = $this->pdo->query('SELECT id FROM pipeline_stages ORDER BY position ASC LIMIT 1');
        $row = $stmt->fetch();

        if (!$row) {
            throw new HttpException('Pipeline stages are not configured', 500);
        }

        return (int) $row['id'];
    }
}
