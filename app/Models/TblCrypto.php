<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TblCrypto
 * 
 * @property int $id
 * @property int $contractId
 * @property string $CryptoName
 * @property float $Price
 * @property string $Image
 * @property string $BlockchainName
 * @property string $SendWallet
 * @property string $ReceiveWallet
 * @property float $DepositFee
 * @property float $WithdrawalFee
 * @property float $TransferFee
 * @property float $SwapFee
 * @property string $contract_address
 * @property int $visible
 *
 * @package App\Models
 */
class TblCrypto extends Model
{
	protected $table = 'tbl_cryptos';
	public $timestamps = false;

	protected $casts = [
		'contractId' => 'int',
		'Price' => 'float',
		'DepositFee' => 'float',
		'WithdrawalFee' => 'float',
		'TransferFee' => 'float',
		'SwapFee' => 'float',
		'visible' => 'int',
		'pulse' => 'int',
		'explorer' => 'int',
		'discount' => 'float',
	];

	protected $fillable = [
		'contractId',
		'CryptoName',
		'Price',
		'Image',
		'BlockchainName',
		'SendWallet',
		'ReceiveWallet',
		'DepositFee',
		'WithdrawalFee',
		'TransferFee',
		'SwapFee',
		'contract_address',
		'visible',
		'pulse',
		'explorer',
		'discount',
		'SwapNetworkFee'

	];
}