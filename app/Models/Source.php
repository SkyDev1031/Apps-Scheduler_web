<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Source
 * 
 * @property int $id
 * @property int $order_id
 * @property string $source_name
 * @property string $biography
 * @property string $bio_image
 * @property string $facebook_url
 * @property string $twitter_url
 * @property string|null $instagram_url
 * @property string $profile_picture
 * @property string $password
 * @property int|null $past_picks_to_show
 * @property int $percentage
 * @property string $phone
 * @property string $email
 *
 * @package App\Models
 */
class Source extends Model
{
	protected $table = 'sources';
	public $timestamps = false;

	protected $casts = [
		'order_id' => 'int',
		'past_picks_to_show' => 'int',
		'percentage' => 'int'
	];

	protected $hidden = [
		'password'
	];

	protected $fillable = [
		'order_id',
		'source_name',
		'biography',
		'bio_image',
		'facebook_url',
		'twitter_url',
		'instagram_url',
		'profile_picture',
		'password',
		'past_picks_to_show',
		'percentage',
		'phone',
		'email'
	];
}
