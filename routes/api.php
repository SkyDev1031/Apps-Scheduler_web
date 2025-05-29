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


Route::get("/bitquery/getTemplateSettings", [ApiController::class, 'getBitqueryTemplateSettings']);


// UserController
Route::post("/login", [UserController::class, 'login']);
Route::post("/register", [UserController::class, 'register']);
Route::post("/users", [UserController::class, 'getUsers']);
Route::get("/users", [UserController::class, 'users']);
Route::get("/user", [UserController::class, 'user']);
Route::post("/users/allow", [UserController::class, 'allowUser']);
Route::post("/users/block", [UserController::class, 'blockUser']);
Route::post("/users/delete", [UserController::class, 'deleteUser']);

// study group management
Route::post('study-requests',                [StudyParticipantRequestController::class, 'invite']);   // researcher
Route::delete('study-requests/{id}',         [StudyParticipantRequestController::class, 'cancel']);   // researcher
Route::prefix('my-invitations')->group(function () {
    Route::get('/',                              [StudyParticipantRequestController::class, 'myInvitations']);
    Route::post('{id}/approve',                  [StudyParticipantRequestController::class, 'approve']);
    Route::post('{id}/decline',                  [StudyParticipantRequestController::class, 'decline']);
});

// AppUserController
Route::prefix('/appusers')->group(function () {
    Route::post("/registerAppUser", [AppUserController::class, 'registerAppUser']);
    Route::post("/", [AppUserController::class, 'getAppUsers']);
    Route::post("/allow", [AppUserController::class, 'allowAppUser']);
    Route::post("/block", [AppUserController::class, 'blockAppUser']);
    Route::post("/delete", [AppUserController::class, 'deleteAppUser']);
    Route::post("/isActive", [AppUserController::class, 'isAllowParticipant']);
});

// App Api Router
Route::prefix('/app')->group(function () {

    Route::get("/", [AppController::class, 'index']);
    Route::post("/checkOnlineState", [AppController::class, 'checkOnlineState']);
    Route::post("/login", [AppController::class, 'login']);
    Route::post("/signup", [AppController::class, 'signup']);
    Route::post("/phonecheckCreate", [AppController::class, 'phonecheckCreate']);
    Route::post("/phonecheckValidate", [AppController::class, 'phonecheckValidate']);
    Route::post("/alreadyexist", [AppController::class, 'isAlreadyExist']);

    Route::post("/insertAppUseInfo", [AppController::class, 'insertAppUseInfo']);
    Route::post("/insertPhoneUseInfo", [AppController::class, 'insertPhoneUseInfo']);
    Route::post('/deleteAppInfoByPhonenumber', [AppController::class, 'deleteAppInfoByPhonenumber']);
    Route::post('/removeall', [AppController::class, 'truncateAppInfo']);
    Route::post('/deletepPhoneInfoByPhonenumber', [AppController::class, 'deletePhoneInfoByPhonenumber']);
    Route::post('/removeallphoneinfo', [AppController::class, 'truncatePhoneInfo']);
    Route::post("/downloadToCSV", [AppController::class, 'downloadToCSV']);
    Route::post('/export-csv', [AppController::class, 'exportToCSV']);

    Route::post('/appUseInfos', [AppController::class, 'appUseInfos']);
    Route::post('/appUseInfoDuration', [AppController::class, 'appUseInfoDuration']);
    Route::post('/appUseInfoFreq', [AppController::class, 'appUseInfoFreq']);
    Route::post('/phoneuseinfos', [AppController::class, 'phoneuseinfos']);
    Route::post('/phoneUseInfoByPhonenumber', [AppController::class, 'phoneUseInfoByPhonenumber']);
});