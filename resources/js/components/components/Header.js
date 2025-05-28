import React, { useState } from 'react';
import { IMAGES } from "../assets";
import SideNavbar from './SideNavbar';
import HeaderNavbar from './HeaderNavbar';
import { Link } from "react-router-dom";
import { useGlobalContext } from "../contexts";
import { logoutUser } from "../utils";

export default function Header({ isSubItem, location, subNav }) {
    const { user, isAdmin, holdings } = useGlobalContext();
    const _role_prefix = isAdmin ? '/admin' : '/user';

    const [isSidebarVisible, setSidebarVisible] = useState(false);

    const toggleSidebar = () => {
        setSidebarVisible(!isSidebarVisible);
    };

    return (
        <div className={`${isSubItem ? 'no-border' : ''}`} id="site_header">
            <header className={`header-section body-collapse`}>
                <div className="overlay">
                    <div className="container-fruid">
                        <div className="row d-flex header-area ml-0 mr-0">
                            <div className="navbar-area">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="sidebar-icon" onClick={toggleSidebar}>
                                        <img src={IMAGES.ic_menu} alt="icon" />
                                    </div>
                                    <form action="#" className="flex-fill" id="search-form-area">
                                        <div className="form-group d-flex align-items-center">
                                            <img src={IMAGES.ic_search} alt="icon" />
                                            <input type="text" placeholder="Type to search..." />
                                        </div>
                                    </form>
                                    <HeaderNavbar
                                        isAdmin={isAdmin}
                                        user={user}
                                        holdings={holdings}
                                        _role_prefix={_role_prefix}
                                        logoutUser={logoutUser}
                                    />
                                </div>
                                {isSubItem && (
                                    <div className="tab-main">
                                        <ul className="nav nav-tabs">
                                            {subNav.items.map((item, index) => {
                                                const link = `${_role_prefix}/${subNav.prefix}${item.link}`;
                                                return (
                                                    <li key={index} className="nav-item">
                                                        <Link to={link} className={`nav-link ${location === link ? 'active' : ''}`}>{item.label}</Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <SideNavbar
                                isAdmin={isAdmin}
                                user={user}
                                location={location}
                                _role_prefix={_role_prefix}
                                toggleSidebar={toggleSidebar}
                            />
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}