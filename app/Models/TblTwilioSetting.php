<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblTwilioSetting
 * 
 * @property int $id
 * @property string $nickname
 * @property string $sid
 * @property string $token
 * @property string $messaging_service_sid
 * @property string $notify_service_sid
 *
 * @package App\Models
 */
class TblTwilioSetting extends Model
{
	protected $table = 'tbl_twilio_settings';
	public $timestamps = false;

	protected $fillable = [
		'nickname',
		'sid',
		'token',
		'messaging_service_sid',
		'notify_service_sid'
	];
}