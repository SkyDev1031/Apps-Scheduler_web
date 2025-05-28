<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblStaked
 * 
 * @property int $id
 * @property int $UserID
 * @property int $CryptoID
 * @property float $StakeAmount
 * @property string $Status
 * @property string $NetworkEligibile
 * @property Carbon $TransDate
 *
 * @package App\Models
 */
class TblStaked extends Model
{
	protected $table = 'tbl_staked';
	public $timestamps = false;

	protected $casts = [
		'UserID' => 'int',
		'CryptoID' => 'int',
		'StakeAmount' => 'float'
	];

	protected $dates = [
		'TransDate'
	];

	protected $fillable = [
		'UserID',
		'CryptoID',
		'StakeAmount',
		'Status',
		'NetworkEligibile',
		'TransDate'
	];
}
