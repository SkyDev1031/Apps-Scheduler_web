<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblUnstake
 * 
 * @property int $id
 * @property int $UserID
 * @property int $StakedID
 * @property int $CryptoID
 * @property float $UnstakeAmount
 * @property Carbon $DateOfTrans
 *
 * @package App\Models
 */
class TblUnstake extends Model
{
	protected $table = 'tbl_unstake';
	public $timestamps = false;

	protected $casts = [
		'UserID' => 'int',
		'StakedID' => 'int',
		'CryptoID' => 'int',
		'UnstakeAmount' => 'float'
	];

	protected $dates = [
		'DateOfTrans'
	];

	protected $fillable = [
		'UserID',
		'StakedID',
		'CryptoID',
		'UnstakeAmount',
		'DateOfTrans'
	];
}
