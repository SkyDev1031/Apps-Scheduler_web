<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Package
 * 
 * @property int $id
 * @property string $PackageName
 * @property string $Description
 * @property string $Image
 * @property float $CryptoAmount
 * @property int $CryptoID
 * @property int $BillingIntervalDays
 * @property string $FolderName
 * @property string|null $BinaryPayoutEligible
 * @property string $status
 * @property int $PackageOrder
 * @property float $CryptoAmount90
 * @property int $BillingIntervalDays90
 * @property float $CryptoAmount365
 * @property int $BillingIntervalDays365
 *
 * @package App\Models
 */
class Package extends Model
{
	protected $table = 'packages';
	public $timestamps = false;

	protected $casts = [
		'CryptoAmount' => 'float',
		'CryptoID' => 'int',
		'BillingIntervalDays' => 'int',
		'PackageOrder' => 'int',
		'CryptoAmount90' => 'float',
		'BillingIntervalDays90' => 'int',
		'CryptoAmount365' => 'float',
		'BillingIntervalDays365' => 'int'
	];

	protected $fillable = [
		'PackageName',
		'Description',
		'Image',
		'CryptoAmount',
		'CryptoID',
		'BillingIntervalDays',
		'FolderName',
		'BinaryPayoutEligible',
		'status',
		'PackageOrder',
		'CryptoAmount90',
		'BillingIntervalDays90',
		'CryptoAmount365',
		'BillingIntervalDays365'
	];
}
