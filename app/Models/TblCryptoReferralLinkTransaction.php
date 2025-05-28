<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblCryptoReferralLinkTransaction
 * 
 * @property int $id
 * @property Carbon $TransactionDate
 * @property int $UserID
 * @property float $Amount
 * @property int $CID
 * @property string $Status
 *
 * @package App\Models
 */
class TblCryptoReferralLinkTransaction extends Model
{
	protected $table = 'tbl_crypto_referral_link_transaction';
	public $timestamps = false;

	protected $casts = [
		'SenderID' => 'int',
		'UserID' => 'int',
		'Amount' => 'float',
		'CID' => 'int'
	];

	protected $dates = [
		'TransactionDate'
	];

	protected $fillable = [
		'TransactionDate',
		'UserID',
		'Amount',
		'CID',
		'Status',
		'SenderID'
	];
}