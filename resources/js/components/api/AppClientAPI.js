import { _REQUEST_APP, _REQ_METHOD } from './index';

// AppsScheduler app panel api
export const getAppUsageInfosApi = () => _REQUEST_APP('appUseInfos', _REQ_METHOD.POST)
export const getAppUsageDurationApi = (phonenumber="", startDate="", endDate="") => _REQUEST_APP('appUseInfoDuration', _REQ_METHOD.POST, { phonenumber: phonenumber, startDate: startDate, endDate: endDate })
export const getAppUsageFreqApi = (phonenumber="", startDate="", endDate="") => _REQUEST_APP('appUseInfoFreq', _REQ_METHOD.POST, { phonenumber: phonenumber, startDate: startDate, endDate: endDate })


export const getPhoneUsageInfosApi = () => _REQUEST_APP('phoneuseinfos', _REQ_METHOD.POST)
export const getPhoneUsageInfosByPhoneNumberApi = (phonenumber="") => _REQUEST_APP('phoneUseInfoByPhonenumber', _REQ_METHOD.POST, { phonenumber: phonenumber })

export const deleteAppUseInfosApi = (phonenumber="") => _REQUEST_APP('deleteAppInfoByPhonenumber', _REQ_METHOD.POST, { phonenumber: phonenumber })
export const deletePhoneUseInfosApi = (phonenumber="") => _REQUEST_APP('deletepPhoneInfoByPhonenumber', _REQ_METHOD.POST, { phonenumber: phonenumber })

export { downloadCSV } from './index';
