<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblTemplate
 * 
 * @property int $id
 * @property string $template_name
 * @property string $template_text
 *
 * @package App\Models
 */
class TblTemplate extends Model
{
	protected $table = 'tbl_template';
	public $timestamps = false;

	protected $fillable = [
		'template_name',
		'template_text'
	];
}
