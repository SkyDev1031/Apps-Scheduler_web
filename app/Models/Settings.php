<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    use HasFactory;
    public static $KEY = [
        'BITQUERY' => 'BITQUERY',
    ];

    protected $fillable = [
        'key', 'value', 'etc', 'status'
    ];
}
