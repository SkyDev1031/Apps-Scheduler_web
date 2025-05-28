import { _REQUEST, _REQ_METHOD } from './index';

export const getParticipantsApi = () => _REQUEST('appusers', _REQ_METHOD.POST);
export const allowParticipantApi = (id) => _REQUEST('appusers/allow', _REQ_METHOD.POST, { appUserID: id });
export const blockParticipantApi = (id) => _REQUEST('appusers/block', _REQ_METHOD.POST, { appUserID: id });
export const deleteParticipantApi = (id) => _REQUEST('appusers/delete', _REQ_METHOD.POST, { appUserID:  id });
