<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Import Log for debugging
use Illuminate\Http\Request;
use App\Models\AppUser; // Import the AppUser model

class AppUserController extends Controller
{
    //    
    private array $credentials;
    public function __construct(array $credentials = [])
    {
        $this->credentials = $credentials;
    }

    public function getCredentials(): array
    {
        return $this->credentials;
    }

    public function setCredentials(array $credentials): void
    {
        $this->credentials = $credentials;
    }
    
    public function getAppUsers()
    {
        try {
            Log::info('Fetching app users...'); // Log the start of the method

            $sql = "SELECT
                id,
                ROW_NUMBER() OVER (ORDER BY id) AS `no`,
                userID,
                `status`,
                created_at
            FROM
            appusers";

            // Execute the query and fetch results
            $appusers = DB::select($sql);

            Log::info('App users fetched successfully', ['data' => $appusers]); // Log the results

            // Return the results as JSON
            return response()->json(['data' => $appusers]);
        } catch (\Exception $e) {
            Log::error('Error fetching app users', ['error' => $e->getMessage()]); // Log any errors
            return response()->json(['error' => 'Failed to fetch app users'], 500);
        }
    }

    public function allowAppUser(Request $request) 
    {
        $id = $request->appUserID;

        if ($id) {
            try {
                // Update the status field to "active"
                $appUser = AppUser::find($id);

                if ($appUser) {
                    $appUser->status = 'active';
                    $appUser->save();

                    Log::info("App user with ID {$id} has been allowed.");
                    return response()->json(['message' => 'App user allowed successfully.', 'status' => true]);
                } else {
                    Log::warning("App user with ID {$id} not found.");
                    return response()->json(['error' => 'App user not found.', 'status' => false], 404);
                }
            } catch (\Exception $e) {
                Log::error("Error allowing app user with ID {$id}: " . $e->getMessage());
                return response()->json(['error' => 'Failed to allow app user.', 'status' => false], 500);
            }
        } else {
            return response()->json(['error' => 'App user ID is required.', 'status' => false], 400);
        }
    }

    public function blockAppUser(Request $request)
    {
        $id = $request->appUserID;

        if ($id) {
            try {
                // Update the status field to "block"
                $appUser = AppUser::find($id);

                if ($appUser) {
                    $appUser->status = 'block';
                    $appUser->save();

                    Log::info("App user with ID {$id} has been blocked.");
                    return response()->json(['message' => 'App user blocked successfully.', 'status' => true]);
                } else {
                    Log::warning("App user with ID {$id} not found.");
                    return response()->json(['error' => 'App user not found.', 'status' => false], 404);
                }
            } catch (\Exception $e) {
                Log::error("Error blocking app user with ID {$id}: " . $e->getMessage());
                return response()->json(['error' => 'Failed to block app user.', 'status' => false], 500);
            }
        } else {
            return response()->json(['error' => 'App user ID is required.', 'status' => false], 400);
        }
    }

    public function deleteAppUser(Request $request)
    {
        $id = $request->appUserID;

        if ($id) {
            try {
                // Delete the record by ID
                $appUser = AppUser::find($id);

                if ($appUser) {
                    $appUser->delete();

                    Log::info("App user with ID {$id} has been deleted.");
                    return response()->json(['message' => 'App user deleted successfully.', 'status' => true]);
                } else {
                    Log::warning("App user with ID {$id} not found.");
                    return response()->json(['error' => 'App user not found.', 'status' => false], 404);
                }
            } catch (\Exception $e) {
                Log::error("Error deleting app user with ID {$id}: " . $e->getMessage());
                return response()->json(['error' => 'Failed to delete app user.', 'status' => false], 500);
            }
        } else {
            return response()->json(['error' => 'App user ID is required.', 'status' => false], 400);
        }
    }


    public function isAllowParticipant(Request $request)
    {
        $participantID = $request->username;
        if ($participantID) {
            try {
                // Check if the participant is allowed
                $appUser = AppUser::where('userID', $participantID)->first();

                if ($appUser && $appUser->status === 'active') {
                    Log::info("Participant with ID {$participantID} is allowed.");
                    return response()->json(['message' => 'Participant is allowed.', 'status' => true]);
                } else {
                    Log::warning("Participant with ID {$participantID} is not allowed.");
                    return response()->json(['error' => 'Participant is not allowed.', 'status' => false], 403);
                }
            } catch (\Exception $e) {
                Log::error("Error checking participant with ID {$participantID}: " . $e->getMessage());
                return response()->json(['error' => 'Failed to check participant status.', 'status' => false], 500);
            }
        } else {
            return response()->json(['error' => 'Participant ID is required.', 'status' => false], 400);
        }
    }
}
