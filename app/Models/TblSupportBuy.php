<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblSupportBuy
 * 
 * @property int $ID
 * @property int $UID
 * @property int $CID
 * @property float $Amount
 * @property float $BusdAmount
 * @property Carbon $buy_date
 * @property int $product_id
 * @property int $status
 * @property float $FeesInCrypto
 *
 * @package App\Models
 */
class TblSupportBuy extends Model
{
	protected $table = 'tbl_support_buy';
	protected $primaryKey = 'ID';
	public $timestamps = false;

	protected $casts = [
		'UID' => 'int',
		'CID' => 'int',
		'Amount' => 'float',
		'BusdAmount' => 'float',
		'product_id' => 'int',
		'status' => 'int',
		'FeesInCrypto' => 'float'
	];

	protected $dates = [
		'buy_date'
	];

	protected $fillable = [
		'UID',
		'CID',
		'Amount',
        'BusdAmount',
		'buy_date',
		'product_id',
		'status',
        'FeesInCrypto'
	];
}
