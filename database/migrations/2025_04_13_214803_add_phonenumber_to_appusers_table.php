<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPhonenumberToAppusersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('appusers', function (Blueprint $table) {
            $table->string('phonenumber')->nullable(); // Add phonenumber column
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('appusers', function (Blueprint $table) {
            $table->dropColumn('phonenumber');
        });
    }
}
