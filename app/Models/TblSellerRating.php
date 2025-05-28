<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblSellerRating
 * 
 * @property int $id
 * @property int $OrderID
 * @property int $SellerID
 * @property int $BuyerID
 * @property int $Rating
 * @property string $Comments
 * @property string $ItemName
 * @property float $Price
 * @property Carbon $DateTime
 *
 * @package App\Models
 */
class TblSellerRating extends Model
{
	protected $table = 'tbl_seller_rating';
	public $timestamps = false;

	protected $casts = [
		'OrderID' => 'int',
		'SellerID' => 'int',
		'BuyerID' => 'int',
		'Rating' => 'int',
		'Price' => 'float'
	];

	protected $dates = [
		'DateTime'
	];

	protected $fillable = [
		'OrderID',
		'SellerID',
		'BuyerID',
		'Rating',
		'Comments',
		'ItemName',
		'Price',
		'DateTime'
	];
}
