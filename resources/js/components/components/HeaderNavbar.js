import React from 'react';
import { Link } from "react-router-dom";
import { Avatar } from 'primereact/avatar';
import { IMAGES } from "../assets";
import { AdminProfileItem, _ERROR_CODES } from "../config";

const HeaderNavbar = ({ isAdmin, user, holdings, onAction, logoutUser, _role_prefix }) => {
    return (
        <div className="dashboard-nav">
            <div className="single-item notifications-area">
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
                                    </div>
                                </a>
                                <i className="fa-solid fa-caret-right" />
                            </li>
                        }
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
    );
};

export default HeaderNavbar;