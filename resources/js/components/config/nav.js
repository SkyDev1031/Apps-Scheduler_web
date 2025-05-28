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
        label: "Study Group",
        link: 'study',
        icon: IMAGES.ic_wallet,
    },
]

export const AdminNavbar = [
    {
        label: "Dashboard",
        link: 'dashboard',
        icon: IMAGES.ic_dashboard,
    },
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