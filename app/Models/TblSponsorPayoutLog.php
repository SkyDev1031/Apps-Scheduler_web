<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblSponsorPayoutLog
 * 
 * @property int $id
 * @property int $SponsorID
 * @property string $SponsorName
 * @property int $SponsorRank
 * @property int $SponsorLevel
 * @property Carbon $DateOfTrans
 * @property float $Amount
 * @property int $UserID
 * @property string $Leg
 * @property int|null $PackageID
 * @property int $CryptoID
 * @property int $PurchaseID
 * @property string $PayoutType
 * @property string $TransType
 * @property string $PayoutHold
 *
 * @package App\Models
 */
class TblSponsorPayoutLog extends Model
{
	protected $table = 'tbl_sponsor_payout_log';
	public $timestamps = false;

	protected $casts = [
		'SponsorID' => 'int',
		'SponsorRank' => 'int',
		'SponsorLevel' => 'int',
		'Amount' => 'float',
		'UserID' => 'int',
		'PackageID' => 'int',
		'CryptoID' => 'int',
		'PurchaseID' => 'int'
	];

	protected $dates = [
		'DateOfTrans'
	];

	protected $fillable = [
		'SponsorID',
		'SponsorName',
		'SponsorRank',
		'SponsorLevel',
		'DateOfTrans',
		'Amount',
		'UserID',
		'Leg',
		'PackageID',
		'CryptoID',
		'PurchaseID',
		'PayoutType',
		'TransType',
		'PayoutHold'
	];
}
