<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyParticipantRequest extends Model
{
    use HasFactory;
    public function study()
    {
        return $this->belongsTo(Study::class);
    }

    public function participant()
    {
        return $this->belongsTo(AppUser::class, 'participant_id');
    }

}
