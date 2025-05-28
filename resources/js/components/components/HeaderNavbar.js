import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Avatar } from 'primereact/avatar';
import { IMAGES } from "../assets";
import { AdminProfileItem } from "../config";

const HeaderNavbar = ({ isAdmin, user, holdings, onAction, logoutUser, _role_prefix }) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    return (
        <div className="header-navbar">
            {/* Notifications Section */}
            <div className="header-navbar__notifications">
                <div className={`header-navbar__notifications-icon ${holdings.length > 0 ? 'header-navbar__notifications--new' : ''}`}>
                    <img
                        src={IMAGES.ic_bell}
                        className="header-navbar__bell-icon"
                        alt="Notifications"
                    />
                </div>
                <div className="header-navbar__notifications-dropdown">
                    <div className="header-navbar__notifications-header d-flex justify-content-between">
                        <h5>Notifications</h5>
                        {holdings.length > 0 && <span className="header-navbar__badge">{1}</span>}
                    </div>
                    <ul>
                        {holdings.length > 0 &&
                            <li>
                                <a href="/user/packages" className="header-navbar__notification-item d-flex">
                                    <div className="header-navbar__notification-avatar">
                                        <img
                                            src={IMAGES.avatar}
                                            className="header-navbar__notification-img"
                                            alt="Notification"
                                        />
                                    </div>
                                    <div className="header-navbar__notification-text">
                                        <p>
                                            You have holding amount. Please buy a package to receive the holding amount.
                                        </p>
                                    </div>
                                </a>
                                <i className="fa-solid fa-caret-right" />
                            </li>
                        }
                    </ul>
                </div>
            </div>

            {/* User Profile Section */}
            <div className="header-navbar__user">
                {/* Avatar Click to Toggle Dropdown */}
                <div
                    className="header-navbar__profile"
                    onClick={toggleDropdown}
                >
                    <span className="header-navbar__avatar">
                        <Avatar image={IMAGES.avatar} size="small" />
                    </span>
                    <i className="fa-solid fa-sort-down header-navbar__dropdown-icon" />
                </div>

                {/* Dropdown Menu */}
                <div
                    className={`header-navbar__dropdown ${isDropdownVisible ? 'header-navbar__dropdown--visible' : 'header-navbar__dropdown--hidden'}`}
                >
                    <div className="header-navbar__dropdown-header d-flex align-items-center">
                        <div className="header-navbar__dropdown-avatar">
                            <img src={IMAGES.avatar} alt="User" />
                        </div>
                        <div className="header-navbar__dropdown-info">
                            <a href="#">
                                <h5>{user.ScreenName || ''}</h5>
                            </a>
                        </div>
                    </div>
                    <ul>
                        {isAdmin && AdminProfileItem.map((item, index) => (
                            <li key={index} className="header-navbar__dropdown-item">
                                {item.action ? (
                                    <a onClick={() => onAction(item.action)}>
                                        <i className={`fas ${item.icon}`} />
                                        <span>{item.label}</span>
                                    </a>
                                ) : (
                                    <Link to={`${_role_prefix}/${item.prefix || item.link}`}>
                                        <i className={`fas ${item.icon}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                )}
                            </li>
                        ))}
                        <li className="header-navbar__dropdown-item">
                            <a href="#" onClick={logoutUser}>
                                <i className="fas fa-sign-out" />
                                Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default HeaderNavbar;