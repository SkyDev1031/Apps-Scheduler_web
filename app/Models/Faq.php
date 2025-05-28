<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Faq
 * 
 * @property int $id
 * @property string $question
 * @property string $answer
 *
 * @package App\Models
 */
class Faq extends Model
{
	protected $table = 'faqs';
	public $timestamps = false;

	protected $fillable = [
		'question',
		'product_id',
		'answer'
	];
}
