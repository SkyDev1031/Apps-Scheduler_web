<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblNetworkCurrent
 * 
 * @property int $id
 * @property int $CryptoID
 * @property int $UserID
 * @property float $LeftBalance
 * @property float $RightBalance
 *
 * @package App\Models
 */
class TblNetworkCurrent extends Model
{
	protected $table = 'tbl_network_current';
	public $timestamps = false;

	protected $casts = [
		'CryptoID' => 'int',
		'UserID' => 'int',
		'LeftBalance' => 'float',
		'RightBalance' => 'float'
	];

	protected $fillable = [
		'CryptoID',
		'UserID',
		'LeftBalance',
		'RightBalance'
	];
}
