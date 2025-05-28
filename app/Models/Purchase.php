<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Purchase
 * 
 * @property int $id
 * @property string $txn_id
 * @property int $activation_code
 * @property string $gateway_name
 * @property Carbon $purchase_date
 * @property int $user_id
 * @property int $package_id
 * @property int $BillingIntervalDays
 * @property float $BillingAmount
 * @property int $CryptoID
 * @property float $price
 * @property Carbon $expiry_date
 * @property Carbon $RenewDate
 * @property string $status
 * @property string $IsBinaryPayout
 *
 * @package App\Models
 */
class Purchase extends Model
{
	protected $table = 'purchases';
	public $timestamps = false;

	protected $casts = [
		'activation_code' => 'int',
		'user_id' => 'int',
		'package_id' => 'int',
		'BillingIntervalDays' => 'int',
		'BillingAmount' => 'float',
		'CryptoID' => 'int',
		'price' => 'float'
	];

	protected $dates = [
		'purchase_date',
		'expiry_date',
		'RenewDate'
	];

	protected $fillable = [
		'txn_id',
		'activation_code',
		'gateway_name',
		'purchase_date',
		'user_id',
		'package_id',
		'BillingIntervalDays',
		'BillingAmount',
		'CryptoID',
		'CryptoSpent',
		'price',
		'expiry_date',
		'RenewDate',
		'autoPay',
		'status',
		'IsBinaryPayout'
	];
}
