<?php

declare(strict_types=1);

$config = require dirname(__DIR__, 2) . '/config/database.php';

$dsn = sprintf('mysql:host=%s;port=%d;charset=%s', $config['host'], $config['port'], $config['charset']);
$pdo = new PDO($dsn, $config['username'], $config['password'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$pdo->exec('CREATE DATABASE IF NOT EXISTS `' . $config['database'] . '` CHARACTER SET ' . $config['charset'] . ' COLLATE utf8mb4_unicode_ci');
$pdo->exec('USE `' . $config['database'] . '`');

$sql = file_get_contents(dirname(__DIR__) . '/database/schema.sql');
if ($sql === false) {
    throw new RuntimeException('Cannot read schema.sql');
}

$pdo->exec($sql);
$pdo->exec(
    'UPDATE deals d
     INNER JOIN pipeline_stages ps_old ON ps_old.id = d.stage_id
     INNER JOIN pipelines p_old ON p_old.id = ps_old.pipeline_id
     INNER JOIN pipelines p_keep ON p_keep.name = p_old.name
     INNER JOIN pipeline_stages ps_keep ON ps_keep.pipeline_id = p_keep.id AND ps_keep.position = ps_old.position
     SET d.stage_id = ps_keep.id
     WHERE p_keep.id = (
       SELECT MIN(id) FROM (SELECT id, name FROM pipelines) keep WHERE keep.name = p_old.name
     ) AND p_old.id <> p_keep.id'
);
$pdo->exec(
    'UPDATE deal_stage_history h
     INNER JOIN pipeline_stages ps_old ON ps_old.id = h.to_stage_id
     INNER JOIN pipelines p_old ON p_old.id = ps_old.pipeline_id
     INNER JOIN pipelines p_keep ON p_keep.name = p_old.name
     INNER JOIN pipeline_stages ps_keep ON ps_keep.pipeline_id = p_keep.id AND ps_keep.position = ps_old.position
     SET h.to_stage_id = ps_keep.id
     WHERE p_keep.id = (
       SELECT MIN(id) FROM (SELECT id, name FROM pipelines) keep WHERE keep.name = p_old.name
     ) AND p_old.id <> p_keep.id'
);
$pdo->exec(
    'UPDATE deal_stage_history h
     INNER JOIN pipeline_stages ps_old ON ps_old.id = h.from_stage_id
     INNER JOIN pipelines p_old ON p_old.id = ps_old.pipeline_id
     INNER JOIN pipelines p_keep ON p_keep.name = p_old.name
     INNER JOIN pipeline_stages ps_keep ON ps_keep.pipeline_id = p_keep.id AND ps_keep.position = ps_old.position
     SET h.from_stage_id = ps_keep.id
     WHERE p_keep.id = (
       SELECT MIN(id) FROM (SELECT id, name FROM pipelines) keep WHERE keep.name = p_old.name
     ) AND p_old.id <> p_keep.id'
);
$pdo->exec(
    'DELETE ps FROM pipeline_stages ps
     INNER JOIN (
       SELECT pipeline_id, position, MIN(id) AS keep_id
       FROM pipeline_stages
       GROUP BY pipeline_id, position
     ) k ON k.pipeline_id = ps.pipeline_id AND k.position = ps.position
     WHERE ps.id <> k.keep_id'
);
$pdo->exec(
    'DELETE p FROM pipelines p
     INNER JOIN (
       SELECT name, MIN(id) AS keep_id
       FROM pipelines
       GROUP BY name
     ) k ON k.name = p.name
     WHERE p.id <> k.keep_id'
);
try {
    $pdo->exec('ALTER TABLE pipelines ADD UNIQUE KEY uq_pipelines_name (name)');
} catch (Throwable) {
}
try {
    $pdo->exec('ALTER TABLE pipeline_stages ADD UNIQUE KEY uq_pipeline_stage_position (pipeline_id, position)');
} catch (Throwable) {
}

echo "Migration completed.\n";
echo "Seed user: admin@mariacrm.local / Admin@123\n";
