<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Package
 * 
 * @property int $id
 * @property int $uid
 * @property string $Title
 * @property string $Description
 * @property string $Package
 * @package App\Models
 */
class TblDiscussion extends Model
{
	protected $table = 'tbl_discussions';
	public $timestamps = false;

	protected $fillable = [
		'uid',
		'Title',
		'Description',
		'Package'
	];
}
