<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudyParticipantRequest;
use App\Models\Study;
use App\Models\AppUser;

class StudyParticipantRequestController extends Controller
{
    public function invite(Request $request)
    {
        $data = $request->validate([
            'study_id'       => 'required|exists:studies,id',
            'participant_id' => 'required|exists:appusers,id',
        ]);
    
        $study = Study::findOrFail($data['study_id']);
    
        // Make sure the authenticated user owns the study
        abort_unless($study->researcher_id === $request->user()->id, 403);
    
        // Try to find or create the invite
        [$invite, $created] = StudyParticipantRequest::firstOrCreate(
            $data,
            ['status' => 'Pending']
        )->wasRecentlyCreated
            ? [$invite = StudyParticipantRequest::where($data)->first(), true]
            : [$invite = StudyParticipantRequest::where($data)->first(), false];
    
        // Optionally trigger notification here
        // Notification::send($invite->participant, new StudyInviteNotification($invite));
    
        if ($created) {
            return response()->json([
                'status' => 'success',
                'message' => 'Invite sent successfully.',
                'invite' => $invite,
            ], 201);
        } else {
            return response()->json([
                'status' => 'duplicate',
                'message' => 'This participant has already been invited to this study.',
                'invite' => $invite,
            ], 200);
        }
    }
    
    public function cancel(Request $request)
    {
        // 1. Validate the incoming study & participant IDs
        $data = [
            'study_id'       => $request->study_id,
            'participant_id' => $request->participant_id
        ];

        // 2. Locate the invite that matches BOTH ids
        $invite = StudyParticipantRequest::where($data)->firstOrFail();
        // print_r($invite);
        if (!$invite) {
            return response()->json(['message' => 'No matching invite found.'], 404);
        }
        // 3. Make sure the caller owns the study
        abort_unless(
            $invite->study->researcher_id === $request->user()->id, 
            403, 
            'Unauthorized'
        );

        // // 4. (Optional) only allow cancelling if still pending
        // abort_if(
        //     $invite->status !== 'pending',
        //     400,
        //     'Cannot cancel processed invite'
        // );

        $invite->delete();

        return response()->json(['message' => 'deleted successfully.'], 200);
    }

    /* ───────────────────────────── PARTICIPANT SIDE ────────────────────────── */

    // GET /api/my-invitations
    public function myInvitations(Request $request)
    {
        $appUser = AppUser::find($request->user()->id); // Retrieve the authenticated user directly
        if (!$appUser) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return $appUser->invitations()
                       ->with('study:id,title,description')
                       ->orderByDesc('created_at')
                       ->get();
    }

    // POST /api/my-invitations/{id}/approve
    public function approve(Request $request, $id)
    {
        $appUser = AppUser::find($request->user()->id); // Retrieve the authenticated user directly

        if (!$appUser) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $invite = StudyParticipantRequest::where('participant_id', $appUser->id)
                                         ->where('status', 'pending')
                                         ->findOrFail($id);

        $invite->update(['status' => 'approved']);
        // $invite->participant->update(['study_id' => $invite->study_id]);

        // 🔔 notify researcher
        // Notification::send($invite->study->researcher, new InviteStatusNotification($invite));

        return response()->json(['message' => 'Invitation approved']);
    }

    // POST /api/my-invitations/{id}/decline
    public function decline(Request $request, $id)
    {
        $appUser = AppUser::find($request->user()->id); // Retrieve the authenticated user directly

        if (!$appUser) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $invite = StudyParticipantRequest::where('participant_id', $appUser->id)
                                         ->where('status', 'pending')
                                         ->findOrFail($id);

        $invite->update(['status' => 'declined']);
        return response()->json(['message' => 'Invitation declined']);
    }
}
