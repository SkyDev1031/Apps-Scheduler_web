<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblWallet
 * 
 * @property int $id
 * @property int $CID
 * @property float $Amount
 * @property Carbon $TransDate
 * @property string $TransType
 * @property string $WithdrawalFeeType
 * @property string $ToReceiveWallet
 * @property string $TransID
 * @property string $Status
 * @property int $UID
 *
 * @package App\Models
 */
class TblWallet extends Model
{
	protected $table = 'tbl_wallets';
	public $timestamps = false;

	protected $casts = [
		'CID' => 'int',
		'Amount' => 'float',
		'UID' => 'int'
	];

	protected $dates = [
		'TransDate'
	];

	protected $fillable = [
		'CID',
		'Amount',
		'TransDate',
		'TransType',
		'WithdrawalFeeType',
		'ToReceiveWallet',
		'TransID',
		'Status',
		'UID'
	];
}
