<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblAdminReferralSetting
 * 
 * @property int $id
 * @property string $ReferralType
 * @property string $Leg
 * @property string $Username
 *
 * @package App\Models
 */
class TblAdminReferralSetting extends Model
{
	protected $table = 'tbl_admin_referral_settings';
	public $timestamps = false;

	protected $fillable = [
		'ReferralType',
		'Leg',
		'Username'
	];
}
