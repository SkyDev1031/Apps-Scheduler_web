import { lazy } from '@loadable/component';
import { MetaMaskProvider } from "metamask-react";
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { GlobalContextProvider } from './contexts';
import { ChatContextProvider } from './Chat';
import { useAuth } from './hooks';
import { Navigate } from './utils';
import { MESSAGE_SERVER } from './config';

const BaseContainer = lazy(() => import("./pages/Container/BaseContainer"))
const MainContainer = lazy(() => import("./pages/Container/MainContainer"))
const NoPage = lazy(() => import("./pages/Errors/NoPage"))
const Chat = lazy(() => import("./pages/Chat"))

const UserNav = [
    { path: '/dashboard', Component: lazy(() => import("./pages/Users/Dashboard")) },
    { path: '/wallet', Component: lazy(() => import("./pages/Users/Wallets")) },
    { path: '/wallet/staked', Component: lazy(() => import('./pages/Users/Staked')) },
    { path: '/packages', Component: lazy(() => import("./pages/Users/Packages")) },
    { path: '/packages/renew-transfer', Component: lazy(() => import("./pages/Users/RenewTransfer")) },
    { path: '/packages/transfers', Component: lazy(() => import("./pages/Users/Transfers")) },
    {
        path: '/packages/cryptopulse',
        params: { type: 'cryptopulse' },
        Component: lazy(() => import("./pages/Users/CryptoPulse")),
    },
    {
        path: '/packages/cryptoexplorer',
        params: { type: 'cryptoexplorer' },
        Component: lazy(() => import("./pages/Users/CryptoPulse"))
    },
    { path: '/marketplace', Component: lazy(() => import("./pages/Users/Marketplace")) },
    { path: '/marketplace/:id', Component: lazy(() => import("./pages/Users/MarketplaceDetail")) },
    {
        path: '/marketplace/add',
        params: { add: true },
        Component: lazy(() => import("./pages/Users/MarketplaceEdit"))
    },
    {
        path: '/marketplace/buy/:id',
        params: { buy: true },
        Component: lazy(() => import("./pages/Users/MarketplaceDetail"))
    },
    { path: '/marketplace/edit/:id', Component: lazy(() => import("./pages/Users/MarketplaceEdit")) },
    {
        path: '/marketplace/download/:id',
        params: { download: true },
        Component: lazy(() => import("./pages/Users/MarketplaceDetail"))
    },
    { path: '/marketplace/items-sale', Component: lazy(() => import("./pages/Users/SaleItems")) },
    { path: '/marketplace/sales-log', Component: lazy(() => import("./pages/Users/SalesLog")) },
    { path: '/marketplace/purchases', Component: lazy(() => import("./pages/Users/Purchases")) },
    { path: '/marketplace/sales-feedback', Component: lazy(() => import("./pages/Users/SalesFeedback")) },
    { path: '/network', Component: lazy(() => import("./pages/Users/Network")) },
    { path: '/referrals', Component: lazy(() => import("./pages/Users/Referals")) },
    { path: '/referrals/links', Component: lazy(() => import("./pages/Users/Referrallink")) },
    { path: '/logs', redirect: '/user/logs/network-logs' },
    { path: '/logs/network-logs', Component: lazy(() => import("./pages/Users/NetworkLogs")) },
    { path: '/logs/sponsor-logs', Component: lazy(() => import("./pages/Users/SponsorLogs")) },
    { path: '/logs/deposit-logs', Component: lazy(() => import("./pages/Users/DepositLogs")) },
    { path: '/logs/withdrawal-logs', Component: lazy(() => import("./pages/Users/WithdrawalLogs")) },
    { path: '/logs/transfer-logs', Component: lazy(() => import("./pages/Users/TransferLogs")) },
    { path: '/logs/swap-logs', Component: lazy(() => import("./pages/Users/SwapLogs")) },
    { path: '/logs/swap-payout-logs', Component: lazy(() => import("./pages/Users/SwapPayoutLogs")) },
    { path: '/logs/staked-logs', Component: lazy(() => import("./pages/Users/StakedLogs")) },
    { path: '/logs/client-admin-logs', Component: lazy(() => import("./pages/Users/Client2AdminLogs")) },
    { path: '/profile', Component: lazy(() => import("./pages/Users/Profile")) },
    { path: '/moderator', Component: lazy(() => import("./pages/Users/Moderator")) },
]
function App() {
    const { _token, _user, isAdmin } = useAuth();
    const SecurityRouter = ({ Component, auth, userRole, adminRole, params = {} }) => {
        if (!auth && _token) return <Navigate to={isAdmin ? '/admin' : '/user'} />;
        if (auth && !_token) return <Navigate to={'/login'} />;
        if ((!userRole && !adminRole) || (userRole && !isAdmin) || (adminRole && isAdmin)) return <Component {...params} />
        return <Navigate to={'/'} />;
    }
    return (
        <BrowserRouter>
            <GlobalContextProvider>
                <ChatContextProvider
                    user={_user}
                    client_id={'test_client_id'}
                    client_secret={'test_client_secret'}
                    server_url={MESSAGE_SERVER}>
                    <ToastContainer />
                    <Suspense fallback={<div className="preloader react-preloader"></div>}>
                        <Routes>
                            <Route path="/user" element={<SecurityRouter Component={BaseContainer} auth userRole />}>
                                <Route path="/user/chat" element={<Chat />} />
                                <Route path="/user/chat/:chatkey" element={<Chat />} />
                            </Route>
                            <Route path="/user" element={<MainContainer />}>
                                <Route index element={<Navigate to={'/user/dashboard'} />} />
                                {UserNav.map((item, index) => (
                                    <Route
                                        path={`/user/${item.path}`}
                                        key={index}
                                        element={item.redirect ?
                                            <Navigate to={item.redirect} />
                                            :
                                            <SecurityRouter {...item} auth userRole />
                                        }
                                    />
                                ))}
                                <Route path="*" element={<NoPage />} />
                            </Route>
                        </Routes>
                    </Suspense>
                </ChatContextProvider>
            </GlobalContextProvider>
        </BrowserRouter>
    )
}
if (document.getElementById('app')) {
    ReactDOM.render(
        <React.StrictMode>
            <MetaMaskProvider>
                <App />
            </MetaMaskProvider>
        </React.StrictMode>,
        document.getElementById('app')
    );
}
