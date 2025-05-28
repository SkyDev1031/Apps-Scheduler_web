<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUniqueConstraintToAppUseInfosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('
            ALTER TABLE app_use_infos 
            ADD UNIQUE INDEX unique_app_use_info (
                phonenumber(20), 
                userID(50), 
                app_name(100), 
                app_start_time, 
                app_end_time, 
                app_duration, 
                app_scheduled_flag, 
                saved_time
            )
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('app_use_infos', function (Blueprint $table) {
            $table->dropIndex('unique_app_use_info');
        });
    }
}
