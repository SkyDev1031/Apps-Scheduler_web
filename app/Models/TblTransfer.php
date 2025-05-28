<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblTransfer
 * 
 * @property int $id
 * @property int $CID
 * @property Carbon $TransDate
 * @property string $TransType
 * @property float $Amount
 * @property float $TransferFee
 * @property string $FeesType
 * @property int $FromClientID
 * @property int $ToClientID
 * @property string $ScreenNamePhoneEmail
 * @property string $Status
 *
 * @package App\Models
 */
class TblTransfer extends Model
{
	protected $table = 'tbl_transfer';
	public $timestamps = false;

	protected $casts = [
		'CID' => 'int',
		'Amount' => 'float',
		'TransferFee' => 'float',
		'FromClientID' => 'int',
		'ToClientID' => 'int'
	];

	protected $dates = [
		'TransDate'
	];

	protected $fillable = [
		'CID',
		'TransDate',
		'TransType',
		'Amount',
		'TransferFee',
		'FeesType',
		'FromClientID',
		'ToClientID',
		'ScreenNamePhoneEmail',
		'Status'
	];
}
