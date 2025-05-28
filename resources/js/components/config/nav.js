import { IMAGES } from "../assets";
export const NavKeys = {
    logout: "logout",
    connect_wallet: 'connect_wallet',
    run_binary_payout: 'run_binary_payout',
    non_referral_signup: 'non_referral_signup',
}
export const UserNavbar = [
    {
        label: "Dashboard",
        link: 'dashboard',
        icon: IMAGES.ic_dashboard,
    },
    {
        label: "Wallet",
        prefix: 'wallet',
        icon: IMAGES.ic_wallet,
        items: [
            { link: '', label: "Wallet" },
            { link: '/staked', label: "Staked" },
        ]
    },
    {
        label: "Packages",
        prefix: 'packages',
        icon: IMAGES.ic_package,
        items: [
            { link: '', label: "Packages" },
            { link: '/renew-transfer', label: "View Purchased Packages" },
            { link: '/transfers', label: "Package Transfers" },
        ]
    },
    {
        label: "Marketplace",
        prefix: 'marketplace',
        icon: IMAGES.ic_market,
        items: [
            { link: '', label: "Marketplace" },
            { link: '/items-sale', label: "Items for sale" },
            { link: '/sales-log', label: "Sales Log" },
            { link: '/Purchases', label: "Purchases" },
            { link: '/sales-feedback', label: "Sales Feedback" },
        ]
    },
    {
        label: "Moderator",
        prefix: 'moderator',
        icon: IMAGES.ic_support,
        items: [
            { link: '', label: "List of Support" },
            // { link: '/activity-support', label: "Activity" },
        ]
    },
    {
        label: "Network",
        link: 'network',
        icon: IMAGES.ic_network,
    },
    {
        label: "Referrals",
        prefix: 'referrals',
        icon: IMAGES.ic_ref,
        items: [
            { link: '', label: "Referrals" },
            { link: '/links', label: "Links" },
        ]
    },
    {
        label: "chat",
        link: 'chat',
        icon: IMAGES.ic_chat,
    },
    {
        label: "Logs",
        prefix: 'logs',
        icon: IMAGES.ic_logs,
        items: [
            { link: '/network-logs', label: "Network" },
            // { link: '/sponsor-logs', label: "Sponsor" },
            { link: '/deposit-logs', label: "Deposit" },
            { link: '/withdrawal-logs', label: "withdrawal" },
            { link: '/transfer-logs', label: "Transfer" },
            { link: '/swap-logs', label: "Swap" },
            { link: '/swap-payout-logs', label: "Swap Payout" },
            { link: '/staked-logs', label: "Staked" },
            { link: '/client-admin-logs', label: "Client To Admin" },
        ]
    },
]
export const AdminNavbar = [
    // {
    //     label: "Dashboard",
    //     link: 'dashboard',
    //     icon: IMAGES.ic_dashboard,
    // },
    {
        label: "UserManagement",
        link: 'users',
        icon: IMAGES.ic_ref,
    },
    {
        label: "Participants",
        link: 'participants',
        icon: IMAGES.ic_ref,
    },
    {
        label: "Report App Usage",
        prefix: 'reportApp',
        icon: IMAGES.ic_package,
    },
    {
        label: "Report Phone Usage",
        prefix: 'reportPhone',
        icon: IMAGES.ic_package,
    },
]
export const AdminProfileItem = [
    {
        label: "Profile",
        link: 'profile',
        icon: 'fa-user',
    },
    {
        label: "Settings",
        link: 'settings',
        icon: 'fa-cog',
    },
    {
        label: "Network Settings",
        link: 'network-settings',
        icon: 'fa-network-wired',
    },
    {
        label: "Client Network",
        link: 'client-network',
        icon: 'fa-user',
    },
    {
        label: "Run Binary Payout",
        action: NavKeys.run_binary_payout,
        icon: 'fa-credit-card',
    },
    {
        label: "Non Referral Signups",
        action: NavKeys.non_referral_signup,
        icon: 'fa-user-plus',
    },
]