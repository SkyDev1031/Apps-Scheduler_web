<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblCryptoReferralLink
 * 
 * @property int $id
 * @property int $CID
 * @property int $UID
 * @property float $Amount
 * @property float $Quantity
 * @property float $Fees
 * @property string $Note
 * @property string $PlaceReferralOn
 * @property string $ReferralUrl
 * @property string $Status
 *
 * @package App\Models
 */
class TblCryptoReferralLink extends Model
{
	protected $table = 'tbl_crypto_referral_link';
	public $timestamps = false;

	protected $casts = [
		'CID' => 'int',
		'UID' => 'int',
		'Amount' => 'float',
		'Quantity' => 'float',
		'Fees' => 'float'
	];

	protected $fillable = [
		'CID',
		'UID',
		'Amount',
		'Quantity',
		'Fees',
		'Note',
		'PlaceReferralOn',
		'ReferralUrl',
		'Status'
	];
}
