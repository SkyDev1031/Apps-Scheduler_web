<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Video
 * 
 * @property int $id
 * @property int $source_id
 * @property string $video_name
 * @property string $video_url
 * @property string $status
 *
 * @package App\Models
 */
class Video extends Model
{
	protected $table = 'videos';
	public $timestamps = false;

	protected $casts = [
		'source_id' => 'int'
	];

	protected $fillable = [
		'source_id',
		'video_name',
		'video_url',
		'status'
	];
}
