<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblSmsSendLog
 * 
 * @property int $id
 * @property Carbon $datetime
 * @property string $sid
 * @property string $fromnumber
 * @property string $sendto
 * @property string $message
 * @property string $status
 *
 * @package App\Models
 */
class TblSmsSendLog extends Model
{
	protected $table = 'tbl_sms_send_log';
	public $timestamps = false;

	protected $dates = [
		'datetime'
	];

	protected $fillable = [
		'datetime',
		'sid',
		'fromnumber',
		'sendto',
		'message',
		'status'
	];
}
