<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblSwap
 * 
 * @property int $ID
 * @property int $UserID
 * @property int $CryptoID
 * @property float $SwapAmount
 * @property Carbon $DateOfSwap
 * @property int $SwapToCryptoID
 * @property float $SwapAmountInCrypto
 * @property float $FeesInCrypto
 * @property string|null $SwapPayout
 *
 * @package App\Models
 */
class TblSwap extends Model
{
	protected $table = 'tbl_swap';
	protected $primaryKey = 'ID';
	public $timestamps = false;

	protected $casts = [
		'UserID' => 'int',
		'CryptoID' => 'int',
		'SwapAmount' => 'float',
		'SwapToCryptoID' => 'int',
		'SwapAmountInCrypto' => 'float',
		'FeesInCrypto' => 'float'
	];

	protected $dates = [
		'DateOfSwap'
	];

	protected $fillable = [
		'UserID',
		'CryptoID',
		'SwapAmount',
		'DateOfSwap',
		'SwapToCryptoID',
		'SwapAmountInCrypto',
		'FeesInCrypto',
		'SwapPayout'
	];
}
