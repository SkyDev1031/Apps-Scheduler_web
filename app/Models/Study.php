<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Study extends Model
{
    use HasFactory;    
    protected $fillable = [
        'title',
        'study_code',
        'description',
        'researcher_id'
    ];

    // App\Models\StudyParticipantRequest.php
    // Columns: id, appuser_id, study_id, type ('join', 'leave'), status ('pending', 'approved', 'declined')
    public function researcher()
    {
        return $this->belongsTo(User::class, 'researcher_id');
    }

    public function participants()
    {
        return $this->belongsToMany(AppUser::class, 'study_participant_requests', 'study_id', 'participant_id')
            ->withPivot('status')
            ->withTimestamps();
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
        return $this->hasMany(StudyParticipantRequest::class)->with('participant'); // eager load participant data;
    }
}
