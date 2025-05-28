<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblAdminPayoutLog
 * 
 * @property int $id
 * @property int $CryptoID
 * @property float $FirstAmount
 * @property float $SecondAmount
 * @property Carbon $DateOfTrans
 *
 * @package App\Models
 */
class TblAdminPayoutLog extends Model
{
	protected $table = 'tbl_admin_payout_log';
	public $timestamps = false;

	protected $casts = [
		'CryptoID' => 'int',
		'FirstAmount' => 'float',
		'SecondAmount' => 'float'
	];

	protected $dates = [
		'DateOfTrans'
	];

	protected $fillable = [
		'CryptoID',
		'FirstAmount',
		'SecondAmount',
		'DateOfTrans',
		"transaction_id"
	];
}