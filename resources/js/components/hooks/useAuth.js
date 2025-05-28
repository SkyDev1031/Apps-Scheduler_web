import { useState } from 'react';
import { getUserApi, loginApi } from "../api/OriginAPI.js";
import { _ERROR_CODES } from '../config';
import { getAuth, saveAuth, toast_error, toast_success } from "../utils";

export default function useAuth() {
    const [auth, setAuth] = useState(getAuth());
    const _token = auth?.token;
    const _user = auth?.user || {};
    const isAdmin = _user?.role == 1;

    const saveAuthData = (auth_data) => {
        setAuth(auth_data);
        saveAuth(auth_data)
    };
    const updateAuth = (user) => {
        const tmp_auth = { ...auth, user };
        setAuth(tmp_auth);
        saveAuth(tmp_auth, false);
    }
    const login = async (username, password) => {
        loginApi(username, password)
            .then(res => {
                toast_success("Login success");
                saveAuthData(res);
            })
            .catch(err => {
                toast_error(err, _ERROR_CODES.AUTH_NETWORK_ERROR);
                setAuth({});
            });
    }
    const refreshUser = () => {
        getUserApi()
            .then(res => updateAuth(res.data))
            .catch(err => console.error)
    }

    return {
        login,
        setAuth: saveAuthData,
        refreshUser,
        _token, _user, isAdmin,
    }
}