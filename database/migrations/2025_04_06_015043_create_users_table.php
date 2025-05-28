<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('fullname');
            $table->string('username')->unique();;
            $table->string('ScreenName');
            $table->string('phone');
            $table->string('password');
            $table->string('secPassword');
            $table->string('activation_code');
            $table->string('status')->default('Pending');
            $table->enum('CanReceiveBinaryPayouts', ['Y', 'N'])->default('N');
            $table->string('LoginIP');
            $table->integer('LoginStatus');
            $table->text('Token');
            $table->string('TimeStamp');
            $table->integer('ParentID');
            $table->integer('ChildId');
            $table->string('PlaceReferralOn');
            $table->string('Leg');
            $table->string('Referral');
            $table->string('sponsor');
            $table->decimal('WalletBalance', 10, 4);
            $table->enum('role', ['1', '0'])->default('0');
            $table->integer('support')->default(0); // Remove auto_increment and default constraint
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
        Schema::dropIfExists('users');
    }
}
