<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblImage
 * 
 * @property int $id
 * @property string $image_name
 * @property string $image_url
 *
 * @package App\Models
 */
class TblImage extends Model
{
	protected $table = 'tbl_images';
	public $timestamps = false;

	protected $fillable = [
		'image_name',
		'image_url'
	];
}
