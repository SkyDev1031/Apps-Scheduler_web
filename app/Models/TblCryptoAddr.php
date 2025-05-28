<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblCryptoAddr
 * 
 * @property int|null $cid
 * @property string|null $addr
 * @property string|null $coin_current_bal
 * @property string|null $coin_key
 * @property int|null $status
 *
 * @package App\Models
 */
class TblCryptoAddr extends Model
{
	protected $table = 'tbl_crypto_addr';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'cid' => 'int',
		'status' => 'int'
	];

	protected $fillable = [
		'cid',
		'addr',
		'coin_current_bal',
		'coin_key',
		'status'
	];
}
