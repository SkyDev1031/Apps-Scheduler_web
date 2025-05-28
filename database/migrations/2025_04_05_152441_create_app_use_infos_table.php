<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAppUseInfosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('app_use_infos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('phonenumber');
            $table->string('userID');
            $table->string('app_name');
            $table->dateTime('app_start_time');
            $table->dateTime('app_end_time');
            $table->time('app_duration');
            $table->integer('app_scheduled_flag');
            $table->dateTime('saved_time');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('app_use_infos');
    }
}
