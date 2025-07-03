import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'
import { Users, Folder, BarChart2, Menu, X, Bell, Search, Settings, LogOut, User, ChevronDown, Home, Film, ChevronRight, Zap, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = ({ activePage }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenuItem, setActiveMenuItem] = useState(activePage || '/dashboard/directerdash');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const getUserData = () => {
        try {
            const storedUser = localStorage.getItem('user');
            const userEmail = localStorage.getItem('email');
            const profileDataRaw = localStorage.getItem('profile_data');
            const profileData = JSON.parse(profileDataRaw);
            const userType = storedUser || 'admin';
            return {
                first_name: profileData.representative_name || profileData.full_name,
                last_name: '',
                email: userEmail,
                role: userType.charAt(0).toUpperCase() + userType.slice(1),
                user_type: userType
            };
        } catch (error) {
            console.error('Error getting user data:', error);
            return {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                role: 'Admin',
                user_type: 'admin'
            };
        }
    };

    const userdata = getUserData();
    const allMenuItems = [
        {
            name: 'Dashboard',
            icon: <Home className="w-5 h-5" />,
            path: '/dashboard/admin-dashboard',
            description: 'Overview & Analytics',
            badge: null,
            color: 'from-blue-500 to-cyan-500',
            roles: ['admin'],
        },
        {
            name: 'Dashboard',
            icon: <Film className="w-5 h-5" />,
            path: '/dashboard/investor-dashboard',
            description: 'Overview Dashboard.',
            badge: null,
            color: 'from-indigo-500 to-purple-500',
            roles: ['investor'],
        },
        {
            name: 'Dashboard',
            icon: <Film className="w-5 h-5" />,
            path: '/dashboard/sme-dashboard',
            description: 'Overview Dashboard.',
            badge: null,
            color: 'from-indigo-500 to-purple-500',
            roles: ['sme'],
        },
        {
            name: 'Account Management',
            icon: <Users className="w-5 h-5" />,
            path: '',
            description: 'Manage Account',
            badge: null,
            color: 'from-green-500 to-emerald-500',
            hasSubItems: true,
            roles: ['admin'],
            subItems: [
                {
                    name: 'Investor Account',
                    path: '/dashboard/viewuinvesteruser',
                    roles: ['admin']
                },
                {
                    name: 'SME Account',
                    path: '/dashboard/viewsmeuser',
                    roles: ['admin']
                }
            ]
        },
        {
            name: 'Document Uploaded',
            icon: <Folder className="w-5 h-5" />,
            path: '/dashboard/addanalysis',
            description: 'Document Predict',
            badge: null,
            color: 'from-purple-500 to-violet-500',
            roles: ['sme'],
        },
        {
            name: 'Manage Subscriptions',
            icon: <BarChart2 className="w-5 h-5" />,
            path: '/dashboard/subscription-plan',
            description: 'Create & monitoring ',
            badge: null,
            color: 'from-orange-500 to-red-500',
            roles: ['admin'],
        },
        {
            name: 'Manage Payments',
            icon: <BarChart2 className="w-5 h-5" />,
            path: '/dashboard/payments-management',
            description: 'Create & monitoring ',
            badge: null,
            color: 'from-orange-500 to-red-500',
            roles: ['admin'],
        },
        {
            name: 'Subscriptions',
            icon: <BarChart2 className="w-5 h-5" />,
            path: '/dashboard/subscription',
            description: 'Manage your active plans.',
            badge: null,
            color: 'from-red-500 to-red-600',
            roles: ['sme'],
        },
        {
            name: 'Notification',
            icon: <BarChart2 className="w-5 h-5" />,
            path: '/dashboard/notifications-management',
            description: 'Manage your Notifications.',
            badge: null,
            color: 'from-red-500 to-red-600',
            roles: ['sme'],
        },

        {
            name: 'Investment Opportunities',
            icon: <Folder className="w-5 h-5" />,
            path: '/dashboard/get-sme-users',
            description: 'Browse Opportunities',

            color: 'from-yellow-500 to-orange-500',
            roles: ['investor'],
        },
        {
            name: 'User Logs',
            icon: <Bell className="w-5 h-5" />,
            path: '/dashboard/user-logs',
            description: 'View User Logs',
            color: 'from-yellow-500 to-orange-500',
            roles: ['admin'],
        }
    ];
    const getFilteredMenuItems = () => {
        return allMenuItems.filter(item => {
            if (!item.roles.includes(userdata.user_type)) {
                return false;
            }
            if (item.hasSubItems && item.subItems) {
                item.subItems = item.subItems.filter(subItem =>
                    subItem.roles.includes(userdata.user_type)
                );
                return item.subItems.length > 0;
            }

            return true;
        });
    };

    const menuItems = getFilteredMenuItems();

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        toast.success('User logged out successfully');
        navigate('/login', { replace: true });
    };

    const handleMenuClick = (path, hasSubItems = false) => {
        if (hasSubItems) {
            setExpandedMenus(prev => ({
                ...prev,
                [path]: !prev[path]
            }));
        } else {
            setActiveMenuItem(path);
            navigate(path);
        }
    };

    const handleSubMenuClick = (path) => {
        setActiveMenuItem(path);
        navigate(path);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-blue-900 border-r border-blue-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 shadow-xl`}>
                <div className="flex items-center justify-center h-40 px-6 border-b border-blue-800 bg-blue-900">
                    <div className="flex items-center text-white justify-center w-48 h-16 rounded-xl">
                        <img
                            src="/images/logox.png"
                            alt="Nova X Logo"
                            className="object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="hidden items-center justify-center w-12 h-12 text-white font-bold text-2xl bg-blue-500 rounded-xl">
                            N
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden absolute top-4 right-4 p-2 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="mt-6 px-4 space-y-1 h-[calc(100vh-140px)] overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider px-3 mb-3">
                            Main Menu ({userdata.role})
                        </h3>
                    </div>

                    <div className="space-y-1">
                        {menuItems.map((item, index) => (
                            <div key={`${item.path}-${index}`} className="relative group">
                                <div
                                    className="relative group"
                                    onMouseEnter={() => setHoveredItem(`${item.path}-${index}`)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <button
                                        onClick={() => handleMenuClick(item.path, item.hasSubItems)}
                                        className={`
                                            w-full flex items-center justify-between p-3 rounded-xl text-left 
                                            transition-all duration-300 ease-out relative overflow-hidden
                                            transform hover:scale-[1.02] hover:shadow-lg
                                            ${(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem)))
                                                ? 'bg-white text-blue-900 shadow-md shadow-white/10 border border-gray-200'
                                                : 'text-blue-100 hover:bg-blue-800/50 hover:text-white hover:shadow-md'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 
                                            transition-opacity duration-300 rounded-xl
                                            ${hoveredItem === `${item.path}-${index}` && activeMenuItem !== item.path ? 'opacity-10' : ''}
                                        `}></div>

                                        <div className="flex items-center space-x-3 relative z-10">
                                            {/* Icon Container */}
                                            <div className={`
                                                relative p-2 rounded-lg transition-all duration-300
                                                ${(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem)))
                                                    ? `bg-gradient-to-br ${item.color} text-white shadow-lg shadow-blue-500/25`
                                                    : 'bg-blue-800/50 text-blue-200 group-hover:bg-blue-700/60 group-hover:shadow-md'
                                                }
                                            `}>
                                                {item.icon}
                                                {(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem))) && (
                                                    <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse"></div>
                                                )}
                                            </div>

                                            {/* Text Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`
                                                        font-semibold text-sm transition-colors duration-200
                                                        ${(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem))) ? 'text-blue-900' : 'text-blue-100'}
                                                    `}>
                                                        {item.name}
                                                    </span>
                                                    {(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem))) && (
                                                        <Zap className="w-3 h-3 text-blue-300 animate-pulse" />
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <p className={`
                                                        text-xs transition-colors duration-200 mt-0.5
                                                        ${(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem))) ? 'text-gray-600' : 'text-blue-300'}
                                                    `}>
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 relative z-10">
                                            {item.badge && (
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-bold transition-all duration-200
                                                    ${(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem)))
                                                        ? 'bg-blue-400/30 text-white shadow-sm'
                                                        : 'bg-red-500/80 text-white group-hover:bg-red-400'
                                                    }
                                                `}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {item.hasSubItems ? (
                                                expandedMenus[item.path] ? (
                                                    <ChevronUp className="w-4 h-4 text-blue-200 transition-all duration-300" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-blue-300 transition-all duration-300" />
                                                )
                                            ) : (
                                                <ChevronRight className={`
                                                    w-4 h-4 transition-all duration-300
                                                    ${(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem)))
                                                        ? 'text-blue-200 transform translate-x-1'
                                                        : 'text-blue-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                                                    }
                                                `} />
                                            )}
                                        </div>

                                        {/* Active Indicator Line */}
                                        {(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem))) && (
                                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-white to-blue-200 rounded-r-full shadow-lg shadow-white/50"></div>
                                        )}
                                    </button>

                                    {/* Hover Effect Line */}
                                    {hoveredItem === `${item.path}-${index}` && activeMenuItem !== item.path && !item.subItems?.some(sub => sub.path === activeMenuItem) && (
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-blue-300 to-blue-200 rounded-r-full transition-all duration-300"></div>
                                    )}
                                </div>

                                {/* Sub Menu Items */}
                                {item.hasSubItems && expandedMenus[item.path] && (
                                    <div className="ml-10 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                        {item.subItems.map((subItem, subIndex) => (
                                            <button
                                                key={`${subItem.path}-${subIndex}`}
                                                onClick={() => handleSubMenuClick(subItem.path)}
                                                className={`
                                                    w-full flex items-center justify-between p-2.5 rounded-lg text-left 
                                                    transition-all duration-200 relative border-l-2 mb-3
                                                    ${activeMenuItem === subItem.path
                                                        ? 'bg-blue-500/20 text-white border-blue-300 shadow-sm'
                                                        : 'text-blue-200 hover:bg-blue-700/30 hover:text-white border-blue-600 hover:border-blue-400'
                                                    }
                                                `}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`
                                                            font-medium text-sm transition-colors duration-200
                                                            ${activeMenuItem === subItem.path ? 'text-white' : 'text-blue-200'}
                                                        `}>
                                                            {subItem.name}
                                                        </span>
                                                        {activeMenuItem === subItem.path && (
                                                            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></div>
                                                        )}
                                                    </div>

                                                </div>

                                                <ChevronRight className={`
                                                    w-3 h-3 transition-all duration-300
                                                    ${activeMenuItem === subItem.path
                                                        ? 'text-blue-200 transform translate-x-0.5'
                                                        : 'text-blue-300 opacity-0 group-hover:opacity-100'
                                                    }
                                                `} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700 bg-blue-800/50">
                    <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-blue-700/40 cursor-pointer transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-blue-300 shadow-sm">
                            <span className="text-white text-sm font-medium">
                                {userdata.first_name?.[0]?.toUpperCase()}{userdata.last_name?.[0]?.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {userdata.first_name} {userdata.last_name}
                            </p>
                            <p className="text-xs text-blue-200 truncate">{userdata.role}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-300" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
                {/* Modern Top Navigation */}
                <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 shadow-sm sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="relative hidden md:flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-80 pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
                                    placeholder="Search dashboard..."
                                />
                            </div>

                            {/* Breadcrumb */}
                            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
                                <span>Dashboard</span>
                                <span>/</span>
                                <span className="text-gray-900 font-medium">
                                    {(() => {
                                        // Find the active menu item or sub-item
                                        const mainItem = menuItems.find(item => item.path === activeMenuItem);
                                        if (mainItem) return mainItem.name;

                                        // Check sub-items
                                        for (const item of menuItems) {
                                            if (item.subItems) {
                                                const subItem = item.subItems.find(sub => sub.path === activeMenuItem);
                                                if (subItem) return `${item.name} / ${subItem.name}`;
                                            }
                                        }
                                        return 'Home';
                                    })()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Quick Actions */}
                            <div className="hidden md:flex items-center space-x-2">
                                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                                    Quick Add
                                </button>
                                <div className="w-px h-6 bg-gray-200"></div>
                            </div>



                            {/* Settings */}
                            <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200">
                                <Settings className="w-5 h-5" />
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-3 pl-3 pr-2 py-2 text-sm rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                                        <span className="text-white text-sm font-medium">
                                            {userdata.first_name?.[0]?.toUpperCase()}{userdata.last_name?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="font-medium text-gray-900 leading-tight">
                                            {userdata.first_name} {userdata.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">{userdata.role}</p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2  bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="font-medium text-gray-900">
                                                {userdata.first_name} {userdata.last_name}
                                            </p>
                                            <p className="text-sm text-gray-500">{userdata.email}</p>
                                        </div>
                                        {userdata.role === 'Sme' && (
                                            <div className="border-t border-gray-100 py-1">
                                                <a
                                                    href="/dashboard/sme-profile"
                                                    className="flex items-center px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer w-full text-left"
                                                >
                                                    <User className="w-4 h-4 mr-3 text-blue-600" />
                                                    SME profile
                                                </a>
                                            </div>
                                        )}

                                        {userdata.role === 'Investor' && (
                                            <div className="border-t border-gray-100 py-1">
                                                <a
                                                    href="/dashboard/investor-profile"
                                                    className="flex items-center px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer w-full text-left"
                                                >
                                                    <User className="w-4 h-4 mr-3 text-blue-600" />
                                                    Investor profile
                                                </a>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-50 py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4 mr-3" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="py-6 px-6">
                    <Outlet />
                </main>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Dashboard;