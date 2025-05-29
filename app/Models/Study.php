<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Study extends Model
{
    use HasFactory;

    // App\Models\StudyParticipantRequest.php
    // Columns: id, appuser_id, study_id, type ('join', 'leave'), status ('pending', 'approved', 'declined')
    public function researcher()
    {
        return $this->belongsTo(User::class, 'researcher_id');
    }

    public function participants()
    {
        return $this->hasMany(AppUser::class);
    }

    public function requests()
    {
        return $this->hasMany(StudyParticipantRequest::class);
    }

    // App\Models\AppUser.php
    public function study()
    {
        return $this->belongsTo(Study::class);
    }

    public function participant()
    {
        return $this->belongsTo(AppUser::class, 'appuser_id');
    }
    
    public function invitations()
    {
        return $this->hasMany(StudyParticipantRequest::class);
    }
}
