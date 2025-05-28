<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class ClientsModel extends Model
{
    use HasFactory;

    public function set_client($id = '')
    {
        $status = $this->input->post('status');
        $username = $this->input->post('username');
        $password = $this->input->post('password');
        $secPassword = $this->input->post('secPassword');
        $fullname = $this->input->post('fullname');
        $ScreenName = $this->input->post('ScreenName');
        $sponsor = $this->input->post('sponsor');
        $phone = $this->input->post('phone');
        return  ClientsModel::insert_client($id, $status, $username, $password, $secPassword, $fullname, $ScreenName, $sponsor, $phone);
    }

    public function TransferAmountToAdmin(Request $request)
    {
        $TransAmount = $request->TransAmount;
        $userid = $request->userid;
        $cid = $request->cid;
        $AmountType = 'R';
        return  ClientsModel::insert_TransferAmountToAdmin($cid, $userid, $TransAmount, $AmountType);
    }
    public function TransferHoldAmountToAdmin(Request $request)
    {
        $TransAmount = $request->HoldTransAmount;
        $userid = $request->userid;
        $cid = $request->cid;
        $AmountType = 'H';
        return  ClientsModel::insert_TransferAmountToAdmin($cid, $userid, $TransAmount, $AmountType);
    }
    public function SavePayout()
    {
        $cid = $this->input->post('cid');
        $FirstAmount = $this->input->post('FirstAmount');
        $SecondAmount = $this->input->post('SecondAmount');
        $data = array(
            'CryptoID' => $cid,
            'FirstAmount' => $FirstAmount,
            'SecondAmount' => $SecondAmount,
            'DateOfTrans' => date('Y-m-d H:i:s')
        );
        ClientsModel::insert_payout($data);
    }

    public static function get_wallets()
    {
        return TblCrypto::select('tbl_cryptos.*', 'tbl_contracts.network', 'tbl_contracts.address')
            ->leftjoin('tbl_contracts', 'tbl_cryptos.contractId', '=', 'tbl_contracts.id')
            ->where('tbl_cryptos.visible', 1)
            ->get();
    }

    public static function get_SupportCredits($id)
    {
        $product_id = $id;
        return TblSupportBuy::where('tbl_support_buy.status', 1)
            ->where('tbl_support_buy.product_id', $product_id)->sum('tbl_support_buy.BusdAmount');
        
    }


    public static function get_final_walletsBalance($UID, $CID)
    {
        // Log::debug(__FUNCTION__ . " == " . __LINE__ . " $UID, $CID = : " . $UID . $CID);
        $netTotal = 0.0;
        if ($UID == 0)
            $result = TblWallet::where(['CID' => $CID, 'Status' => 'C'])->get();
        else
            $result = TblWallet::where(['CID' => $CID, 'UID' => $UID, 'Status' => 'C'])->get();
        $total = 0.0;
        foreach ($result as $r) {
            if ($r->TransType == 'D')
                $total =    $total + $r->Amount;
            else
                $total =    $total - $r->Amount;
        }
        $netTotal = $netTotal . $total . '+';
        if ($UID == 0)
            $result = TblTransfer::where(['CID' => $CID])->where('Status', '!=', 'C')->get();
        else
            $result = TblTransfer::where(['CID' => $CID, 'FromClientID' => $UID])->where('Status', '!=', 'C')->get();

        foreach ($result as $r) {
            if ($r->TransType == 'S')
                $total =    $total - (float)$r->Amount;
            else
                $total =    $total + (float)$r->Amount;
        }

        if ($UID == 0)
            $result = TblTransfer::where(['CID' => $CID, 'Status' => 'C'])->get(); // for sender
        else
            $result = TblTransfer::where(['CID' => $CID, 'FromClientID' => $UID, 'Status' => 'C'])->get(); // for sender

        foreach ($result as $r) {
            if ($r->TransType == 'S')
                $total =    $total + ($r->Amount - $r->TransferFee);
            else
                $total =    $total + ($r->Amount - $r->TransferFee);
        }

        $netTotal = $netTotal . $total . '+';
        if ($UID == 0)
            $result = TblTransfer::where(['CID' => $CID,  'Status' => 'A'])->get(); // for reciever
        else
            $result = TblTransfer::where(['CID' => $CID, 'ToClientID' => $UID, 'Status' => 'A'])->get(); // for reciever

        foreach ($result as $r) {
            if ($r->TransType == 'S')
                $total = $total + ($r->Amount - $r->TransferFee);
            else
                $total = $total - ($r->Amount - $r->TransferFee);
        }
        $netTotal = $netTotal . $total . '+';

        if ($UID == 0)
            $result = TblCryptoReferralLink::where(['CID' => $CID])->where('Status', '!=', 'Cancel')->get(); // for crypto canceled
        else
            $result = TblCryptoReferralLink::where(['CID' => $CID, 'UID' => $UID])->where('Status', '!=', 'Cancel')->get(); // for crypto canceled

        foreach ($result as $r) {
            $total =    $total - (($r->Amount * $r->Quantity) + $r->Fees);
        }
        $netTotal = $netTotal . $total . '+';

        if ($UID == 0) {
            $result = TblCryptoReferralLink::where(['CID' => $CID, 'Status' => 'Cancel'])->get(); // for crypto canceled
            foreach ($result as $r) $total =    $total + $r->Fees;
        } else {
            $result = TblCryptoReferralLink::where(['CID' => $CID, 'UID' => $UID, 'Status' => 'Cancel'])->get(); // for crypto canceled
            foreach ($result as $r) $total =    $total - $r->Fees;
        }

        // foreach ($result as $r) {
        //     $total =    $total + ($r->Amount * $r->Quantity);
        // }
        $balance = $total;

        // crypto referral (send-receive)
        if ($UID != 0) {
            $result = TblCryptoReferralLinkTransaction::where(['CID' => $CID, 'UserID' => $UID])->get();
            foreach ($result as $r) $total = $total + $r->Amount;

            $result = TblCryptoReferralLinkTransaction::where(['CID' => $CID, 'SenderID' => $UID])->get();
            foreach ($result as $r) $total = $total - $r->Amount;
        }

        // FOR PRODUCT PURCHASE
        if ($UID == 0)
            $result = TblSaleLog::where(['CryptoID' => $CID])->get();
        else
            $result = TblSaleLog::where(['CryptoID' => $CID, 'BuyerID' => $UID])->get();

        foreach ($result as $r) {
            $total =    $total - ($r->BillingAmount);
        }
        $balance = $total;

        // FOR PRODUCT SALE
        if ($UID == 0)
            $result = TblSaleLog::where(['CryptoID' => $CID])->get(); // for PRODUCT SALE
        else
            $result = TblSaleLog::where(['CryptoID' => $CID, 'SellerID' => $UID])->get(); // for PRODUCT SALE

        foreach ($result as $r) {
            $feesInCoin = $r->BillingAmount / $r->ProductPrice * $r->BuyerFees;
            $total =    $total + ($r->BillingAmount - $feesInCoin);
        }

        // FOR COIN STAKED
        if ($UID == 0)
            $result = TblStaked::where(['CryptoID' => $CID])->get(); // for PRODUCT SALE
        else
            $result = TblStaked::where(['CryptoID' => $CID, 'UserID' => $UID])->get(); // for PRODUCT SALE

        foreach ($result as $r) {
            $total =    $total - $r->StakeAmount;
        }

        // FOR COIN UNSTAKED
        if ($UID == 0)
            $result = TblUnstake::where(['CryptoID' => $CID])->get(); // for PRODUCT SALE
        else
            $result = TblUnstake::where(['CryptoID' => $CID, 'UserID' => $UID])->get(); // for PRODUCT SALE
        foreach ($result as $r) {
            $total =    $total + $r->UnstakeAmount;
        }

        // FOR COIN SWAP DEDUCT FROM THE BALANCE
        if ($UID == 0)
            $result = TblSwap::where(['CryptoID' => $CID])->get(); // for PRODUCT SALE
        else
            $result = TblSwap::where(['CryptoID' => $CID, 'UserID' => $UID])->get(); // for PRODUCT SALE
        foreach ($result as $r) {
            $total =    $total - ($r->SwapAmount + $r->FeesInCrypto);
        }

        // FOR COIN SWAP TO
        if ($UID == 0)
            $result = TblSwap::where(['SwapToCryptoID' => $CID])->get(); // for PRODUCT SALE
        else
            $result = TblSwap::where(['SwapToCryptoID' => $CID, 'UserID' => $UID])->get(); // for PRODUCT SALE
        foreach ($result as $r) {
            $total =    $total + $r->SwapAmountInCrypto;
        }

        // FOR SWAP FEES PAYOUT
        if ($UID == 0)
            $result = TblSwapFeesLog::where(['CryptoID' => $CID])->get(); // for PRODUCT SALE
        else
            $result = TblSwapFeesLog::where(['CryptoID' => $CID, 'UserID' => $UID])->get(); // for PRODUCT SALE
        foreach ($result as $r) {
            $total = $total + $r->SwapFeesCollected;
        }
        // FOR SWAP FEES PAYOUT
        if ($UID == 0)
            $result = FeesNetwork::where(['cryptoid' => $CID])->get(); // for PRODUCT SALE
        else
            $result = FeesNetwork::where(['cryptoid' => $CID, 'userid' => $UID])->get(); // for PRODUCT SALE
        foreach ($result as $r) {
            $total = $total + $r->amount;
        }

        $balance = $total;

        $sponsorBalance = ClientsModel::get_sponsor_wallet($UID, $CID) ?? 0;
        $balance = $balance + $sponsorBalance;

        $netTotal = $netTotal . $sponsorBalance . '+';

        $purchaseBalance = ClientsModel::get_purchases_for_wallet($UID, $CID) ?? 0;
        $balance = $balance - $purchaseBalance;
        $netTotal = $netTotal . $purchaseBalance . '+';

        $finaltransferamount = ClientsModel::get_transfer_amount($UID, $CID, 'R') ?? 0;
        $balance = $balance - $finaltransferamount;

        // return $netTotal = $netTotal . $finaltransferamount . '=' . $balance;
        return $balance;
    }
    // ---------------------------------count or sum ------------------------------

    public static function get_sponsor_wallet($userID, $CryptoID, $Leg = '')
    {
        if ($userID == 0)
            return TblSponsorPayoutLog::where(['CryptoID' => $CryptoID, 'PayoutHold' => 'O'])->sum('Amount');

        return TblSponsorPayoutLog::where(['SponsorID' => $userID, 'CryptoID' => $CryptoID, 'PayoutHold' => 'O'])->sum('Amount');
    }

    public static function get_transfer_amount($userID, $CryptoID, $AmountType)
    {
        if ($userID == 0)
            return TblClientToAdminTransferLog::where(['CoinID' => $CryptoID, 'AmountType' => $AmountType])->sum('Amount');
        return TblClientToAdminTransferLog::where(['userID' => $userID, 'CoinID' => $CryptoID, 'AmountType' => $AmountType])->sum('Amount');
    }
    public static function get_purchases_for_wallet($user_id, $walletid)
    {
        if ($user_id == 0)
            return Purchase::select('SUM(purchases.price) as Amount')
                ->leftjoin('packages as pk', 'pk.id', '=', 'purchases.package_id')
                ->join('tbl_cryptos as c', 'pk.CryptoID', '=', 'c.id')
                ->where(['purchases.CryptoID' => $walletid])
                ->sum('purchases.price');
        return Purchase::select('SUM(purchases.price) as Amount')
            ->leftjoin('packages as pk', 'pk.id', '=', 'purchases.package_id')
            ->join('tbl_cryptos as c', 'pk.CryptoID', '=', 'c.id')
            ->where(['purchases.user_id' => $user_id, 'purchases.CryptoID' => $walletid])
            ->sum('purchases.price');
    }
    public static function get_binary_hold_balance($userID, $CryptoID)
    {
        return TblSponsorPayoutLog::where('SponsorID', $userID)
            ->where('CryptoID', $CryptoID)
            ->where('PayoutType', 'B')
            ->where('PayoutHold', 'H')
            ->sum('Amount');
    }
    public static function get_sponsor_hold_balance($userID, $CryptoID)
    {
        return TblSponsorPayoutLog::where('SponsorID', $userID)
            ->where('CryptoID', $CryptoID)
            ->where('PayoutType', 'S')
            ->where('PayoutHold', 'H')
            ->sum('Amount');
    }
    public static function get_sponsor_payout($userID, $PurchaseID)
    {
        return TblSponsorPayoutLog::where('SponsorID', $userID)->where('PurchaseID', $PurchaseID)->count();
    }

    public static function get_all_transfer_amount($CryptoID)
    {
        return TblClientToAdminTransferLog::where('CoinID', $CryptoID)
            ->sum('Amount');
    }
    public static function getUnstakedAmount($UserID, $CryptoID)
    {
        // IMPORTANT
        return TblUnstake::where('UserID', $UserID)->where('CryptoID', $CryptoID)->groupby('StakedID')->sum('UnstakeAmount');
    }

    public static function get_all_payout_amount($CryptoID)
    {
        return TblAdminPayoutLog::select(DB::raw('sum(FirstAmount) + sum(SecondAmount) as amount'))
            ->where('CryptoID', $CryptoID)
            ->value('amount');
    }
    // --------------------------------------------------------------------------------

    public static function insert_client($id, $status, $username, $password, $secPassword, $fullname, $ScreenName, $sponsor, $phone)
    {
        $password = Hash::make($password);
        $secPassword = Hash::make($secPassword);

        if ($status == 'Suspended' || $status == 'Pending') {
            $CanReceiveBinaryPayouts = "M";
        } else {
            $total_purchase = count(ClientsModel::get_any_purchase($id));
            if ($total_purchase != 0) $CanReceiveBinaryPayouts = "Y";
            else $CanReceiveBinaryPayouts = "N";
        }
        $data = compact('username', 'password', 'secPassword', 'fullname', 'ScreenName', 'sponsor', 'phone', 'status', 'CanReceiveBinaryPayouts');
        if (empty($id)) {
            $data['created_at'] = date('Y-m-d');
            return User::create($data);
        } else {
            return User::find($id)->update($data);
        }
    }

    public static function get_any_purchase($uid)
    {
        return Purchase::where('user_id', $uid)->where('status', 'Active')->where('IsBinaryPayout', 'Y')->where('expiry_date', '>=', date("Y-m-d"))->get();
    }

    public static function getPurchaseByPackageID($PackageID, $uid)
    {
        return Purchase::where('package_id', $PackageID)->where('user_id', $uid)->where('status', 'Active')->where('expiry_date', '>=', date("Y-m-d"))->get();
    }

    public static function getClientName($id)
    {
        $user = User::find($id);
        if (!$user) return 'Deleted';
        return $user->ScreenName;
    }

    public static function getDirectReferrals($sponsor)
    {
        return User::where('sponsor', $sponsor)->count();
    }

    public static function get_clientByScreenNamePhoneEmail($ScreenNamePhoneEmail)
    {
        return User::where('username', $ScreenNamePhoneEmail)->orwhere('ScreenName', $ScreenNamePhoneEmail)->orwhere('Phone', $ScreenNamePhoneEmail)->first();
    }
    public static function search_clients($data)
    {
        // IMPORTANT
        $query = User::query();
        foreach ($data as $key => $value) {
            $query = $query->where($key, 'LIKE', "%{$value}%");
        }
        return $query->get();
    }
    public static function get_active_clients()
    {
        return User::where('status', 'Active')->get();
    }
    public static function get_all_clients()
    {
        return User::select('*')->get();
    }
    public static function unset_client($id)
    {

        User::find($id)->delete();
    }
    public static function record_count()
    {
        User::select("*")->count();
    }

    public static function set_text_status($data)
    {
        return TblSmsSendLog::create($data);
    }
    public static function update_text_status($data, $status, $sendto)
    {
        return TblSmsSendLog::where(['status' => $status, 'sendto' => $sendto])->update($data);
    }

    public static function get_wallets_by_contract($CID = null)
    {
        $query = TblCrypto::select('tbl_cryptos.*', 'tbl_contracts.network', 'tbl_contracts.address')
            ->leftjoin('tbl_contracts', 'tbl_cryptos.contractId', '=', 'tbl_contracts.id');
        if ($CID) {
            $query = $query->where('tbl_cryptos.contractId', $CID);
        }
        return $query->where('tbl_cryptos.visible', 1)->get();
    }

    public static function get_wallet($UID = 0, $CID)
    {
        return TblCrypto::select('tbl_cryptos.*', 'tbl_contracts.network', 'tbl_contracts.address')
            ->leftjoin('tbl_contracts', 'tbl_cryptos.contractId', '=', 'tbl_contracts.id')
            ->where('tbl_cryptos.id', $CID)->first();
    }

    public static function get_user_rec_wallets($UID, $CID)
    {
        return TblUserRecWallet::where(['cid' => $CID, 'uid' => $UID])->get();
    }


    public static function get_walletsBalance($UID, $CID)
    {
        $result = TblWallet::where(['CID' => $CID, 'UID' => $UID, 'Status' => 'C'])->get();
        $total = 0.0;
        foreach ($result as $r) {
            if ($r->TransType == 'D')
                $total = $total + $r->Amount;
            else
                $total = $total - $r->Amount;
        }

        $result = TblTransfer::where(['CID' => $CID, 'FromClientID' => $UID])->get(); // for sender
        foreach ($result as $r) {
            if ($r->TransType == 'S')
                $total = $total - $r->Amount;
            else
                $total = $total + $r->Amount;
        }

        $result = TblTransfer::where(['CID' => $CID, 'ToClientID' => $UID, 'Status' => 'A'])->get(); // for reciever
        foreach ($result as $r) {
            if ($r->TransType == 'S')
                $total = $total + $r->Amount;
            else
                $total = $total - $r->Amount;
        }

        $result = TblCryptoReferralLink::where(['CID' => $CID, 'UID' => $UID])->where('Status', '!=', 'Cancel')->get(); // for reciever
        foreach ($result as $r) {
            $total = $total - (($r->Amount * $r->Quantity) + $r->Fees);
        }

        $result = TblCryptoReferralLink::where(['CID' => $CID, 'UID' => $UID, 'Status' => 'Cancel'])->get(); // for crypto canceled

        foreach ($result as $r) {
            $Cancel = $r->Amount * $r->Quantity;
            $total = $total + $Cancel;
        }
        return $total;
    }

    public static function insert_deposit($CID, $Amount, $ToReceiveWallet, $TransID, $UID)
    {
        $TransDate = date('Y-m-d h:i:s');
        $TransType = 'D';
        $Status = 'C';
        $WithdrawalFeeType = '';
        $data = compact('CID', 'Amount', 'TransDate', 'TransType', 'WithdrawalFeeType', 'ToReceiveWallet', 'TransID', 'Status', 'UID');
        return TblWallet::create($data)->id;
    }

    public static function update_deposit_by_text($id, $Amount)
    {
        $result = TblWallet::where(['id' => $id, 'Status' => 'P'])->get();
        if (!isset($result[0])) return;
        if ($result[0]->TransType == 'W') {
            if ($Amount == '0') $data = array('Status' => 'R');
            else $data = array('TransID' => $Amount, 'Status' => 'C');
        } else {
            $data = array('Amount' => $Amount, 'Status' => 'C');
        }
        TblWallet::where(['id' => $id, 'Status' => 'P'])->update($data);
    }

    public static function get_deposit($uid = null)
    {
        $query = TblWallet::where('TransType', 'D');
        if ($uid) $query = $query->where('UID', $uid);
        return $query->orderby('Status', 'ASC')
            ->orderby('id', 'desc')
            ->get();
    }

    public static function insert_withdrawal($UID, $CID, $Amount, $WithdrawalFeeType, $ToReceiveWallet, $TransID)
    {
        $TransDate = date('Y-m-d h:i:s');
        $TransType = 'W';
        $Status = 'C';
        $data = compact('CID', 'Amount', 'TransDate', 'TransType', 'WithdrawalFeeType', 'ToReceiveWallet', 'TransID', 'Status', 'UID');
        return TblWallet::create($data)->id;
    }


    public static function update_sender_balance($id = '', $Amount)
    {
        // $balance = User::find($id)->value('WalletBalance') - $Amount;
        // User::where('id', $id)->update('WalletBalance', $balance);
    }

    public static function update_transfer($tid = '')
    {
        TblTransfer::where('id', $tid)->update(['Status' => 'A']);
    }

    public static function update_ReceiveBinaryPayoutStatus($id = '')
    {
        User::find($id)->update(['CanReceiveBinaryPayouts' => 'Y']);
    }

    public static function cancel_transfer($tid)
    {
        TblTransferPackage::find($tid)->update(['Status' => 'C']);
    }
    public static function accept_transfer($tid)
    {
        $transfer = TblTransferPackage::find($tid);
        $transfer->update(['Status' => 'A']);
        // Transfered
        $purchage = Purchase::find($transfer->PurchaseID);
        $expiry_date = $purchage->expiry_date;
        $purchase_date = $purchage->purchase_date;
        if ($purchage->active == 1) {
            $pendingPackage = Purchase::where([
                'user_id' => $transfer->ToClientID,
                'package_id' => $purchage->package_id,
                'active' => 0
            ])->count();
            if ($pendingPackage <= 0) {
                $purchase_date = date("Y-m-d");
                $expiry_date = Carbon::now()->addDays($purchage->BillingIntervalDays)->format("Y-m-d");
            }
        } else {
            $pendingPackage = Purchase::where([
                'user_id' => $purchage->user_id,
                'package_id' => $purchage->package_id,
                'active' => 1
            ])->first();
            if ($pendingPackage) {
                $purchase_date = date("Y-m-d");
                $expiry_date = Carbon::now()->addDays($pendingPackage->BillingIntervalDays)->format("Y-m-d");

                $pendingPackage->update([
                    'purchase_date' => $purchase_date,
                    'expiry_date' => $expiry_date,
                    'RenewDate' => $expiry_date,
                    'active' => 0,
                ]);
            }
        }
        $purchage->update(['status' => 'Transfered']);
        $purchage->user_id = $transfer->ToClientID;
        $purchage->purchase_date = $purchase_date;
        $purchage->expiry_date = $expiry_date;
        $purchage->RenewDate = $expiry_date;
        $purchage->autoPay = "0";
        $purchage = json_decode(json_encode($purchage), true);
        Purchase::create($purchage);
    }

    public static function cancel_transaction($tid)
    {
        // IMPORTANT CID
        TblTransfer::find($tid)->update(['Status' => 'C']);
    }

    public static function insert_transfer($FromClientID, $ToClientID, $CID, $Amount, $TransferFee, $FeesType, $ScreenNamePhoneEmail)
    {
        $Status = 'P';
        $TransDate = date('Y-m-d h:i:s');
        $data = compact('CID', 'Amount', 'TransDate', 'TransferFee', 'FeesType', 'FromClientID', 'ToClientID', 'Status', 'ScreenNamePhoneEmail');
        return TblTransfer::create($data)->id;
    }

    public static function get_withdrawal($uid)
    {
        $query = TblWallet::where('TransType', 'W');
        if ($uid) $query = $query->where('UID', $uid);
        return $query->orderby('Status', 'ASC')->orderby('id', 'desc')->get();
    }

    public static function get_transfer($uid = null)
    {
        $query = TblTransfer::select("*");
        if ($uid) $query = $query->where('FromClientID', $uid)->orwhere('ToClientID', $uid);
        return $query->orderby('Status', 'ASC')->orderby('id', 'desc')->get();
    }

    public static function get_referral_setting($UID = FALSE)
    {
        return TblReferralLinkSetting::where('UID', $UID)->first();
    }

    public static function get_cryptos($limit = 0, $start = 0)
    {
        if ($limit != 0 && $start != 0)
            return TblCrypto::limit($limit)->offset($start)->get();
        return TblCrypto::select('*')->get();
    }
    public static function get_crypto($id = FALSE)
    {
        return TblCrypto::find($id);
    }
    public static function insert_referral_link($id, $UID, $ReferralLink, $PlaceReferralOn)
    {
        $Status = 'A';
        $data = compact('ReferralLink', 'PlaceReferralOn', 'UID', 'Status');
        if (empty($id)) {
            return TblReferralLinkSetting::create($data);
        } else {
            return TblReferralLinkSetting::where('id', $id)->update($data);
        }
    }

    // Generate token
    public static function getLink($length)
    {
        $token = "";
        $codeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        $codeAlphabet .= "abcdefghijklmnopqrstuvwxyz";
        $codeAlphabet .= "0123456789";
        $max = strlen($codeAlphabet); // edited

        for ($i = 0; $i < $length; $i++) {
            $token .= $codeAlphabet[rand(0, $max - 1)];
        }

        return $token;
    }

    public static function get_cryptoreferrallinklog($uid)
    {
        return TblCryptoReferralLink::where('UID', $uid)->orderby('Status', 'ASC')->orderby('id', 'desc')->get();
    }

    public static function cancel_cryptoreferrallink($ID)
    {
        return TblCryptoReferralLink::where('id', $ID)->update(['Status' => 'Cancel']);
    }

    public static function get_clients_for_tree($user_id)
    {
        // IMPORTANT
        $sql = "SELECT ParentID,Leg FROM users WHERE id = " . $user_id . " UNION ALL SELECT cp.id,c.Leg FROM users AS cp JOIN users AS c ON cp.id = c.ParentID";
        return DB::select($sql);
    }

    public static function get_clients_tree()
    {
        // IMPORTANT
        $sql = "SELECT ParentID,Leg FROM users UNION ALL SELECT cp.id,c.Leg FROM users AS cp JOIN users AS c ON cp.id = c.ParentID";
        return DB::select($sql);
    }

    public static function getUser($ParentID)
    {
        return User::where('ParentID', $ParentID)->orderby("Leg", "ASC")->get();
    }
    public static function getUserLevel($ParentID, $Leg)
    {
        return User::where('ParentID', $ParentID)->where('Leg', $Leg)->orderby("Leg", "ASC")->get();
    }

    public static function getRankSetting()
    {
        return TblNetworkSetting::select('Rank', 'Subscription')->orderby("Rank", "DESC")->get();
    }

    public static function get_network_logs($id)
    {
        $query = TblSponsorPayoutLog::select('tbl_sponsor_payout_log.*', 'c.CryptoName')
            ->join('tbl_cryptos as c', 'tbl_sponsor_payout_log.CryptoID', '=', 'c.id');
        if ($id) $query = $query->where('SponsorID', $id);
        return $query->orderby("DateOfTrans", "DESC")
            ->orderby("tbl_sponsor_payout_log.id", "DESC")
            ->get();
    }
    public static function get_all_payout($limit = 100, $start = 1)
    {
        $query = TblSponsorPayoutLog::select('tbl_sponsor_payout_log.*', 'c.CryptoName')
            ->join('tbl_cryptos as c', 'tbl_sponsor_payout_log.CryptoID', '=', 'c.id')
            ->orderby("DateOfTrans", "DESC")
            ->orderby("tbl_sponsor_payout_log.id", "DESC");
        if ($start != 0) $query = $query->limit($limit)->offset($start);
        return $query->get();
    }

    public static function UpdateHoldToExpire($interval)
    {
        $sql = "UPDATE tbl_sponsor_payout_log SET PayoutHold = 'E' WHERE PayoutHold='H' and DateOfTrans <= DATE_ADD(DateOfTrans, INTERVAL " . $interval . " DAY)";
        return DB::select($sql);
    }

    public static function get_current_network_balance($UserID, $CryptoID)
    {
        return TblNetworkCurrent::where('CryptoID', $CryptoID)->where('UserID', $UserID)->first();
    }

    public static function get_client_details($UserID, $PackageID)
    {
        $query = Purchase::select('purchases.*', 'ur.*', 'pk.PackageName', 'c.CryptoName')
            ->join('users as ur', 'ur.id', '=', 'purchases.user_id')
            ->join('packages as pk', 'pk.id', '=', 'purchases.package_id')
            ->join('tbl_cryptos as c', 'pk.CryptoID', '=', 'c.id')
            ->where('pk.id', $PackageID);

        if (!empty($UserID)) $query = $query->where('purchases.user_id', $UserID);

        return $query->orderby('purchases.purchase_date', 'desc')->get();
    }

    public static function get_for_transfer_client_details($UserID, $PurchaseID, $CryptoID)
    {
        $query = TblTransfer::select('tbl_transfer.*', 'ur.fullname as fromClientName', 'ur2.fullname as toClientName', 'c.CryptoName', 'tbl_transfer.Amount as price')
            ->join('users as ur', 'ur.id', '=', 'tbl_transfer.FromClientID')
            ->join('users as ur2', 'ur2.id', '=', 'tbl_transfer.ToClientID')
            ->join('tbl_cryptos as c', 'tbl_transfer.CID', '=', 'c.id')
            ->where('tbl_transfer.id', $PurchaseID);
        if (!empty($UserID))
            $query = $query->where('tbl_transfer.FromClientID', $UserID);
        return $query->get();
    }

    public static function get_for_cryptoreferal_client_details($UserID, $PurchaseID, $CryptoID)
    {
        // IMPORTANT
        $query = TblCryptoReferralLink::select(DB::raw('tbl_crypto_referral_link.*,ur.*,c.CryptoName,(Amount) as price'))
            ->join('users as ur', 'ur.id', '=', 'tbl_crypto_referral_link.UID')
            ->join('tbl_cryptos as c', 'tbl_crypto_referral_link.CID', '=', 'c.id')
            ->where('tbl_crypto_referral_link.id', $PurchaseID);
        if (!empty($UserID)) $query = $query->where('tbl_crypto_referral_link.UID', $UserID);
        return $query->get();
    }

    public static function get_withdrawal_client_details($UserID, $PurchaseID, $CryptoID)
    {
        $query = TblWallet::select('tbl_wallets.*', 'ur.*', 'c.CryptoName', 'Amount as price')
            ->join('users as ur', 'ur.id', '=', 'tbl_wallets.UID')
            ->join('tbl_cryptos as c', 'tbl_wallets.CID', '=', 'c.id')
            ->where('tbl_wallets.id', $PurchaseID)
            ->where('tbl_wallets.TransType', 'W');
        if (!empty($UserID)) $query = $query->where('tbl_wallets.UID', $UserID);
        return $query->get();
    }

    public static function get_deposit_client_details($UserID, $PurchaseID, $CryptoID)
    {
        $query = TblWallet::select('tbl_wallets.*', 'ur.*', 'c.CryptoName', 'Amount as price')
            ->join('users as ur', 'ur.id', '=', 'tbl_wallets.UID')
            ->join('tbl_cryptos as c', 'tbl_wallets.CID', '=', 'c.id')
            ->where('tbl_wallets.id', $PurchaseID)
            ->where('tbl_wallets.TransType', 'D');
        if (!empty($UserID)) $query = $query->where('tbl_wallets.UID', $UserID);
        return $query->get();
    }

    public static function get_purchase_client_details($UserID, $PurchaseID, $CryptoID)
    {
        $query = TblSaleLog::select(DB::raw('tbl_sale_log.*,ur.*,c.CryptoName,(tbl_sale_log.BillingAmount) as price'))
            ->join('users as ur', 'ur.id', '=', 'tbl_sale_log.BuyerID')
            ->join('tbl_cryptos as c', 'tbl_sale_log.CryptoID', '=', 'c.id')
            ->where('tbl_sale_log.id', $PurchaseID);
        if (!empty($UserID))
            $query = $query->where('tbl_sale_log.BuyerID', $UserID);
        return $query->get();
    }

    public static function getRankSettingByRank($Rank)
    {
        return TblNetworkSetting::where('Rank', $Rank)->orderby("Rank", "DESC")->first();
    }

    public static function getUserByID($id)
    {
        return User::where('id', $id)->first();
    }
    public static function getSponsor($sponsor)
    {
        return User::where('ScreenName', $sponsor)->first();
    }
    public static function get_network_currents()
    {
        return TblNetworkCurrent::where('LeftBalance', '!=', 0)->where('RightBalance', '!=', 0)->get();
    }
    public static function update_hold_to_open_status($uid)
    {
        return TblSponsorPayoutLog::where('SponsorID', $uid)->where('PayoutHold', 'H')->update(['PayoutHold' => 'O']);
    }
    public static function insert_TransferAmountToAdmin($CoinID, $UserID, $Amount, $AmountType)
    {
        $DateOfTransfer = date('Y-m-d');
        $data = compact('CoinID', 'UserID', 'AmountType', 'Amount', 'DateOfTransfer');
        return TblClientToAdminTransferLog::create($data);
    }

    public static function get_all_admintransferlog()
    {
        return  ClientsModel::get_client_admintransferlog();
    }

    public static function get_client_admintransferlog($UserID = null)
    {
        $query = TblClientToAdminTransferLog::select("*")
            ->join('tbl_cryptos as c', 'tbl_client_to_admin_transfer_log.CoinID', '=', 'c.id');
        if ($UserID) {
            $query = $query->where('tbl_client_to_admin_transfer_log.UserID', $UserID);
        }

        return $query->orderby("DateOfTransfer", "DESC")
            ->orderby("tbl_client_to_admin_transfer_log.id", "DESC")
            ->get();
    }

    public static function get_package_transfer($uid)
    {
        return TblTransferPackage::select('tbl_transfer_package.*', 'p.PackageName')
            ->join('packages as p', 'tbl_transfer_package.PackageID', '=', 'p.id')
            ->where('FromClientID', $uid)
            ->orwhere('ToClientID', $uid)
            ->orderby('Status', 'ASC')
            ->orderby('id', 'DESC')
            ->get();
    }

    public static function update_transfer_package($user_id, $PID)
    {
        return TblTransferPackage::where('ID', $PID)->update(['Status' => 'A']);
    }

    public static function insert_stake($data)
    {
        return TblStaked::create($data)->id;
    }

    public static function remove_stake($id = '')
    {
        return TblStaked::where('id', $id)->update(['Status' => 'I']);
    }

    public static function insert_swap($data)
    {
        return TblSwap::create($data)->id;
    }

    public static function insert_support_buy($data)
    {
        return TblSupportBuy::create($data)->id;
    }

    public static function get_my_staked($ID)
    {
        return TblStaked::select(DB::raw('tbl_staked.*, sum(tbl_staked.StakeAmount) as StakeAmount,c.Image,c.CryptoName,c.Price'))
            ->join('tbl_cryptos as c', 'tbl_staked.CryptoID', '=', 'c.id')
            ->where('tbl_staked.UserID', $ID)
            ->where('Status', 'A')
            ->orderby('tbl_staked.UserID')
            ->groupby('tbl_staked.CryptoID')
            ->get();
    }

    public static function get_all_staked_crypto_wise($CryptoID)
    {
        return TblStaked::where('Status', 'A')->where('CryptoID', $CryptoID)->orderby('UserID')->get();
    }

    // FIND PERCENTAGE
    public static function getPercentage($UserID, $CryptoID)
    {
        $totalStake = TblStaked::where('Status', 'A')->where('CryptoID', $CryptoID)->sum('StakeAmount');
        $totalUnStake = TblUnstake::where('CryptoID', $CryptoID)->sum('UnstakeAmount');

        $userStake = TblStaked::where('Status', 'A')->where('CryptoID', $CryptoID)->where('UserID', $UserID)->sum('StakeAmount');
        $userUnStake = TblUnstake::where('CryptoID', $CryptoID)->where('UserID', $UserID)->sum('UnstakeAmount');

        return number_format(($userStake - $userUnStake) / ($totalStake - $totalUnStake) * 100, 2);

        // $AllStaked =  ClientsModel::get_all_staked_crypto_wise($CryptoID);

        // foreach ($AllStaked as $staked) {
        //     $UserWiseAmount[$staked->UserID][$staked->CryptoID] = 0;
        // }

        // $total = 0;
        // foreach ($AllStaked as $staked) {
        //     $UserWiseAmount[$staked->UserID][$staked->CryptoID] = $UserWiseAmount[$staked->UserID][$staked->CryptoID] + $staked->StakeAmount;
        //     $total = $total + $staked->StakeAmount;
        // }

        // if (isset($UserWiseAmount[$UserID][$CryptoID]) && $UserWiseAmount[$UserID][$CryptoID] != '')
        //     return number_format($UserWiseAmount[$UserID][$CryptoID] / $total * 100, 2);
        // else
        //     return 0;
    }
    public static function get_current_stacked($CryptoID = null)
    {
        // IMPORTANT
        $query = DB::table('tbl_staked as s')
            ->select(DB::raw('s.*,sum(s.StakeAmount) as StakeAmount, c.Image, c.CryptoName'))
            ->join('tbl_cryptos as c', 's.CryptoID', '=', 'c.id')
            ->groupby('s.CryptoID')
            ->where('Status', 'A');

        if ($CryptoID) return $query->where('CryptoID', $CryptoID)->first();
        return $query->get();
    }
    public static function get_stake_amount($CryptoID = null)
    {
        $userStake = TblStaked::where('CryptoID', $CryptoID)->sum('StakeAmount');
        $userUnStake = TblUnstake::where('CryptoID', $CryptoID)->sum('UnstakeAmount');
        return $userStake - $userUnStake;
        // return TblStaked::where('CryptoID', $CryptoID)->sum('StakeAmount');
    }

    public static function get_swaped_coin_to($SwapToCryptoID)
    {
        $SwapAmountInCrypto = TblSwap::where('SwapToCryptoID', $SwapToCryptoID)->sum('SwapAmountInCrypto');
        $SwapAmount = TblSwap::where('SwapToCryptoID', $SwapToCryptoID)->sum('SwapAmount');
        $FeesInCrypto = TblSwap::where('SwapToCryptoID', $SwapToCryptoID)->sum('FeesInCrypto');
        return compact('SwapAmountInCrypto', 'SwapAmount', 'FeesInCrypto');
    }

    public static function get_swaped_coin($CryptoID)
    {
        $SwapAmountInCrypto = TblSwap::where('CryptoID', $CryptoID)->sum('SwapAmountInCrypto');
        $SwapAmount = TblSwap::where('CryptoID', $CryptoID)->sum('SwapAmount');
        $FeesInCrypto = TblSwap::where('CryptoID', $CryptoID)->sum('FeesInCrypto');
        return compact('SwapAmountInCrypto', 'SwapAmount', 'FeesInCrypto');
    }
    public static function get_swaped($CryptoID)
    {
        $SwapAmount = TblSwap::where('CryptoID', $CryptoID)->sum('SwapAmount'); //+
        $FeesInCrypto = TblSwap::where('CryptoID', $CryptoID)->sum('FeesInCrypto'); //+
        $SwapAmountInCrypto = TblSwap::where('SwapToCryptoID', $CryptoID)->sum('SwapAmountInCrypto'); //-
        $SwapFeesCollected = TblSwapFeesLog::where('CryptoID', $CryptoID)->sum('SwapFeesCollected'); //+
        return compact('SwapAmount', 'SwapAmountInCrypto', 'FeesInCrypto', 'SwapFeesCollected');
    }

    public static function get_swap($uid)
    {
        return TblSwap::select('tbl_swap.*', 'c.CryptoName')
            ->join('tbl_cryptos as c', 'tbl_swap.CryptoID', '=', 'c.id')
            ->where('UserID', $uid)
            ->orderby('DateOfSwap', 'desc')
            ->get();
    }

    public static function get_staked($ID)
    {
        return TblStaked::select('tbl_staked.*', 'c.Image', 'c.CryptoName')
            ->join('tbl_cryptos as c', 'tbl_staked.CryptoID', '=', 'c.id')
            ->where('tbl_staked.UserID', $ID)
            ->orderby('Status', 'asc')
            ->get();
    }

    public static function get_stake($ID)
    {
        return TblStaked::select(DB::raw('tbl_staked.*,sum(StakeAmount) as StakeAmount,c.Image,c.CryptoName'))
            ->join('tbl_cryptos as c', 'tbl_staked.CryptoID', '=', 'c.id')
            ->where('tbl_staked.id', $ID)
            ->groupby('tbl_staked.CryptoID')
            ->get();
    }

    public static function insert_unstake($data)
    {
        return TblUnstake::create($data)->id;
    }

    public static function getUsersForSwapFeesPayout()
    {
        return DB::table('tbl_swap as s')
            ->select(DB::raw('s.ID,s.SwapToCryptoID, sum(s.FeesInCrypto) as FeesInCrypto'))
            ->groupby('s.SwapToCryptoID')
            ->where('SwapPayout', 'N')
            ->get();
    }

    public static function updateSwapFeesPayout($SwapToCryptoID)
    {
        return TblSwap::where('SwapToCryptoID', $SwapToCryptoID)->update(['SwapPayout' => 'Y']);
    }

    public static function get_staked_network_balance($CryptoID)
    {
        // FOR COIN STAKED
        $total = 0;
        $result = TblStaked::where('CryptoID', $CryptoID)->get(); // for PRODUCT SALE
        foreach ($result as $r) {
            $total = $total + $r->StakeAmount;
        }

        // FOR COIN UNSTAKED
        $result = TblUnstake::where('CryptoID', $CryptoID)->get(); // for PRODUCT SALE
        foreach ($result as $r) {
            $total = $total - $r->UnstakeAmount;
        }

        // FOR COIN SWAP DEDUCT FROM THE BALANCE
        $result = TblSwap::where('CryptoID', $CryptoID)->get(); // for PRODUCT SALE
        foreach ($result as $r) {
            $total = $total + ($r->SwapAmount + $r->FeesInCrypto);
        }

        // FOR COIN SWAP TO
        $result = TblSwap::where('SwapToCryptoID', $CryptoID)->get(); // for COIN SWAP TO
        foreach ($result as $r) {
            $total = $total - $r->SwapAmountInCrypto;
        }

        // FOR SWAP FEES PAYOUT
        $result = TblSwapFeesLog::where('CryptoID', $CryptoID)->get(); // for SWAP FEES PAYOUT
        foreach ($result as $r) {
            $total = $total + $r->SwapFeesCollected;
        }
        return $total;
    }

    public static function insert_payout($data)
    {
        return TblAdminPayoutLog::create($data)->id;
    }
    public static function get_settings_for_frontend()
    {
        return AdminSettings::where('id', 1)->first();
    }
    public static function get_packages()
    {
        return Package::select(DB::raw('packages.*,c.CryptoName,c.Image as CryptoImage'))
            ->join('tbl_cryptos as c', 'packages.CryptoID', '=', 'c.id')
            ->orderby('PackageOrder', 'ASC')
            ->get();
    }
    public static function get_purchases($user_id = null)
    {
        $query = Purchase::select(DB::raw('purchases.*,purchases.BillingIntervalDays as realDays,u.fullname,pk.PackageName,pk.BillingIntervalDays,c.CryptoName,pk.CryptoAmount, pk.Image, pk.FolderName'))
            ->leftjoin('tbl_cryptos as c', 'c.id', '=', 'purchases.CryptoID')
            ->leftjoin('users as u', 'u.id', '=', 'purchases.user_id')
            ->leftjoin('packages as pk', 'pk.id', '=', 'purchases.package_id');
        if ($user_id > 0) $query = $query->where('purchases.user_id', $user_id);
        return $query->orderby('purchases.purchase_date', 'desc')->get();
    }

    public static function get_marketplaces_byuid($UID, $mid = 0)
    {
        if ($mid > 0) {
            return TblMarketplace::select('tbl_marketplaces.*', 'c.CategoryName')
                ->join('tbl_category as c', 'tbl_marketplaces.Category', '=', 'c.ID')
                ->where('tbl_marketplaces.id', $mid)
                ->first();
        }
        return TblMarketplace::select('tbl_marketplaces.*', 'c.CategoryName')
            ->join('tbl_category as c', 'tbl_marketplaces.Category', '=', 'c.ID')
            ->where('tbl_marketplaces.UserID', $UID)
            ->orderby('Feature', 'ASC')
            ->get();
    }
    public static function get_marketplaces($id = null)
    {
        $query = DB::table('tbl_marketplaces as m')
            ->select('m.*', 'c.CategoryName')
            ->join('tbl_category as c', 'm.Category', '=', 'c.ID')
            ->join('users as u', 'm.UserID', '=', 'u.id');
        if ($id) return $query->where('m.id', $id)->first();
        return $query->where('m.Status', 'A')->get();
    }
    public static function getCategoryList()
    {
        return DB::table('tbl_category as c')
            ->select(DB::raw('c.Status,c.ID,p.ID AS PID, p.CategoryName AS Parent, c.CategoryName AS Child'))
            ->leftjoin('tbl_category AS p', 'p.ID', '=', 'c.ParentID')
            ->get();
    }
    public static function get_product_sales($UserID)
    {
        return TblMarketplace::select('tbl_marketplaces.*', 'c.CategoryName', 's.*', 'u.fullname', 'tbl_marketplaces.id as MID')
            ->join('tbl_category as c', 'tbl_marketplaces.Category', '=', 'c.ID')
            ->join('tbl_sale_log as s', 'tbl_marketplaces.id', '=', 's.ProductID')
            ->join('users as u', 's.BuyerID', '=', 'u.id')
            ->where('tbl_marketplaces.UserID', $UserID)
            ->orderby('s.SaleDate', 'ASC')
            ->get();
    }
    public static function get_product_order($UserID)
    {
        return DB::table('tbl_marketplaces as m')
            ->select(DB::raw('m.*,c.CategoryName,s.*,u.fullname,m.id as MID'))
            ->join('tbl_category as c', 'm.Category', '=', 'c.ID')
            ->join('tbl_sale_log as s', 'm.id', '=', 's.ProductID')
            ->join('users as u', 's.SellerID', '=', 'u.id')
            ->where('s.BuyerID', $UserID)
            ->orderby('s.SaleDate', 'ASC')
            ->get();
    }
    public static function get_allrating($sid)
    {
        return DB::table('tbl_marketplaces as m')
            ->select('sr.*', 'u.fullname')
            ->join('tbl_sale_log as s', 'm.id', '=', 's.ProductID')
            ->join('tbl_seller_rating as sr', 'sr.OrderID', '=', 's.id')
            ->join('users as u', 'sr.BuyerID', '=', 'u.id')
            ->where('sr.SellerID', $sid)
            ->orderby('sr.DateTime', 'DESC')
            ->get();
    }
    public static function get_network_settings()
    {
        return TblNetworkSetting::select('*')->get();
    }

    public static function get_swap_fees_collected($UserID)
    {
        return DB::table('tbl_swap_fees_log as s')
            ->select('s.*', 'c.CryptoName')
            ->join('tbl_cryptos as c', 's.CryptoID', '=', 'c.id')
            ->where('s.UserID', $UserID)
            ->orderby('DateOfPayout', 'desc')
            ->get();
    }

    // FOR TOTAL LEFT LEG
    public static function getTotalLeg($id, $leg)
    {
        $leftresult = ClientsModel::getUserLevel($id, $leg);
        $total = 0;
        if (count($leftresult) == 0) return 0;
        do {
            $total += 1;
            $leftresult = ClientsModel::getUserLevel($leftresult[0]->id, $leg);
        } while (isset($leftresult[0]->id) && $leftresult[0]->id != '');
        return $total;
    }

    // FIND RANK
    public static function findRank($userid)
    {
        $RankSettings = ClientsModel::getRankSetting();
        $left = ClientsModel::getTotalLeg($userid, "Left");
        $right = ClientsModel::getTotalLeg($userid, "Right");
        foreach ($RankSettings as $RankSetting) {
            if ($left == 0 || $right == 0) {
                return 0;
            } else {
                if ($RankSetting->Subscription > $left || $RankSetting->Subscription > $right) {
                    continue;
                } else {
                    return $RankSetting->Rank;
                }
            }
        }
    }

    public static function fees2Network($origin_user_id, $sponsor, $origin_amount, $cryptoid, $type, $level = 1)
    {
        $parent = ClientsModel::getSponsor($sponsor);

        if (!$parent) return;
        $rank = ClientsModel::findRank($origin_user_id);
        $RankSettings = ClientsModel::getRankSettingByRank($rank);
        $percent = $RankSettings->Level1;
        if ($level == 2)
            $percent = $RankSettings->Level2;
        if ($level == 3)
            $percent = $RankSettings->Level3;
        $amount = $origin_amount * $percent / 100;

        $userid = $parent->id;
        $senderid = $origin_user_id;
        FeesNetwork::create(compact('userid', 'cryptoid', 'amount', 'senderid', 'type'));

        return ClientsModel::fees2Network($origin_user_id, $parent->sponsor, $origin_amount, $cryptoid, $type, $level + 1);
    }
}
