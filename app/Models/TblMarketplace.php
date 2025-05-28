<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TblMarketplace
 * 
 * @property int $id
 * @property int $UserID
 * @property Carbon $InsertDate
 * @property string $TypeOfItem
 * @property int $Category
 * @property int $Quantity
 * @property string $ProductName
 * @property string $Description
 * @property string $Image1
 * @property string $Image2
 * @property string $Image3
 * @property string $Image4
 * @property string $Image5
 * @property string $Video
 * @property float $Price
 * @property string $Status
 * @property string $Ship_On
 * @property string $Feature
 * @property string $File1
 * @property string $File2
 * @property string $File3
 * @property string $File4
 * @property string $File5
 * @property string $File6
 * @property string $File7
 * @property string $File8
 * @property string $File9
 * @property string $File10
 * @property string $Video1
 * @property string $Video2
 * @property string $Video3
 * @property string $Video4
 * @property string $Video5
 * @property string $Video6
 * @property string $Video7
 * @property string $Video8
 * @property string $Video9
 * @property string $Video10
 * @property string $Name
 * @property string $Address
 * @property string $City
 * @property string $State
 * @property string $Country
 * @property string $Zip
 *
 * @package App\Models
 */
class TblMarketplace extends Model
{
	protected $table = 'tbl_marketplaces';
	public $timestamps = false;

	protected $casts = [
		'UserID' => 'int',
		'Category' => 'int',
		'Quantity' => 'int',
		'Price' => 'float'
	];

	protected $dates = [
		'InsertDate'
	];

	protected $fillable = [
		'UserID',
		'InsertDate',
		'TypeOfItem',
		'Category',
		'Quantity',
		'ProductName',
		'Description',
		'Image1',
		'Image2',
		'Image3',
		'Image4',
		'Image5',
		'Video',
		'Price',
		'Status',
		'Ship_On',
		'Feature',
		'File1',
		'File2',
		'File3',
		'File4',
		'File5',
		'File6',
		'File7',
		'File8',
		'File9',
		'File10',
		'Video1',
		'Video2',
		'Video3',
		'Video4',
		'Video5',
		'Video6',
		'Video7',
		'Video8',
		'Video9',
		'Video10',
		'Name',
		'Address',
		'City',
		'State',
		'Country',
		'Zip',
		'ShipCountries'
	];
}
