<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Import Log for debugging

class UserController extends Controller
{
    public function getUsers()
    {
        try {
            Log::info('Fetching app users...'); // Log the start of the method

            $sql = "SELECT id, 
                        ROW_NUMBER() OVER (ORDER BY id) AS `no`,
                        fullname,
                        username as email,
                        ScreenName,
                        phone,
                        `status`,
                        LoginIP,
                        LoginStatus,
                        `TimeStamp` as registeredTime,
                        `role`
                    FROM
                        users";

            // Execute the query and fetch results
            $users = DB::select($sql);

            Log::info('Users fetched successfully', ['data' => $users]); // Log the results

            // Return the results as JSON
            return response()->json(['data' => $users]);
        } catch (\Exception $e) {
            Log::error('Error fetching users', ['error' => $e->getMessage()]); // Log any errors
            return response()->json(['error' => 'Failed to fetch users'], 500);
        }
    }
}
