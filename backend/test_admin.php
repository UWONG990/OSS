<?php
use App\Models\User;
require_once '/var/www/html/vendor/autoload.php';
require_once '/var/www/html/bootstrap/app.php';

// Find admin user
$admin = User::where('email', 'admin@oss.com')->first();
if ($admin) {
    // Create a personal access token for testing
    $token = $admin->createToken('admin-test')->plainTextToken;
    echo 'Admin token: ' . $token . PHP_EOL;
    echo 'Admin ID: ' . $admin->id . PHP_EOL;
    echo 'Admin Role: ' . $admin->role . PHP_EOL;
    echo 'Is Admin: ' . ($admin->isAdmin() ? 'true' : 'false') . PHP_EOL;
} else {
    echo 'Admin user not found' . PHP_EOL;
}