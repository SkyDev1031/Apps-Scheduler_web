<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblReferralLinkSetting
 * 
 * @property int $id
 * @property string $ReferralLink
 * @property string $PlaceReferralOn
 * @property string $Status
 * @property int $UID
 *
 * @package App\Models
 */
class TblReferralLinkSetting extends Model
{
	protected $table = 'tbl_referral_link_settings';
	public $timestamps = false;

	protected $casts = [
		'UID' => 'int'
	];

	protected $fillable = [
		'ReferralLink',
		'PlaceReferralOn',
		'Status',
		'UID'
	];
}
