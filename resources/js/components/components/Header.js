import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { useState, useEffect } from 'react'
import { useMetaMask } from "metamask-react";
import { Avatar } from 'primereact';
import { Button } from 'primereact/button';
import { Link } from "react-router-dom";
import { getNonReferralApi, runBinaryPayoutApi, updateNonReferralApi } from "../api/OriginAPI.js";
import { IMAGES } from "../assets";
import { Image } from "../components";
import { AdminNavbar, AdminProfileItem, NavKeys, UserNavbar, _ERROR_CODES } from "../config";
import { useGlobalContext } from "../contexts";
import { logoutUser, toast_error, toast_success } from "../utils";
import { useAuth } from "../hooks";

export default function Header({ isSubItem, location, subNav }) {
    const { conf2ndPwd, setLoading, check2ndPassword, user, isAdmin, holdings } = useGlobalContext();
    const { status, connect, account } = useMetaMask();
    const _role_prefix = isAdmin ? '/admin' : '/user';
    const { _user } = useAuth();


    useEffect(() => {
        console.log(_user)
    }, [])

    const handleClose = () => {
        setModalOptions({})
    }
    const handleAction = async (e) => {
        e?.preventDefault?.();
        if (_isConf2nd) {
            const res = await check2ndPassword(modalOptions.password)
            if (res) {
                setModalOptions(prev => ({ ...prev, type: _MODAL_TYPE.CONNECT_WALLET }))
            }
        }
        if (_isNonReferral) {
            setLoading(true);
            const res = await updateNonReferralApi(_data)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                setModalOptions({ visible: false })
                toast_success(res.message)
            }
            setLoading(false)
        }
    }
    const updateModalData = (item) => setModalOptions(prev => ({ ...prev, data: { ...prev.data, ...item } }))
    const onAction = async (type) => {
        if (type == NavKeys.run_binary_payout) {
            const res = await runBinaryPayoutApi()
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) toast_success(res.message);
            return;
        }
        if (type == NavKeys.non_referral_signup) {
            setLoading(true);
            getNonReferralApi()
                .then(res => {
                    setModalOptions({ visible: true, type: _MODAL_TYPE.NON_REFERRAL_SIGNUP, data: res.data })
                })
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
                .finally(() => setLoading(false));
        }
    }
    return (
        <div className={`${isSubItem ? 'no-border' : ''}`} id="site_header">
            <header className={`header-section body-collapse`}>
                <div className="overlay">
                    <div className="container-fruid">
                        <div className="row d-flex header-area ml-0 mr-0">
                            <div className="navbar-area">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="sidebar-icon">
                                        <img src={IMAGES.ic_menu} alt="icon" />
                                    </div>
                                    <form action="#" className="flex-fill" id="search-form-area">
                                        <div className="form-group d-flex align-items-center">
                                            <img src={IMAGES.ic_search} alt="icon" />
                                            <input type="text" placeholder="Type to search..." />
                                        </div>
                                    </form>
                                    <div className="dashboard-nav" >
                                        <div className="single-item language-area" hidden>
                                            <div className="language-btn">
                                                <img src={IMAGES.ic_lang} alt="icon" />
                                            </div>
                                            <ul className="main-area language-content">
                                                <li>English</li>
                                                <li>Hindi</li>
                                                <li className="active">English (US)</li>
                                                <li>Japanese</li>
                                                <li>Kannada</li>
                                                <li>Lithuanian</li>
                                            </ul>
                                        </div>
                                        <div className="single-item notifications-area" >
                                            <div className={`notifications-btn ${holdings.length > 0 ? 'header-new-badge' : ''}`}>
                                                <img
                                                    src={IMAGES.ic_bell}
                                                    className="bell-icon"
                                                    alt="icon"
                                                />
                                            </div>
                                            <div className="main-area notifications-content">
                                                <div className="head-area d-flex justify-content-between">
                                                    <h5>Notifications</h5>
                                                    {holdings.length > 0 && <span className="mdr">{1}</span>}
                                                </div>
                                                <ul>
                                                    {holdings.length > 0 &&
                                                        <li>
                                                            <a href="/user/packages" className="d-flex">
                                                                <div className="img-area">
                                                                    <img
                                                                        src={IMAGES.avatar}
                                                                        className="max-un small-img"
                                                                        alt="image"
                                                                    />
                                                                </div>
                                                                <div className="text-area">
                                                                    <p className="mdr">
                                                                        You have holding amount, Please buy package to receive holding amount.
                                                                    </p>
                                                                    {/* <p className="mdr time-area">09.39AM</p> */}
                                                                </div>
                                                            </a>
                                                            <i className="fa-solid fa-caret-right" />
                                                        </li>
                                                    }
                                                    {/* <li>
                                                        <a href="#" className="d-flex">
                                                            <div className="img-area">
                                                                <img
                                                                    src={IMAGES.avatar}
                                                                    className="max-un small-img"
                                                                />
                                                            </div>
                                                            <div className="text-area">
                                                                <p className="mdr">
                                                                    <b>James Deed</b> requested a payment of
                                                                    <b>£890.00</b>
                                                                </p>
                                                                <p className="mdr time-area">08.09AM</p>
                                                            </div>
                                                        </a>
                                                        <i className="fa-solid fa-caret-right" />
                                                    </li> */}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="single-item user-area">
                                            <div className="profile-area d-flex align-items-center">
                                                <span className="user-profile small-img">
                                                    <Avatar image={IMAGES.avatar} size="small" />
                                                </span>
                                                <i className="fa-solid fa-sort-down" />
                                            </div>
                                            <div className="main-area user-content">
                                                <div className="head-area d-flex align-items-center">
                                                    <div className="profile-img">
                                                        <img src={IMAGES.avatar} alt="User" />
                                                    </div>
                                                    <div className="profile-head">
                                                        <a href="#">
                                                            <h5>{user.ScreenName || ''}</h5>
                                                        </a>
                                                    </div>
                                                </div>
                                                <ul>
                                                    {isAdmin && AdminProfileItem.map((item, index) => (
                                                        <li key={index}>
                                                            {item.action ?
                                                                <a onClick={() => onAction(item.action)}>
                                                                    <i className={`fas ${item.icon}`} />
                                                                    <span>{item.label}</span>
                                                                </a>
                                                                :
                                                                <Link to={`${_role_prefix}/${item.prefix || item.link}`}>
                                                                    <i className={`fas ${item.icon}`} />
                                                                    <span>{item.label}</span>
                                                                </Link>
                                                            }
                                                        </li>
                                                    ))}
                                                    <li>
                                                        <a href="#" onClick={logoutUser}>
                                                            <i className="fas fa-sign-out" />
                                                            Logout
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {isSubItem &&
                                    <div className="tab-main">
                                        <ul className="nav nav-tabs">
                                            {subNav.items.map((item, index) => {
                                                const link = `${_role_prefix}/${subNav.prefix}${item.link}`;
                                                return (
                                                    <li key={index} className="nav-item">
                                                        <Link to={link} className={`nav-link ${location === link ? 'active' : ''}`}>{item.label}</Link>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                }
                            </div>
                            <div className="sidebar-wrapper">
                                <div className="close-btn">
                                    <i className="fa-solid fa-xmark" />
                                </div>
                                <div className="sidebar-logo">
                                    <a href="/">
                                        <img src={IMAGES.logo} alt="logo" />
                                    </a>
                                </div>
                                <ul>
                                    {(isAdmin ? AdminNavbar : UserNavbar).filter(function (item) {
                                        if (item.prefix == "moderator" && user.support == "0") {
                                            return false; // skip
                                        }
                                        return true;
                                    }).map((item, index) => {
                                        const isactive = location.startsWith(`${_role_prefix}/${item.prefix || item.link}`)
                                        return (
                                            <li className={isactive ? 'active' : ''} key={index}>
                                                <Link to={`${_role_prefix}/${item.prefix || item.link}`}>
                                                    <img src={item.icon} alt={item.label} className="nav-icon" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </li>

                                        )
                                    })}
                                </ul>
                                <ul className="bottom-item">
                                    <li>
                                        <Link to={isAdmin ? `/admin/profile` : `/user/profile`}>
                                            <img src={IMAGES.ic_account} alt="Account" />{" "}
                                            <span>Account</span>
                                        </Link>
                                    </li>
                                    {isAdmin &&
                                        <li>
                                            <Link to={`/admin/settings`}>
                                                <i className="fa-solid fa-cog" />
                                                <span className='p-2'> Settings</span>
                                            </Link>
                                        </li>
                                    }
                                    <li>
                                        <a href="#" onClick={logoutUser}>
                                            <img src={IMAGES.ic_quit} alt="logout" />{" "}
                                            <span>Logout</span>
                                        </a>
                                    </li>
                                </ul>
                                {/* <div className="pt-120">
                                <div className="invite-now">
                                    <div className="img-area">
                                        <img src="assets/images/invite-now-illus.png" alt="Image" />
                                    </div>
                                    <p>Invite your friend and get $25</p>
                                    <a href="#" className="cmn-btn">
                                        Invite Now
                                    </a>
                                </div>
                            </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </header >
        </div >
    )
}