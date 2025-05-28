<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblFromnumber
 * 
 * @property int $id
 * @property string $sid
 * @property string $fromnumber
 * @property string $status
 *
 * @package App\Models
 */
class TblFromnumber extends Model
{
	protected $table = 'tbl_fromnumbers';
	public $timestamps = false;

	protected $fillable = [
		'sid',
		'fromnumber',
		'status'
	];
}
