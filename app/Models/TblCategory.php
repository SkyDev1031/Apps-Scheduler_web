<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblCategory
 * 
 * @property int $ID
 * @property string $CategoryName
 * @property string $Status
 * @property int $ParentID
 * @property string $alias
 *
 * @package App\Models
 */
class TblCategory extends Model
{
	protected $table = 'tbl_category';
	protected $primaryKey = 'ID';
	public $timestamps = false;

	protected $casts = [
		'ParentID' => 'int'
	];

	protected $fillable = [
		'CategoryName',
		'Status',
		'ParentID',
		'alias'
	];
}
