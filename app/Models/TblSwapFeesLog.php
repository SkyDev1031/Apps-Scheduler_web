<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblSwapFeesLog
 * 
 * @property int $ID
 * @property int $CryptoID
 * @property int $UserID
 * @property Carbon $DateOfPayout
 * @property float $SwapFeesCollected
 * @property float $SwapPercentage
 *
 * @package App\Models
 */
class TblSwapFeesLog extends Model
{
	protected $table = 'tbl_swap_fees_log';
	protected $primaryKey = 'ID';
	public $timestamps = false;

	protected $casts = [
		'CryptoID' => 'int',
		'UserID' => 'int',
		'SwapFeesCollected' => 'float',
		'SwapPercentage' => 'float'
	];

	protected $dates = [
		'DateOfPayout'
	];

	protected $fillable = [
		'CryptoID',
		'UserID',
		'DateOfPayout',
		'SwapFeesCollected',
		'SwapPercentage'
	];
}
