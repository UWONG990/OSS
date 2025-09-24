<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->after('name');
            $table->enum('user_type', ['buyer', 'seller'])->default('buyer')->after('role');
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->enum('gender', ['male', 'female', 'other', 'prefer-not-to-say'])->nullable()->after('date_of_birth');
            $table->string('city')->nullable()->after('address');
            $table->string('paypal_id')->nullable()->after('city');
        });

        // Update existing users with generated usernames
        DB::statement("UPDATE users SET username = CONCAT('user_', id) WHERE username IS NULL");
        
        // Now make username required and unique
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'user_type', 
                'date_of_birth',
                'gender',
                'city',
                'paypal_id'
            ]);
        });
    }
};