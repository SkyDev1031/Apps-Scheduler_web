import React from 'react';
import { Link } from "react-router-dom";
import { IMAGES } from "../assets";
import { AdminNavbar, AdminProfileItem, NavKeys, UserNavbar, _ERROR_CODES } from "../config";
import { logoutUser, toast_error, toast_success } from "../utils";

const SideNavbar = ({ isAdmin, user, location, _role_prefix, toggleSidebar }) => {
    return (
        <div className="sidebar-wrapper">
            <div className="close-btn" onClick={toggleSidebar}>
                <i className="fa-solid fa-xmark" />
            </div>
            <div className="sidebar-logo">
                <a href="/">
                    <img src={IMAGES.logo} alt="logo" />
                </a>
            </div>
            <ul>
                {(isAdmin ? AdminNavbar : UserNavbar).filter(function (item) {
                    if (item.prefix === "moderator" && user.support === "0") {
                        return false; // skip
                    }
                    return true;
                }).map((item, index) => {
                    const isActive = location.startsWith(`${_role_prefix}/${item.prefix || item.link}`);
                    return (
                        <li className={isActive ? 'active' : ''} key={index}>
                            <Link to={`${_role_prefix}/${item.prefix || item.link}`}>
                                <img src={item.icon} alt={item.label} className="nav-icon" />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <ul className="bottom-item">
                <li>
                    <Link to={isAdmin ? `/admin/profile` : `/user/profile`}>
                        <img src={IMAGES.ic_account} alt="Account" />{" "}
                        <span>Account</span>
                    </Link>
                </li>
                {isAdmin && (
                    <li>
                        <Link to={`/admin/settings`}>
                            <i className="fa-solid fa-cog" />
                            <span className='p-2'> Settings</span>
                        </Link>
                    </li>
                )}
                <li>
                    <a href="#" onClick={logoutUser}>
                        <img src={IMAGES.ic_quit} alt="logout" />{" "}
                        <span>Logout</span>
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default SideNavbar;