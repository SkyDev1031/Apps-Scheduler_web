<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblNetworkSetting
 * 
 * @property int $id
 * @property int $Rank
 * @property float $Subscription
 * @property float $Level1
 * @property float $Level2
 * @property float $Level3
 * @property float $LevelBinary
 *
 * @package App\Models
 */
class TblNetworkSetting extends Model
{
	protected $table = 'tbl_network_settings';
	public $timestamps = false;

	protected $casts = [
		'Rank' => 'int',
		'Subscription' => 'float',
		'Level1' => 'float',
		'Level2' => 'float',
		'Level3' => 'float',
		'LevelBinary' => 'float'
	];

	protected $fillable = [
		'Rank',
		'Subscription',
		'Level1',
		'Level2',
		'Level3',
		'LevelBinary'
	];
}
