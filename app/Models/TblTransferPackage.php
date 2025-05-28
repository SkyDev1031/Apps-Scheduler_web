<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblTransferPackage
 * 
 * @property int $ID
 * @property Carbon $TransDate
 * @property int $PackageID
 * @property int $PurchaseID
 * @property int $FromClientID
 * @property int $ToClientID
 * @property string $ScreenNamePhoneEmail
 * @property string $Status
 *
 * @package App\Models
 */
class TblTransferPackage extends Model
{
	protected $table = 'tbl_transfer_package';
	protected $primaryKey = 'ID';
	public $timestamps = false;

	protected $casts = [
		'PackageID' => 'int',
		'PurchaseID' => 'int',
		'FromClientID' => 'int',
		'ToClientID' => 'int'
	];

	protected $dates = [
		'TransDate'
	];

	protected $fillable = [
		'TransDate',
		'PackageID',
		'PurchaseID',
		'FromClientID',
		'ToClientID',
		'ScreenNamePhoneEmail',
		'Status'
	];
}
