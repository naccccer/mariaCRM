<?php

declare(strict_types=1);

use App\Controllers\ActivitiesController;
use App\Controllers\AuthController;
use App\Controllers\ContactsController;
use App\Controllers\DealsController;
use App\Controllers\HealthController;
use App\Controllers\ImportController;
use App\Controllers\LeadsController;
use App\Controllers\ProjectsController;
use App\Controllers\ReportsController;
use App\Controllers\TicketsController;
use App\Controllers\UsersController;
use App\Repositories\CrmRepository;
use App\Support\Auth;
use App\Support\HttpException;
use App\Support\Json;
use App\Support\Request;
use App\Support\Router;

require_once __DIR__ . '/../src/Support/Database.php';
require_once __DIR__ . '/../src/Support/Json.php';
require_once __DIR__ . '/../src/Support/Request.php';
require_once __DIR__ . '/../src/Support/HttpException.php';
require_once __DIR__ . '/../src/Support/Auth.php';
require_once __DIR__ . '/../src/Support/Validator.php';
require_once __DIR__ . '/../src/Support/Router.php';
require_once __DIR__ . '/../src/Services/AuditLogger.php';
require_once __DIR__ . '/../src/Services/IntegrationLogger.php';
require_once __DIR__ . '/../src/Repositories/CrmRepository.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/UsersController.php';
require_once __DIR__ . '/../src/Controllers/HealthController.php';
require_once __DIR__ . '/../src/Controllers/LeadsController.php';
require_once __DIR__ . '/../src/Controllers/ContactsController.php';
require_once __DIR__ . '/../src/Controllers/DealsController.php';
require_once __DIR__ . '/../src/Controllers/ActivitiesController.php';
require_once __DIR__ . '/../src/Controllers/TicketsController.php';
require_once __DIR__ . '/../src/Controllers/ProjectsController.php';
require_once __DIR__ . '/../src/Controllers/ReportsController.php';
require_once __DIR__ . '/../src/Controllers/ImportController.php';

$appConfig = require dirname(__DIR__, 2) . '/config/app.php';
date_default_timezone_set($appConfig['timezone']);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowOrigin = in_array($origin, $appConfig['allowed_origins'], true) ? $origin : ($appConfig['allowed_origins'][0] ?? '*');
header('Access-Control-Allow-Origin: ' . $allowOrigin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

Auth::bootSession();

$request = new Request();
$repository = new CrmRepository();

$authController = new AuthController($request);
$usersController = new UsersController($request, $repository);
$healthController = new HealthController();
$leadsController = new LeadsController($request, $repository);
$contactsController = new ContactsController($request, $repository);
$dealsController = new DealsController($request, $repository);
$activitiesController = new ActivitiesController($request, $repository);
$ticketsController = new TicketsController($request, $repository);
$projectsController = new ProjectsController($request, $repository);
$reportsController = new ReportsController($repository);
$importController = new ImportController($request, $repository);

$router = new Router();
$router->add('GET', '/v1/health', fn() => $healthController->ping());
$router->add('POST', '/v1/auth/login', fn() => $authController->login());
$router->add('POST', '/v1/auth/logout', fn() => $authController->logout());
$router->add('GET', '/v1/auth/me', fn() => $authController->me());

$router->add('GET', '/v1/users', fn() => $usersController->index());
$router->add('POST', '/v1/users', fn() => $usersController->create());
$router->add('PATCH', '/v1/users/{id}', fn(int $id) => $usersController->update($id));

$router->add('GET', '/v1/leads', fn() => $leadsController->index());
$router->add('POST', '/v1/leads', fn() => $leadsController->create());
$router->add('PATCH', '/v1/leads/{id}', fn(int $id) => $leadsController->update($id));
$router->add('POST', '/v1/leads/{id}/convert', fn(int $id) => $leadsController->convert($id));

$router->add('GET', '/v1/contacts', fn() => $contactsController->index());
$router->add('GET', '/v1/contacts/{id}', fn(int $id) => $contactsController->show($id));
$router->add('POST', '/v1/contacts', fn() => $contactsController->create());
$router->add('PATCH', '/v1/contacts/{id}', fn(int $id) => $contactsController->update($id));
$router->add('GET', '/v1/contacts/{id}/timeline', fn(int $id) => $contactsController->timeline($id));

$router->add('GET', '/v1/deals', fn() => $dealsController->index());
$router->add('POST', '/v1/deals', fn() => $dealsController->create());
$router->add('PATCH', '/v1/deals/{id}', fn(int $id) => $dealsController->update($id));
$router->add('POST', '/v1/deals/{id}/move-stage', fn(int $id) => $dealsController->moveStage($id));

$router->add('GET', '/v1/activities', fn() => $activitiesController->index());
$router->add('POST', '/v1/activities', fn() => $activitiesController->create());
$router->add('PATCH', '/v1/activities/{id}', fn(int $id) => $activitiesController->update($id));
$router->add('POST', '/v1/activities/{id}/complete', fn(int $id) => $activitiesController->complete($id));

$router->add('GET', '/v1/tickets', fn() => $ticketsController->index());
$router->add('POST', '/v1/tickets', fn() => $ticketsController->create());
$router->add('PATCH', '/v1/tickets/{id}', fn(int $id) => $ticketsController->update($id));
$router->add('POST', '/v1/tickets/{id}/comments', fn(int $id) => $ticketsController->addComment($id));

$router->add('GET', '/v1/projects', fn() => $projectsController->index());
$router->add('POST', '/v1/projects', fn() => $projectsController->create());
$router->add('PATCH', '/v1/projects/{id}', fn(int $id) => $projectsController->update($id));

$router->add('GET', '/v1/reports/kpi', fn() => $reportsController->kpi());
$router->add('GET', '/v1/reports/pipeline', fn() => $reportsController->pipeline());
$router->add('GET', '/v1/reports/users', fn() => $reportsController->users());

$router->add('POST', '/v1/import/contacts', fn() => $importController->contacts());

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = $_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = preg_replace('#^.*?/api#', '', $path) ?: '/';
$path = str_replace('/public/index.php', '', $path);

try {
    $response = $router->dispatch($method, $path);
    Json::ok($response['data'] ?? [], [], (int) ($response['status'] ?? 200));
} catch (HttpException $exception) {
    Json::fail($exception->getMessage(), $exception->statusCode(), $exception->details());
} catch (Throwable $exception) {
    Json::fail('Internal server error', 500);
}
