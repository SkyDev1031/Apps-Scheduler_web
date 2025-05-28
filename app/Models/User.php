<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
	use HasFactory, Notifiable, HasApiTokens;

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array<int, string>
	 */
	public $timestamps = false;
	protected $fillable = [
		'fullname',
		'username',
		'ScreenName',
		'phone',
		'password',
		'secPassword',
		'activation_code',
		'status',
		'created_at',
		'CanReceiveBinaryPayouts',
		'LoginIP',
		'LoginStatus',
		'Token',
		'TimeStamp',
		'ParentID',
		'ChildID',
		'PlaceReferralOn',
		'Leg',
		'Referral',
		'sponsor',
		'WalletBalance',
		'role',
		'support',
	];

	/**
	 * The attributes that should be hidden for serialization.
	 *
	 * @var array<int, string>
	 */
	protected $hidden = [
		'password',
		'remember_token',
		'secPassword'
	];

	/**
	 * The attributes that should be cast.
	 *
	 * @var array<string, string>
	 */
	protected $casts = [
		'email_verified_at' => 'datetime',
	];
	public function accessTokens()
	{
		return $this->hasMany('App\Models\OauthAccessToken');
	}

	public static function getUserNameByID($ID) {
		$result = User::where('id', $ID)->first();

		return $result->fullname;
	}
}