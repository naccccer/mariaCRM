SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT UNSIGNED NOT NULL,
  permission_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT UNSIGNED NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(190) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL,
  ended_at DATETIME NULL,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_created_at (created_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS companies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  national_id VARCHAR(100) NULL,
  owner_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_companies_owner (owner_id),
  CONSTRAINT fk_companies_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tags (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  color VARCHAR(20) NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS entity_tags (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(40) NOT NULL,
  entity_id INT UNSIGNED NOT NULL,
  tag_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_entity_tags_entity (entity_type, entity_id),
  CONSTRAINT fk_entity_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pipelines (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_pipelines_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pipeline_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  position INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_pipeline_stage_position (pipeline_id, position),
  INDEX idx_pipeline_stages_pipeline (pipeline_id),
  CONSTRAINT fk_pipeline_stages_pipeline FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(190) NULL,
  source VARCHAR(80) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  budget DECIMAL(14,2) NULL,
  interest VARCHAR(190) NULL,
  owner_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_leads_owner (owner_id),
  INDEX idx_leads_status (status),
  INDEX idx_leads_created_at (created_at),
  CONSTRAINT fk_leads_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contacts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id INT UNSIGNED NULL,
  lead_id INT UNSIGNED NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(190) NULL,
  type VARCHAR(80) NULL,
  budget DECIMAL(14,2) NULL,
  interest VARCHAR(190) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  owner_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_contacts_owner (owner_id),
  INDEX idx_contacts_status (status),
  INDEX idx_contacts_created_at (created_at),
  CONSTRAINT fk_contacts_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  CONSTRAINT fk_contacts_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  CONSTRAINT fk_contacts_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS deals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190) NOT NULL,
  contact_id INT UNSIGNED NOT NULL,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  stage_id INT UNSIGNED NOT NULL,
  owner_id INT UNSIGNED NOT NULL,
  expected_close_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_deals_owner (owner_id),
  INDEX idx_deals_status (status),
  INDEX idx_deals_stage (stage_id),
  INDEX idx_deals_created_at (created_at),
  CONSTRAINT fk_deals_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deals_stage FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deals_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS deal_stage_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  deal_id INT UNSIGNED NOT NULL,
  from_stage_id INT UNSIGNED NULL,
  to_stage_id INT UNSIGNED NOT NULL,
  moved_by INT UNSIGNED NOT NULL,
  moved_at DATETIME NOT NULL,
  INDEX idx_deal_history_deal (deal_id),
  CONSTRAINT fk_deal_history_deal FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  CONSTRAINT fk_deal_history_from_stage FOREIGN KEY (from_stage_id) REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  CONSTRAINT fk_deal_history_to_stage FOREIGN KEY (to_stage_id) REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deal_history_user FOREIGN KEY (moved_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id INT UNSIGNED NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  due_at DATETIME NULL,
  completed_at DATETIME NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'todo',
  type VARCHAR(80) NOT NULL DEFAULT 'follow_up',
  owner_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_activities_owner (owner_id),
  INDEX idx_activities_status (status),
  INDEX idx_activities_due_at (due_at),
  INDEX idx_activities_created_at (created_at),
  CONSTRAINT fk_activities_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  CONSTRAINT fk_activities_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_reminders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id INT UNSIGNED NOT NULL,
  remind_at DATETIME NOT NULL,
  channel VARCHAR(40) NOT NULL DEFAULT 'in_app',
  sent_at DATETIME NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  INDEX idx_activity_reminders_remind_at (remind_at),
  CONSTRAINT fk_activity_reminders_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id INT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NULL,
  deleted_at DATETIME NULL,
  INDEX idx_notes_contact (contact_id),
  CONSTRAINT fk_notes_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attachments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(40) NOT NULL,
  entity_id INT UNSIGNED NOT NULL,
  file_name VARCHAR(190) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NULL,
  file_size BIGINT UNSIGNED NULL,
  uploaded_by INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_attachments_entity (entity_type, entity_id),
  CONSTRAINT fk_attachments_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tickets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id INT UNSIGNED NULL,
  subject VARCHAR(190) NOT NULL,
  description TEXT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'normal',
  status VARCHAR(40) NOT NULL DEFAULT 'open',
  assignee_id INT UNSIGNED NULL,
  sla_due_at DATETIME NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_assignee (assignee_id),
  INDEX idx_tickets_created_at (created_at),
  CONSTRAINT fk_tickets_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket_comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_ticket_comments_ticket (ticket_id),
  CONSTRAINT fk_ticket_comments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_ticket_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT UNSIGNED NOT NULL,
  from_status VARCHAR(40) NULL,
  to_status VARCHAR(40) NOT NULL,
  changed_by INT UNSIGNED NOT NULL,
  changed_at DATETIME NOT NULL,
  INDEX idx_ticket_status_history_ticket (ticket_id),
  CONSTRAINT fk_ticket_status_history_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_ticket_status_history_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  location VARCHAR(150) NULL,
  type VARCHAR(150) NULL,
  total_units INT UNSIGNED NOT NULL DEFAULT 0,
  available_units INT UNSIGNED NOT NULL DEFAULT 0,
  progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
  base_price VARCHAR(120) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planning',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_projects_status (status),
  INDEX idx_projects_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id INT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  meta JSON NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_audit_logs_user (user_id),
  INDEX idx_audit_logs_created_at (created_at),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS integration_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  channel VARCHAR(40) NOT NULL,
  direction VARCHAR(20) NOT NULL,
  status VARCHAR(40) NOT NULL,
  payload JSON NULL,
  response_body TEXT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_integration_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS imports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(40) NOT NULL,
  file_name VARCHAR(190) NOT NULL,
  total_rows INT UNSIGNED NOT NULL DEFAULT 0,
  inserted_rows INT UNSIGNED NOT NULL DEFAULT 0,
  failed_rows INT UNSIGNED NOT NULL DEFAULT 0,
  imported_by INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_imports_created_at (created_at),
  CONSTRAINT fk_imports_user FOREIGN KEY (imported_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO roles (name, code) VALUES
('Super Admin', 'super_admin'),
('Sales Manager', 'sales_manager'),
('Sales Agent', 'sales_agent'),
('Support Agent', 'support_agent')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO permissions (name, code) VALUES
('Manage users and roles', 'users.manage'),
('Read leads', 'leads.read'),
('Write leads', 'leads.write'),
('Read contacts', 'contacts.read'),
('Write contacts', 'contacts.write'),
('Read deals', 'deals.read'),
('Write deals', 'deals.write'),
('Read activities', 'activities.read'),
('Write activities', 'activities.write'),
('Read tickets', 'tickets.read'),
('Write tickets', 'tickets.write'),
('Read projects', 'projects.read'),
('Write projects', 'projects.write'),
('Read reports', 'reports.read')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (full_name, email, password_hash, is_active, created_at, updated_at)
VALUES ('Super Admin', 'admin@mariacrm.local', '$2y$10$lyUTp82OxKrARRgfCfNcNuUtZI3zEZd1cN6.lb.HoTxJ7F9jGujuq', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE updated_at = UTC_TIMESTAMP();

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.code = 'super_admin'
WHERE u.email = 'admin@mariacrm.local'
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'super_admin'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('leads.read', 'leads.write', 'contacts.read', 'contacts.write', 'deals.read', 'deals.write', 'activities.read', 'activities.write', 'projects.read', 'reports.read')
WHERE r.code = 'sales_manager'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('leads.read', 'leads.write', 'contacts.read', 'contacts.write', 'deals.read', 'deals.write', 'activities.read', 'activities.write', 'projects.read')
WHERE r.code = 'sales_agent'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('tickets.read', 'tickets.write', 'contacts.read', 'activities.read')
WHERE r.code = 'support_agent'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO pipelines (name, is_default, created_at, updated_at)
VALUES ('Default Pipeline', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE is_default = VALUES(is_default), updated_at = UTC_TIMESTAMP();

INSERT IGNORE INTO pipeline_stages (pipeline_id, name, position, created_at, updated_at)
SELECT p.id, 'New Lead', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM pipelines p WHERE p.is_default = 1
UNION ALL
SELECT p.id, 'Initial Negotiation', 2, UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM pipelines p WHERE p.is_default = 1
UNION ALL
SELECT p.id, 'Meeting', 3, UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM pipelines p WHERE p.is_default = 1
UNION ALL
SELECT p.id, 'Proposal', 4, UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM pipelines p WHERE p.is_default = 1
UNION ALL
SELECT p.id, 'Won', 5, UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM pipelines p WHERE p.is_default = 1;

INSERT IGNORE INTO projects (name, location, type, total_units, available_units, progress, base_price, status, created_at, updated_at)
VALUES
('ویلا برج سولاریس', 'محمودآباد', 'مسکونی', 120, 15, 85, 'متری ۱۵۰ میلیون', 'in_progress', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('برج مسکونی کادنس', 'چالوس', 'برج باغ', 80, 32, 40, 'متری ۱۲۰ میلیون', 'pre_sale', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('برج ساحلی ژوان', 'شیرود', 'ساحلی', 65, 4, 95, 'متری ۲۰۰ میلیون', 'ready', UTC_TIMESTAMP(), UTC_TIMESTAMP());

INSERT IGNORE INTO leads (id, full_name, phone, email, source, status, budget, interest, owner_id, created_at, updated_at)
SELECT 1, 'کوروش ستوده', '09123456789', 'k.setoude@example.com', 'instagram', 'new', 150000000000, 'برج ساحلی ژوان', u.id, UTC_TIMESTAMP(), UTC_TIMESTAMP()
FROM users u
WHERE u.email = 'admin@mariacrm.local';

INSERT IGNORE INTO contacts (id, lead_id, full_name, phone, email, type, budget, interest, status, owner_id, created_at, updated_at)
SELECT 1, 1, 'الناز وکیلی', '09129876543', 'elnaz@example.com', 'buyer', 85000000000, 'برج مسکونی کادنس', 'active', u.id, UTC_TIMESTAMP(), UTC_TIMESTAMP()
FROM users u
WHERE u.email = 'admin@mariacrm.local';

INSERT IGNORE INTO deals (id, title, contact_id, amount, status, stage_id, owner_id, expected_close_at, created_at, updated_at)
SELECT 1, 'Opportunity - الناز وکیلی', 1, 85000000000, 'open', ps.id, u.id, NULL, UTC_TIMESTAMP(), UTC_TIMESTAMP()
FROM users u
JOIN pipeline_stages ps ON ps.position = 2
WHERE u.email = 'admin@mariacrm.local'
LIMIT 1;

INSERT IGNORE INTO deal_stage_history (id, deal_id, from_stage_id, to_stage_id, moved_by, moved_at)
SELECT 1, 1, NULL, ps.id, u.id, UTC_TIMESTAMP()
FROM users u
JOIN pipeline_stages ps ON ps.position = 2
WHERE u.email = 'admin@mariacrm.local'
LIMIT 1;

INSERT IGNORE INTO activities (id, contact_id, title, description, due_at, status, type, owner_id, created_at, updated_at)
SELECT 1, 1, 'تماس پیگیری وضعیت', 'بررسی تصمیم نهایی مشتری', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 DAY), 'todo', 'task', u.id, UTC_TIMESTAMP(), UTC_TIMESTAMP()
FROM users u
WHERE u.email = 'admin@mariacrm.local';

INSERT IGNORE INTO tickets (id, contact_id, subject, description, priority, status, assignee_id, sla_due_at, created_by, created_at, updated_at)
SELECT 1, 1, 'درخواست استعلام قیمت', 'نیاز به تایید قیمت نهایی واحد', 'normal', 'open', u.id, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 DAY), u.id, UTC_TIMESTAMP(), UTC_TIMESTAMP()
FROM users u
WHERE u.email = 'admin@mariacrm.local';
