<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblUserRecWallet
 * 
 * @property int $id
 * @property int $cid
 * @property string $address
 * @property string $private_key
 * @property int $uid
 * @property int $engage
 *
 * @package App\Models
 */
class TblUserRecWallet extends Model
{
	protected $table = 'tbl_user_rec_wallets';
	public $timestamps = false;

	protected $casts = [
		'cid' => 'int',
		'uid' => 'int',
		'engage' => 'int'
	];

	protected $fillable = [
		'cid',
		'address',
		'private_key',
		'uid',
		'engage'
	];
}
