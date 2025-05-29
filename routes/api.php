<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\AppUserController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StudyController;
use App\Http\Controllers\StudyParticipantRequestController;
use App\Models\AppUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->group(function () {    

});

// UserController
Route::post("/login", [UserController::class, 'login']);
Route::post("/register", [UserController::class, 'register']);
Route::post("/users", [UserController::class, 'getUsers']);
Route::get("/users", [UserController::class, 'users']);
Route::get("/user", [UserController::class, 'user']);
Route::post("/users/allow", [UserController::class, 'allowUser']);
Route::post("/users/block", [UserController::class, 'blockUser']);
Route::post("/users/delete", [UserController::class, 'deleteUser']);


// API Controller
Route::get("referral/{key}", 'ApiController@checkRefLink');
Route::get("admin/bitquery/getTemplateSettings", [ApiController::class, 'getBitqueryTemplateSettings']);
Route::post("/v1/purchaselog", 'ApiController@insert_PurchaseLog');

// App Api Router
Route::get("/app", [AppController::class, 'index']);
Route::post("/app/checkOnlineState", [AppController::class, 'checkOnlineState']);
Route::post("/app/login", [AppController::class, 'login']);
Route::post("/app/signup", [AppController::class, 'signup']);
Route::post("/app/phonecheckCreate", [AppController::class, 'phonecheckCreate']);
Route::post("/app/phonecheckValidate", [AppController::class, 'phonecheckValidate']);
Route::post("/app/alreadyexist", [AppController::class, 'isAlreadyExist']);

Route::post("/app/insertAppUseInfo", [AppController::class, 'insertAppUseInfo']);
Route::post("/app/insertPhoneUseInfo", [AppController::class, 'insertPhoneUseInfo']);
Route::post('/app/deleteAppInfoByPhonenumber', [AppController::class, 'deleteAppInfoByPhonenumber']);
Route::post('/app/removeall', [AppController::class, 'truncateAppInfo']);
Route::post('/app/deletepPhoneInfoByPhonenumber', [AppController::class, 'deletePhoneInfoByPhonenumber']);
Route::post('/app/removeallphoneinfo', [AppController::class, 'truncatePhoneInfo']);
Route::post("/app/downloadToCSV", [AppController::class, 'downloadToCSV']);
Route::post('/app/export-csv', [AppController::class, 'exportToCSV']);

Route::post('/app/appUseInfos', [AppController::class, 'appUseInfos']);
Route::post('/app/appUseInfoDuration', [AppController::class, 'appUseInfoDuration']);
Route::post('/app/appUseInfoFreq', [AppController::class, 'appUseInfoFreq']);
Route::post('/app/phoneuseinfos', [AppController::class, 'phoneuseinfos']);
Route::post('/app/phoneUseInfoByPhonenumber', [AppController::class, 'phoneUseInfoByPhonenumber']);


// study group management
Route::post('study-requests',                [StudyParticipantRequestController::class, 'invite']);   // researcher
Route::delete('study-requests/{id}',         [StudyParticipantRequestController::class, 'cancel']);   // researcher
Route::prefix('my-invitations')->group(function () {
    Route::get('/',                              [StudyParticipantRequestController::class, 'myInvitations']);
    Route::post('{id}/approve',                  [StudyParticipantRequestController::class, 'approve']);
    Route::post('{id}/decline',                  [StudyParticipantRequestController::class, 'decline']);
});

// AppUserController
Route::post("/appusers/registerAppUser", [AppUserController::class, 'registerAppUser']);
Route::post("/appusers", [AppUserController::class, 'getAppUsers']);
Route::post("/appusers/allow", [AppUserController::class, 'allowAppUser']);
Route::post("/appusers/block", [AppUserController::class, 'blockAppUser']);
Route::post("/appusers/delete", [AppUserController::class, 'deleteAppUser']);
Route::post("/appusers/isActive", [AppUserController::class, 'isAllowParticipant']);

