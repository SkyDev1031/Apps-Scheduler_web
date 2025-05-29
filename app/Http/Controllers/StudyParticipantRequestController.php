<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudyParticipantRequest;
use App\Models\Study;
use App\Models\AppUser;

class StudyParticipantRequestController extends Controller
{
    // POST /api/study-requests
    public function invite(Request $request)
    {
        $data = $request->validate([
            'study_id'       => 'required|exists:studies,id',
            'participant_id' => 'required|exists:appusers,id',
        ]);

        $study = Study::findOrFail($data['study_id']);

        // (optional) check that the auth user owns this study
        abort_unless($study->researcher_id === $request->user()->id, 403);

        $invite = StudyParticipantRequest::firstOrCreate(
            $data,
            ['status' => 'pending']
        );

        // 🔔 push notification to participant (FCM or Laravel Echo)
        // Notification::send($invite->participant, new StudyInviteNotification($invite));

        return response()->json($invite, 201);
    }

    // DELETE /api/study-requests/{id}  (cancel)
    public function cancel($id)
    {
        $invite = StudyParticipantRequest::findOrFail($id);
        abort_unless($invite->study->researcher_id === auth()->id(), 403);

        if ($invite->status === 'pending') {
            $invite->delete();
            return response()->noContent();
        }

        return response()->json(['message' => 'Cannot cancel processed invite'], 400);
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
        $invite->participant->update(['study_id' => $invite->study_id]);

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
