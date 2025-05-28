<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class PackageImage
 * 
 * @property int $id
 * @property string $description
 * @property string $image_url
 *
 * @package App\Models
 */
class PackageImage extends Model
{
	protected $table = 'package_images';
	public $timestamps = false;

	protected $fillable = [
		'description',
		'image_url'
	];
}
