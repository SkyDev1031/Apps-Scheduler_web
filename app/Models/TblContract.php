<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblContract
 * 
 * @property int $id
 * @property string $address
 * @property string $deployer
 * @property string|null $owner
 * @property string|null $hash
 * @property int $verified
 * @property int $actived
 * @property string|null $desc
 * @property string $network
 * @property Carbon $created_at
 *
 * @package App\Models
 */
class TblContract extends Model
{
	protected $table = 'tbl_contracts';
	public $timestamps = false;

	protected $casts = [
		'verified' => 'int',
		'actived' => 'int'
	];

	protected $fillable = [
		'address',
		'deployer',
		'owner',
		'hash',
		'verified',
		'actived',
		'desc',
		'network'
	];
}
