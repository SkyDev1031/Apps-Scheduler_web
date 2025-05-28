<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PurchaseLog extends Model
{
    public $fillable = ['card_lastFourDigits', 'money', 'card_brand', 'card_prepaidType', 'card_type', 'purchased_date'];

    public $table = 'purchaselog';

    use HasFactory;

    public static function savePurchaseLog($data) {
        
        // $res = DB::table('purchaselog')->delete();

        if(PurchaseLog::create($data)) {
            return true;
        }
        return false;
    }
}
