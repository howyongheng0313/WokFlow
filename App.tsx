
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Calendar from './components/Calendar';
import CountrySelector from './components/CountrySelector';
import ClickSpark from './components/ClickSpark';
import AboutView from './components/AboutView';
import { ViewState, UserRole } from './types';
import {
    INITIAL_USERS,
    INITIAL_COURSES,
    INITIAL_ENROLLMENTS,
    INITIAL_COMMENTS,
    INITIAL_SHARER_REGISTRATIONS,
    INITIAL_SHARER_REQUESTS,
    INITIAL_REPORTED_CONTENT,
    INITIAL_PLATFORM_ANALYTICS,
    INITIAL_CHAPTERS,
    INITIAL_CHAPTER_PROGRESS,
    MONTH_NAMES as IMPORTED_MONTH_NAMES,
    UserStatus,
    CourseStatus,
    getCuisineStatistics,
    getUserRoleStatistics,
    getRegistrationTrendData,
    type UserChapterProgress
} from './data/database';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    Bell,
    LogOut,
    Search,
    ChevronDown,
    MoreVertical,
    Play,
    CheckCircle,
    XCircle,
    Filter,
    Plus,
    Upload,
    Trash2,
    Edit2,
    Eye,
    MessageSquare,
    Heart,
    Share2,
    Star,
    Send,
    User,
    Menu,
    X,
    Image as ImageIcon,
    Video,
    FileText,
    HelpCircle,
    Info,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Ban,
    RotateCcw,
    Check,
    GripVertical,
    Link,
    Bold,
    Italic,
    List,
    Clock,
    Globe,
    BarChart2,
    Award,
    EyeOff,
    Maximize,
    Pause,
    Volume2,
    ChefHat,
    Circle,
    Flame,
    Slice,
    Fish,
    Droplet,
    ArrowLeft,
    Flag
} from 'lucide-react';


// --- CONSTANTS ---

const MONTH_NAMES = IMPORTED_MONTH_NAMES;

// 将数据库课程格式转换为应用所需格式(只包含活跃课程)
const INITIAL_ALL_COURSES = INITIAL_COURSES
    .filter(course => course.status === CourseStatus.ACTIVE)  // 只显示活跃课程
    .map(course => ({
        id: course.course_id,
        title: course.title,
        description: course.description,  // 添加课程描述
        cuisine: course.cuisine_id === 1 ? 'Chinese' :
            course.cuisine_id === 2 ? 'Western' :
                course.cuisine_id === 3 ? 'Japanese' : 'Korean',
        image: course.image_url,
        difficulty: course.difficulty,  // 添加难度字段用于筛选和显示
        duration: course.duration,  // 添加时长字段用于显示
        created_date: course.created_date  // 添加创建日期字段用于时间筛选
    }));

// 将数据库注册格式转换为应用所需格式
const INITIAL_ENROLLED_COURSES = INITIAL_ENROLLMENTS.map(enrollment => ({
    id: enrollment.enrollment_id,
    userId: enrollment.user_id, // 添加 userId
    title: INITIAL_COURSES.find(c => c.course_id === enrollment.course_id)?.title || `Course ${enrollment.course_id}`,
    date: enrollment.enrollment_date,
    progress: enrollment.progress,
    status: enrollment.status
}));

// 创建的课程列表(从课程表中筛选)
const INITIAL_CREATED_COURSES = INITIAL_COURSES.map(course => ({
    id: course.course_id,
    title: course.title,
    date: course.created_date,
    status: course.status
}));

const SECTION_SCORES = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: i === 7 ? 'Cuisine 8' : `Section ${i + 1} `,
    date: '03-13-2026',
    score: 60,
    status: i === 1 ? 'Failed' : 'Passed'
}));

// 将数据库用户格式转换为应用所需格式
const INITIAL_USER_CONTROL_DATA = INITIAL_USERS.map(user => ({
    id: user.user_id,
    username: user.username,
    role: user.role === 'LEARNER' ? 'Learner' :
        user.role === 'SHARER' ? 'Sharer' :
            user.role === 'ADMIN' ? 'Admin' : 'Guest',
    joinedDate: user.joined_date,
    status: user.status
}));

// 将数据库举报内容格式转换为应用所需格式
const INITIAL_REPORTED_CONTENT_DATA = INITIAL_REPORTED_CONTENT.map(report => ({
    id: report.report_id,
    course: INITIAL_COURSES.find(c => c.course_id === report.course_id)?.title || `Course ${report.course_id}`,
    reporter: INITIAL_USERS.find(u => u.user_id === report.reporter_id)?.username || `User ${report.reporter_id}`,
    reason: report.reason,
    date: report.report_date,
    status: report.status
}));

// 将数据库分享者注册格式转换为应用所需格式
const INITIAL_SHARER_REGISTRATIONS_DATA = INITIAL_SHARER_REGISTRATIONS.map(reg => ({
    id: reg.registration_id,
    username: INITIAL_USERS.find(u => u.user_id === reg.user_id)?.username || `User ${reg.user_id}`,
    requestDate: reg.request_date,
    status: reg.status
}));

// 将数据库分享者请求格式转换为应用所需格式
const INITIAL_SHARER_REQUESTS_DATA = INITIAL_SHARER_REQUESTS.map(req => ({
    id: req.request_id,
    username: INITIAL_USERS.find(u => u.user_id === req.user_id)?.username || `User ${req.user_id}`,
    requestDate: req.request_date,
    status: req.status
}));

// 注册趋势数据
const REGISTRATION_TREND_DATA = getRegistrationTrendData();

// 菜系分类数据
const CUISINE_CATEGORY_DATA = getCuisineStatistics();

// 用户角色数据
const USER_ROLE_DATA = getUserRoleStatistics();


// --- SHARED COMPONENTS ---

interface Enrollment {
    id: number;
    userId: number; // 添加 userId
    title: string;
    date: string;
    progress: number;
    status: string;
}

interface ViewProps {
    setCurrentView: (view: ViewState) => void;
}

interface AuthenticatedViewProps extends ViewProps {
    selectedRole: UserRole;
}

interface RegisterProps extends ViewProps {
    selectedRole: UserRole;
    setSelectedRole: (role: UserRole) => void;
}

