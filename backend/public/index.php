<?php

declare(strict_types=1);

define('BASE_PATH', dirname(__DIR__));

require BASE_PATH . '/vendor/autoload.php';

use App\Core\App;

$dotenv = Dotenv\Dotenv::createImmutable(BASE_PATH);
$dotenv->load();

$app = new App();
$app->run();
