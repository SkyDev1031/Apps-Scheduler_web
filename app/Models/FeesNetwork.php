<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeesNetwork extends Model
{
    use HasFactory;
    protected $table = 'tbl_fees_network';
    protected $fillable = ['userid', 'cryptoid', 'amount', 'senderid', 'type'];
}