const AuthenticatedNavbar: React.FC<{
    setCurrentView: (view: ViewState) => void;
    selectedRole: UserRole;
    currentView: ViewState;
    myCoursesSubpage?: string;
    setMyCoursesSubpage?: (subpage: string) => void;
    onClearEditing?: () => void;
}> = ({ setCurrentView, selectedRole, currentView, myCoursesSubpage, setMyCoursesSubpage, onClearEditing }) => {
    const [isMyCoursesDropdownOpen, setIsMyCoursesDropdownOpen] = React.useState(false);
    const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] = React.useState(false);

    return (
        <header className="flex items-center justify-between px-6 py-4 md:px-12 max-w-[1400px] mx-auto w-full relative z-20">
            <div className="glass-panel rounded-full px-6 py-3 w-full flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setCurrentView(ViewState.DASHBOARD)}
                >
                    <div className="bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
                        <ChefHat size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">WokFlow</span>
                </div>

                <nav className="hidden md:flex items-center gap-10">
                    <button
                        onClick={() => setCurrentView(ViewState.DASHBOARD)}
                        className={`text-sm font-bold transition-all px-4 py-2 rounded-full ${currentView === ViewState.DASHBOARD ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-[#FF8C66]'} `}
                    >
                        Homepage
                    </button>
                    {/* My Courses - Dropdown for Sharer, regular button for Learner */}
                    {selectedRole === UserRole.SHARER ? (
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsMyCoursesDropdownOpen(!isMyCoursesDropdownOpen);
                                    setIsAnalyticsDropdownOpen(false);
                                }}
                                className={`text-sm font-bold transition-all px-4 py-2 rounded-full flex items-center gap-1 ${currentView === ViewState.MY_COURSES ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-[#FF8C66]'} `}
                            >
                                My Courses
                                <ChevronDown size={16} className={`transition-transform ${isMyCoursesDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isMyCoursesDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                                    <button
                                        onClick={() => {
                                            setCurrentView(ViewState.MY_COURSES);
                                            setMyCoursesSubpage?.('created');
                                            setIsMyCoursesDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
                                    >
                                        Created Courses
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCurrentView(ViewState.MY_COURSES);
                                            setMyCoursesSubpage?.('joined');
                                            setIsMyCoursesDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
                                    >
                                        Joined Courses
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setCurrentView(ViewState.MY_COURSES)}
                            className={`text-sm font-bold transition-all px-4 py-2 rounded-full ${currentView === ViewState.MY_COURSES ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-[#FF8C66]'} `}
                        >
                            My Courses
                        </button>
                    )}

                    {selectedRole === UserRole.SHARER && (
                        <>
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsAnalyticsDropdownOpen(!isAnalyticsDropdownOpen);
                                        setIsMyCoursesDropdownOpen(false);
                                    }}
                                    className={`text-sm font-bold transition-all px-4 py-2 rounded-full flex items-center gap-1 ${[ViewState.ANALYTICS_PERFORMANCE, ViewState.ANALYTICS_QUIZ, ViewState.ANALYTICS_COMMENTS].includes(currentView) ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-[#FF8C66]'} `}
                                >
                                    Analytics
                                    <ChevronDown size={16} className={`transition-transform ${isAnalyticsDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isAnalyticsDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                                        <button
                                            onClick={() => {
                                                setCurrentView(ViewState.ANALYTICS_PERFORMANCE);
                                                setIsAnalyticsDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
                                        >
                                            Course Performance
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentView(ViewState.ANALYTICS_QUIZ);
                                                setIsAnalyticsDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
                                        >
                                            Quiz Performance
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentView(ViewState.ANALYTICS_COMMENTS);
                                                setIsAnalyticsDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
                                        >
                                            Comments Dashboard
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    if (onClearEditing) onClearEditing();
                                    setCurrentView(ViewState.CREATE_COURSE);
                                }}
                                className={`text-sm font-bold transition-all px-4 py-2 rounded-full ${currentView === ViewState.CREATE_COURSE ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-[#FF8C66]'} `}
                            >
                                Create Course
                            </button>
                        </>
                    )}
                </nav>
                <div className="flex items-center gap-4">
                    <button
                        className={`p-2 rounded-full transition-colors ${currentView === ViewState.USER_PROFILE ? 'bg-orange-100 text-[#FF8C66]' : 'hover:bg-white/50 text-gray-500'} `}
                        onClick={() => setCurrentView(ViewState.USER_PROFILE)}
                    >
                        <User size={24} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </header>
    );
};

const AdminNavbar: React.FC<{
    setCurrentView: (view: ViewState) => void;
    currentView: ViewState;
}> = ({ setCurrentView, currentView }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isUserManagementActive = currentView === ViewState.ADMIN_USER_MANAGEMENT || currentView === ViewState.ADMIN_SHARER_REGISTRATION;

    return (
        <header className="flex items-center justify-between px-6 py-4 md:px-12 max-w-[1400px] mx-auto w-full relative z-20">
            <div className="glass-panel rounded-full px-6 py-3 w-full flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setCurrentView(ViewState.ADMIN_USER_MANAGEMENT)}
                >
                    <div className="bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
                        <ChefHat size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">WokFlow</span>
                </div>

                <nav className="hidden md:flex items-center gap-10">
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className={`text-sm font-bold transition-all px-4 py-2 rounded-full flex items-center gap-2 ${isUserManagementActive ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-[#FF8C66]'} `}
                        >
                            User Management
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isUserMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-1">
                                <button
                                    onClick={() => {
                                        setCurrentView(ViewState.ADMIN_USER_MANAGEMENT);
                                        setIsUserMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === ViewState.ADMIN_USER_MANAGEMENT ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    User Control Panel
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentView(ViewState.ADMIN_SHARER_REQUESTS);
                                        setIsUserMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === ViewState.ADMIN_SHARER_REQUESTS ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Sharer Requests
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentView(ViewState.ADMIN_SHARER_REGISTRATION);
                                        setIsUserMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === ViewState.ADMIN_SHARER_REGISTRATION ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Sharer Registration
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setCurrentView(ViewState.ADMIN_CONTENT_MANAGEMENT)}
                        className={`text-sm font-bold transition-all px-4 py-2 rounded-full ${currentView === ViewState.ADMIN_CONTENT_MANAGEMENT ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-[#FF8C66]'} `}
                    >
                        Content Management
                    </button>
                    <button
                        onClick={() => setCurrentView(ViewState.ADMIN_PLATFORM_ANALYTICS)}
                        className={`text-sm font-bold transition-all px-4 py-2 rounded-full ${currentView === ViewState.ADMIN_PLATFORM_ANALYTICS ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-[#FF8C66]'} `}
                    >
                        Platform Analytics
                    </button>
                </nav>
                <div className="flex items-center gap-4">
                    <button
                        className={`p-2 rounded-full transition-colors ${currentView === ViewState.USER_PROFILE ? 'bg-orange-100 text-[#FF8C66]' : 'hover:bg-white/50 text-gray-500'} `}
                        onClick={() => setCurrentView(ViewState.USER_PROFILE)}
                    >
                        <User size={24} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </header>
    );
};

// --- Admin Views ---

interface SharerRegistrationProps extends ViewProps {
    registrations: typeof INITIAL_SHARER_REGISTRATIONS;
    onAcceptRegistration: (id: number) => void;
    onRejectRegistration: (id: number) => void;
    onUndoRegistration: (id: number) => void;
}

const SharerRegistrationView: React.FC<SharerRegistrationProps> = ({
    setCurrentView,
    registrations,
    onAcceptRegistration,
    onRejectRegistration,
    onUndoRegistration
}) => {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredRegistrations = registrations.filter(item => {
        const matchesSearch = item.username.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AdminNavbar setCurrentView={setCurrentView} currentView={ViewState.ADMIN_SHARER_REGISTRATION} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6">
                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">Sharer Registration</h1>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-4 pr-10 rounded-lg border border-white/60 bg-white/60 backdrop-blur-md text-[#1A1A1A] placeholder:text-gray-500 focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] shadow-sm"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative min-w-[200px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-10 pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                        {(statusFilter !== 'All' || searchQuery !== '') && (
                            <button
                                onClick={() => {
                                    setStatusFilter('All');
                                    setSearchQuery('');
                                }}
                                className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 px-8 py-5 text-sm font-bold text-[#1A1A1A] border-b border-white/40 bg-white/30">
                        <div className="col-span-3 flex items-center gap-2 cursor-pointer">Username <ChevronDown size={14} /></div>
                        <div className="col-span-2">Register Date</div>
                        <div className="col-span-3">Proof of Skills</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>
                    <div className="divide-y divide-white/40">
                        {filteredRegistrations.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-orange-50/30 transition-colors">
                                <div className="col-span-3 flex items-center gap-4">
                                    <GripVertical size={20} className="text-gray-300" />
                                    <span className="font-medium text-[#1A1A1A]">{item.username}</span>
                                </div>
                                <div className="col-span-2 text-gray-600">{item.requestDate}</div>
                                <div className="col-span-3">
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); alert(`Opening proof: ${item.proof}`); }}
                                        className="text-[#FF8C66] hover:underline font-medium flex items-center gap-1"
                                    >
                                        <FileText size={16} />
                                        {item.proof}
                                    </a>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-sm font-medium text-gray-600">
                                        {item.status}
                                    </span>
                                </div>
                                <div className="col-span-2 flex justify-end relative">
                                    <button
                                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-[#FF8C66]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === item.id ? null : item.id);
                                        }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {openMenuId === item.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                {item.status === 'Pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => { onAcceptRegistration(item.id); setOpenMenuId(null); }}
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <CheckCircle size={16} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => { onRejectRegistration(item.id); setOpenMenuId(null); }}
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <XCircle size={16} /> Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => { onUndoRegistration(item.id); setOpenMenuId(null); }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                                    >
                                                        <RotateCcw size={16} /> Undo
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

interface SharerRequestProps extends ViewProps {
    requests: typeof INITIAL_SHARER_REQUESTS;
    onAcceptRequest: (id: number) => void;
    onRejectRequest: (id: number) => void;
    onUndoRequest: (id: number) => void;
}

const SharerRequestView: React.FC<SharerRequestProps> = ({
    setCurrentView,
    requests,
    onAcceptRequest,
    onRejectRequest,
    onUndoRequest
}) => {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredRequests = requests.filter(item => {
        const matchesSearch = item.username.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AdminNavbar setCurrentView={setCurrentView} currentView={ViewState.ADMIN_SHARER_REQUESTS} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6">
                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">Sharer Requests</h1>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-4 pr-10 rounded-lg border border-white/60 bg-white/60 backdrop-blur-md text-[#1A1A1A] placeholder:text-gray-500 focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] shadow-sm"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative min-w-[200px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-10 pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                        {(statusFilter !== 'All' || searchQuery !== '') && (
                            <button
                                onClick={() => {
                                    setStatusFilter('All');
                                    setSearchQuery('');
                                }}
                                className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 px-8 py-5 text-sm font-bold text-[#1A1A1A] border-b border-white/40 bg-white/30">
                        <div className="col-span-4 flex items-center gap-2 cursor-pointer">Username <ChevronDown size={14} /></div>
                        <div className="col-span-4">Request Date</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>
                    <div className="divide-y divide-white/40">
                        {filteredRequests.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-orange-50/30 transition-colors">
                                <div className="col-span-4 flex items-center gap-4">
                                    <GripVertical size={20} className="text-gray-300" />
                                    <span className="font-medium text-[#1A1A1A]">{item.username}</span>
                                </div>
                                <div className="col-span-4 text-gray-600">{item.requestDate}</div>
                                <div className="col-span-2">
                                    <span className="text-sm font-medium text-gray-600">
                                        {item.status}
                                    </span>
                                </div>
                                <div className="col-span-2 flex justify-end relative">
                                    <button
                                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-[#FF8C66]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === item.id ? null : item.id);
                                        }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {openMenuId === item.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                {item.status === 'Pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => { onAcceptRequest(item.id); setOpenMenuId(null); }}
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <CheckCircle size={16} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => { onRejectRequest(item.id); setOpenMenuId(null); }}
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <XCircle size={16} /> Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => { onUndoRequest(item.id); setOpenMenuId(null); }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                                    >
                                                        <RotateCcw size={16} /> Undo
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pagination */}
                    <div className="px-8 py-6 border-t border-white/40 flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">1 - 8 of 40 items</span>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Previous</button>
                            <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Next</button>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
};

interface AdminUserManagementProps extends ViewProps {
    users: typeof INITIAL_USER_CONTROL_DATA;
    onBanUser: (id: number) => void;
    onRecoverUser: (id: number) => void;
}

const AdminUserManagementView: React.FC<AdminUserManagementProps> = ({
    setCurrentView,
    users,
    onBanUser,
    onRecoverUser
}) => {
    const [openUserControlMenuId, setOpenUserControlMenuId] = useState<number | null>(null);



    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("");
    const [userStatusFilter, setUserStatusFilter] = useState("");

    const filteredUserControl = users.filter(item => {
        const matchesSearch = item.username.toLowerCase().includes(userSearchQuery.toLowerCase());
        const matchesRole = userRoleFilter === "" || item.role === userRoleFilter;
        const matchesStatus = userStatusFilter === "" || item.status === userStatusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AdminNavbar setCurrentView={setCurrentView} currentView={ViewState.ADMIN_USER_MANAGEMENT} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6">

                {/* Stats Banner */}
                <div className="w-full bg-gradient-to-br from-[#FF8C66] to-[#FFB399] rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-orange-200/50 mb-20 relative overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                                <Flame size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/80 mb-1">Total User</div>
                                <div className="text-3xl font-bold">2350</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                                <Slice size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/80 mb-1">New User</div>
                                <div className="text-3xl font-bold">12</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                                <Fish size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/80 mb-1">Pending</div>
                                <div className="text-3xl font-bold">12</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                                <Droplet size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/80 mb-1">Banned</div>
                                <div className="text-3xl font-bold">8</div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* User Control Panel */}
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">User Control Panel</h2>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Search username..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="w-full h-10 pl-4 pr-10 rounded-lg border border-white/60 bg-white/60 backdrop-blur-md text-[#1A1A1A] placeholder:text-gray-500 focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] shadow-sm"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>

                        <div className="relative min-w-[150px]">
                            <select
                                value={userRoleFilter}
                                onChange={(e) => setUserRoleFilter(e.target.value)}
                                className="w-full h-10 pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                            >
                                <option value="" disabled>Role</option>
                                <option value="Learner">Learner</option>
                                <option value="Sharer">Sharer</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>

                        <div className="relative min-w-[200px]">
                            <select
                                value={userStatusFilter}
                                onChange={(e) => setUserStatusFilter(e.target.value)}
                                className="w-full h-10 pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                            >
                                <option value="" disabled>Status</option>
                                <option value="Active">Active</option>
                                <option value="Banned">Banned</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>

                        {(userSearchQuery || userRoleFilter || userStatusFilter) && (
                            <button
                                onClick={() => {
                                    setUserSearchQuery("");
                                    setUserRoleFilter("");
                                    setUserStatusFilter("");
                                }}
                                className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-12 px-8 py-5 text-sm font-bold text-[#1A1A1A] border-b border-white/40 bg-white/30">
                            <div className="col-span-3 flex items-center gap-2 cursor-pointer">Username <ChevronDown size={14} /></div>
                            <div className="col-span-2">Role</div>
                            <div className="col-span-3">Joined Date</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Action</div>
                        </div>
                        <div className="divide-y divide-white/40">
                            {filteredUserControl.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-orange-50/30 transition-colors">
                                    <div className="col-span-3 flex items-center gap-4">
                                        <GripVertical size={20} className="text-gray-300" />
                                        <span className="font-medium text-[#1A1A1A]">{item.username}</span>
                                    </div>
                                    <div className="col-span-2 text-gray-600">{item.role}</div>
                                    <div className="col-span-3 text-gray-600">{item.joinedDate}</div>
                                    <div className="col-span-2 text-gray-600">{item.status}</div>
                                    <div className="col-span-2 flex justify-end relative">
                                        <button
                                            className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-[#FF8C66]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenUserControlMenuId(openUserControlMenuId === item.id ? null : item.id);
                                            }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {openUserControlMenuId === item.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenUserControlMenuId(null); }}></div>
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    {item.status === 'Active' ? (
                                                        <button className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                                            <Ban size={16} /> Ban User
                                                        </button>
                                                    ) : (
                                                        <button className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2">
                                                            <CheckCircle size={16} /> Recover User
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Pagination */}
                        <div className="px-8 py-6 border-t border-white/40 flex items-center justify-between">
                            <span className="text-sm text-gray-500 font-medium">1 - 8 of 40 items</span>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Previous</button>
                                <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Next</button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
};

interface AdminContentManagementProps extends ViewProps {
    reportedContent: typeof INITIAL_REPORTED_CONTENT_DATA;
    onBanContent: (id: number) => void;
    onIgnoreContent: (id: number) => void;
    onUndoContent: (id: number) => void;
}

const AdminContentManagementView: React.FC<AdminContentManagementProps> = ({
    setCurrentView,
    reportedContent,
    onBanContent,
    onIgnoreContent,
    onUndoContent
}) => {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // --- State for Filters ---
    const [reportedSearchQuery, setReportedSearchQuery] = useState("");
    const [reportedStatusFilter, setReportedStatusFilter] = useState("");

    // --- Filtering Logic ---
    const filteredReportedContent = reportedContent.filter(item => {
        const matchesSearch = item.course.toLowerCase().includes(reportedSearchQuery.toLowerCase()) ||
            item.reporter.toLowerCase().includes(reportedSearchQuery.toLowerCase());
        const matchesStatus = reportedStatusFilter === "" || item.status === reportedStatusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AdminNavbar setCurrentView={setCurrentView} currentView={ViewState.ADMIN_CONTENT_MANAGEMENT} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">Reported Content</h2>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search course or reporter..."
                            value={reportedSearchQuery}
                            onChange={(e) => setReportedSearchQuery(e.target.value)}
                            className="w-full h-10 pl-4 pr-10 rounded-lg border border-white/60 bg-white/60 backdrop-blur-md text-[#1A1A1A] placeholder:text-gray-500 focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] shadow-sm"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>

                    <div className="relative min-w-[250px] flex items-center gap-2">
                        <div className="relative w-full">
                            <select
                                value={reportedStatusFilter}
                                onChange={(e) => setReportedStatusFilter(e.target.value)}
                                className="w-full h-10 pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                            >
                                <option value="" disabled>Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Ignored">Ignored</option>
                                <option value="Banned">Banned</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>

                        {(reportedSearchQuery || reportedStatusFilter) && (
                            <button
                                onClick={() => {
                                    setReportedSearchQuery("");
                                    setReportedStatusFilter("");
                                }}
                                className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 px-8 py-5 text-sm font-bold text-[#1A1A1A] border-b border-white/40 bg-white/30">
                        <div className="col-span-3 flex items-center gap-2 cursor-pointer">Courses <ChevronDown size={14} /></div>
                        <div className="col-span-2 flex items-center gap-2 cursor-pointer">Reporter <ChevronDown size={14} /></div>
                        <div className="col-span-2">Reason</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>
                    <div className="divide-y divide-white/40">
                        {filteredReportedContent.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-orange-50/30 transition-colors">
                                <div className="col-span-3 flex items-center gap-4">
                                    <GripVertical size={20} className="text-gray-300" />
                                    <span className="font-medium text-[#1A1A1A]">{item.course}</span>
                                </div>
                                <div className="col-span-2 text-gray-600">{item.reporter}</div>
                                <div className="col-span-2 text-gray-600">{item.reason}</div>
                                <div className="col-span-2 text-gray-600">{item.date}</div>
                                <div className="col-span-1 text-gray-600">{item.status}</div>
                                <div className="col-span-2 flex justify-end relative">
                                    <button
                                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-[#FF8C66]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === item.id ? null : item.id);
                                        }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {openMenuId === item.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                {item.status === 'Pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => { onIgnoreContent(item.id); setOpenMenuId(null); }}
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <CheckCircle size={16} /> Ignore
                                                        </button>
                                                        <button
                                                            onClick={() => { onBanContent(item.id); setOpenMenuId(null); }}
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <Ban size={16} /> Ban
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => { onUndoContent(item.id); setOpenMenuId(null); }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                                    >
                                                        <RotateCcw size={16} /> Undo
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pagination */}
                    <div className="px-8 py-6 border-t border-white/40 flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">1 - 8 of 40 items</span>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Previous</button>
                            <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Next</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

const AdminPlatformAnalyticsView: React.FC<ViewProps> = ({ setCurrentView }) => {
    // --- State for Filters ---
    const [registrationYear, setRegistrationYear] = useState("2026");
    const [cuisineYear, setCuisineYear] = useState("2026");
    const [rolesYear, setRolesYear] = useState("2026");
    const [rolesMonth, setRolesMonth] = useState("All");

    // --- Mock Filter Logic (Impacts Data) ---
    const getRegistrationData = () => {
        // Mock data change based on year
        return registrationYear === "2026" ? REGISTRATION_TREND_DATA : REGISTRATION_TREND_DATA.map(v => Math.floor(v * 0.8));
    };

    const getCuisineData = () => {
        return cuisineYear === "2026" ? CUISINE_CATEGORY_DATA : CUISINE_CATEGORY_DATA.map(d => ({ ...d, value: Math.floor(d.value * 0.7) }));
    };

    const getRolesData = () => {
        let base = USER_ROLE_DATA;
        if (rolesYear === "2025") base = base.map(d => ({ ...d, value: Math.floor(d.value * 0.9) }));
        if (rolesMonth !== "All") base = base.map(d => ({ ...d, value: Math.floor(d.value / 12) }));
        return base;
    };

    // Custom Chart Components using SVG

    // 1. Line Chart for User Registration Trend
    const LineChart = ({ data }: { data: number[] }) => {
        const height = 300;
        const width = 800;
        const maxVal = Math.max(...data, 100) * 1.1; // Add some padding
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (val / maxVal) * height;
            return `${x},${y} `;
        }).join(' ');

        return (
            <div className="w-full h-full min-h-[200px]">
                <svg viewBox={`0 0 ${width} ${height} `} className="overflow-visible w-full h-full" preserveAspectRatio="none">
                    {/* Y Axis Grid Lines */}
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map(tick => (
                        <g key={tick}>
                            <line x1="0" y1={height * (1 - tick)} x2={width} y2={height * (1 - tick)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
                            <text x="-15" y={height * (1 - tick)} className="text-[10px] fill-gray-400 text-right" dy="3">{Math.round(maxVal * tick)}</text>
                        </g>
                    ))}

                    {/* X Axis Ticks */}
                    {MONTH_NAMES.map((m, i) => {
                        const x = (i / (data.length - 1)) * width;
                        return (
                            <g key={i}>
                                <text x={x} y={height + 20} className="text-[10px] fill-gray-500 uppercase" textAnchor="middle">{m.substring(0, 3)}</text>
                            </g>
                        )
                    })}

                    {/* Trend Line */}
                    <defs>
                        <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FF8C66" />
                            <stop offset="100%" stopColor="#FF6B4A" />
                        </linearGradient>
                    </defs>
                    <polyline points={points} fill="none" stroke="url(#gradientLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        );
    };

    // 2. Bar Chart for Cuisine Categories
    const BarChart = ({ data }: { data: { label: string, value: number }[] }) => {
        const maxVal = Math.max(...data.map(d => d.value), 1000) * 1.1;

        return (
            <div className="w-full h-full flex flex-col min-h-[300px] relative">
                <div className="flex-1 relative ml-12 mb-6 border-b border-gray-100">
                    {/* Y Axis Labels & Grid Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick, i) => (
                            <div key={i} className="absolute w-full flex items-center" style={{ bottom: `${tick * 100}%` }}>
                                <div className="absolute -left-12 w-10 text-right text-[10px] text-gray-400 pr-2">
                                    {Math.round(maxVal * tick)}
                                </div>
                                {tick > 0 && <div className="w-full h-px bg-gray-100 border-t border-dashed border-gray-200"></div>}
                            </div>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end justify-around pl-4 pr-4 pt-4 z-10">
                        {data.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end w-16 group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                    {item.value.toLocaleString()} Users
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>

                                <div
                                    className="w-full bg-gradient-to-b from-[#FF8C66] to-[#FFB399] rounded-t-xl transition-all duration-300 ease-out hover:brightness-110 shadow-sm group-hover:shadow-lg group-hover:shadow-orange-500/20 group-hover:-translate-y-1"
                                    style={{ height: `${(item.value / maxVal) * 100}%` }}
                                ></div>
                                <span className="absolute -bottom-8 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // 3. Donut Chart for User Roles
    const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
        const total = data.reduce((acc, curr) => acc + curr.value, 0);
        let currentAngle = 0;
        const radius = 80;
        const circumference = 2 * Math.PI * radius;

        return (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 h-full min-h-[250px]">
                <div className="relative w-48 h-48 shrink-0">
                    <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                        {data.map((item, idx) => {
                            const strokeDasharray = `${(item.value / total) * circumference} ${circumference} `;
                            const strokeDashoffset = -currentAngle;
                            currentAngle += (item.value / total) * circumference;

                            return (
                                <circle
                                    key={idx}
                                    cx="100" cy="100" r={radius}
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth="35"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="hover:opacity-90 transition-opacity"
                                />
                            );
                        })}
                    </svg>
                </div>
                <div className="space-y-3">
                    {data.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm font-medium text-gray-700">{item.label} ({item.value})</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AdminNavbar setCurrentView={setCurrentView} currentView={ViewState.ADMIN_PLATFORM_ANALYTICS} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6">

                {/* Top Stats Banner */}
                <div className="w-full bg-gradient-to-r from-[#FF8C66] to-[#FFB399] rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4 text-white shadow-lg shadow-orange-200/50 mb-12">
                    <div className="flex items-center gap-4 min-w-[200px] flex-1">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                            <Flame size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="text-sm font-medium opacity-90 text-white/90">Platform Users</div>
                            <div className="text-2xl font-bold">2000</div>
                        </div>
                    </div>
                    <div className="w-px h-12 bg-white/20 hidden md:block"></div>
                    <div className="flex items-center gap-4 min-w-[200px] flex-1">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                            <Slice size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="text-sm font-medium opacity-90 text-white/90">Active Courses</div>
                            <div className="text-2xl font-bold">100</div>
                        </div>
                    </div>
                    <div className="w-px h-12 bg-white/20 hidden md:block"></div>
                    <div className="flex items-center gap-4 min-w-[200px] flex-1">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                            <Fish size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="text-sm font-medium opacity-90 text-white/90">-</div>
                            <div className="text-2xl font-bold">-</div>
                        </div>
                    </div>
                    <div className="w-px h-12 bg-white/20 hidden md:block"></div>
                    <div className="flex items-center gap-4 min-w-[200px] flex-1">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                            <Droplet size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="text-sm font-medium opacity-90 text-white/90">-</div>
                            <div className="text-2xl font-bold">-</div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">

                    {/* Left Column - Spanning 2 Rows - Cuisine Bar Chart */}
                    <div className="lg:row-span-2 glass-panel p-6 rounded-2xl flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-bold text-[#1A1A1A]">Cuisine Categories</h3>
                            <div className="relative w-[120px]">
                                <select
                                    value={cuisineYear}
                                    onChange={(e) => setCuisineYear(e.target.value)}
                                    className="w-full h-10 pl-3 pr-8 bg-white/60 backdrop-blur-md border border-white/60 rounded-lg appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer transition-all shadow-sm"
                                >
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <BarChart data={getCuisineData()} />
                        </div>
                    </div>

                    {/* Right Column Top - Registration Line Chart */}
                    <div className="glass-panel p-6 rounded-2xl flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-bold text-[#1A1A1A]">User Registration Trend</h3>
                            <div className="relative w-[120px]">
                                <select
                                    value={registrationYear}
                                    onChange={(e) => setRegistrationYear(e.target.value)}
                                    className="w-full h-10 pl-3 pr-8 bg-white/60 backdrop-blur-md border border-white/60 rounded-lg appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer transition-all shadow-sm"
                                >
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <LineChart data={getRegistrationData()} />
                        </div>
                    </div>

                    {/* Right Column Bottom - Roles Donut Chart */}
                    <div className="glass-panel p-6 rounded-2xl flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-bold text-[#1A1A1A]">User Role Breakdown</h3>
                            <div className="flex gap-2">
                                <div className="relative w-[100px]">
                                    <select
                                        value={rolesYear}
                                        onChange={(e) => setRolesYear(e.target.value)}
                                        className="w-full h-10 pl-3 pr-8 bg-white/60 backdrop-blur-md border border-white/60 rounded-lg appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer transition-all shadow-sm"
                                    >
                                        <option value="2026">2026</option>
                                        <option value="2025">2025</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                                <div className="relative w-[100px]">
                                    <select
                                        value={rolesMonth}
                                        onChange={(e) => setRolesMonth(e.target.value)}
                                        className="w-full h-10 pl-3 pr-8 bg-white/60 backdrop-blur-md border border-white/60 rounded-lg appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                                    >
                                        <option value="All">All Mo</option>
                                        {MONTH_NAMES.map((m, i) => (
                                            <option key={i} value={m}>{m.substring(0, 3)}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <DonutChart data={getRolesData()} />
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
};


// --- Analytics View ---
const AnalyticsView: React.FC<AuthenticatedViewProps & { myCoursesSubpage?: string; setMyCoursesSubpage?: (subpage: string) => void; currentViewState?: ViewState }> = ({ setCurrentView, selectedRole, myCoursesSubpage, setMyCoursesSubpage, currentViewState = ViewState.ANALYTICS_PERFORMANCE }) => {
    // Data for charts/tables
    // --- Mock Data Generation with Filter Fields ---
    const [allParticipantsData, setAllParticipantsData] = useState([
        { label: 'Course 1', value: 56, cuisine: 'Chinese', date: '2026-03-01' },
        { label: 'Course 2', value: 64, cuisine: 'Chinese', date: '2026-03-05' },
        { label: 'Course 3', value: 76, cuisine: 'Western', date: '2026-03-10' },
        { label: 'Course 4', value: 78, cuisine: 'Western', date: '2026-03-15' },
        { label: 'Course 5', value: 70, cuisine: 'Japanese', date: '2026-03-20' },
        { label: 'Course 6', value: 37, cuisine: 'Japanese', date: '2026-03-25' },
        { label: 'Course 7', value: 37, cuisine: 'Korean', date: '2026-03-30' },
    ]);

    const [allQuizData] = useState(Array.from({ length: 40 }, (_, i) => ({
        id: i,
        learner: `Learner ${i + 1} `,
        date: `2026-03-${(i % 28) + 1} `,
        score: Math.floor(Math.random() * 41) + 60, // 60-100
        status: Math.random() > 0.2 ? 'Passed' : 'Failed',
        cuisine: ['Chinese', 'Western', 'Japanese', 'Korean'][i % 4],
        section: `Section ${(i % 3) + 1} `
    })));

    const [allCommentData] = useState(Array.from({ length: 40 }, (_, i) => ({
        id: i,
        learner: `Learner ${i + 1} `,
        date: `2026-03-${(i % 28) + 1} `,
        comment: 'Keep up the good work! Really enjoyed this course.',
        rating: Math.floor(Math.random() * 2) + 4, // 4-5
        course: `Course ${(i % 7) + 1} `
    })));

    // --- State Management ---
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [appliedDateRange, setAppliedDateRange] = useState<{ start: string, end: string } | null>(null);

    // Quiz Filters
    const [quizCuisineFilter, setQuizCuisineFilter] = useState('All');
    const [quizSectionFilter, setQuizSectionFilter] = useState('All');
    const [quizStatusFilter, setQuizStatusFilter] = useState('All');

    // Comment Filters
    const [commentCourseFilter, setCommentCourseFilter] = useState('All');

    // Calendar UI State
    const [isStartDateOpen, setIsStartDateOpen] = useState(false);
    const [isEndDateOpen, setIsEndDateOpen] = useState(false);

    // Calendar view state
    const [startCalendarView, setStartCalendarView] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth()
    });
    const [endCalendarView, setEndCalendarView] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth()
    });

    // --- Filtering Logic ---
    const displayedParticipantsData = allParticipantsData.filter(item => {
        if (!appliedDateRange) return true;
        return item.date >= appliedDateRange.start && item.date <= appliedDateRange.end;
    });

    const displayedQuizData = allQuizData.filter(item => {
        const matchesCuisine = quizCuisineFilter === 'All' || item.cuisine === quizCuisineFilter;
        const matchesSection = quizSectionFilter === 'All' || item.section === quizSectionFilter;
        const matchesStatus = quizStatusFilter === 'All' || item.status === quizStatusFilter;
        return matchesCuisine && matchesSection && matchesStatus;
    });

    const displayedCommentData = allCommentData.filter(item => {
        return commentCourseFilter === 'All' || item.course === commentCourseFilter;
    });

    const handleApplyDateFilter = () => {
        if (startDate && endDate) {
            setAppliedDateRange({ start: startDate, end: endDate });
        } else {
            setAppliedDateRange(null);
        }
    };

    // Helper functions for calendar
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return "Select date";
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const renderCalendar = (
        selectedDate: string,
        onSelect: (date: string) => void,
        view: { year: number, month: number },
        setView: (view: { year: number, month: number }) => void,
        close: () => void
    ) => {
        const daysInMonth = getDaysInMonth(view.year, view.month);
        const firstDay = getFirstDayOfMonth(view.year, view.month);
        const days = [];

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${view.year}-${(view.month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toDateString() === new Date(view.year, view.month, i).toDateString();

            days.push(
                <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(dateStr); close(); }}
                    className={`h-8 w-8 rounded-full text-sm font-medium flex items-center justify-center transition-all
                        ${isSelected ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-md' : 'text-gray-700 hover:bg-orange-50 hover:text-[#FF8C66]'}
                        ${!isSelected && isToday ? 'border border-[#FF8C66] text-[#FF8C66]' : ''}
`}
                >
                    {i}
                </button>
            );
        }

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

        return (
            <div className="absolute top-full left-0 mt-2 p-4 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-2xl z-50 w-full animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-3 mb-4 px-1">
                    <div className="relative flex-[3]">
                        <select
                            className="w-full appearance-none bg-orange-50/50 hover:bg-white border border-orange-200/50 hover:border-orange-400 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] transition-all cursor-pointer"
                            value={view.month}
                            onChange={(e) => setView({ ...view, month: parseInt(e.target.value) })}
                        >
                            {MONTH_NAMES.map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="relative flex-[2]">
                        <select
                            className="w-full appearance-none bg-orange-50/50 hover:bg-white border border-orange-200/50 hover:border-orange-400 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] transition-all cursor-pointer"
                            value={view.year}
                            onChange={(e) => setView({ ...view, year: parseInt(e.target.value) })}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2 border-b border-gray-100 pb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AuthenticatedNavbar setCurrentView={setCurrentView} selectedRole={selectedRole} currentView={currentViewState} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6">

                {/* Stats Banner */}
                <div className="w-full bg-gradient-to-br from-[#FF8C66] to-[#FFB399] rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-orange-200/50 mb-20 relative overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                                <Flame size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/80 mb-1">Total Views</div>
                                <div className="text-3xl font-bold">24</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                                <Slice size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/80 mb-1">Average Rating</div>
                                <div className="text-3xl font-bold">4.7</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                                <Fish size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/80 mb-1">Students</div>
                                <div className="text-3xl font-bold">8</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                                <Droplet size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/80 mb-1">Watch Time</div>
                                <div className="text-3xl font-bold">12 <span className="text-lg font-normal opacity-80">h</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Participants Section */}
                {currentViewState === ViewState.ANALYTICS_PERFORMANCE && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 mb-24">
                        {/* Left Controls */}
                        <div className="xl:col-span-4 glass-panel rounded-[2.5rem] p-10 h-fit">
                            <h3 className="text-xl font-medium text-[#1A1A1A] mb-8">Start Date</h3>
                            <div className="relative mb-8">
                                <div
                                    className={`w-full h-14 px-4 bg-white/50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isStartDateOpen ? 'border-[#FF8C66] ring-2 ring-[#FF8C66]/20' : 'border-white/60 hover:border-[#FF8C66]'} `}
                                    onClick={(e) => { e.stopPropagation(); setIsStartDateOpen(!isStartDateOpen); setIsEndDateOpen(false); }}
                                >
                                    <span className={`text-base ${startDate ? 'text-[#1A1A1A]' : 'text-gray-500'} `}>
                                        {formatDisplayDate(startDate)}
                                    </span>
                                    <CalendarIcon size={20} className={`text-gray-400 transition-colors ${isStartDateOpen ? 'text-[#FF8C66]' : ''} `} />
                                </div>
                                {isStartDateOpen && renderCalendar(startDate, setStartDate, startCalendarView, setStartCalendarView, () => setIsStartDateOpen(false))}
                                {/* Backdrop to close calendar */}
                                {isStartDateOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsStartDateOpen(false)} />}
                            </div>

                            <h3 className="text-xl font-medium text-[#1A1A1A] mb-8">End Date</h3>
                            <div className="relative mb-8">
                                <div
                                    className={`w-full h-14 px-4 bg-white/50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isEndDateOpen ? 'border-[#FF8C66] ring-2 ring-[#FF8C66]/20' : 'border-white/60 hover:border-[#FF8C66]'} `}
                                    onClick={(e) => { e.stopPropagation(); setIsEndDateOpen(!isEndDateOpen); setIsStartDateOpen(false); }}
                                >
                                    <span className={`text-base ${endDate ? 'text-[#1A1A1A]' : 'text-gray-500'} `}>
                                        {formatDisplayDate(endDate)}
                                    </span>
                                    <CalendarIcon size={20} className={`text-gray-400 transition-colors ${isEndDateOpen ? 'text-[#FF8C66]' : ''} `} />
                                </div>
                                {isEndDateOpen && renderCalendar(endDate, setEndDate, endCalendarView, setEndCalendarView, () => setIsEndDateOpen(false))}
                                {/* Backdrop to close calendar */}
                                {isEndDateOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsEndDateOpen(false)} />}
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => {
                                        setStartDate("");
                                        setEndDate("");
                                        handleApplyDateFilter();
                                    }}
                                    className="flex-1 py-4 rounded-full border border-gray-200 text-gray-500 font-bold text-lg hover:bg-gray-50 transition-all"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleApplyDateFilter}
                                    className="flex-[2] py-4 rounded-full bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white font-bold text-lg hover:shadow-orange-500/30 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Right Chart */}
                        <div className="xl:col-span-8 glass-panel rounded-[2.5rem] p-12">
                            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-12 text-center">Course Participants</h2>

                            <div className="relative h-[400px] w-full pl-10 pb-10">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between text-gray-400 text-sm pl-4 pb-8 pointer-events-none">
                                    {[100, 80, 60, 40, 20, 0].map(val => (
                                        <div key={val} className="w-full border-b border-dashed border-gray-200 h-0 flex items-center relative">
                                            <span className="absolute-left-10 w-8 text-right">{val}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Bars Container */}
                                <div className="absolute inset-0 flex items-end justify-around pl-4 pb-8 pt-6">
                                    {displayedParticipantsData.map((data, idx) => (
                                        <div key={idx} className="h-full flex flex-col justify-end items-center gap-2 group w-14">
                                            <span className="text-lg font-medium text-gray-600 mb-1">{data.value}</span>
                                            <div
                                                className="w-full bg-gradient-to-t from-[#FF8C66] to-[#FFB399] rounded-t-lg transition-all duration-500 hover:opacity-90 relative shadow-lg shadow-orange-500/10"
                                                style={{ height: `${data.value}% `, opacity: 0.9 }}
                                            >
                                                {/* Top highlight effect */}
                                                <div className="absolute top-0 left-0 right-0 h-4 bg-white/20 skew-y-12 origin-top-left rounded-t-sm"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-400 absolute-bottom-8 whitespace-nowrap">{data.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-center items-center gap-2 mt-4 text-sm font-medium text-gray-500">
                                <div className="w-3 h-3 bg-[#FF8C66] rounded-sm"></div>
                                2026
                            </div>
                        </div>
                    </div>

                )}
                {/* Quiz Score Dashboard */}
                {currentViewState === ViewState.ANALYTICS_QUIZ && (
                    <div className="mb-24">
                        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">Quiz Score Dashboard</h2>

                        {/* Filters */}
                        <div className="flex gap-4 mb-8">
                            {/* Cuisine Type Filter */}
                            <div className="relative min-w-[150px]">
                                <select
                                    value={quizCuisineFilter}
                                    onChange={(e) => setQuizCuisineFilter(e.target.value)}
                                    className="w-full h-10 pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                                >
                                    <option value="All" disabled>All Cuisine</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="Western">Western</option>
                                    <option value="Japanese">Japanese</option>
                                    <option value="Korean">Korean</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Section Filter */}
                            <div className="relative min-w-[150px]">
                                <select
                                    value={quizSectionFilter}
                                    onChange={(e) => setQuizSectionFilter(e.target.value)}
                                    className="w-full h-10 pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                                >
                                    <option value="All" disabled>All Sections</option>
                                    <option value="Section 1">Section 1</option>
                                    <option value="Section 2">Section 2</option>
                                    <option value="Section 3">Section 3</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Status Filter */}
                            <div className="relative min-w-[150px]">
                                <select
                                    value={quizStatusFilter}
                                    onChange={(e) => setQuizStatusFilter(e.target.value)}
                                    className="w-full h-10 pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                                >
                                    <option value="All" disabled>All Status</option>
                                    <option value="Passed">Passed</option>
                                    <option value="Failed">Failed</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Reset Button - Only show when filters are active */}
                            {(quizCuisineFilter !== 'All' || quizSectionFilter !== 'All' || quizStatusFilter !== 'All') && (
                                <button
                                    onClick={() => {
                                        setQuizCuisineFilter('All');
                                        setQuizSectionFilter('All');
                                        setQuizStatusFilter('All');
                                    }}
                                    className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                                >
                                    <RotateCcw size={16} />
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-12 px-8 py-5 text-sm font-bold text-[#1A1A1A] border-b border-white/40 bg-white/30">
                                <div className="col-span-3 flex items-center gap-2 cursor-pointer">Learner Name <ChevronDown size={14} /></div>
                                <div className="col-span-3">Date Completed</div>
                                <div className="col-span-4">Scores</div>
                                <div className="col-span-2">Status</div>
                            </div>
                            <div className="divide-y divide-white/40">
                                {displayedQuizData.slice(0, 8).map((item) => (
                                    <div key={item.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-orange-50/30 transition-colors">
                                        <div className="col-span-3 flex items-center gap-4">
                                            <GripVertical size={20} className="text-gray-300" />
                                            <span className="font-medium text-[#1A1A1A]">{item.learner}</span>
                                        </div>
                                        <div className="col-span-3 text-gray-600">{item.date}</div>
                                        <div className="col-span-4 flex items-center gap-4 pr-12">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#FF8C66] to-[#FFB399] rounded-full" style={{ width: `${item.score}% ` }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-[#1A1A1A] min-w-[3rem]">{item.score} %</span>
                                            <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
                                        </div>
                                        <div className="col-span-2 text-gray-600">{item.status}</div>
                                    </div>
                                ))}
                                {displayedQuizData.length === 0 && (
                                    <div className="p-12 text-center text-gray-500">No data found for the selected filters.</div>
                                )}
                            </div>
                            {/* Pagination */}
                            <div className="px-8 py-6 border-t border-white/40 flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">1 - 8 of 40 items</span>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Previous</button>
                                    <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>

                )}
                {/* Comment Dashboard */}
                {currentViewState === ViewState.ANALYTICS_COMMENTS && (
                    <div>
                        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">Comment Dashboard</h2>

                        {/* Filter */}
                        <div className="flex gap-4 mb-8">
                            <div className="relative min-w-[150px]">
                                <select
                                    value={commentCourseFilter}
                                    onChange={(e) => setCommentCourseFilter(e.target.value)}
                                    className="w-full h-10 pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl appearance-none text-gray-700 font-medium hover:border-[#FF8C66] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 cursor-pointer shadow-sm"
                                >
                                    <option value="All" disabled>All Courses</option>
                                    <option value="Course 1">Course 1</option>
                                    <option value="Course 2">Course 2</option>
                                    <option value="Course 3">Course 3</option>
                                    <option value="Course 4">Course 4</option>
                                    <option value="Course 5">Course 5</option>
                                    <option value="Course 6">Course 6</option>
                                    <option value="Course 7">Course 7</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Reset Button - Only show when filter is active */}
                            {commentCourseFilter !== 'All' && (
                                <button
                                    onClick={() => setCommentCourseFilter('All')}
                                    className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                                >
                                    <RotateCcw size={16} />
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-12 px-8 py-5 text-sm font-bold text-[#1A1A1A] border-b border-white/40 bg-white/30">
                                <div className="col-span-3 flex items-center gap-2 cursor-pointer">Learner Name <ChevronDown size={14} /></div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-4">Comment</div>
                                <div className="col-span-3">Rating</div>
                            </div>
                            <div className="divide-y divide-white/40">
                                {displayedCommentData.slice(0, 8).map((item) => (
                                    <div key={item.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-orange-50/30 transition-colors">
                                        <div className="col-span-3 flex items-center gap-4">
                                            <GripVertical size={20} className="text-gray-300" />
                                            <span className="font-medium text-[#1A1A1A]">{item.learner}</span>
                                        </div>
                                        <div className="col-span-2 text-gray-600">{item.date}</div>
                                        <div className="col-span-4 text-gray-600">
                                            {item.comment}
                                        </div>
                                        <div className="col-span-3 flex gap-1">
                                            {Array.from({ length: 5 }).map((_, s) => (
                                                <Star key={s} size={18} fill={s < item.rating ? "#FF8C66" : "none"} className={s < item.rating ? "text-[#FF8C66]" : "text-gray-300"} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {displayedCommentData.length === 0 && (
                                    <div className="p-12 text-center text-gray-500">No comments found for the selected course.</div>
                                )}
                            </div>
                            {/* Pagination */}
                            <div className="px-8 py-6 border-t border-white/40 flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">1 - 8 of 40 items</span>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Previous</button>
                                    <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>

                )}
            </main>
            <Footer />
        </div>
    );
};

// --- Score Modal ---
const ScoreModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-white/60">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#1A1A1A]">Cuisine 1 Tutorial Score</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-[#1A1A1A]">
                        <ChevronDown className="rotate-180" size={24} />
                    </button>
                </div>

                <div className="overflow-auto flex-1 p-8">
                    {/* Header */}
                    <div className="grid grid-cols-12 text-sm font-medium text-gray-500 mb-6 px-4">
                        <div className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-[#1A1A1A]">
                            Sections <ChevronDown size={14} />
                        </div>
                        <div className="col-span-3">Date Completed</div>
                        <div className="col-span-4">Scores</div>
                        <div className="col-span-2 text-right">Status</div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-2">
                        {SECTION_SCORES.map((section) => (
                            <div key={section.id} className="grid grid-cols-12 items-center py-5 px-4 bg-white/50 border border-white/60 rounded-xl hover:shadow-sm transition-shadow">
                                <div className="col-span-3 flex items-center gap-3">
                                    <span className="font-semibold text-[#1A1A1A] pl-2">{section.name}</span>
                                </div>
                                <div className="col-span-3 text-gray-500 font-medium">{section.date}</div>
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#FF8C66] to-[#FFB399] rounded-full" style={{ width: `${section.score}% ` }}></div>
                                    </div>
                                    <span className="text-sm font-bold text-[#1A1A1A] min-w-[3rem]">{section.score} %</span>
                                    <MoreVertical size={16} className="text-gray-400 opacity-0" />
                                </div>
                                <div className="col-span-2 text-right flex items-center justify-end gap-6">
                                    <span className={`text-sm font-medium ${section.status === 'Failed' ? 'text-gray-500' : 'text-gray-500'} mr-4`}>{section.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Footer */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">1 - 8 of 40 items</span>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white">Previous</button>
                        <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Create Course View ---
interface Answer { id: number; text: string; isCorrect: boolean; }
interface Question { id: number; text: string; answers: Answer[]; }
interface Chapter {
    id: number;
    title: string;
    description: string;
    video: string | null;
    questions: Question[];
}

const CreateCourseView: React.FC<AuthenticatedViewProps & {
    editingCourse?: any;
    onCreateCourse: (course: any) => void;
    onUpdateCourse: (course: any) => void;
    myCoursesSubpage?: string;
    setMyCoursesSubpage?: (subpage: string) => void;
    onClearEditing?: () => void;
}> = ({ setCurrentView, selectedRole, editingCourse, onCreateCourse, onUpdateCourse, myCoursesSubpage, setMyCoursesSubpage, onClearEditing }) => {
    const [step, setStep] = useState(1);

    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [duration, setDuration] = useState("");
    const [difficulty, setDifficulty] = useState(4);

    // Upload States (Step 1)
    const [courseImage, setCourseImage] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Chapter States (Step 2)
    const [chapters, setChapters] = useState<Chapter[]>([
        {
            id: 1,
            title: "",
            description: "",
            video: null,
            questions: []
        }
    ]);
    const [activeChapterId, setActiveChapterId] = useState<number>(1);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

    // Active chapter helper
    const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

    const videoInputRef = useRef<HTMLInputElement>(null);

    // Initialize with editingCourse data if available
    useEffect(() => {
        if (editingCourse) {
            setTitle(editingCourse.title || "Existing Course Title");
            setDescription(editingCourse.description || "This is a detailed description of the course...");
            setCuisine(editingCourse.cuisine || "Chinese");
            setDifficulty(editingCourse.difficulty || 3);
            setDuration(editingCourse.duration || "45 mins");
            setCourseImage(editingCourse.image || "course-thumbnail.jpg");

            // Mock chapters if not present
            if (editingCourse.chapters) {
                setChapters(editingCourse.chapters);
                if (editingCourse.chapters.length > 0) setActiveChapterId(editingCourse.chapters[0].id);
            } else {
                setChapters([
                    { id: 101, title: "Chapter 1: Advanced Techniques", description: "Learn advanced wok skills.", video: null, questions: [] },
                    { id: 102, title: "Chapter 2: Plating Standards", description: "How to plate like a pro.", video: null, questions: [] }
                ]);
                setActiveChapterId(101);
            }
        }
    }, [editingCourse]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = event.target.files?.[0];
        if (file) {
            if (type === 'image') {
                setCourseImage(file.name);
            } else if (type === 'video') {
                updateActiveChapter('video', file.name);
            }
        }
    };

    const handleAddChapter = () => {
        const newChapter: Chapter = {
            id: Date.now(),
            title: `Chapter ${chapters.length + 1}`,
            description: "",
            video: null,
            questions: []
        };
        setChapters([...chapters, newChapter]);
        setActiveChapterId(newChapter.id);
    };

    const updateActiveChapter = (field: keyof Chapter, value: any) => {
        setChapters(chapters.map(c => c.id === activeChapterId ? { ...c, [field]: value } : c));
    };

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: Date.now(),
            text: "",
            answers: [
                { id: 1, text: "", isCorrect: false },
                { id: 2, text: "", isCorrect: false },
                { id: 3, text: "", isCorrect: false },
                { id: 4, text: "", isCorrect: false },
            ]
        };
        updateActiveChapter('questions', [...activeChapter.questions, newQuestion]);
        setCurrentQuestionIndex(activeChapter.questions.length); // Navigate to new question
    };

    const updateQuestion = (qId: number, field: keyof Question, value: any) => {
        const updatedQuestions = activeChapter.questions.map(q => q.id === qId ? { ...q, [field]: value } : q);
        updateActiveChapter('questions', updatedQuestions);
    };

    const updateAnswer = (qId: number, aId: number, field: keyof Answer, value: any) => {
        const updatedQuestions = activeChapter.questions.map(q => {
            if (q.id !== qId) return q;
            const updatedAnswers = q.answers.map(a => {
                if (a.id !== aId) return a;
                // Exclusive check logic if setting isCorrect to true could be here, but simple toggle for now
                if (field === 'isCorrect' && value === true) {
                    // If setting correct, maybe uncheck others? For now simple toggle.
                }
                return { ...a, [field]: value };
            });
            // If setting one correct, uncheck others? Let's ensure single choice for this UI
            if (field === 'isCorrect' && value === true) {
                updatedAnswers.forEach(a => {
                    if (a.id !== aId) a.isCorrect = false;
                });
            }
            return { ...q, answers: updatedAnswers };
        });
        updateActiveChapter('questions', updatedQuestions);
    };


    const handleNext = () => {
        setStep(2);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = () => {
        const courseData = {
            id: editingCourse ? editingCourse.id : Date.now(),
            title,
            description,
            cuisine,
            duration,
            difficulty,
            image: courseImage,
            chapters,
            status: editingCourse ? editingCourse.status : 'Active',
            date: editingCourse ? editingCourse.date : new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
            progress: 0 // Default for new courses
        };


        if (editingCourse) {
            onUpdateCourse(courseData);
            if (onClearEditing) onClearEditing(); // 清除编辑状态
        } else {
            onCreateCourse(courseData);
            if (onClearEditing) onClearEditing(); // 清除编辑状态
        }

        setCurrentView(ViewState.DASHBOARD);
    };

    // 在组件卸载时清除编辑状态
    useEffect(() => {
        return () => {
            if (onClearEditing) onClearEditing();
        };
    }, []);


    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AuthenticatedNavbar setCurrentView={setCurrentView} selectedRole={selectedRole} currentView={ViewState.CREATE_COURSE} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} onClearEditing={onClearEditing} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6 pt-24">

                {/* Step 1 Container */}
                {step === 1 && (
                    <div className="glass-panel rounded-[2rem] p-8 md:p-12 relative min-h-[800px]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Left Column - Details */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-base font-medium text-[#1A1A1A]">Course title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Your course Title"
                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] text-[#1A1A1A]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-medium text-[#1A1A1A]">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Course description"
                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] text-[#1A1A1A]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-medium text-[#1A1A1A]">Cuisine Type</label>
                                    <div className="relative">
                                        <select
                                            value={cuisine}
                                            onChange={(e) => setCuisine(e.target.value)}
                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] text-gray-500 appearance-none"
                                        >
                                            <option value="">Cuisine</option>
                                            <option value="Chinese">Chinese</option>
                                            <option value="Western">Western</option>
                                            <option value="Japanese">Japanese</option>
                                            <option value="Korean">Korean</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-medium text-[#1A1A1A]">Difficulty</label>
                                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl w-fit border border-gray-200">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setDifficulty(star)}
                                                className="transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                <Star
                                                    size={24}
                                                    fill={star <= difficulty ? "#FF8C66" : "transparent"}
                                                    className={star <= difficulty ? "text-[#FF8C66]" : "text-gray-300"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-medium text-[#1A1A1A]">Course Duration</label>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        placeholder="Course duration"
                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] text-[#1A1A1A]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-medium text-[#1A1A1A]">Upload Course Image</label>
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        onChange={(e) => handleFileSelect(e, 'image')}
                                        className="hidden"
                                        accept="image/png, image/jpeg"
                                    />
                                    <button
                                        onClick={() => imageInputRef.current?.click()}
                                        className="w-full h-32 md:h-40 bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-[#FF8C66] hover:bg-orange-50/30 transition-all group relative overflow-hidden"
                                    >
                                        {courseImage ? (
                                            <div className="flex flex-col items-center gap-2 text-[#FF8C66] font-medium z-10">
                                                <CheckCircle size={32} />
                                                <span className="truncate max-w-[200px] text-sm">{courseImage}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="text-gray-400 group-hover:text-[#FF8C66] group-hover:scale-110 transition-all" size={32} />
                                            </div>
                                        )}
                                    </button>
                                    <p className="text-xs text-gray-400 pl-1">Supports JPG, PNG (Max 10MB)</p>
                                </div>
                            </div>

                            {/* Right Column illustration */}
                            <div className="hidden lg:flex flex-col items-center justify-center bg-orange-50/30 rounded-3xl border border-orange-100 p-8">
                                <div className="text-center space-y-4">
                                    <div className="w-24 h-24 bg-gradient-to-br from-[#FF8C66] to-[#FF6B4A] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 text-white">
                                        <BookOpen size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#1A1A1A]">Start Creating Your Course</h3>
                                    <p className="text-gray-500 max-w-sm">Fill in the basic details to get started. You'll be able to add chapters, videos, and quizzes in the next step.</p>
                                </div>
                            </div>

                            <div className="lg:col-span-2 flex justify-end mt-12">
                                <button
                                    onClick={handleNext}
                                    className="bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white px-12 py-3 rounded-full font-bold hover:shadow-orange-500/30 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                                >
                                    Next <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Step 2: Content & Quiz (Chapter Centric) */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="glass-panel rounded-[2rem] p-8 md:p-12 relative min-h-[800px]">
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12">
                                {/* Left Column: Chapter List & Details */}
                                <div className="flex flex-col h-full gap-8">

                                    {/* Chapters List */}
                                    <div className="space-y-4">
                                        <label className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                            Chapters <span className="text-sm font-normal text-gray-400 ml-2">({chapters.length})</span>
                                        </label>
                                        <div className="bg-white/50 border border-gray-100 rounded-[2rem] p-4 space-y-3 max-h-[300px] overflow-y-auto">
                                            {chapters.map(chapter => (
                                                <div
                                                    key={chapter.id}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 group ${activeChapterId === chapter.id
                                                        ? 'bg-white border-[#FF8C66] shadow-md shadow-orange-500/10'
                                                        : 'bg-white border-transparent hover:border-orange-200'
                                                        }`}
                                                >
                                                    <div
                                                        onClick={() => setActiveChapterId(chapter.id)}
                                                        className="flex items-center gap-3 flex-1 min-w-0"
                                                    >
                                                        <div className={`w-2 h-2 rounded-full shrink-0 ${activeChapterId === chapter.id ? 'bg-[#FF8C66]' : 'bg-gray-300'}`}></div>
                                                        <span className={`font-bold truncate ${activeChapterId === chapter.id ? 'text-[#1A1A1A]' : 'text-gray-500'}`}>
                                                            {chapter.title || "Untitled Chapter"}
                                                        </span>
                                                    </div>
                                                    {chapters.length > 1 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newChapters = chapters.filter(c => c.id !== chapter.id);
                                                                setChapters(newChapters);
                                                                // If deleting active chapter, switch to first remaining chapter
                                                                if (activeChapterId === chapter.id && newChapters.length > 0) {
                                                                    setActiveChapterId(newChapters[0].id);
                                                                    setCurrentQuestionIndex(0);
                                                                }
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            <button
                                                onClick={handleAddChapter}
                                                className="w-full py-3 rounded-xl border-2 border-dashed border-[#FF8C66]/30 text-[#FF8C66] font-bold hover:bg-orange-50 hover:border-[#FF8C66] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={18} /> Add New Chapter
                                            </button>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* Active Chapter Form */}
                                    <div className="space-y-6 animate-in fade-in duration-300" key={activeChapter.id}>
                                        <div className="space-y-2">
                                            <label className="text-base font-medium text-[#1A1A1A]">Chapter Name</label>
                                            <input
                                                type="text"
                                                value={activeChapter.title}
                                                onChange={(e) => updateActiveChapter('title', e.target.value)}
                                                placeholder="e.g. Chapter 1: Introduction"
                                                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] text-[#1A1A1A]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-base font-medium text-[#1A1A1A]">Chapter Description</label>
                                            <textarea
                                                value={activeChapter.description}
                                                onChange={(e) => updateActiveChapter('description', e.target.value)}
                                                placeholder="Describe what students will learn..."
                                                rows={3}
                                                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] text-[#1A1A1A] resize-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-base font-medium text-[#1A1A1A]">Upload Video</label>
                                            <input
                                                type="file"
                                                ref={videoInputRef}
                                                onChange={(e) => handleFileSelect(e, 'video')}
                                                className="hidden"
                                                accept="video/mp4"
                                            />
                                            <div
                                                onClick={() => videoInputRef.current?.click()}
                                                className="w-full aspect-video bg-white rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#FF8C66] transition-colors cursor-pointer group relative overflow-hidden"
                                            >
                                                {activeChapter.video ? (
                                                    <div className="flex flex-col items-center gap-3 text-[#FF8C66] font-medium z-10">
                                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#FF8C66] animate-bounce">
                                                            <Video size={24} />
                                                        </div>
                                                        <span className="truncate max-w-[300px] px-4 py-1 bg-white/80 rounded-full text-xs">{activeChapter.video}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload size={32} className="text-[#1A1A1A] group-hover:scale-110 transition-transform mb-2" strokeWidth={1.5} />
                                                        <span className="text-gray-400 font-medium text-sm">Click to upload video</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Divider */}
                                <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>

                                {/* Right Column: Quiz Creator (Scoped to Active Chapter) */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xl font-bold text-[#1A1A1A]">Create Quiz</label>
                                        <div className="text-sm text-gray-400">For: {activeChapter.title || "Untitled Chapter"}</div>
                                    </div>

                                    {/* Mock Dropdown to match requested UI (even though it's auto-selected) */}
                                    <div className="relative w-full mb-4 opacity-50 pointer-events-none">
                                        <select disabled className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm appearance-none">
                                            <option>{activeChapter.title || "Select chapter..."}</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>

                                    <div className="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-6 lg:p-8 shadow-sm min-h-[500px] flex flex-col">
                                        {activeChapter.questions.length === 0 && (
                                            <div className="text-center py-16 text-gray-400 flex-1 flex flex-col items-center justify-center">
                                                <HelpCircle className="mx-auto mb-2 opacity-50" size={32} />
                                                <p>No questions added for this chapter yet.</p>
                                            </div>
                                        )}

                                        {activeChapter.questions.length > 0 && (() => {
                                            const q = activeChapter.questions[currentQuestionIndex];
                                            if (!q) return null;
                                            return (
                                                <div className="flex-1 flex flex-col">
                                                    {/* Question Navigation Header */}
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                                                disabled={currentQuestionIndex === 0}
                                                                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                <ChevronLeft size={18} />
                                                            </button>
                                                            <span className="text-sm font-medium text-gray-600">
                                                                Question {currentQuestionIndex + 1} of {activeChapter.questions.length}
                                                            </span>
                                                            <button
                                                                onClick={() => setCurrentQuestionIndex(Math.min(activeChapter.questions.length - 1, currentQuestionIndex + 1))}
                                                                disabled={currentQuestionIndex === activeChapter.questions.length - 1}
                                                                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                <ChevronRight size={18} />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const newQs = activeChapter.questions.filter(quest => quest.id !== q.id);
                                                                updateActiveChapter('questions', newQs);
                                                                setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                                                            }}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Question Input */}
                                                    <input
                                                        type="text"
                                                        value={q.text}
                                                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                                        placeholder="Type your question here..."
                                                        className="w-full p-4 mb-6 bg-white border border-gray-200 rounded-xl text-[#1A1A1A] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] shadow-sm"
                                                    />

                                                    {/* Answers Label */}
                                                    <div className="mb-3">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Answers</label>
                                                    </div>

                                                    {/* Answers List */}
                                                    <div className="space-y-3 flex-1">
                                                        {q.answers.map((ans, aIndex) => (
                                                            <div key={ans.id} className="flex items-center gap-3 group">
                                                                <button
                                                                    onClick={() => updateAnswer(q.id, ans.id, 'isCorrect', !ans.isCorrect)}
                                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${ans.isCorrect ? 'bg-[#FF8C66] border-[#FF8C66] text-white' : 'bg-white border-gray-200 text-transparent hover:border-[#FF8C66]'} `}
                                                                >
                                                                    <Check size={16} strokeWidth={4} />
                                                                </button>
                                                                <div className="flex-1">
                                                                    <input
                                                                        type="text"
                                                                        value={ans.text}
                                                                        onChange={(e) => updateAnswer(q.id, ans.id, 'text', e.target.value)}
                                                                        placeholder={`Answer option ${aIndex + 1}`}
                                                                        className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] outline-none text-gray-600 font-medium text-sm transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Add Question Button */}
                                        <div className="mt-auto pt-6 border-t border-orange-200/50">
                                            <button
                                                onClick={handleAddQuestion}
                                                className="w-full px-5 py-3 rounded-full border-2 border-dashed border-[#FF8C66]/50 text-[#FF8C66] text-sm font-bold hover:bg-white hover:border-[#FF8C66] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} /> Add Question
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons (Outside Card) */}
                        <div className="flex items-center justify-between mt-8 px-4">
                            <button
                                onClick={handleBack}
                                className="px-8 py-3 rounded-full border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 bg-white"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-12 py-3 rounded-full bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white font-bold hover:shadow-orange-500/30 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                            >
                                <CheckCircle size={20} /> Submit Course
                            </button>
                        </div>
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
};


// --- User Profile View ---
const UserProfileView: React.FC<AuthenticatedViewProps & { myCoursesSubpage?: string; setMyCoursesSubpage?: (subpage: string) => void }> = ({ setCurrentView, selectedRole, myCoursesSubpage, setMyCoursesSubpage }) => {
    // Hardcoded data based on image
    // State for profile data (editable)
    const [profileData, setProfileData] = useState({
        name: "Alexa Rawles",
        email: "alexarawles@gmail.com",
        role: selectedRole === UserRole.SHARER ? "Sharer" : selectedRole === UserRole.ADMIN ? "Admin" : "Learner",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
        birthDate: "24th June, 1998",
        country: "United States"
    });

    // Alias to keep existing references working
    const user = profileData;

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'pending'>('idle');
    const [isEditing, setIsEditing] = useState(false);

    // Picker states
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // If ADMIN render the specific requested layout
    if (selectedRole === UserRole.ADMIN) {
        return (
            <div className="min-h-screen flex flex-col font-sans">
                <AdminNavbar setCurrentView={setCurrentView} currentView={ViewState.USER_PROFILE} />

                <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 md:px-12 pb-20 mt-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#1A1A1A]">Welcome, {user.role}</h1>
                        <p className="text-gray-400 mt-1">Fri, 30 Jan 2026</p>
                    </div>

                    {/* Banner */}
                    <div className="w-full h-32 md:h-48 bg-gradient-to-r from-gray-800 to-black rounded-2xl mb-24 md:mb-20 relative shadow-lg">
                        {/* Avatar overlapping */}
                        <div className="absolute left-6 md:left-10 -bottom-12 md:-bottom-16 translate-y-6 md:translate-y-4">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Profile Header Info */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 relative z-10 pl-2">
                        <div className="md:ml-40 mt-[-3rem] md:mt-0">
                            <h2 className="text-2xl font-bold text-[#1A1A1A]">{user.name}</h2>
                            <p className="text-gray-500">{user.email}</p>
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-10 py-3 rounded-full font-medium transition-all shadow-md w-full md:w-auto text-center self-end md:self-auto ${isEditing ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' : 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white hover:shadow-orange-500/30 shadow-orange-500/20'}`}
                        >
                            {isEditing ? 'Save Changes' : 'Edit'}
                        </button>
                    </div>

                    {/* Form Field */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2">
                            <label className="text-[#1A1A1A] font-medium">Full Name</label>
                            <input
                                disabled={!isEditing}
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleInputChange}
                                className="w-full p-4 glass-panel rounded-xl focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] focus:outline-none text-gray-700 placeholder:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[#1A1A1A] font-medium">Email Address</label>
                            <input disabled={!isEditing} type="email" defaultValue={user.email} className="w-full p-4 glass-panel rounded-xl focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] focus:outline-none text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" />
                        </div>
                    </div>

                    {/* Birth Date and Country */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2 relative">
                            <label className="text-[#1A1A1A] font-medium">Birth Date</label>
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        className="w-full p-4 glass-panel rounded-xl flex items-center text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    >
                                        <CalendarIcon size={20} className="text-gray-400 mr-3 shrink-0" />
                                        <span>{profileData.birthDate || "YYYY-MM-DD"}</span>
                                    </button>
                                    {isCalendarOpen && (
                                        <Calendar
                                            selectedDate={profileData.birthDate}
                                            onSelect={(date) => {
                                                setProfileData(prev => ({ ...prev, birthDate: date }));
                                                setIsCalendarOpen(false);
                                            }}
                                            onClose={() => setIsCalendarOpen(false)}
                                        />
                                    )}
                                </>
                            ) : (
                                <input disabled type="text" value={profileData.birthDate} className="w-full p-4 glass-panel rounded-xl text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" />
                            )}
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-[#1A1A1A] font-medium">Country</label>
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        className="w-full p-4 glass-panel rounded-xl flex items-center text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                                        onClick={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)}
                                    >
                                        <span className="block truncate mr-2 flex-1">{profileData.country || "Select Country"}</span>
                                        <ChevronDown size={20} className="text-gray-400 shrink-0" />
                                    </button>
                                    {isCountrySelectorOpen && (
                                        <CountrySelector
                                            selectedCountry={profileData.country}
                                            onSelect={(country) => {
                                                setProfileData(prev => ({ ...prev, country: country }));
                                                setIsCountrySelectorOpen(false);
                                            }}
                                            onClose={() => setIsCountrySelectorOpen(false)}
                                        />
                                    )}
                                </>
                            ) : (
                                <input disabled type="text" value={profileData.country} className="w-full p-4 glass-panel rounded-xl text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <label className="text-[#1A1A1A] font-medium">Description</label>
                        <textarea
                            disabled={!isEditing}
                            className="w-full h-40 p-4 glass-panel rounded-xl focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] focus:outline-none text-gray-700 resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                        ></textarea>
                    </div>

                    <div className="flex justify-end mt-12">
                        <button
                            onClick={() => setCurrentView(ViewState.LANDING)}
                            className="flex items-center gap-2 px-8 py-3 rounded-full border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // If SHARER render the specific requested layout
    if (selectedRole === UserRole.SHARER) {
        return (
            <div className="min-h-screen flex flex-col font-sans">
                <AuthenticatedNavbar setCurrentView={setCurrentView} selectedRole={selectedRole} currentView={ViewState.USER_PROFILE} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} />

                <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 md:px-12 pb-20 mt-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#1A1A1A]">Welcome, {user.role}</h1>
                        <p className="text-gray-400 mt-1">Fri, 30 Jan 2026</p>
                    </div>

                    {/* Banner */}
                    <div className="w-full h-32 md:h-48 bg-gradient-to-r from-gray-800 to-black rounded-2xl mb-24 md:mb-20 relative shadow-lg">
                        {/* Avatar overlapping */}
                        <div className="absolute left-6 md:left-10 -bottom-12 md:-bottom-16 translate-y-6 md:translate-y-4">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Profile Header Info */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 relative z-10 pl-2">
                        <div className="md:ml-40 mt-[-3rem] md:mt-0">
                            <h2 className="text-2xl font-bold text-[#1A1A1A]">{user.name}</h2>
                            <p className="text-gray-500">{user.email}</p>
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-10 py-3 rounded-full font-medium transition-all shadow-md w-full md:w-auto text-center self-end md:self-auto ${isEditing ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' : 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white hover:shadow-orange-500/30 shadow-orange-500/20'}`}
                        >
                            {isEditing ? 'Save Changes' : 'Edit'}
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2">
                            <label className="text-[#1A1A1A] font-medium">Full Name</label>
                            <input
                                disabled={!isEditing}
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleInputChange}
                                className="w-full p-4 glass-panel rounded-xl focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] focus:outline-none text-gray-700 placeholder:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[#1A1A1A] font-medium">Email Address</label>
                            <input disabled={!isEditing} type="email" defaultValue={user.email} className="w-full p-4 glass-panel rounded-xl focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] focus:outline-none text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" />
                        </div>
                    </div>

                    {/* Birth Date and Country */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2 relative">
                            <label className="text-[#1A1A1A] font-medium">Birth Date</label>
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        className="w-full p-4 glass-panel rounded-xl flex items-center text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    >
                                        <CalendarIcon size={20} className="text-gray-400 mr-3 shrink-0" />
                                        <span>{profileData.birthDate || "YYYY-MM-DD"}</span>
                                    </button>
                                    {isCalendarOpen && (
                                        <Calendar
                                            selectedDate={profileData.birthDate}
                                            onSelect={(date) => {
                                                setProfileData(prev => ({ ...prev, birthDate: date }));
                                                setIsCalendarOpen(false);
                                            }}
                                            onClose={() => setIsCalendarOpen(false)}
                                        />
                                    )}
                                </>
                            ) : (
                                <input disabled type="text" value={profileData.birthDate} className="w-full p-4 glass-panel rounded-xl text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" />
                            )}
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-[#1A1A1A] font-medium">Country</label>
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        className="w-full p-4 glass-panel rounded-xl flex items-center text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                                        onClick={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)}
                                    >
                                        <span className="block truncate mr-2 flex-1">{profileData.country || "Select Country"}</span>
                                        <ChevronDown size={20} className="text-gray-400 shrink-0" />
                                    </button>
                                    {isCountrySelectorOpen && (
                                        <CountrySelector
                                            selectedCountry={profileData.country}
                                            onSelect={(country) => {
                                                setProfileData(prev => ({ ...prev, country: country }));
                                                setIsCountrySelectorOpen(false);
                                            }}
                                            onClose={() => setIsCountrySelectorOpen(false)}
                                        />
                                    )}
                                </>
                            ) : (
                                <input disabled type="text" value={profileData.country} className="w-full p-4 glass-panel rounded-xl text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <label className="text-[#1A1A1A] font-medium">Description</label>
                        <textarea
                            disabled={!isEditing}
                            className="w-full h-40 p-4 glass-panel rounded-xl focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] focus:outline-none text-gray-700 resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                        ></textarea>
                    </div>

                    <div className="flex justify-end mt-12">
                        <button
                            onClick={() => setCurrentView(ViewState.LANDING)}
                            className="flex items-center gap-2 px-8 py-3 rounded-full border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>

                </main>
                <Footer />
            </div>
        );
    }

    // Default LEARNER Layout
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AuthenticatedNavbar setCurrentView={setCurrentView} selectedRole={selectedRole} currentView={ViewState.USER_PROFILE} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} />

            <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 md:px-12 pb-20 mt-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">Welcome, {user.role}</h1>
                    <p className="text-gray-400 mt-1">Fri, 30 Jan 2026</p>
                </div>

                {/* Banner */}
                <div className="w-full h-32 md:h-48 bg-gradient-to-r from-gray-800 to-black rounded-2xl mb-24 md:mb-20 relative shadow-lg">
                    {/* Avatar overlapping */}
                    <div className="absolute left-6 md:left-10-bottom-12 md:-bottom-16 translate-y-6 md:translate-y-4">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Profile Header Info */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 relative z-10 pl-2">
                    <div className="md:ml-40 mt-[-3rem] md:mt-0">
                        <h2 className="text-2xl font-bold text-[#1A1A1A]">{user.name}</h2>
                        <p className="text-gray-500">{user.email}</p>
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-10 py-3 rounded-full font-medium transition-all shadow-md w-full md:w-auto text-center self-end md:self-auto ${isEditing ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' : 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white hover:shadow-orange-500/30 shadow-orange-500/20'}`}
                    >
                        {isEditing ? 'Save Changes' : 'Edit'}
                    </button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                        <label className="text-[#1A1A1A] font-medium">Full Name</label>
                        <input
                            disabled={!isEditing}
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            className="w-full p-4 glass-panel rounded-xl focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] focus:outline-none text-gray-700 placeholder:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[#1A1A1A] font-medium">Email Address</label>
                        <input disabled={!isEditing} type="email" defaultValue={user.email} className="w-full p-4 glass-panel rounded-xl focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] focus:outline-none text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" />
                    </div>
                </div>

                {/* Updated Birth Date and Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2 relative">
                        <label className="text-[#1A1A1A] font-medium">Birth Date</label>
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="w-full p-4 glass-panel rounded-xl flex items-center text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                >
                                    <CalendarIcon size={20} className="text-gray-400 mr-3 shrink-0" />
                                    <span>{profileData.birthDate || "YYYY-MM-DD"}</span>
                                </button>
                                {isCalendarOpen && (
                                    <Calendar
                                        selectedDate={profileData.birthDate}
                                        onSelect={(date) => {
                                            setProfileData(prev => ({ ...prev, birthDate: date }));
                                            setIsCalendarOpen(false);
                                        }}
                                        onClose={() => setIsCalendarOpen(false)}
                                    />
                                )}
                            </>
                        ) : (
                            <input disabled type="text" value={profileData.birthDate} className="w-full p-4 glass-panel rounded-xl text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" />
                        )}
                    </div>
                    <div className="space-y-2 relative">
                        <label className="text-[#1A1A1A] font-medium">Country</label>
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="w-full p-4 glass-panel rounded-xl flex items-center text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                                    onClick={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)}
                                >
                                    <span className="block truncate mr-2 flex-1">{profileData.country || "Select Country"}</span>
                                    <ChevronDown size={20} className="text-gray-400 shrink-0" />
                                </button>
                                {isCountrySelectorOpen && (
                                    <CountrySelector
                                        selectedCountry={profileData.country}
                                        onSelect={(country) => {
                                            setProfileData(prev => ({ ...prev, country: country }));
                                            setIsCountrySelectorOpen(false);
                                        }}
                                        onClose={() => setIsCountrySelectorOpen(false)}
                                    />
                                )}
                            </>
                        ) : (
                            <input disabled type="text" value={profileData.country} className="w-full p-4 glass-panel rounded-xl text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" />
                        )}
                    </div>
                </div>

                {/* Upgrade Section */}
                <div className="glass-panel rounded-3xl p-8 md:p-10 shadow-sm">
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Upgrade to Sharer</h3>
                    <p className="text-gray-500 mb-6">Requirements to become a Professional Sharer:</p>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#FF8C66] flex items-center justify-center text-white shrink-0">
                                <Check size={14} strokeWidth={4} />
                            </div>
                            <span className="text-gray-600 font-medium">Complete at least 10 courses</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0"></div>
                            <span className="text-gray-600 font-medium">Maintain 80% + quiz average</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0"></div>
                            <span className="text-gray-600 font-medium">Active for 30+ days</span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsUpgradeModalOpen(true)}
                            disabled={upgradeStatus === 'pending'}
                            className={`px-8 py-3 rounded-full font-bold transition-all border 
                                ${upgradeStatus === 'pending'
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white border-transparent shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5'
                                } `}
                        >
                            {upgradeStatus === 'pending' ? 'Pending Approval' : 'Request Upgrade'}
                        </button>
                    </div>
                </div>

                {isUpgradeModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)}></div>
                        <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Become a Pro Sharer</h3>
                            <p className="text-gray-500 mb-8 text-sm">Congratulations! You have met all the requirements to become a Sharer.</p>

                            <div className="bg-green-50 rounded-xl p-6 mb-8 flex items-start gap-4 border border-green-100">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-800 text-sm mb-1">All Systems Go!</h4>
                                    <p className="text-sm text-green-700 leading-relaxed">
                                        Your profile has been automatically verified based on your activity.
                                        Click submit to finalize your upgrade application.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsUpgradeModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setIsUpgradeModalOpen(false);
                                        setUpgradeStatus('pending');
                                        alert("Application Submitted Successfully!");
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] font-bold text-white hover:shadow-orange-500/30 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Submit Application
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end mt-12">
                    <button
                        onClick={() => setCurrentView(ViewState.LANDING)}
                        className="flex items-center gap-2 px-8 py-3 rounded-full border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// --- Course Detail View ---
interface CourseDetailProps extends AuthenticatedViewProps {
    selectedCourse: any;
    comments: typeof INITIAL_COMMENTS;
    onAddComment: (comment: any) => void;
    isChapterUnlocked?: (chapterId: number, courseId: number) => boolean;
    handleCompleteChapter?: (chapterId: number, courseId: number) => void;
    chapterProgress?: any[];
}

const CourseDetailView: React.FC<CourseDetailProps & { myCoursesSubpage?: string; setMyCoursesSubpage?: (subpage: string) => void }> = ({
    setCurrentView,
    selectedRole,
    selectedCourse,
    comments,
    onAddComment,
    myCoursesSubpage,
    setMyCoursesSubpage,
    isChapterUnlocked,
    handleCompleteChapter,
    chapterProgress
}) => {
    const [commentText, setCommentText] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [videoCompleted, setVideoCompleted] = useState(false);

    // Quiz states
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(10).fill(null));

    // Mock quiz questions
    const quizQuestions = [
        {
            question: "Who is making the Web standards?",
            options: ["The World Wide Web Consortium", "Microsoft", "Mozilla", "Google"],
            correctAnswer: 0
        },
        {
            question: "What does HTML stand for?",
            options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyperlinking Text Marking Language"],
            correctAnswer: 0
        },
        {
            question: "Which HTML tag is used for a paragraph?",
            options: ["<paragraph>", "<p>", "<pg>", "<para>"],
            correctAnswer: 1
        },
        {
            question: "What is CSS used for?",
            options: ["Styling web pages", "Creating databases", "Programming logic", "Network security"],
            correctAnswer: 0
        },
        {
            question: "Which symbol is used for IDs in CSS?",
            options: [".", "#", "@", "*"],
            correctAnswer: 1
        },
        {
            question: "What does DOM stand for?",
            options: ["Document Object Model", "Data Object Management", "Digital Object Method", "Document Oriented Markup"],
            correctAnswer: 0
        },
        {
            question: "Which JavaScript method is used to select an element by ID?",
            options: ["getElement()", "getElementById()", "selectElement()", "findById()"],
            correctAnswer: 1
        },
        {
            question: "What is the correct way to write a JavaScript array?",
            options: ["var colors = 'red', 'green', 'blue'", "var colors = (1:'red', 2:'green', 3:'blue')", "var colors = ['red', 'green', 'blue']", "var colors = {1='red', 2='green', 3='blue'}"],
            correctAnswer: 2
        },
        {
            question: "How do you create a function in JavaScript?",
            options: ["function myFunction()", "function:myFunction()", "function = myFunction()", "create function myFunction()"],
            correctAnswer: 0
        },
        {
            question: "Which operator is used to assign a value to a variable?",
            options: ["*", "=", "-", "x"],
            correctAnswer: 1
        }
    ];

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestionIndex];

    const handleSendComment = () => {
        if (!commentText.trim()) return;

        const newComment = {
            id: Date.now(),
            user: 'You',
            text: commentText,
            rating: userRating || 5 // Default rating if user hasn't rated yet
        };

        onAddComment(newComment);
        setCommentText('');
    };

    const handleSubmitReport = () => {
        if (!reportReason.trim()) {
            alert('请填写举报原因');
            return;
        }
        alert(`举报已提交\n原因: ${reportReason}`);
        setIsReportModalOpen(false);
        setReportReason('');
    };

    // Quiz handlers
    const handleAnswerSelect = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = answerIndex;
        setUserAnswers(newAnswers);
        setShowResult(false);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(userAnswers[currentQuestionIndex + 1]);
            setShowResult(false);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedAnswer(userAnswers[currentQuestionIndex - 1]);
            setShowResult(false);
        }
    };

    const handleShowResult = () => {
        setShowResult(!showResult);
    };

    // 获取当前课程的章节
    const courseChapters = INITIAL_CHAPTERS
        .filter(ch => ch.course_id === selectedCourse?.id)
        .sort((a, b) => a.chapter_order - b.chapter_order);

    const [currentStep, setCurrentStep] = useState(1);

    // 获取当前章节
    const currentChapter = courseChapters[currentStep - 1] || courseChapters[0];

    // 视频引用
    const videoRef = useRef<HTMLVideoElement>(null);

    // 视频播放完成处理
    const handleVideoEnded = () => {
        if (currentChapter && handleCompleteChapter) {
            console.log('Video completed! Unlocking next chapter...');
            setVideoCompleted(true);
            handleCompleteChapter(currentChapter.chapter_id, selectedCourse?.id);
        }
    };

    // 章节切换时重置状态
    useEffect(() => {
        setVideoCompleted(false);
        // 重置视频到开始位置
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.load(); // 重新加载视频
        }
    }, [currentStep]);

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AuthenticatedNavbar setCurrentView={setCurrentView} selectedRole={selectedRole} currentView={ViewState.COURSE_DETAIL} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6">

                {/* Stepper - 动态章节进度条 */}
                <div className="flex justify-center items-center gap-2 md:gap-4 mb-10">
                    {courseChapters.map((chapter, index) => {
                        const step = index + 1;
                        const isUnlocked = isChapterUnlocked ? isChapterUnlocked(chapter.chapter_id, selectedCourse?.id) : false;
                        const isActive = step === currentStep;
                        const chapterProgressItem = chapterProgress?.find(p => p.chapter_id === chapter.chapter_id);
                        const isCompleted = chapterProgressItem?.is_completed || false;

                        return (
                            <React.Fragment key={chapter.chapter_id}>
                                {index > 0 && (
                                    <div className={`w-12 md:w-24 h-0.5 transition-colors duration-300 ${isCompleted || isActive ? 'bg-[#FF8C66]' : 'bg-gray-200'}`}></div>
                                )}
                                <button
                                    onClick={() => isUnlocked && setCurrentStep(step)}
                                    disabled={!isUnlocked}
                                    title={chapter.title}
                                    className={`
w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all border-2 shrink-0
                                        ${isActive
                                            ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] border-[#FF8C66] text-white shadow-lg shadow-orange-500/30 scale-110 z-10'
                                            : isUnlocked
                                                ? isCompleted
                                                    ? 'bg-[#FF8C66] border-[#FF8C66] text-white hover:opacity-90'
                                                    : 'bg-white border-[#FF8C66] text-[#FF8C66] hover:bg-orange-50'
                                                : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                                        }
`}
                                >
                                    {isCompleted ? <Check size={20} strokeWidth={3} /> : isUnlocked ? step : '🔒'}
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Video & Comments */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Video Player */}
                        <div className="w-full aspect-video bg-black rounded-[2rem] relative overflow-hidden group shadow-xl">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                controls
                                controlsList="nodownload"
                                onEnded={handleVideoEnded}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User size={24} className="text-gray-500" />
                            </div>
                            <button
                                onClick={() => setIsFollowing(!isFollowing)}
                                className={`flex-1 h-12 rounded-full font-bold transition-all ${isFollowing
                                    ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white hover:shadow-orange-500/30 shadow-lg shadow-orange-500/20'
                                    : 'border border-gray-500 text-gray-600 hover:bg-gray-50'
                                    } `}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="h-12 px-6 rounded-full border border-red-400 text-red-600 font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                            >
                                <Flag size={18} />
                                Report
                            </button>
                        </div>

                        {/* Rating & Comment Input */}
                        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                                <span>Please rate</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setUserRating(s)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                size={20}
                                                fill={s <= userRating ? "#FF8C66" : "none"}
                                                className={s <= userRating ? "text-[#FF8C66]" : "text-gray-300"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                placeholder="Leave a comment"
                                className="w-full p-4 pr-16 bg-white/60 border border-white/60 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] transition-all"
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={!commentText.trim()}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${commentText.trim() ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white hover:shadow-orange-500/30 shadow-md shadow-orange-500/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} `}
                            >
                                <Send size={20} />
                            </button>
                        </div>

                        <div className="h-px bg-gray-200 w-full my-8"></div>

                        {/* Comments List */}
                        <div className="space-y-8">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                        <User size={20} className="text-gray-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-[#1A1A1A]">{comment.user}</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star
                                                        key={s}
                                                        size={14}
                                                        fill={s <= comment.rating ? "#FF8C66" : "none"}
                                                        className={s <= comment.rating ? "text-[#FF8C66]" : "text-gray-300"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Info & Quiz */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Info Card */}
                        <div className="glass-panel rounded-[2rem] p-8 space-y-8">
                            <div>
                                <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">Chapter</h3>
                                <div className="text-4xl font-bold text-[#1A1A1A]">{currentStep.toString().padStart(2, '0')}</div>
                            </div>

                            <div>
                                <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">{currentChapter?.title || `Chapter ${currentStep}`}</h4>
                                <div className="h-px bg-gray-200 w-full"></div>
                            </div>

                            <div className="space-y-3 text-[#1A1A1A] text-sm leading-relaxed">
                                <p>{currentChapter?.description || 'This chapter covers the fundamentals and key techniques. Follow along with the video to learn step by step.'}</p>
                            </div>

                            {/* 视频完成提示 */}
                            {videoCompleted && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-700 text-sm font-medium">✅ Chapter completed! Next chapter unlocked.</p>
                                </div>
                            )}
                        </div>

                        {/* Quiz Card */}
                        <div className="glass-panel rounded-[2rem] p-8">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-800 font-bold text-sm">Question: {currentQuestionIndex + 1}/{quizQuestions.length}</span>
                                <span className="text-red-500 font-bold text-sm cursor-pointer hover:underline">Quit</span>
                            </div>

                            <h4 className="text-[#1A1A1A] font-medium mb-6">{currentQuestion.question}</h4>

                            <div className="space-y-3 mb-8">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = currentAnswer === index;
                                    const isCorrect = index === currentQuestion.correctAnswer;
                                    const showCorrectAnswer = showResult && isCorrect;
                                    const showWrongAnswer = showResult && isSelected && !isCorrect;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(index)}
                                            className={`w-full p-4 rounded-lg font-medium text-left shadow-sm transition-all ${showCorrectAnswer
                                                ? 'bg-green-500 text-white border-2 border-green-600'
                                                : showWrongAnswer
                                                    ? 'bg-red-500 text-white border-2 border-red-600'
                                                    : isSelected
                                                        ? 'bg-[#FF8C66] text-white'
                                                        : 'bg-white/50 border border-white/60 text-[#1A1A1A] hover:bg-white/80'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mb-8">
                                <button
                                    onClick={handleShowResult}
                                    className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1 hover:text-gray-600"
                                >
                                    {showResult ? 'Hide Result' : 'See Result'} <ChevronDown size={14} className={showResult ? 'rotate-180' : ''} />
                                </button>
                                {showResult && (
                                    <div className="mt-4 p-4 bg-white/60 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700">
                                            {currentAnswer === currentQuestion.correctAnswer
                                                ? '✅ 正确！'
                                                : currentAnswer !== null
                                                    ? `❌ 错误。正确答案是：${currentQuestion.options[currentQuestion.correctAnswer]}`
                                                    : '请先选择一个答案'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handlePreviousQuestion}
                                    disabled={currentQuestionIndex === 0}
                                    className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all ${currentQuestionIndex === 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-white/50 border border-white/60 text-[#1A1A1A] hover:bg-white/80'
                                        }`}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={currentQuestionIndex === quizQuestions.length - 1}
                                    className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all ${currentQuestionIndex === quizQuestions.length - 1
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-white/50 border border-white/60 text-[#1A1A1A] hover:bg-white/80'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />

            {/* Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Flag size={20} className="text-red-500" />
                                举报内容
                            </h3>
                            <button
                                onClick={() => {
                                    setIsReportModalOpen(false);
                                    setReportReason('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">请说明举报原因</label>
                            <textarea
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="请详细描述举报原因..."
                                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 resize-none text-sm"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setIsReportModalOpen(false);
                                    setReportReason('');
                                }}
                                className="flex-1 h-11 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSubmitReport}
                                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all"
                            >
                                确定举报
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- My Courses View ---
// --- My Courses View ---
interface MyCoursesProps extends AuthenticatedViewProps {
    enrolledCourses: typeof INITIAL_ENROLLED_COURSES;
    createdCourses: typeof INITIAL_CREATED_COURSES;
    onUnenroll: (courseId: number) => void;
    onDeleteCourse: (courseId: number) => void;
    onRecoverCourse: (courseId: number) => void;
    setEditingCourse: (course: any) => void;
    myCoursesSubpage?: string;
    setMyCoursesSubpage?: (subpage: string) => void;
}

const MyCoursesView: React.FC<MyCoursesProps> = ({
    setCurrentView,
    selectedRole,
    setEditingCourse,
    enrolledCourses,
    createdCourses,
    onUnenroll,
    onDeleteCourse,
    onRecoverCourse,
    myCoursesSubpage = 'created',
    setMyCoursesSubpage
}) => {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [unenrollConfirmModal, setUnenrollConfirmModal] = useState<{ isOpen: boolean; courseId: number | null; courseName: string }>({ isOpen: false, courseId: null, courseName: '' });
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; courseId: number | null; courseName: string; isRecover: boolean }>({ isOpen: false, courseId: null, courseName: '', isRecover: false });

    // 处理退课逻辑
    // 处理退课逻辑
    const handleUnenrollClick = (courseId: number) => {
        onUnenroll(courseId);
        setUnenrollConfirmModal({ isOpen: false, courseId: null, courseName: '' });
        setOpenMenuId(null);
    };

    // 处理删除课程逻辑
    // 处理删除课程逻辑
    const handleDeleteClick = (courseId: number) => {
        onDeleteCourse(courseId);
        setDeleteConfirmModal({ isOpen: false, courseId: null, courseName: '', isRecover: false });
        setOpenMenuId(null);
    };

    // 处理恢复课程逻辑
    // 处理恢复课程逻辑
    const handleRecoverClick = (courseId: number) => {
        onRecoverCourse(courseId);
        setDeleteConfirmModal({ isOpen: false, courseId: null, courseName: '', isRecover: false });
        setOpenMenuId(null);
    };

    const [createdSearchQuery, setCreatedSearchQuery] = useState('');
    const [createdFilterStatus, setCreatedFilterStatus] = useState('All');

    // 过滤 Created Courses
    const displayedCreatedCourses = createdCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(createdSearchQuery.toLowerCase());
        const matchesStatus = createdFilterStatus === 'All' || course.status === createdFilterStatus;
        return matchesSearch && matchesStatus;
    });

    const [enrolledSearchQuery, setEnrolledSearchQuery] = useState('');

    // Filter courses based on status and search
    // Filter courses based on status and search
    // Filter courses based on status and search
    const filteredCourses = enrolledCourses.filter(course => {
        const matchesStatus = filterStatus === 'All' || course.status === filterStatus;
        const matchesSearch = course.title.toLowerCase().includes(enrolledSearchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <AuthenticatedNavbar setCurrentView={setCurrentView} selectedRole={selectedRole} currentView={ViewState.MY_COURSES} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} />

            {selectedRole === UserRole.LEARNER ? (
                <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6">
                    <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8">My Courses</h1>

                    {/* Stats Banner */}
                    <div className="w-full bg-gradient-to-br from-[#FF8C66] to-[#FFB399] rounded-[2rem] p-6 md:p-10 text-white mb-12 shadow-xl shadow-orange-200/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center gap-4 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                                    <Flame size={28} strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-white/90 mb-0.5 truncate">Learning Time</div>
                                    <div className="text-2xl font-bold">24 <span className="text-sm font-medium opacity-80">hours</span></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                                    <Slice size={28} strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-white/90 mb-0.5 truncate">Completion</div>
                                    <div className="text-2xl font-bold">65 <span className="text-sm font-medium opacity-80">%</span></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                                    <Fish size={28} strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-white/90 mb-0.5 truncate">Completed</div>
                                    <div className="text-2xl font-bold">8</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                                    <Droplet size={28} strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-white/90 mb-0.5 truncate">Enrolled</div>
                                    <div className="text-2xl font-bold">12</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Container */}
                    <div className="glass-panel rounded-[1.5rem] p-2">
                        {/* Search & Filter */}
                        <div className="flex items-center gap-4 py-8 px-6 border-b border-white/40">
                            <div className="relative w-full max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    className="w-full h-10 pl-4 pr-10 rounded-xl border border-white/60 bg-white/60 backdrop-blur-md focus:outline-none focus:border-[#FF8C66] focus:ring-4 focus:ring-[#FF8C66]/10 transition-all text-sm"
                                    value={enrolledSearchQuery}
                                    onChange={(e) => setEnrolledSearchQuery(e.target.value)}
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative min-w-[140px]">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full h-10 pl-4 pr-10 appearance-none bg-white/60 backdrop-blur-md border border-white/60 rounded-xl text-gray-700 font-medium focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] cursor-pointer shadow-sm text-sm"
                                    >
                                        <option value="All" disabled>All Status</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                </div>
                                {(filterStatus !== 'All' || enrolledSearchQuery !== '') && (
                                    <button
                                        onClick={() => {
                                            setFilterStatus('All');
                                            setEnrolledSearchQuery('');
                                        }}
                                        className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <RotateCcw size={16} />
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 px-6 py-4 text-sm font-semibold text-gray-500 border-b border-white/40">
                            <div className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-[#1A1A1A]">
                                Tutorials <ChevronDown size={14} />
                            </div>
                            <div className="col-span-3">Date</div>
                            <div className="col-span-4">Progress</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-white/40">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="grid grid-cols-12 px-6 py-6 items-center hover:bg-orange-50/30 transition-colors cursor-pointer group"
                                        onClick={() => setCurrentView(ViewState.COURSE_DETAIL)}
                                    >
                                        <div className="col-span-4 flex items-center gap-4">
                                            <MoreVertical size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                                            <span className="font-bold text-[#1A1A1A]">{course.title}</span>
                                        </div>
                                        <div className="col-span-3 text-gray-500 font-medium">
                                            {course.date}
                                        </div>
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#FF8C66] to-[#FFB399] rounded-full" style={{ width: `${course.progress}% ` }}></div>
                                            </div>
                                            <span className="text-sm font-bold text-[#1A1A1A] min-w-[3rem]">{course.progress} %</span>
                                        </div>
                                        <div className="col-span-1 flex justify-end relative" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-[#1A1A1A]"
                                                onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {openMenuId === course.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                        <button
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-[#FF8C66] transition-colors"
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                setIsScoreModalOpen(true);
                                                            }}
                                                        >
                                                            Show Quiz Score
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(null);
                                                                setUnenrollConfirmModal({ isOpen: true, courseId: course.id, courseName: course.title });
                                                            }}
                                                        >
                                                            Unenroll
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No courses found matching your criteria</p>
                                    <p className="text-sm opacity-60">Try adjusting your search or filtering by status</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-6 border-t border-white/40 flex items-center justify-between">
                            <span className="text-sm text-gray-500 font-medium">1 - 8 of 40 items</span>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Previous</button>
                                <button className="px-4 py-2 rounded-lg border border-white/60 text-sm font-medium text-gray-600 hover:bg-white">Next</button>
                            </div>
                        </div>
                    </div>
                </main>
            ) : (
                <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-20 mt-6 space-y-20">
                    {/* Stats Banner */}
                    <div className="w-full bg-gradient-to-br from-[#FF8C66] to-[#FFB399] rounded-[2rem] p-6 md:px-12 md:py-10 text-white shadow-xl shadow-orange-200/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Create Courses */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 backdrop-blur-sm">
                                    <Flame size={28} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white/90 mb-1">Create Courses</div>
                                    <div className="text-3xl font-bold">24</div>
                                </div>
                            </div>
                            {/* Enrolled */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 backdrop-blur-sm">
                                    <Droplet size={28} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white/90 mb-1">Enrolled</div>
                                    <div className="text-3xl font-bold">12</div>
                                </div>
                            </div>
                            {/* Completed */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 backdrop-blur-sm">
                                    <Fish size={28} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white/90 mb-1">Completed</div>
                                    <div className="text-3xl font-bold">8</div>
                                </div>
                            </div>
                            {/* Completion */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 backdrop-blur-sm">
                                    <Slice size={28} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white/90 mb-1">Completion</div>
                                    <div className="text-3xl font-bold">65 <span className="text-base font-medium">%</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Created Courses */}
                    {myCoursesSubpage === 'created' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-500">Created Courses</h2>

                            {/* Search & Filter */}
                            <div className="flex gap-4">
                                <div className="relative w-full max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Search ..."
                                        className="w-full h-10 pl-4 pr-10 rounded-xl border border-white/60 bg-white/60 backdrop-blur-md focus:outline-none focus:border-[#FF8C66] focus:ring-4 focus:ring-[#FF8C66]/10 transition-all"
                                        value={createdSearchQuery}
                                        onChange={(e) => setCreatedSearchQuery(e.target.value)}
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <select
                                            className="h-10 pl-4 pr-10 appearance-none bg-white/60 border border-white/60 backdrop-blur-md rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20"
                                            value={createdFilterStatus}
                                            onChange={(e) => setCreatedFilterStatus(e.target.value)}
                                        >
                                            <option value="All" disabled>All Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Deleted">Deleted</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                    </div>
                                    {(createdFilterStatus !== 'All' || createdSearchQuery !== '') && (
                                        <button
                                            onClick={() => {
                                                setCreatedFilterStatus('All');
                                                setCreatedSearchQuery('');
                                            }}
                                            className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <RotateCcw size={16} />
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="glass-panel rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-12 px-6 py-4 text-xs font-semibold text-gray-400 border-b border-white/40 uppercase tracking-wider">
                                    <div className="col-span-4 flex items-center gap-2">Courses <ChevronDown size={14} /></div>
                                    <div className="col-span-3">Created Date</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-3 text-right">Action</div>
                                </div>
                                <div className="divide-y divide-white/40">
                                    {displayedCreatedCourses.length > 0 ? (
                                        displayedCreatedCourses.map((course) => (
                                            <div key={course.id} className="grid grid-cols-12 px-6 py-6 items-center hover:bg-orange-50/30 transition-colors">
                                                <div className="col-span-4 flex items-center gap-4">
                                                    <GripVertical size={20} className="text-gray-300 cursor-grab" />
                                                    <span className="font-bold text-[#1A1A1A]">{course.title}</span>
                                                </div>
                                                <div className="col-span-3 text-gray-500 font-medium">{course.date}</div>
                                                <div className="col-span-2 text-gray-600">
                                                    {course.status}
                                                </div>
                                                <div className="col-span-3 flex justify-end relative">
                                                    <button
                                                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === course.id ? null : course.id);
                                                        }}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {openMenuId === course.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                                {course.status === 'Active' ? (
                                                                    <>
                                                                        <button
                                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-[#FF8C66] transition-colors flex items-center gap-2"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setOpenMenuId(null);
                                                                                if (setEditingCourse) setEditingCourse(course);
                                                                                setCurrentView(ViewState.CREATE_COURSE);
                                                                            }}
                                                                        >
                                                                            <Edit2 size={16} /> Edit
                                                                        </button>
                                                                        <button
                                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setOpenMenuId(null);
                                                                                setDeleteConfirmModal({ isOpen: true, courseId: course.id, courseName: course.title, isRecover: false });
                                                                            }}
                                                                        >
                                                                            <Trash2 size={16} /> Delete
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenMenuId(null);
                                                                            setDeleteConfirmModal({ isOpen: true, courseId: course.id, courseName: course.title, isRecover: true });
                                                                        }}
                                                                    >
                                                                        <RotateCcw size={16} /> Recover
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-gray-500">
                                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="text-lg font-medium">No courses found matching your criteria</p>
                                            <p className="text-sm opacity-60">Try adjusting your search or filter settings</p>
                                        </div>
                                    )}
                                </div>
                                {/* Pagination */}
                                <div className="px-6 py-4 border-t border-white/40 flex items-center justify-between">
                                    <span className="text-sm text-gray-500">1 - 8 of 40 items</span>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 border border-white/60 rounded-lg text-sm text-gray-600 hover:bg-white">Previous</button>
                                        <button className="px-4 py-2 border border-white/60 rounded-lg text-sm text-gray-600 hover:bg-white">Next</button>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Action Button for Create Course */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setCurrentView(ViewState.CREATE_COURSE)}
                                    className="bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-orange-500/30 transition-all"
                                >
                                    Create Course
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Joined Courses */}
                    {myCoursesSubpage === 'joined' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-500">Joined Courses</h2>

                            {/* Table Container */}
                            <div className="glass-panel rounded-2xl pt-6">
                                {/* Search & Filter */}
                                <div className="flex items-center gap-4 py-8 px-6 border-b border-white/40 bg-white/10">
                                    <div className="relative w-full max-w-xs">
                                        <input
                                            type="text"
                                            placeholder="Search joined courses..."
                                            className="w-full h-10 pl-4 pr-10 rounded-xl border border-white/60 bg-white/60 backdrop-blur-md focus:outline-none focus:border-[#FF8C66] focus:ring-4 focus:ring-[#FF8C66]/10 transition-all text-sm"
                                            value={enrolledSearchQuery}
                                            onChange={(e) => setEnrolledSearchQuery(e.target.value)}
                                        />
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative min-w-[140px]">
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="w-full h-10 pl-4 pr-10 appearance-none bg-white/60 backdrop-blur-md border border-white/60 rounded-xl text-gray-700 font-medium focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] cursor-pointer shadow-sm text-sm"
                                            >
                                                <option value="All" disabled>All Status</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                        </div>
                                        {(filterStatus !== 'All' || enrolledSearchQuery !== '') && (
                                            <button
                                                onClick={() => {
                                                    setFilterStatus('All');
                                                    setEnrolledSearchQuery('');
                                                }}
                                                className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <RotateCcw size={16} />
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y divide-white/40">
                                    {filteredCourses.length > 0 ? (
                                        filteredCourses.map((course) => (
                                            <div
                                                key={course.id}
                                                className="grid grid-cols-12 px-6 py-8 items-center hover:bg-orange-50/30 transition-colors group cursor-pointer"
                                                onClick={() => setCurrentView(ViewState.COURSE_DETAIL)}
                                            >
                                                <div className="col-span-5 flex items-center gap-4">
                                                    <GripVertical size={20} className="text-gray-300 cursor-grab" />
                                                    <span className="font-bold text-[#1A1A1A] text-sm md:text-base">{course.title}</span>
                                                </div>
                                                <div className="col-span-3 text-gray-500 font-medium text-sm">{course.date}</div>
                                                <div className="col-span-4 flex items-center gap-4 relative">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-[#FF8C66] to-[#FFB399] rounded-full" style={{ width: `${course.progress}% ` }}></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-[#1A1A1A] min-w-[2.5rem]">{course.progress} %</span>

                                                    <div className="relative">
                                                        <button
                                                            className="p-2 hover:bg-white rounded-full transition-colors text-gray-300 hover:text-gray-600 ml-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === course.id ? null : course.id);
                                                            }}
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {openMenuId === course.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                                    <button
                                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-[#FF8C66] transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenMenuId(null);
                                                                            setIsScoreModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Show Quiz Score
                                                                    </button>
                                                                    <button
                                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenMenuId(null);
                                                                            setUnenrollConfirmModal({ isOpen: true, courseId: course.id, courseName: course.title });
                                                                        }}
                                                                    >
                                                                        Unenroll
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-gray-500">
                                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="text-lg font-medium">No courses found matching your criteria</p>
                                            <p className="text-sm opacity-60">Try adjusting your search or filtering by status</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                <div className="px-6 py-6 border-t border-white/40 flex items-center justify-between">
                                    <span className="text-sm text-gray-500 font-medium">1 - 8 of 40 items</span>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 border border-white/60 rounded-lg text-sm text-gray-600 hover:bg-white">Previous</button>
                                        <button className="px-4 py-2 border border-white/60 rounded-lg text-sm text-gray-600 hover:bg-white">Next</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            )}
            <Footer />

            {/* Unenroll Confirmation Dialog */}
            {
                unenrollConfirmModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Confirm Unenrollment</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to unenroll from <span className="font-bold text-[#FF8C66]">{unenrollConfirmModal.courseName}</span>?
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                After unenrolling, your learning progress will be saved, but the course will be removed from your list.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setUnenrollConfirmModal({ isOpen: false, courseId: null, courseName: '' })}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (unenrollConfirmModal.courseId) {
                                            handleUnenrollClick(unenrollConfirmModal.courseId);
                                        }
                                    }}
                                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all"
                                >
                                    Confirm Unenroll
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete/Recover Course Confirmation Dialog */}
            {
                deleteConfirmModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">
                                {deleteConfirmModal.isRecover ? 'Confirm Recovery' : 'Confirm Deletion'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {deleteConfirmModal.isRecover
                                    ? (<>Are you sure you want to recover <span className="font-bold text-[#FF8C66]">{deleteConfirmModal.courseName}</span>?</>)
                                    : (<>Are you sure you want to delete <span className="font-bold text-[#FF8C66]">{deleteConfirmModal.courseName}</span>?</>)
                                }
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                {deleteConfirmModal.isRecover
                                    ? 'The course will be restored and become active again.'
                                    : 'The course will be marked as deleted and can be recovered later.'
                                }
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirmModal({ isOpen: false, courseId: null, courseName: '', isRecover: false })}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (deleteConfirmModal.courseId) {
                                            if (deleteConfirmModal.isRecover) {
                                                handleRecoverClick(deleteConfirmModal.courseId);
                                            } else {
                                                handleDeleteClick(deleteConfirmModal.courseId);
                                            }
                                        }
                                    }}
                                    className={`px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all ${deleteConfirmModal.isRecover
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-emerald-500/30'
                                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-red-500/30'
                                        }`}
                                >
                                    {deleteConfirmModal.isRecover ? 'Confirm Recovery' : 'Confirm Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <ScoreModal isOpen={isScoreModalOpen} onClose={() => setIsScoreModalOpen(false)} />
        </div >
    );
};


const LoginView: React.FC<ViewProps & { setSelectedRole: (role: UserRole) => void; setCurrentUser?: (user: any) => void }> = ({ setCurrentView, setSelectedRole, setCurrentUser }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Minimal Header */}
            <div className="px-6 py-6 md:px-12 flex justify-between items-center max-w-[1400px] mx-auto w-full">
                <div className="text-xl font-bold text-[#1A1A1A] cursor-pointer" onClick={() => setCurrentView(ViewState.LANDING)}>WokFlow</div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF8C66] to-[#FFB399] rounded-full mb-8 shadow-lg shadow-orange-500/20"></div>

                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">Sign in</h1>

                <div className="w-full max-w-[500px] glass-panel rounded-[2.5rem] p-8 md:p-12 mb-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Email or mobile phone number</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                className="w-full h-14 px-4 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-gray-700">Your password</label>
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[#1A1A1A] font-bold text-sm flex items-center gap-2 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <>
                                            <Eye size={18} /> Show
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff size={18} /> Hide
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    className="w-full h-14 px-4 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={() => {
                                // 验证输入
                                if (!email || !password) {
                                    setError('Please enter both email and password');
                                    return;
                                }

                                // 在数据库中查找用户
                                const user = INITIAL_USERS.find(
                                    u => u.email.toLowerCase() === email.toLowerCase() && u.password_hash === password
                                );

                                if (!user) {
                                    setError('Invalid email or password');
                                    return;
                                }

                                // 检查用户状态
                                if (user.status === UserStatus.BANNED) {
                                    setError('This account has been banned');
                                    return;
                                }

                                // 登录成功,设置当前用户并根据用户角色跳转
                                if (setCurrentUser) {
                                    setCurrentUser({
                                        id: user.user_id,
                                        name: user.username,
                                        role: user.role === 'LEARNER' ? UserRole.LEARNER :
                                            user.role === 'SHARER' ? UserRole.SHARER :
                                                user.role === 'ADMIN' ? UserRole.ADMIN : UserRole.GUEST
                                    });
                                }

                                if (user.role === UserRole.ADMIN) {
                                    setSelectedRole(UserRole.ADMIN);
                                    setCurrentView(ViewState.ADMIN_USER_MANAGEMENT);
                                } else if (user.role === UserRole.SHARER) {
                                    setSelectedRole(UserRole.SHARER);
                                    setCurrentView(ViewState.DASHBOARD);
                                } else {
                                    setSelectedRole(UserRole.LEARNER);
                                    setCurrentView(ViewState.DASHBOARD);
                                }
                            }}
                            className="w-full h-14 bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white rounded-xl font-bold text-base hover:shadow-orange-500/30 transition-all shadow-lg shadow-orange-500/20 mt-2"
                        >
                            Sign In
                        </button>

                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                            By continuing, you agree to the <span className="font-bold text-gray-700">Terms of use</span> and <span className="font-bold text-gray-700">Privacy Policy</span>.
                        </p>

                        <div className="flex justify-between items-center pt-2">
                            <button className="text-sm font-medium text-[#1A1A1A]">Other issue with sign in</button>
                            <button className="text-sm font-bold text-gray-500 hover:text-[#1A1A1A]">Forget your password</button>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[600px] flex items-center gap-4 mb-8">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="text-gray-500 font-medium">New to our community</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                </div>

                <button
                    onClick={() => setCurrentView(ViewState.REGISTER)}
                    className="text-[#1A1A1A] font-bold hover:text-gray-600 transition-colors"
                >
                    Create an account
                </button>
            </div>

            <Footer />
        </div>
    );
};

const RegisterView: React.FC<RegisterProps> = ({ setCurrentView, selectedRole, setSelectedRole }) => {
    const initialFormState = {
        fullName: '',
        email: '',
        birthDate: '',
        country: '',
        password: '',
        confirmPassword: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
    const [showRoleInfo, setShowRoleInfo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form when role changes
    useEffect(() => {
        setFormData(initialFormState);
        setUploadedFileName(null);
        setUploadedFileName(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsCalendarOpen(false);
        setIsCountrySelectorOpen(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [selectedRole]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFileName(file.name);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Minimal Header */}
            <div className="px-6 py-6 md:px-12 max-w-[1400px] mx-auto w-full">
                <div className="text-xl font-bold text-[#1A1A1A] cursor-pointer" onClick={() => setCurrentView(ViewState.LANDING)}>WokFlow</div>
            </div>

            <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 md:px-12 pb-20 flex flex-col items-center mt-4">
                <div className="flex items-center gap-3 mb-8">
                    <h1 className="text-4xl font-bold text-[#1A1A1A]">User Registration</h1>
                    <button
                        onClick={() => setShowRoleInfo(true)}
                        className="text-gray-400 hover:text-[#FF8C66] transition-colors p-1 hover:bg-orange-50 rounded-full"
                    >
                        <Info size={24} />
                    </button>
                </div>

                {/* Role Toggle */}
                <div className="w-full max-w-md border border-white/60 bg-white/40 backdrop-blur-md rounded-full p-1.5 flex mb-16 relative">
                    <button
                        onClick={() => setSelectedRole(UserRole.LEARNER)}
                        className={`flex-1 py-3 rounded-full text-sm font-medium transition-all relative z-10 ${selectedRole === UserRole.LEARNER ? 'text-white' : 'text-[#1A1A1A]'} `}
                    >
                        Learner
                    </button>
                    <button
                        onClick={() => setSelectedRole(UserRole.SHARER)}
                        className={`flex-1 py-3 rounded-full text-sm font-medium transition-all relative z-10 ${selectedRole === UserRole.SHARER ? 'text-white' : 'text-[#1A1A1A]'} `}
                    >
                        Sharer
                    </button>
                    {/* Sliding Background */}
                    <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%_-_6px)] bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] rounded-full transition-all duration-300 ease-in-out shadow-md ${selectedRole === UserRole.LEARNER ? 'left-1.5' : 'left-[calc(50%_+_3px)]'} `}></div>
                </div>

                {/* Form Grid */}
                {/* Form Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mb-12">
                    <div className="space-y-2">
                        <label className="text-gray-700 font-medium">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full h-14 px-4 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-700 font-medium">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full h-14 px-4 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                        />
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-gray-700 font-medium">Birth Date</label>
                        <button
                            type="button"
                            className="w-full h-14 px-4 bg-white/60 border border-white/60 rounded-xl flex items-center text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        >
                            <CalendarIcon size={20} className="text-gray-400 mr-3 shrink-0" />
                            <span className={formData.birthDate ? "text-gray-700" : "text-gray-400"}>
                                {formData.birthDate || "YYYY-MM-DD"}
                            </span>
                        </button>
                        {isCalendarOpen && (
                            <Calendar
                                selectedDate={formData.birthDate}
                                onSelect={(date) => setFormData(prev => ({ ...prev, birthDate: date }))}
                                onClose={() => setIsCalendarOpen(false)}
                            />
                        )}
                    </div>
                    <div className="space-y-2 relative">
                        <label className="text-gray-700 font-medium">Country</label>
                        <button
                            type="button"
                            className="w-full h-14 px-4 bg-white/60 border border-white/60 rounded-xl flex items-center text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                            onClick={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)}
                        >
                            <span className={`block truncate mr-2 ${formData.country ? "text-gray-700" : "text-gray-400"} `}>
                                {formData.country || "Select Country"}
                            </span>
                            <ChevronDown size={20} className="text-gray-400 ml-auto shrink-0" />
                        </button>
                        {isCountrySelectorOpen && (
                            <CountrySelector
                                selectedCountry={formData.country}
                                onSelect={(country) => setFormData(prev => ({ ...prev, country: country }))}
                                onClose={() => setIsCountrySelectorOpen(false)}
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-gray-500 font-medium">Password</label>
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#1A1A1A] font-bold text-sm flex items-center gap-2"
                            >
                                {showPassword ? (
                                    <>
                                        <Eye size={18} /> Show
                                    </>
                                ) : (
                                    <>
                                        <EyeOff size={18} /> Hide
                                    </>
                                )}
                            </button>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full h-14 px-4 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-gray-500 font-medium">Confirm Password</label>
                            <button
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-[#1A1A1A] font-bold text-sm flex items-center gap-2"
                            >
                                {showConfirmPassword ? (
                                    <>
                                        <Eye size={18} /> Show
                                    </>
                                ) : (
                                    <>
                                        <EyeOff size={18} /> Hide
                                    </>
                                )}
                            </button>
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full h-14 px-4 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66]"
                        />
                    </div>

                    {/* Sharer Only Field */}
                    {selectedRole === UserRole.SHARER && (
                        <>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[#1A1A1A] font-medium">Upload Proof of Skills</label>
                                <div className="flex gap-4">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                    <button
                                        onClick={handleUploadClick}
                                        className="flex-1 h-14 border-2 border-dashed border-[#FF8C66]/50 bg-orange-50/50 rounded-xl flex items-center justify-center hover:border-[#FF8C66] hover:bg-orange-50 transition-all text-[#FF8C66]"
                                    >
                                        <Upload size={20} />
                                    </button>
                                    <div className="flex-[1.5] h-14 bg-gray-200 rounded-xl flex items-center justify-center text-[#1A1A1A] font-medium px-4 overflow-hidden text-ellipsis whitespace-nowrap">
                                        {uploadedFileName || ""}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-6 w-full max-w-[600px] mx-auto">
                    <button
                        onClick={() => setCurrentView(ViewState.LOGIN)}
                        className="flex-1 h-14 border border-gray-400 rounded-full text-[#1A1A1A] font-medium hover:bg-white/50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => setCurrentView(ViewState.DASHBOARD)}
                        className="flex-1 h-14 bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] rounded-full text-white font-medium hover:shadow-orange-500/30 transition-all shadow-lg shadow-orange-500/20"
                    >
                        Register
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const DashboardShell: React.FC<AuthenticatedViewProps & {
    allCourses: typeof INITIAL_ALL_COURSES;
    onJoinCourse: (course: any) => void;
    myCoursesSubpage: string;
    setMyCoursesSubpage: (subpage: string) => void;
    enrolledCourses: Enrollment[];
}> = ({ setCurrentView, selectedRole, allCourses, onJoinCourse, myCoursesSubpage, setMyCoursesSubpage, enrolledCourses }) => {
    const [showRoleInfo, setShowRoleInfo] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCuisine, setSelectedCuisine] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedCuisine("");
        setSelectedDifficulty("");
        setSelectedTime("");
    };

    // Filter Logic
    const filteredCourses = allCourses.filter(course => {
        // 搜索匹配
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());

        // 菜系匹配
        const matchesCuisine = selectedCuisine === "" || course.cuisine === selectedCuisine;

        // 难度匹配
        const matchesDifficulty = selectedDifficulty === "" || course.difficulty === parseInt(selectedDifficulty);

        // 时间匹配
        let matchesTime = true;
        if (selectedTime !== "") {
            const courseDate = new Date(course.created_date);
            const now = new Date();
            const diffTime = now.getTime() - courseDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (selectedTime === "24h") {
                matchesTime = diffDays <= 1;
            } else if (selectedTime === "week") {
                matchesTime = diffDays <= 7;
            } else if (selectedTime === "month") {
                matchesTime = diffDays <= 30;
            }
        }

        return matchesSearch && matchesCuisine && matchesDifficulty && matchesTime;
    });

    return (
        <div className="min-h-screen flex flex-col font-sans text-[#1A1A1A]">
            <AuthenticatedNavbar setCurrentView={setCurrentView} selectedRole={selectedRole} currentView={ViewState.DASHBOARD} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} />

            <main className="flex-1 px-6 md:px-12 max-w-[1400px] mx-auto w-full pb-20 mt-6 relative">
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-12 items-start md:items-center">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-4 pr-10 rounded-lg border border-white/60 bg-white/60 backdrop-blur-md text-[#1A1A1A] placeholder:text-gray-500 focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] shadow-sm"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]" size={20} />
                    </div>

                    <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                        {/* Custom Select Wrappers */}
                        <div className="relative min-w-[120px]">
                            <select
                                value={selectedCuisine}
                                onChange={(e) => setSelectedCuisine(e.target.value)}
                                className="w-full h-10 pl-4 pr-8 appearance-none bg-white/60 backdrop-blur-md border border-white/60 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] cursor-pointer shadow-sm"
                            >
                                <option value="" disabled>Cuisine</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Western">Western</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Korean">Korean</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>

                        <div className="relative min-w-[130px]">
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full h-10 pl-4 pr-8 appearance-none bg-white/60 backdrop-blur-md border border-white/60 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] cursor-pointer shadow-sm"
                            >
                                <option value="" disabled>Difficulty</option>
                                <option value="1">1 Star</option>
                                <option value="2">2 Star</option>
                                <option value="3">3 Star</option>
                                <option value="4">4 Star</option>
                                <option value="5">5 Star</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>

                        <div className="relative min-w-[140px]">
                            <select
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full h-10 pl-4 pr-8 appearance-none bg-white/60 backdrop-blur-md border border-white/60 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-[#FF8C66] focus:ring-1 focus:ring-[#FF8C66] cursor-pointer shadow-sm"
                            >
                                <option value="" disabled>Time Posted</option>
                                <option value="24h">Past 24 hours</option>
                                <option value="week">Past week</option>
                                <option value="month">Past Month</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>

                        {/* Reset Button - Only show when filters are active */}
                        {(searchQuery || selectedCuisine || selectedDifficulty || selectedTime) && (
                            <button
                                onClick={handleResetFilters}
                                className="h-10 px-4 rounded-lg bg-red-50 border border-red-300 text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => {
                        const isJoined = enrolledCourses.some(enrolled => enrolled.title === course.title);
                        return (
                            <div key={course.id} className="glass-panel rounded-[2rem] p-4 flex flex-col hover:shadow-xl transition-shadow h-full">
                                {/* Image Placeholder */}
                                <div className="w-full aspect-[4/3] rounded-[1.5rem] bg-orange-50/50 mb-5 overflow-hidden relative flex items-center justify-center">
                                    {course.image ? (
                                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-orange-200">
                                            <ImageIcon size={48} strokeWidth={1.5} />
                                        </div>
                                    )}
                                </div>

                                <div className="px-2 pb-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-[#1A1A1A]">{course.title}</h3>
                                        <button
                                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isJoined
                                                ? 'bg-gray-200 text-gray-500 cursor-default'
                                                : 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5'
                                                }`}
                                            disabled={isJoined}
                                            onClick={() => {
                                                if (!isJoined) {
                                                    onJoinCourse(course);
                                                    setCurrentView(ViewState.COURSE_DETAIL);
                                                }
                                            }}
                                        >
                                            {isJoined ? 'Joined' : 'Join'}
                                        </button>
                                    </div>
                                    <p className="text-gray-600 text-[15px] mb-8 leading-relaxed font-medium line-clamp-2">
                                        {course.description || 'No description available'}
                                    </p>

                                    <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-orange-100"></div>
                                            <span className="text-[#1A1A1A] text-sm font-medium">{course.cuisine}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-orange-100"></div>
                                            <span className="text-[#1A1A1A] text-sm font-medium">{course.difficulty} Star{course.difficulty > 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-orange-100"></div>
                                            <span className="text-[#1A1A1A] text-sm font-medium">{course.duration || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                    <button className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-500 font-bold hover:border-[#FF8C66] hover:text-[#FF8C66] transition-all shadow-sm flex items-center gap-2">
                        <ChevronLeft size={18} /> Previous
                    </button>

                    <span className="px-4 text-gray-600 font-bold">1 <span className="text-gray-400 font-medium mx-1">out of</span> 10</span>

                    <button className="px-6 py-2.5 rounded-full bg-white border border-[#FF8C66] text-[#FF8C66] font-bold hover:bg-[#FF8C66] hover:text-white transition-all shadow-md shadow-orange-500/20 flex items-center gap-2">
                        Next <ChevronRight size={18} />
                    </button>
                </div >

                {/* Create Course Button (Sharer Only) - Static at bottom right */}
                {
                    selectedRole === UserRole.SHARER && (
                        <div className="flex justify-end mt-12">
                            <button
                                onClick={() => setCurrentView(ViewState.CREATE_COURSE)}
                                className="flex items-center gap-2 bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-orange-500/30 transition-all shadow-orange-500/20"
                            >
                                <Plus size={20} />
                                Create Course
                            </button>
                        </div>
                    )
                }
            </main >


            {/* Role Info Modal */}
            {
                showRoleInfo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                            onClick={() => setShowRoleInfo(false)}
                        ></div>
                        <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowRoleInfo(false)}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 text-center flex items-center justify-center gap-3">
                                <span className="bg-orange-100 p-2 rounded-full text-[#FF8C66]">
                                    <Info size={24} />
                                </span>
                                Account Types
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Learner Column */}
                                <div className="space-y-4">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold text-[#1A1A1A]">Learner</h3>
                                        <p className="text-sm text-gray-500">For students & enthusiasts</p>
                                    </div>
                                    <ul className="space-y-3">
                                        {[
                                            "Browse & Search Courses",
                                            "Enroll in Courses",
                                            "Track Learning Progress",
                                            "Manage Personal Profile"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                                                <div className="min-w-[20px] h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Sharer Column */}
                                <div className="space-y-4 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 -ml-4 hidden md:block"></div>
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold text-[#1A1A1A]">Sharer</h3>
                                        <p className="text-sm text-gray-500">For creators & instructors</p>
                                    </div>
                                    <ul className="space-y-3">
                                        {[
                                            "All Learner Features",
                                            "Create & Publish Courses",
                                            "View Advanced Analytics",
                                            "Manage Content"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                                                <div className="min-w-[20px] h-5 rounded-full bg-orange-100 flex items-center justify-center text-[#FF8C66]">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <Footer />
        </div >
    );
};

// --- MAIN APP ---

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.LEARNER);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
    const [comments, setComments] = useState(INITIAL_COMMENTS);
    const [currentUser, setCurrentUser] = useState({ id: 1, name: 'Current User', role: UserRole.LEARNER }); // Initial dummy user
    const [myCoursesSubpage, setMyCoursesSubpage] = useState<string>('created');

    const handleAddComment = (newComment: any) => {
        setComments(prev => [newComment, ...prev]);
    };

    // --- Admin State ---
    const [registrations, setRegistrations] = useState(INITIAL_SHARER_REGISTRATIONS_DATA);
    const [sharerRequests, setSharerRequests] = useState(INITIAL_SHARER_REQUESTS_DATA);
    const [users, setUsers] = useState(INITIAL_USER_CONTROL_DATA);
    const [reportedContent, setReportedContent] = useState(INITIAL_REPORTED_CONTENT_DATA);

    // --- Admin Handlers ---
    const handleAcceptRegistration = (id: number) => {
        setRegistrations(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Accepted' } : req
        ));
    };

    const handleRejectRegistration = (id: number) => {
        setRegistrations(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Rejected' } : req
        ));
    };

    const handleAcceptRequest = (id: number) => {
        setSharerRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Accepted' } : req
        ));
    };

    const handleRejectRequest = (id: number) => {
        setSharerRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Rejected' } : req
        ));
    };



    const handleBanUser = (id: number) => {
        setUsers(prev => prev.map(user =>
            user.id === id ? { ...user, status: 'Banned' } : user
        ));
    };

    const handleRecoverUser = (id: number) => {
        setUsers(prev => prev.map(user =>
            user.id === id ? { ...user, status: 'Active' } : user
        ));
    };

    // --- Sharer Request/Registration Undo Handlers ---
    const handleUndoRegistration = (id: number) => {
        setRegistrations(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Pending' } : req
        ));
    };

    const handleUndoRequest = (id: number) => {
        setSharerRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Pending' } : req
        ));
    };


    const handleBanContent = (id: number) => {
        setReportedContent(prev => prev.map(content =>
            content.id === id ? { ...content, status: 'Banned' } : content
        ));
    };

    const handleIgnoreContent = (id: number) => {
        setReportedContent(prev => prev.map(content =>
            content.id === id ? { ...content, status: 'Ignored' } : content
        ));
    };

    const handleUndoContent = (id: number) => {
        setReportedContent(prev => prev.map(content =>
            content.id === id ? { ...content, status: 'Pending' } : content
        ));
    };

    // --- Course State ---
    const [allCourses, setAllCourses] = useState(INITIAL_ALL_COURSES);
    const [enrolledCourses, setEnrolledCourses] = useState<typeof INITIAL_ENROLLED_COURSES>([]);  // 初始化为空数组
    const [createdCourses, setCreatedCourses] = useState(INITIAL_CREATED_COURSES);
    const [chapterProgress, setChapterProgress] = useState<UserChapterProgress[]>(INITIAL_CHAPTER_PROGRESS);  // 章节进度状态

    // --- Course Handlers ---
    // 处理课程加入逻辑
    const handleJoinCourse = (course: any) => {
        // 检查课程是否已经加入 (基于当前用户)
        const alreadyEnrolled = enrolledCourses.some(c => c.title === course.title && c.userId === currentUser.id);

        if (!alreadyEnrolled) {
            // 创建新的注册记录
            const newEnrollment = {
                id: enrolledCourses.length + 1,
                userId: currentUser.id, // 关联当前用户
                title: course.title,
                date: new Date().toISOString().split('T')[0],  // 当前日期
                progress: 0,  // 初始进度为 0
                status: 'In Progress'  // 初始状态
            };

            // 添加到已注册课程列表
            setEnrolledCourses(prev => [...prev, newEnrollment]);

            // ✅ 解锁第一章
            const courseChapters = INITIAL_CHAPTERS.filter(ch => ch.course_id === course.id);
            if (courseChapters.length > 0) {
                const firstChapter = courseChapters.sort((a, b) => a.chapter_order - b.chapter_order)[0];
                const newProgress: UserChapterProgress = {
                    progress_id: chapterProgress.length + 1,
                    user_id: currentUser.id,
                    enrollment_id: newEnrollment.id,
                    chapter_id: firstChapter.chapter_id,
                    is_completed: false,
                    completed_date: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setChapterProgress(prev => [...prev, newProgress]);
            }
        }

        // 设置选中的课程(用于课程详情页)
        setSelectedCourse(course);
    };

    const handleUnenroll = (courseId: number) => {
        setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
    };

    // 检查章节是否解锁
    const isChapterUnlocked = (chapterId: number, courseId: number): boolean => {
        const courseChapters = INITIAL_CHAPTERS
            .filter(ch => ch.course_id === courseId)
            .sort((a, b) => a.chapter_order - b.chapter_order);

        const currentChapter = courseChapters.find(ch => ch.chapter_id === chapterId);
        if (!currentChapter) return false;

        // 第一章总是解锁
        if (currentChapter.chapter_order === 1) {
            // 检查用户是否已加入课程
            const enrollment = enrolledCourses.find(e => {
                const course = allCourses.find(c => c.title === e.title);
                return course?.id === courseId;
            });
            return !!enrollment;
        }

        // 检查前一章是否完成
        const previousChapter = courseChapters.find(ch => ch.chapter_order === currentChapter.chapter_order - 1);
        if (!previousChapter) return false;

        const previousProgress = chapterProgress.find(
            p => p.chapter_id === previousChapter.chapter_id && p.is_completed && p.user_id === currentUser.id
        );

        return !!previousProgress;
    };

    // 完成章节并解锁下一章
    const handleCompleteChapter = (chapterId: number, courseId: number) => {
        // 标记当前章节为完成 (仅针对当前用户)
        setChapterProgress(prev => prev.map(p =>
            p.chapter_id === chapterId && p.user_id === currentUser.id
                ? { ...p, is_completed: true, completed_date: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }
                : p
        ));

        // 解锁下一章
        const courseChapters = INITIAL_CHAPTERS
            .filter(ch => ch.course_id === courseId)
            .sort((a, b) => a.chapter_order - b.chapter_order);

        const currentChapter = courseChapters.find(ch => ch.chapter_id === chapterId);
        if (!currentChapter) return;

        const nextChapter = courseChapters.find(ch => ch.chapter_order === currentChapter.chapter_order + 1);
        if (nextChapter) {
            // 检查下一章是否已经在进度中 (针对当前用户)
            const nextChapterExists = chapterProgress.some(p => p.chapter_id === nextChapter.chapter_id && p.user_id === currentUser.id);
            if (!nextChapterExists) {
                const enrollment = enrolledCourses.find(e => {
                    const course = allCourses.find(c => c.title === e.title);
                    return course?.id === courseId && e.userId === currentUser.id;
                });

                if (enrollment) {
                    const newProgress: UserChapterProgress = {
                        progress_id: chapterProgress.length + 1,
                        user_id: currentUser.id,
                        enrollment_id: enrollment.id,
                        chapter_id: nextChapter.chapter_id,
                        is_completed: false,
                        completed_date: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    setChapterProgress(prev => [...prev, newProgress]);
                }
            }
        }

        // 更新课程总进度
        updateCourseProgress(courseId);
    };

    // 计算并更新课程总进度
    const updateCourseProgress = (courseId: number) => {
        const enrollment = enrolledCourses.find(e => {
            const course = allCourses.find(c => c.title === e.title);
            return course?.id === courseId && e.userId === currentUser.id;
        });
        if (!enrollment) return;

        // 获取课程的所有章节
        const courseChapters = INITIAL_CHAPTERS.filter(ch => ch.course_id === courseId);
        const totalChapters = courseChapters.length;

        if (totalChapters === 0) return;

        // 计算完成的章节数 (仅计算当前用户的进度)
        const completedChapters = chapterProgress.filter(
            p => courseChapters.some(ch => ch.chapter_id === p.chapter_id) && p.is_completed && p.user_id === currentUser.id
        ).length;

        // 计算进度百分比
        const progress = Math.round((completedChapters / totalChapters) * 100);

        // 更新注册记录的进度
        setEnrolledCourses(prev => prev.map(e =>
            e.id === enrollment.id
                ? { ...e, progress, status: progress === 100 ? 'Completed' : 'In Progress' }
                : e
        ));
    };


    const handleDeleteCourse = (courseId: number) => {
        setCreatedCourses(prev => prev.map(c =>
            c.id === courseId ? { ...c, status: 'Deleted' } : c
        ));
    };

    const handleRecoverCourse = (courseId: number) => {
        setCreatedCourses(prev => prev.map(c =>
            c.id === courseId ? { ...c, status: 'Active' } : c
        ));
    };

    const handleCreateCourse = (newCourse: any) => {
        setCreatedCourses(prev => [...prev, newCourse]);
        // Also add to allCourses if it matches the format, or minimal format
        setAllCourses(prev => [...prev, {
            id: newCourse.id,
            title: newCourse.title,
            cuisine: newCourse.cuisine || 'Western', // Default
            image: newCourse.image
        }]);
    };

    const handleUpdateCourse = (updatedCourse: any) => {
        setCreatedCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
        setAllCourses(prev => prev.map(c => c.id === updatedCourse.id ? {
            ...c,
            title: updatedCourse.title,
            image: updatedCourse.image
        } : c));
    };

    const renderView = () => {
        switch (currentView) {
            case ViewState.LOGIN:
                return <LoginView setCurrentView={setCurrentView} setSelectedRole={setSelectedRole} setCurrentUser={setCurrentUser} />;
            case ViewState.REGISTER:
                return <RegisterView setCurrentView={setCurrentView} selectedRole={selectedRole} setSelectedRole={setSelectedRole} />;
            case ViewState.DASHBOARD:
                return (
                    <DashboardShell
                        setCurrentView={setCurrentView}
                        selectedRole={selectedRole}
                        allCourses={allCourses}
                        onJoinCourse={handleJoinCourse}  // 传递 handleJoinCourse
                        myCoursesSubpage={myCoursesSubpage}
                        setMyCoursesSubpage={setMyCoursesSubpage}
                        enrolledCourses={enrolledCourses.filter(e => e.userId === currentUser.id)}
                    />
                );
            case ViewState.MY_COURSES:
                return (
                    <MyCoursesView
                        setCurrentView={setCurrentView}
                        selectedRole={selectedRole}
                        setEditingCourse={setEditingCourse}
                        enrolledCourses={enrolledCourses.filter(e => e.userId === currentUser.id)}
                        createdCourses={createdCourses}
                        onUnenroll={handleUnenroll}
                        onDeleteCourse={handleDeleteCourse}
                        onRecoverCourse={handleRecoverCourse}
                        myCoursesSubpage={myCoursesSubpage}
                        setMyCoursesSubpage={setMyCoursesSubpage}
                    />
                );
            case ViewState.COURSE_DETAIL:
                return (
                    <CourseDetailView
                        setCurrentView={setCurrentView}
                        selectedRole={selectedRole}
                        selectedCourse={selectedCourse}
                        comments={comments}
                        onAddComment={handleAddComment}
                        myCoursesSubpage={myCoursesSubpage}
                        setMyCoursesSubpage={setMyCoursesSubpage}
                        isChapterUnlocked={isChapterUnlocked}
                        handleCompleteChapter={handleCompleteChapter}
                        chapterProgress={chapterProgress.filter(p => p.user_id === currentUser.id)}
                    />
                );
            case ViewState.ABOUT:
                return <AboutView setCurrentView={setCurrentView} />;
            case ViewState.CREATE_COURSE:
                return (
                    <CreateCourseView
                        setCurrentView={setCurrentView}
                        selectedRole={selectedRole}
                        editingCourse={editingCourse}
                        onCreateCourse={handleCreateCourse}
                        onUpdateCourse={handleUpdateCourse}
                        myCoursesSubpage={myCoursesSubpage}
                        setMyCoursesSubpage={setMyCoursesSubpage}
                        onClearEditing={() => setEditingCourse(null)}
                    />
                );

            case ViewState.USER_PROFILE:
                return <UserProfileView setCurrentView={setCurrentView} selectedRole={selectedRole} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} />;
            case ViewState.ANALYTICS_PERFORMANCE:
                return <AnalyticsView setCurrentView={setCurrentView} selectedRole={selectedRole} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} currentViewState={ViewState.ANALYTICS_PERFORMANCE} />;
            case ViewState.ANALYTICS_QUIZ:
                return <AnalyticsView setCurrentView={setCurrentView} selectedRole={selectedRole} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} currentViewState={ViewState.ANALYTICS_QUIZ} />;
            case ViewState.ANALYTICS_COMMENTS:
                return <AnalyticsView setCurrentView={setCurrentView} selectedRole={selectedRole} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} currentViewState={ViewState.ANALYTICS_COMMENTS} />;
            case ViewState.ANALYTICS:
                return <AnalyticsView setCurrentView={setCurrentView} selectedRole={selectedRole} myCoursesSubpage={myCoursesSubpage} setMyCoursesSubpage={setMyCoursesSubpage} currentViewState={ViewState.ANALYTICS_PERFORMANCE} />;
            case ViewState.ADMIN_USER_MANAGEMENT:
                return (
                    <AdminUserManagementView
                        setCurrentView={setCurrentView}
                        users={users}
                        onBanUser={handleBanUser}
                        onRecoverUser={handleRecoverUser}
                    />
                );
            case ViewState.ADMIN_SHARER_REGISTRATION:
                return (
                    <SharerRegistrationView
                        setCurrentView={setCurrentView}
                        registrations={registrations}
                        onAcceptRegistration={handleAcceptRegistration}
                        onRejectRegistration={handleRejectRegistration}
                        onUndoRegistration={handleUndoRegistration}
                    />
                );
            case ViewState.ADMIN_SHARER_REQUESTS:
                return (
                    <SharerRequestView
                        setCurrentView={setCurrentView}
                        requests={sharerRequests}
                        onAcceptRequest={handleAcceptRequest}
                        onRejectRequest={handleRejectRequest}
                        onUndoRequest={handleUndoRequest}
                    />
                );
            case ViewState.ADMIN_CONTENT_MANAGEMENT:
                return (
                    <AdminContentManagementView
                        setCurrentView={setCurrentView}
                        reportedContent={reportedContent}
                        onBanContent={handleBanContent}
                        onIgnoreContent={handleIgnoreContent}
                        onUndoContent={handleUndoContent}
                    />
                );
            case ViewState.ADMIN_PLATFORM_ANALYTICS:
                return <AdminPlatformAnalyticsView setCurrentView={setCurrentView} />;
            case ViewState.LANDING:
            default:
                return (
                    <div className="min-h-screen flex flex-col selection:bg-orange-200 selection:text-black">
                        <Navbar
                            onSignInClick={() => setCurrentView(ViewState.LOGIN)}
                            onLogoClick={() => setCurrentView(ViewState.LANDING)}
                            onAboutClick={() => setCurrentView(ViewState.ABOUT)}
                        />
                        <div className="flex-1">
                            <Hero onCtaClick={() => setCurrentView(ViewState.LOGIN)} />
                        </div>
                        <Footer />
                    </div>
                );
        }
    }

    return (
        <>
            <ClickSpark sparkColor='#FF8C66' sparkSize={10} sparkRadius={30} sparkCount={8} duration={0.5} />
            {renderView()}
        </>
    );
};

export default App;