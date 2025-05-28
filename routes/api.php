<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\AppUserController;
use App\Http\Controllers\UserController;
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
    Route::get("user", [ApiController::class, 'user']);
    Route::get("users", [ApiController::class, 'users']);
    
    // admin
    Route::get("admin", [ApiController::class, 'getAdminData']);
    Route::post("admin", [ApiController::class, 'updateAdminData']);

    Route::get("admin/contracts", [ApiController::class, 'getContracts']);
    Route::get("admin/wallets/{id}", [ApiController::class, 'adminWallets']);
    Route::post("admin/payout", [ApiController::class, 'confirmPayout']);
    Route::post("admin/transfer", [ApiController::class, 'transfer2Admin']);
    Route::delete("admin/transfer/{id}", [ApiController::class, 'deleteTransfer']);
    Route::get("admin/clients", [ApiController::class, 'getClients']);
    Route::post("admin/user", [ApiController::class, 'updateUser']);
    Route::post("admin/user/text", [ApiController::class, 'sendText']);
    Route::delete("admin/user/{id}", [ApiController::class, 'deleteUser']);
    Route::post("admin/package", [ApiController::class, 'updatePackage']);
    Route::delete("admin/package/{id}", [ApiController::class, 'deletePackage']);
    Route::get("admin/purchases/{id}", [ApiController::class, 'getPurchases']);
    Route::delete("admin/purchases/{id}", [ApiController::class, 'deletePurchase']);
    Route::post("admin/discussion", [ApiController::class, 'updateDiscussion']);
    Route::delete("admin/discussions/{id}", [ApiController::class, 'deleteDiscussion']);
    
    Route::get("admin/categories", [ApiController::class, 'getCategories']);
    Route::post("admin/categories", [ApiController::class, 'updateCategory']);
    Route::delete("admin/categories/{id}", [ApiController::class, 'deleteCategory']);

    Route::get("admin/twilio", [ApiController::class, 'getTwilioAccounts']);
    Route::post("admin/twilio", [ApiController::class, 'saveTwilioAccounts']);
    Route::post("admin/twilio/number", [ApiController::class, 'saveTwilioNumbers']);
    Route::delete("admin/twilio/number/{id}", [ApiController::class, 'deleteTwilioNumber']);
    Route::get("admin/twilio-logs", [ApiController::class, 'getTwilioLogs']);
    Route::delete("admin/twilio-logs/{id}", [ApiController::class, 'deleteTwilioLog']);

    Route::get("admin/faq", [ApiController::class, 'getFaqs']);
    Route::post("admin/faq", [ApiController::class, 'updateFaq']);
    Route::delete("admin/faq/{id}", [ApiController::class, 'deleteFaq']);

    Route::post("admin/sms-callback", [ApiController::class, 'saveTextStatus']);
    Route::post("admin/contract", [ApiController::class, 'contractAction']);

    Route::post("admin/crypto", [ApiController::class, 'updateCrypto']);
    Route::post("admin/update-crypto", [ApiController::class, 'updateShowCrypto']);

    Route::delete("admin/crypto/{id}", [ApiController::class, 'deleteCrypto']);

    Route::post("admin/network", [ApiController::class, 'updateNetworkSettings']);
    Route::get("admin/binary-payout", [ApiController::class, 'runBinaryPayout']);
    Route::get("admin/referral", [ApiController::class, 'getReferralSettings']);
    Route::post("admin/referral", [ApiController::class, 'updateReferralSettings']);

    Route::get("admin/bitquery", [ApiController::class, 'getBitquerySettings']);
    Route::post("admin/bitquery", [ApiController::class, 'updateBitquerySettings']);
    Route::delete("admin/bitquery/{id}", [ApiController::class, 'deleteBitquerySettings']);
    Route::post("admin/bitquery/updateTemplateSettings", [ApiController::class, 'updateBitqueryTemplateSettings']);

    Route::get("contacts", [ApiController::class, 'getContacts']);


});

Route::post("login", 'ApiController@login');
Route::post("register", 'ApiController@register');
Route::get("referral/{key}", 'ApiController@checkRefLink');
Route::get("admin/bitquery/getTemplateSettings", [ApiController::class, 'getBitqueryTemplateSettings']);

// Update the Purchase Log
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


// AppUserController
Route::post("/appusers/registerAppUser", [AppUserController::class, 'registerAppUser']);
Route::post("/appusers", [AppUserController::class, 'getAppUsers']);
Route::post("/appusers/allow", [AppUserController::class, 'allowAppUser']);
Route::post("/appusers/block", [AppUserController::class, 'blockAppUser']);
Route::post("/appusers/delete", [AppUserController::class, 'deleteAppUser']);
Route::post("/appusers/isActive", [AppUserController::class, 'isAllowParticipant']);

// UserController
Route::post("/users", [UserController::class, 'getUsers']);