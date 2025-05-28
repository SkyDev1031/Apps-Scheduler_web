<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblSaleLog
 * 
 * @property int $id
 * @property int $ProductID
 * @property int $SellerID
 * @property int $BuyerID
 * @property Carbon $SaleDate
 * @property float $ProductPrice
 * @property float $BuyerFees
 * @property int $CryptoID
 * @property string $CryptoName
 * @property float $BillingAmount
 * @property string|null $BuyerName
 * @property string|null $Address
 * @property string|null $City
 * @property string|null $State
 * @property string|null $Country
 * @property string|null $Zip
 * @property Carbon|null $ExpiryDate
 * @property string $Status
 *
 * @package App\Models
 */
class TblSaleLog extends Model
{
	protected $table = 'tbl_sale_log';
	public $timestamps = false;

	protected $casts = [
		'ProductID' => 'int',
		'SellerID' => 'int',
		'BuyerID' => 'int',
		'ProductPrice' => 'float',
		'BuyerFees' => 'float',
		'CryptoID' => 'int',
		'BillingAmount' => 'float'
	];

	protected $dates = [
		'SaleDate',
		'ExpiryDate'
	];

	protected $fillable = [
		'ProductID',
		'SellerID',
		'BuyerID',
		'SaleDate',
		'ProductPrice',
		'BuyerFees',
		'CryptoID',
		'CryptoName',
		'BillingAmount',
		'BuyerName',
		'Address',
		'City',
		'State',
		'Zip',
		'ExpiryDate',
		'Status',
		'Country',
		'status'
	];
}
