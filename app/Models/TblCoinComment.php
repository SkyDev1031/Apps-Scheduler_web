<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblCoinComment
 * 
 * @property int $id
 * @property int $UserID
 * @property string $CoinID
 * @property string $CommentType
 * @property string $Comments
 * @property Carbon $DateTime
 *
 * @package App\Models
 */
class TblCoinComment extends Model
{
	protected $table = 'tbl_coin_comments';
	public $timestamps = false;

	protected $casts = [
		'UserID' => 'int'
	];

	protected $dates = [
		'DateTime'
	];

	protected $fillable = [
		'UserID',
		'CoinID',
		'CommentType',
		'Comments',
		'DateTime'
	];
}
