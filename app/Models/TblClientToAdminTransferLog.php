<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblClientToAdminTransferLog
 * 
 * @property int $id
 * @property int $CoinID
 * @property int $UserID
 * @property string $AmountType
 * @property float $Amount
 * @property Carbon $DateOfTransfer
 *
 * @package App\Models
 */
class TblClientToAdminTransferLog extends Model
{
	protected $table = 'tbl_client_to_admin_transfer_log';
	public $timestamps = false;

	protected $casts = [
		'CoinID' => 'int',
		'UserID' => 'int',
		'Amount' => 'float'
	];

	protected $dates = [
		'DateOfTransfer'
	];

	protected $fillable = [
		'CoinID',
		'UserID',
		'AmountType',
		'Amount',
		'DateOfTransfer'
	];
}
