// ============================================
// 类型定义
// ============================================

/**
 * 用户角色枚举
 */
export enum UserRole {
    GUEST = 'GUEST',
    LEARNER = 'LEARNER',
    SHARER = 'SHARER',
    ADMIN = 'ADMIN'
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
    ACTIVE = 'Active',
    BANNED = 'Banned'
}

/**
 * 课程状态枚举
 */
export enum CourseStatus {
    ACTIVE = 'Active',
    DELETED = 'Deleted'
}

/**
 * 学习状态枚举
 */
export enum EnrollmentStatus {
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed'
}

/**
 * 测验状态枚举
 */
export enum QuizStatus {
    PASSED = 'Passed',
    FAILED = 'Failed'
}

/**
 * 申请/举报状态枚举
 */
export enum RequestStatus {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
    IGNORED = 'Ignored',
    BANNED = 'Banned'
}

// ============================================
// 数据表接口定义
// ============================================

/**
 * 用户表 (Users)
 * 主键: user_id
 */
export interface User {
    user_id: number;
    username: string;
    email: string;
    password_hash: string;
    role: UserRole;
    status: UserStatus;
    joined_date: string; // ISO 8601 格式: YYYY-MM-DD
    created_at: string;  // ISO 8601 格式: YYYY-MM-DDTHH:mm:ss
    updated_at: string;
}

/**
 * 菜系表 (Cuisines)
 * 主键: cuisine_id
 */
export interface Cuisine {
    cuisine_id: number;
    cuisine_name: string;
    description: string | null;
    created_at: string;
}

/**
 * 课程表 (Courses)
 * 主键: course_id
 * 外键: cuisine_id → Cuisines, creator_id → Users
 */
export interface Course {
    course_id: number;
    title: string;
    description: string | null;
    cuisine_id: number;
    creator_id: number;
    duration: string | null;
    difficulty: number; // 1-5
    image_url: string | null;
    status: CourseStatus;
    created_date: string; // YYYY-MM-DD
    created_at: string;
    updated_at: string;
}

/**
 * 章节表 (Chapters)
 * 主键: chapter_id
 * 外键: course_id → Courses
 */
export interface Chapter {
    chapter_id: number;
    course_id: number;
    chapter_order: number;
    title: string;
    description: string | null;
    video_url: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * 问题表 (Questions)
 * 主键: question_id
 * 外键: chapter_id → Chapters
 */
export interface Question {
    question_id: number;
    chapter_id: number;
    question_text: string;
    question_order: number;
    created_at: string;
    updated_at: string;
}

/**
 * 答案表 (Answers)
 * 主键: answer_id
 * 外键: question_id → Questions
 */
export interface Answer {
    answer_id: number;
    question_id: number;
    answer_text: string;
    is_correct: boolean;
    answer_order: number;
    created_at: string;
}

/**
 * 课程注册表 (Enrollments)
 * 主键: enrollment_id
 * 外键: user_id → Users, course_id → Courses
 * 唯一约束: (user_id, course_id)
 */
export interface Enrollment {
    enrollment_id: number;
    user_id: number;
    course_id: number;
    enrollment_date: string; // YYYY-MM-DD
    progress: number; // 0-100
    status: EnrollmentStatus;
    created_at: string;
    updated_at: string;
}

/**
 * 测验结果表 (QuizResults)
 * 主键: result_id
 * 外键: user_id → Users, chapter_id → Chapters
 */
export interface QuizResult {
    result_id: number;
    user_id: number;
    chapter_id: number;
    score: number; // 0-100
    status: QuizStatus;
    completed_date: string; // YYYY-MM-DD
    created_at: string;
}

/**
 * 评论表 (Comments)
 * 主键: comment_id
 * 外键: course_id → Courses, user_id → Users
 */
export interface Comment {
    comment_id: number;
    course_id: number;
    user_id: number;
    comment_text: string;
    rating: number; // 1-5
    created_date: string; // YYYY-MM-DD
    created_at: string;
    updated_at: string;
}

/**
 * 分享者注册申请表 (SharerRegistrations)
 * 主键: registration_id
 * 外键: user_id → Users, reviewed_by → Users
 */
export interface SharerRegistration {
    registration_id: number;
    user_id: number;
    request_date: string; // YYYY-MM-DD
    proof_document: string | null;
    status: RequestStatus;
    reviewed_by: number | null;
    reviewed_date: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * 分享者权限请求表 (SharerRequests)
 * 主键: request_id
 * 外键: user_id → Users, reviewed_by → Users
 */
export interface SharerRequest {
    request_id: number;
    user_id: number;
    request_date: string; // YYYY-MM-DD
    status: RequestStatus;
    reviewed_by: number | null;
    reviewed_date: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * 举报内容表 (ReportedContent)
 * 主键: report_id
 * 外键: course_id → Courses, reporter_id → Users, reviewed_by → Users
 */
export interface ReportedContent {
    report_id: number;
    course_id: number;
    reporter_id: number;
    reason: string;
    report_date: string; // YYYY-MM-DD
    status: RequestStatus;
    reviewed_by: number | null;
    reviewed_date: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * 平台分析数据表 (PlatformAnalytics)
 * 主键: analytics_id
 */
export interface PlatformAnalytics {
    analytics_id: number;
    record_date: string; // YYYY-MM-DD
    new_users_count: number;
    total_users_count: number;
    active_courses_count: number;
    total_courses_count: number;
    created_at: string;
}

// ============================================
// 初始数据 (模拟数据库种子数据)
// ============================================

/**
 * 菜系初始数据
 */
export const INITIAL_CUISINES: Cuisine[] = [
    {
        cuisine_id: 1,
        cuisine_name: 'Chinese',
        description: '中华料理,包含炒菜、蒸菜等多种烹饪技法',
        created_at: new Date().toISOString()
    },
    {
        cuisine_id: 2,
        cuisine_name: 'Western',
        description: '西式料理,包含意大利、法式等多种风格',
        created_at: new Date().toISOString()
    },
    {
        cuisine_id: 3,
        cuisine_name: 'Japanese',
        description: '日本料理,注重食材原味和精致摆盘',
        created_at: new Date().toISOString()
    },
    {
        cuisine_id: 4,
        cuisine_name: 'Korean',
        description: '韩国料理,以辣味和发酵食品为特色',
        created_at: new Date().toISOString()
    }
];

/**
 * 用户初始数据
 * 测试账户:
 * - learner@gmail.com / 12345 (Learner角色)
 * - sharer@gmail.com / 12345 (Sharer角色)
 * - admin@gmail.com / 12345 (Admin角色)
 */
export const INITIAL_USERS: User[] = [
    {
        user_id: 1,
        username: 'Learner User',
        email: 'learner@gmail.com',
        password_hash: '12345', // 实际应用中应使用加密哈希
        role: UserRole.LEARNER,
        status: UserStatus.ACTIVE,
        joined_date: '2026-01-01',
        created_at: new Date('2026-01-01T08:00:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        user_id: 2,
        username: 'Sharer User',
        email: 'sharer@gmail.com',
        password_hash: '12345', // 实际应用中应使用加密哈希
        role: UserRole.SHARER,
        status: UserStatus.ACTIVE,
        joined_date: '2026-01-01',
        created_at: new Date('2026-01-01T08:00:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        user_id: 3,
        username: 'Admin User',
        email: 'admin@gmail.com',
        password_hash: '12345', // 实际应用中应使用加密哈希
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        joined_date: '2026-01-01',
        created_at: new Date('2026-01-01T08:00:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    // Real Users for Comments
    {
        user_id: 4,
        username: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        password_hash: '12345',
        role: UserRole.LEARNER,
        status: UserStatus.ACTIVE,
        joined_date: '2025-11-15',
        created_at: new Date('2025-11-15T10:00:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        user_id: 5,
        username: 'Emily Rodriguez',
        email: 'emily.r@example.com',
        password_hash: '12345',
        role: UserRole.LEARNER,
        status: UserStatus.ACTIVE,
        joined_date: '2025-12-05',
        created_at: new Date('2025-12-05T09:30:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        user_id: 6,
        username: 'David Kim',
        email: 'david.kim@example.com',
        password_hash: '12345',
        role: UserRole.LEARNER,
        status: UserStatus.ACTIVE,
        joined_date: '2026-01-10',
        created_at: new Date('2026-01-10T14:20:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        user_id: 7,
        username: 'Alex Nguyen',
        email: 'alex.n@example.com',
        password_hash: '12345',
        role: UserRole.LEARNER,
        status: UserStatus.ACTIVE,
        joined_date: '2026-01-12',
        created_at: new Date('2026-01-12T11:00:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        user_id: 8,
        username: 'Maya Patel',
        email: 'maya.p@example.com',
        password_hash: '12345',
        role: UserRole.LEARNER,
        status: UserStatus.ACTIVE,
        joined_date: '2026-01-20',
        created_at: new Date('2026-01-20T16:45:00').toISOString(),
        updated_at: new Date().toISOString()
    }
];

/**
 * 课程初始数据
 * 使用真实的课程标题和详细描述
 */
export const INITIAL_COURSES: Course[] = [
    {
        course_id: 1,
        title: 'Perfect Yangzhou Fried Rice Mastery',
        description: 'Master the art of creating authentic Yangzhou fried rice with perfectly separated grains, balanced flavors, and restaurant-quality presentation. Learn the secrets of wok hei and ingredient preparation.',
        cuisine_id: 1, // Chinese
        creator_id: 2, // Sharer User
        duration: '45 mins',
        difficulty: 3,
        image_url: '/images/courses/yangzhou-fried-rice.jpg',
        status: CourseStatus.ACTIVE,
        created_date: '2025-10-15',
        created_at: new Date('2025-10-15T09:00:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        course_id: 2,
        title: 'Authentic Kung Pao Chicken',
        description: 'Discover the authentic Sichuan flavors of Kung Pao Chicken. Learn to balance the numbing spice of Sichuan peppercorns with the perfect sauce consistency and tender chicken pieces.',
        cuisine_id: 1, // Chinese
        creator_id: 2, // Sharer User
        duration: '60 mins',
        difficulty: 4,
        image_url: '/images/courses/kung-pao-chicken.jpg',
        status: CourseStatus.DELETED,
        created_date: '2025-09-28',
        created_at: new Date('2025-09-28T14:30:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        course_id: 3,
        title: 'Classic Italian Carbonara',
        description: 'Create the perfect Roman-style carbonara with silky egg sauce, crispy guanciale, and al dente pasta. No cream needed - just authentic Italian technique and quality ingredients.',
        cuisine_id: 2, // Western
        creator_id: 2, // Sharer User
        duration: '50 mins',
        difficulty: 2,
        image_url: '/images/courses/carbonara.jpg',
        status: CourseStatus.ACTIVE,
        created_date: '2025-11-20',
        created_at: new Date('2025-11-20T10:15:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        course_id: 4,
        title: 'Gourmet Sandwich Techniques',
        description: 'Elevate your sandwich game with professional layering techniques, bread selection, and flavor pairing. From classic club to modern fusion creations.',
        cuisine_id: 2, // Western
        creator_id: 2, // Sharer User
        duration: '30 mins',
        difficulty: 1,
        image_url: '/images/courses/gourmet-sandwich.jpg',
        status: CourseStatus.DELETED,
        created_date: '2025-08-25',
        created_at: new Date('2025-08-25T11:00:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        course_id: 5,
        title: 'Japanese Katsu Curry from Scratch',
        description: 'Learn to make authentic Japanese curry roux from scratch, perfectly breaded tonkatsu, and fluffy Japanese rice. Complete with traditional accompaniments and plating techniques.',
        cuisine_id: 3, // Japanese
        creator_id: 2, // Sharer User
        duration: '70 mins',
        difficulty: 4,
        image_url: '/images/courses/katsu-curry.jpg',
        status: CourseStatus.ACTIVE,
        created_date: '2025-10-30',
        created_at: new Date('2025-10-30T13:20:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        course_id: 6,
        title: 'Traditional Korean Bibimbap',
        description: 'Master the art of Korean bibimbap with perfectly seasoned vegetables, marinated beef, crispy rice, and homemade gochujang sauce. Learn the traditional stone bowl technique.',
        cuisine_id: 4, // Korean
        creator_id: 2, // Sharer User
        duration: '55 mins',
        difficulty: 3,
        image_url: '/images/courses/bibimbap.jpg',
        status: CourseStatus.ACTIVE,
        created_date: '2025-12-05',
        created_at: new Date('2025-12-05T15:40:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        course_id: 7,
        title: 'Dim Sum Essentials: Dumplings & Buns',
        description: 'Create restaurant-quality dim sum at home. Master pleating techniques for dumplings, steaming methods for buns, and traditional filling recipes.',
        cuisine_id: 1, // Chinese
        creator_id: 2, // Sharer User
        duration: '90 mins',
        difficulty: 5,
        image_url: '/images/courses/dim-sum.jpg',
        status: CourseStatus.ACTIVE,
        created_date: '2026-01-08',
        created_at: new Date('2026-01-08T08:30:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        course_id: 8,
        title: 'Homemade Ramen Workshop',
        description: 'Build your ramen from the ground up: rich tonkotsu broth, perfect noodles, marinated eggs, and traditional toppings. A comprehensive guide to ramen mastery.',
        cuisine_id: 3, // Japanese
        creator_id: 2, // Sharer User
        duration: '120 mins',
        difficulty: 5,
        image_url: '/images/courses/ramen.jpg',
        status: CourseStatus.ACTIVE,
        created_date: '2025-11-12',
        created_at: new Date('2025-11-12T09:45:00').toISOString(),
        updated_at: new Date().toISOString()
    }
];

/**
 * 课程注册初始数据
 */
export const INITIAL_ENROLLMENTS: Enrollment[] = Array.from({ length: 8 }, (_, i) => ({
    enrollment_id: i + 1,
    user_id: 1, // Learner 1
    course_id: (i % 6) + 1,
    enrollment_date: '2026-03-13',
    progress: 60,
    status: EnrollmentStatus.IN_PROGRESS,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
}));

/**
 * 评论初始数据
 * 使用真实的用户评论内容
 */
export const INITIAL_COMMENTS: Comment[] = [
    // Course 1: Yangzhou Fried Rice
    {
        comment_id: 1,
        course_id: 1,
        user_id: 4, // Sarah Chen
        comment_text: 'This course completely transformed my fried rice game! The wok hei technique is a game-changer. My family can\'t believe I made this at home!',
        rating: 5,
        created_date: '2025-12-20',
        created_at: new Date('2025-12-20T19:30:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        comment_id: 2,
        course_id: 1,
        user_id: 5, // Emily Rodriguez
        comment_text: 'Great tutorial overall, but the pacing was a bit fast during the stir-frying section. Would love to see more close-up shots of the technique.',
        rating: 4,
        created_date: '2025-12-28',
        created_at: new Date('2025-12-28T14:15:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        comment_id: 8,
        course_id: 1,
        user_id: 6, // David Kim
        comment_text: 'The tips on egg preparation were exactly what I needed. My rice is finally golden and separate!',
        rating: 5,
        created_date: '2026-01-05',
        created_at: new Date('2026-01-05T18:45:00').toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 3: Carbonara
    {
        comment_id: 3,
        course_id: 3,
        user_id: 6, // David Kim
        comment_text: 'Finally! An authentic carbonara recipe without cream. Chef Isabella explains the emulsification process so clearly. Perfetto!',
        rating: 5,
        created_date: '2026-01-15',
        created_at: new Date('2026-01-15T20:45:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        comment_id: 9,
        course_id: 3,
        user_id: 7, // Alex Nguyen
        comment_text: 'Delicious result, but be careful with the salt since different brands of pecorino can vary in saltiness.',
        rating: 4,
        created_date: '2026-01-20',
        created_at: new Date('2026-01-20T12:30:00').toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 5: Katsu Curry
    {
        comment_id: 4,
        course_id: 5,
        user_id: 7, // Alex Nguyen
        comment_text: 'The katsu curry turned out amazing! Making the roux from scratch takes time but it\'s so worth it. The depth of flavor is incredible.',
        rating: 5,
        created_date: '2026-01-18',
        created_at: new Date('2026-01-18T18:20:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        comment_id: 10,
        course_id: 5,
        user_id: 8, // Maya Patel
        comment_text: 'My pork cutlets came out super crispy. The double frying method mentioned in the Q&A section really helps.',
        rating: 5,
        created_date: '2026-02-02',
        created_at: new Date('2026-02-02T19:10:00').toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 6: Bibimbap
    {
        comment_id: 5,
        course_id: 6,
        user_id: 8, // Maya Patel
        comment_text: 'Love the bibimbap recipe! The gochujang sauce recipe alone is worth the course. Would appreciate more tips on getting the rice crispy in a regular pan.',
        rating: 4,
        created_date: '2026-01-25',
        created_at: new Date('2026-01-25T12:30:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        comment_id: 11,
        course_id: 6,
        user_id: 4, // Sarah Chen
        comment_text: 'Healthy, colorful, and delicious. A bit of work to chop all the veggies, but great for meal prep.',
        rating: 5,
        created_date: '2026-01-28',
        created_at: new Date('2026-01-28T09:15:00').toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 7: Dim Sum
    {
        comment_id: 6,
        course_id: 7,
        user_id: 4, // Sarah Chen
        comment_text: 'The dim sum course is challenging but incredibly rewarding. My har gow came out restaurant-quality after a few practice rounds!',
        rating: 5,
        created_date: '2026-02-01',
        created_at: new Date('2026-02-01T16:00:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        comment_id: 12,
        course_id: 7,
        user_id: 5, // Emily Rodriguez
        comment_text: 'The dough recipe is spot on. I struggled a bit with the pleating, but the video slow-motion replay was very helpful.',
        rating: 4,
        created_date: '2026-02-05',
        created_at: new Date('2026-02-05T14:20:00').toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 8: Ramen
    {
        comment_id: 7,
        course_id: 8,
        user_id: 5, // Emily Rodriguez
        comment_text: 'This ramen workshop is intensive but absolutely worth every minute. The tonkotsu broth recipe is pure gold. Chef Tanaka is a master!',
        rating: 5,
        created_date: '2026-02-03',
        created_at: new Date('2026-02-03T21:10:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        comment_id: 13,
        course_id: 8,
        user_id: 6, // David Kim
        comment_text: 'Best homemade ramen I have ever made. The chashu pork melts in your mouth.',
        rating: 5,
        created_date: '2026-02-06',
        created_at: new Date('2026-02-06T11:50:00').toISOString(),
        updated_at: new Date().toISOString()
    }
];

/**
 * 测验结果初始数据
 */
export const INITIAL_QUIZ_RESULTS: QuizResult[] = Array.from({ length: 8 }, (_, i) => ({
    result_id: i + 1,
    user_id: 1,
    chapter_id: i + 1,
    score: 60,
    status: i === 1 ? QuizStatus.FAILED : QuizStatus.PASSED,
    completed_date: '2026-03-13',
    created_at: new Date().toISOString()
}));

/**
 * 分享者注册申请初始数据
 * 使用真实的用户引用
 */
export const INITIAL_SHARER_REGISTRATIONS: SharerRegistration[] = [
    {
        registration_id: 1,
        user_id: 1, // sarah_chen
        request_date: '2025-12-01',
        proof_document: 'culinary_certificate_sarah_chen.pdf',
        status: RequestStatus.PENDING,
        reviewed_by: null,
        reviewed_date: null,
        created_at: new Date('2025-12-01T10:00:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        registration_id: 2,
        user_id: 2, // Sharer User (已批准)
        request_date: '2025-09-15',
        proof_document: 'professional_chef_license_marcus.pdf',
        status: RequestStatus.ACCEPTED,
        reviewed_by: null,
        reviewed_date: '2025-09-20',
        created_at: new Date('2025-09-15T14:30:00').toISOString(),
        updated_at: new Date('2025-09-20T09:00:00').toISOString()
    },
    {
        registration_id: 3,
        user_id: 3, // emily_rodriguez
        request_date: '2025-12-10',
        proof_document: 'cooking_school_diploma_emily.pdf',
        status: RequestStatus.REJECTED,
        reviewed_by: null,
        reviewed_date: '2025-12-15',
        created_at: new Date('2025-12-10T11:20:00').toISOString(),
        updated_at: new Date('2025-12-15T16:30:00').toISOString()
    },
    {
        registration_id: 4,
        user_id: 7, // alex_nguyen
        request_date: '2026-01-05',
        proof_document: 'culinary_portfolio_alex.pdf',
        status: RequestStatus.PENDING,
        reviewed_by: null,
        reviewed_date: null,
        created_at: new Date('2026-01-05T09:15:00').toISOString(),
        updated_at: new Date().toISOString()
    }
];

/**
 * 分享者权限请求初始数据
 * 使用真实的用户引用
 */
export const INITIAL_SHARER_REQUESTS: SharerRequest[] = [
    {
        request_id: 1,
        user_id: 5, // david_kim
        request_date: '2026-01-20',
        status: RequestStatus.PENDING,
        reviewed_by: null,
        reviewed_date: null,
        created_at: new Date('2026-01-20T10:30:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        request_id: 2,
        user_id: 2, // Sharer User (已批准)
        request_date: '2025-08-10',
        status: RequestStatus.ACCEPTED,
        reviewed_by: null,
        reviewed_date: '2025-08-15',
        created_at: new Date('2025-08-10T09:00:00').toISOString(),
        updated_at: new Date('2025-08-15T14:20:00').toISOString()
    },
    {
        request_id: 3,
        user_id: 7, // alex_nguyen
        request_date: '2025-12-15',
        status: RequestStatus.REJECTED,
        reviewed_by: null,
        reviewed_date: '2025-12-20',
        created_at: new Date('2025-12-15T11:45:00').toISOString(),
        updated_at: new Date('2025-12-20T10:00:00').toISOString()
    },
    {
        request_id: 4,
        user_id: 8, // maya_patel
        request_date: '2026-02-01',
        status: RequestStatus.PENDING,
        reviewed_by: null,
        reviewed_date: null,
        created_at: new Date('2026-02-01T15:20:00').toISOString(),
        updated_at: new Date().toISOString()
    }
];

/**
 * 举报内容初始数据
 * 使用真实的用户和课程引用
 */
export const INITIAL_REPORTED_CONTENT: ReportedContent[] = [
    {
        report_id: 1,
        course_id: 1, // Perfect Yangzhou Fried Rice Mastery
        reporter_id: 3, // emily_rodriguez
        reason: 'Video quality is poor in some sections, making it hard to see the technique clearly.',
        report_date: '2026-01-10',
        status: RequestStatus.PENDING,
        reviewed_by: null,
        reviewed_date: null,
        created_at: new Date('2026-01-10T14:20:00').toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        report_id: 2,
        course_id: 2, // Authentic Kung Pao Chicken (已删除)
        reporter_id: 5, // david_kim
        reason: 'Recipe measurements are inconsistent with the video demonstration.',
        report_date: '2025-11-05',
        status: RequestStatus.IGNORED,
        reviewed_by: null,
        reviewed_date: '2025-11-10',
        created_at: new Date('2025-11-05T16:30:00').toISOString(),
        updated_at: new Date('2025-11-10T09:15:00').toISOString()
    },
    {
        report_id: 3,
        course_id: 3, // Classic Italian Carbonara
        reporter_id: 7, // alex_nguyen
        reason: 'Minor audio sync issues in chapter 2.',
        report_date: '2026-01-22',
        status: RequestStatus.IGNORED,
        reviewed_by: null,
        reviewed_date: '2026-01-25',
        created_at: new Date('2026-01-22T11:00:00').toISOString(),
        updated_at: new Date('2026-01-25T13:40:00').toISOString()
    },
    {
        report_id: 4,
        course_id: 5, // Japanese Katsu Curry from Scratch
        reporter_id: 1, // sarah_chen
        reason: 'Missing ingredient in the shopping list - curry powder amount not specified.',
        report_date: '2026-01-28',
        status: RequestStatus.IGNORED,
        reviewed_by: null,
        reviewed_date: '2026-01-30',
        created_at: new Date('2026-01-28T10:15:00').toISOString(),
        updated_at: new Date('2026-01-30T14:00:00').toISOString()
    },
    {
        report_id: 5,
        course_id: 7, // Dim Sum Essentials
        reporter_id: 8, // maya_patel
        reason: 'Inappropriate content - contains copyrighted background music.',
        report_date: '2026-02-02',
        status: RequestStatus.BANNED,
        reviewed_by: null,
        reviewed_date: '2026-02-03',
        created_at: new Date('2026-02-02T09:30:00').toISOString(),
        updated_at: new Date('2026-02-03T11:20:00').toISOString()
    }
];

/**
 * 平台分析数据初始数据 (2026年每月数据)
 */
export const INITIAL_PLATFORM_ANALYTICS: PlatformAnalytics[] = [
    { analytics_id: 1, record_date: '2026-01-31', new_users_count: 20, total_users_count: 20, active_courses_count: 5, total_courses_count: 5, created_at: new Date().toISOString() },
    { analytics_id: 2, record_date: '2026-02-28', new_users_count: 22, total_users_count: 42, active_courses_count: 8, total_courses_count: 8, created_at: new Date().toISOString() },
    { analytics_id: 3, record_date: '2026-03-31', new_users_count: 18, total_users_count: 60, active_courses_count: 10, total_courses_count: 10, created_at: new Date().toISOString() },
    { analytics_id: 4, record_date: '2026-04-30', new_users_count: 30, total_users_count: 90, active_courses_count: 15, total_courses_count: 15, created_at: new Date().toISOString() },
    { analytics_id: 5, record_date: '2026-05-31', new_users_count: 42, total_users_count: 132, active_courses_count: 20, total_courses_count: 20, created_at: new Date().toISOString() },
    { analytics_id: 6, record_date: '2026-06-30', new_users_count: 15, total_users_count: 147, active_courses_count: 22, total_courses_count: 22, created_at: new Date().toISOString() },
    { analytics_id: 7, record_date: '2026-07-31', new_users_count: 55, total_users_count: 202, active_courses_count: 30, total_courses_count: 30, created_at: new Date().toISOString() },
    { analytics_id: 8, record_date: '2026-08-31', new_users_count: 65, total_users_count: 267, active_courses_count: 35, total_courses_count: 35, created_at: new Date().toISOString() },
    { analytics_id: 9, record_date: '2026-09-30', new_users_count: 95, total_users_count: 362, active_courses_count: 45, total_courses_count: 45, created_at: new Date().toISOString() },
    { analytics_id: 10, record_date: '2026-10-31', new_users_count: 100, total_users_count: 462, active_courses_count: 50, total_courses_count: 50, created_at: new Date().toISOString() },
    { analytics_id: 11, record_date: '2026-11-30', new_users_count: 102, total_users_count: 564, active_courses_count: 55, total_courses_count: 55, created_at: new Date().toISOString() },
    { analytics_id: 12, record_date: '2026-12-31', new_users_count: 105, total_users_count: 669, active_courses_count: 60, total_courses_count: 60, created_at: new Date().toISOString() }
];

// ============================================
// 辅助常量
// ============================================

/**
 * 月份名称 (用于UI显示)
 */
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * 菜系统计数据 (从 Courses 表聚合计算)
 */
export const getCuisineStatistics = (): { label: string; value: number }[] => {
    const stats = INITIAL_CUISINES.map(cuisine => {
        const count = INITIAL_COURSES.filter(
            course => course.cuisine_id === cuisine.cuisine_id && course.status === CourseStatus.ACTIVE
        ).length;
        return {
            label: cuisine.cuisine_name.toUpperCase(),
            value: count * 200 // 模拟用户数量
        };
    });
    return stats;
};

/**
 * 用户角色统计数据 (从 Users 表聚合计算)
 */
export const getUserRoleStatistics = (): { label: string; value: number; color: string }[] => {
    const learnerCount = INITIAL_USERS.filter(u => u.role === UserRole.LEARNER).length;
    const sharerCount = INITIAL_USERS.filter(u => u.role === UserRole.SHARER).length;
    const adminCount = INITIAL_USERS.filter(u => u.role === UserRole.ADMIN).length;

    return [
        { label: 'Learner', value: learnerCount * 300, color: '#FF8C66' },
        { label: 'Sharer', value: sharerCount * 200, color: '#FFB399' },
        { label: 'Admin', value: adminCount * 100, color: '#FCD5CE' }
    ];
};

/**
 * 注册趋势数据 (从 PlatformAnalytics 表提取)
 */
export const getRegistrationTrendData = (): number[] => {
    return INITIAL_PLATFORM_ANALYTICS.map(record => record.new_users_count);
};

// ============================================================================
// 章节数据和进度追踪
// ============================================================================

/**
 * 用户章节进度表 (UserChapterProgress)
 * 用于追踪用户在每个章节的完成状态
 */
export interface UserChapterProgress {
    progress_id: number;
    user_id: number;
    enrollment_id: number;
    chapter_id: number;
    is_completed: boolean;
    completed_date: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * 章节数据 (INITIAL_CHAPTERS)
 * 包含所有课程的章节信息
 */
export const INITIAL_CHAPTERS: Chapter[] = [
    // ========== Course 1: Perfect Yangzhou Fried Rice Mastery (4 chapters) ==========
    {
        chapter_id: 1,
        course_id: 1,
        chapter_order: 1,
        title: "Introduction to Yangzhou Fried Rice",
        description: "Learn the history and cultural significance of this classic Chinese dish",
        video_url: "https://www.youtube.com/watch?v=example1",
        created_at: "2026-01-15T10:00:00Z",
        updated_at: "2026-01-15T10:00:00Z"
    },
    {
        chapter_id: 2,
        course_id: 1,
        chapter_order: 2,
        title: "Ingredient Selection and Preparation",
        description: "Master the art of selecting and preparing the perfect ingredients",
        video_url: "https://www.youtube.com/watch?v=example2",
        created_at: "2026-01-15T10:00:00Z",
        updated_at: "2026-01-15T10:00:00Z"
    },
    {
        chapter_id: 3,
        course_id: 1,
        chapter_order: 3,
        title: "Wok Techniques and Cooking",
        description: "Learn the essential wok techniques for perfect fried rice",
        video_url: "https://www.youtube.com/watch?v=example3",
        created_at: "2026-01-15T10:00:00Z",
        updated_at: "2026-01-15T10:00:00Z"
    },
    {
        chapter_id: 4,
        course_id: 1,
        chapter_order: 4,
        title: "Plating and Final Touches",
        description: "Make your dish restaurant-quality with professional plating",
        video_url: "https://www.youtube.com/watch?v=example4",
        created_at: "2026-01-15T10:00:00Z",
        updated_at: "2026-01-15T10:00:00Z"
    },

    // ========== Course 2: Authentic Kung Pao Chicken (5 chapters) ==========
    {
        chapter_id: 5,
        course_id: 2,
        chapter_order: 1,
        title: "Understanding Kung Pao Chicken",
        description: "Explore the origins and variations of this Sichuan classic",
        video_url: "https://www.youtube.com/watch?v=example5",
        created_at: "2026-01-16T10:00:00Z",
        updated_at: "2026-01-16T10:00:00Z"
    },
    {
        chapter_id: 6,
        course_id: 2,
        chapter_order: 2,
        title: "Marinating and Velveting Chicken",
        description: "Learn the secret to tender, juicy chicken",
        video_url: "https://www.youtube.com/watch?v=example6",
        created_at: "2026-01-16T10:00:00Z",
        updated_at: "2026-01-16T10:00:00Z"
    },
    {
        chapter_id: 7,
        course_id: 2,
        chapter_order: 3,
        title: "Preparing the Kung Pao Sauce",
        description: "Create the perfect balance of sweet, sour, and spicy",
        video_url: "https://www.youtube.com/watch?v=example7",
        created_at: "2026-01-16T10:00:00Z",
        updated_at: "2026-01-16T10:00:00Z"
    },
    {
        chapter_id: 8,
        course_id: 2,
        chapter_order: 4,
        title: "Stir-Frying Techniques",
        description: "Master high-heat wok cooking for authentic flavor",
        video_url: "https://www.youtube.com/watch?v=example8",
        created_at: "2026-01-16T10:00:00Z",
        updated_at: "2026-01-16T10:00:00Z"
    },
    {
        chapter_id: 9,
        course_id: 2,
        chapter_order: 5,
        title: "Assembly and Garnishing",
        description: "Bring it all together with proper assembly and presentation",
        video_url: "https://www.youtube.com/watch?v=example9",
        created_at: "2026-01-16T10:00:00Z",
        updated_at: "2026-01-16T10:00:00Z"
    },

    // ========== Course 3: Classic Italian Carbonara (3 chapters) ==========
    {
        chapter_id: 10,
        course_id: 3,
        chapter_order: 1,
        title: "Carbonara Fundamentals",
        description: "Learn the authentic Roman recipe and common mistakes to avoid",
        video_url: "https://www.youtube.com/watch?v=example10",
        created_at: "2026-01-17T10:00:00Z",
        updated_at: "2026-01-17T10:00:00Z"
    },
    {
        chapter_id: 11,
        course_id: 3,
        chapter_order: 2,
        title: "Cooking Pasta and Guanciale",
        description: "Perfect pasta texture and crispy guanciale technique",
        video_url: "https://www.youtube.com/watch?v=example11",
        created_at: "2026-01-17T10:00:00Z",
        updated_at: "2026-01-17T10:00:00Z"
    },
    {
        chapter_id: 12,
        course_id: 3,
        chapter_order: 3,
        title: "Creating the Creamy Sauce",
        description: "Master the egg and cheese emulsion without scrambling",
        video_url: "https://www.youtube.com/watch?v=example12",
        created_at: "2026-01-17T10:00:00Z",
        updated_at: "2026-01-17T10:00:00Z"
    },

    // ========== Course 4: Gourmet Sandwich Techniques (3 chapters) ==========
    {
        chapter_id: 13,
        course_id: 4,
        chapter_order: 1,
        title: "Bread Selection and Toasting",
        description: "Choose the right bread and achieve perfect toasting",
        video_url: "https://www.youtube.com/watch?v=example13",
        created_at: "2026-01-18T10:00:00Z",
        updated_at: "2026-01-18T10:00:00Z"
    },
    {
        chapter_id: 14,
        course_id: 4,
        chapter_order: 2,
        title: "Layering and Flavor Balance",
        description: "Learn the art of ingredient layering for maximum flavor",
        video_url: "https://www.youtube.com/watch?v=example14",
        created_at: "2026-01-18T10:00:00Z",
        updated_at: "2026-01-18T10:00:00Z"
    },
    {
        chapter_id: 15,
        course_id: 4,
        chapter_order: 3,
        title: "Spreads and Condiments",
        description: "Create gourmet spreads and choose complementary condiments",
        video_url: "https://www.youtube.com/watch?v=example15",
        created_at: "2026-01-18T10:00:00Z",
        updated_at: "2026-01-18T10:00:00Z"
    },

    // ========== Course 5: Japanese Katsu Curry from Scratch (5 chapters) ==========
    {
        chapter_id: 16,
        course_id: 5,
        chapter_order: 1,
        title: "Japanese Curry Basics",
        description: "Understanding Japanese curry and its unique characteristics",
        video_url: "https://www.youtube.com/watch?v=example16",
        created_at: "2026-01-19T10:00:00Z",
        updated_at: "2026-01-19T10:00:00Z"
    },
    {
        chapter_id: 17,
        course_id: 5,
        chapter_order: 2,
        title: "Making Curry Roux from Scratch",
        description: "Create authentic curry roux with the perfect spice blend",
        video_url: "https://www.youtube.com/watch?v=example17",
        created_at: "2026-01-19T10:00:00Z",
        updated_at: "2026-01-19T10:00:00Z"
    },
    {
        chapter_id: 18,
        course_id: 5,
        chapter_order: 3,
        title: "Preparing the Perfect Katsu",
        description: "Breading and frying techniques for crispy, juicy katsu",
        video_url: "https://www.youtube.com/watch?v=example18",
        created_at: "2026-01-19T10:00:00Z",
        updated_at: "2026-01-19T10:00:00Z"
    },
    {
        chapter_id: 19,
        course_id: 5,
        chapter_order: 4,
        title: "Cooking the Curry Sauce",
        description: "Simmer and develop deep, rich curry flavors",
        video_url: "https://www.youtube.com/watch?v=example19",
        created_at: "2026-01-19T10:00:00Z",
        updated_at: "2026-01-19T10:00:00Z"
    },
    {
        chapter_id: 20,
        course_id: 5,
        chapter_order: 5,
        title: "Plating and Serving",
        description: "Traditional Japanese plating and accompaniments",
        video_url: "https://www.youtube.com/watch?v=example20",
        created_at: "2026-01-19T10:00:00Z",
        updated_at: "2026-01-19T10:00:00Z"
    },

    // ========== Course 6: Traditional Korean Bibimbap (4 chapters) ==========
    {
        chapter_id: 21,
        course_id: 6,
        chapter_order: 1,
        title: "Bibimbap Components Overview",
        description: "Understanding the harmony of ingredients in bibimbap",
        video_url: "https://www.youtube.com/watch?v=example21",
        created_at: "2026-01-20T10:00:00Z",
        updated_at: "2026-01-20T10:00:00Z"
    },
    {
        chapter_id: 22,
        course_id: 6,
        chapter_order: 2,
        title: "Preparing Namul (Seasoned Vegetables)",
        description: "Learn to prepare and season traditional Korean vegetables",
        video_url: "https://www.youtube.com/watch?v=example22",
        created_at: "2026-01-20T10:00:00Z",
        updated_at: "2026-01-20T10:00:00Z"
    },
    {
        chapter_id: 23,
        course_id: 6,
        chapter_order: 3,
        title: "Making Gochujang Sauce",
        description: "Create the perfect spicy-sweet gochujang sauce",
        video_url: "https://www.youtube.com/watch?v=example23",
        created_at: "2026-01-20T10:00:00Z",
        updated_at: "2026-01-20T10:00:00Z"
    },
    {
        chapter_id: 24,
        course_id: 6,
        chapter_order: 4,
        title: "Assembly and Presentation",
        description: "Arrange ingredients beautifully and serve in hot stone bowl",
        video_url: "https://www.youtube.com/watch?v=example24",
        created_at: "2026-01-20T10:00:00Z",
        updated_at: "2026-01-20T10:00:00Z"
    },

    // ========== Course 7: Dim Sum Essentials (6 chapters) ==========
    {
        chapter_id: 25,
        course_id: 7,
        chapter_order: 1,
        title: "Introduction to Dim Sum",
        description: "History and varieties of traditional Cantonese dim sum",
        video_url: "https://www.youtube.com/watch?v=example25",
        created_at: "2026-01-21T10:00:00Z",
        updated_at: "2026-01-21T10:00:00Z"
    },
    {
        chapter_id: 26,
        course_id: 7,
        chapter_order: 2,
        title: "Making Dumpling Wrappers",
        description: "Create thin, delicate wrappers from scratch",
        video_url: "https://www.youtube.com/watch?v=example26",
        created_at: "2026-01-21T10:00:00Z",
        updated_at: "2026-01-21T10:00:00Z"
    },
    {
        chapter_id: 27,
        course_id: 7,
        chapter_order: 3,
        title: "Preparing Fillings",
        description: "Traditional fillings for har gow, siu mai, and more",
        video_url: "https://www.youtube.com/watch?v=example27",
        created_at: "2026-01-21T10:00:00Z",
        updated_at: "2026-01-21T10:00:00Z"
    },
    {
        chapter_id: 28,
        course_id: 7,
        chapter_order: 4,
        title: "Folding Techniques",
        description: "Master the art of pleating and shaping dim sum",
        video_url: "https://www.youtube.com/watch?v=example28",
        created_at: "2026-01-21T10:00:00Z",
        updated_at: "2026-01-21T10:00:00Z"
    },
    {
        chapter_id: 29,
        course_id: 7,
        chapter_order: 5,
        title: "Steaming Methods",
        description: "Proper steaming techniques for perfect texture",
        video_url: "https://www.youtube.com/watch?v=example29",
        created_at: "2026-01-21T10:00:00Z",
        updated_at: "2026-01-21T10:00:00Z"
    },
    {
        chapter_id: 30,
        course_id: 7,
        chapter_order: 6,
        title: "Dipping Sauces and Serving",
        description: "Traditional sauces and dim sum etiquette",
        video_url: "https://www.youtube.com/watch?v=example30",
        created_at: "2026-01-21T10:00:00Z",
        updated_at: "2026-01-21T10:00:00Z"
    },

    // ========== Course 8: Homemade Ramen Workshop (6 chapters) ==========
    {
        chapter_id: 31,
        course_id: 8,
        chapter_order: 1,
        title: "Ramen Styles and Components",
        description: "Understanding different ramen styles and their components",
        video_url: "https://www.youtube.com/watch?v=example31",
        created_at: "2026-01-22T10:00:00Z",
        updated_at: "2026-01-22T10:00:00Z"
    },
    {
        chapter_id: 32,
        course_id: 8,
        chapter_order: 2,
        title: "Making Ramen Broth",
        description: "Create rich, flavorful tonkotsu or shoyu broth",
        video_url: "https://www.youtube.com/watch?v=example32",
        created_at: "2026-01-22T10:00:00Z",
        updated_at: "2026-01-22T10:00:00Z"
    },
    {
        chapter_id: 33,
        course_id: 8,
        chapter_order: 3,
        title: "Preparing Fresh Ramen Noodles",
        description: "Make authentic alkaline noodles with perfect texture",
        video_url: "https://www.youtube.com/watch?v=example33",
        created_at: "2026-01-22T10:00:00Z",
        updated_at: "2026-01-22T10:00:00Z"
    },
    {
        chapter_id: 34,
        course_id: 8,
        chapter_order: 4,
        title: "Chashu Pork and Ajitsuke Tamago",
        description: "Prepare traditional ramen toppings",
        video_url: "https://www.youtube.com/watch?v=example34",
        created_at: "2026-01-22T10:00:00Z",
        updated_at: "2026-01-22T10:00:00Z"
    },
    {
        chapter_id: 35,
        course_id: 8,
        chapter_order: 5,
        title: "Tare and Aromatic Oil",
        description: "Create the flavor base and finishing oil",
        video_url: "https://www.youtube.com/watch?v=example35",
        created_at: "2026-01-22T10:00:00Z",
        updated_at: "2026-01-22T10:00:00Z"
    },
    {
        chapter_id: 36,
        course_id: 8,
        chapter_order: 6,
        title: "Assembly and Presentation",
        description: "Bring all components together for the perfect bowl",
        video_url: "https://www.youtube.com/watch?v=example36",
        created_at: "2026-01-22T10:00:00Z",
        updated_at: "2026-01-22T10:00:00Z"
    }
];

/**
 * 初始章节进度数据 (INITIAL_CHAPTER_PROGRESS)
 * 初始为空,用户加入课程后动态创建
 */
export const INITIAL_CHAPTER_PROGRESS: UserChapterProgress[] = [];

/**
 * 初始测验题目数据 (INITIAL_QUESTIONS)
 */
export const INITIAL_QUESTIONS: Question[] = [
    // Course 1: Perfect Yangzhou Fried Rice Mastery - Chapter 1
    {
        question_id: 1,
        chapter_id: 1,
        question_text: "What is the key authentic characteristic of Yangzhou Fried Rice?",
        question_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        question_id: 2,
        chapter_id: 1,
        question_text: "Which ingredient is NOT typically found in authentic Yangzhou Fried Rice?",
        question_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 3: Classic Italian Carbonara - Chapter 10
    {
        question_id: 3,
        chapter_id: 10,
        question_text: "What is the traditional meat used in Carbonara?",
        question_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        question_id: 4,
        chapter_id: 10,
        question_text: "Which ingredient should NEVER be added to authentic Roman Carbonara?",
        question_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 5: Japanese Katsu Curry from Scratch - Chapter 16
    {
        question_id: 5,
        chapter_id: 16,
        question_text: "What gives Japanese curry its distinct thickness?",
        question_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        question_id: 6,
        chapter_id: 16,
        question_text: "Which vegetable trifecta is standard in Japanese curry?",
        question_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 6: Traditional Korean Bibimbap - Chapter 21
    {
        question_id: 7,
        chapter_id: 21,
        question_text: "What does \"Bibimbap\" literally translate to?",
        question_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        question_id: 8,
        chapter_id: 21,
        question_text: "What specific sauce is essential for Bibimbap?",
        question_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 7: Dim Sum Essentials: Dumplings & Buns - Chapter 25
    {
        question_id: 9,
        chapter_id: 25,
        question_text: "What is the primary starch used for Har Gow (Crystal Shrimp Dumpling) skins?",
        question_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        question_id: 10,
        chapter_id: 25,
        question_text: "What is the philosophical meaning of \"Dim Sum\"?",
        question_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },

    // Course 8: Homemade Ramen Workshop - Chapter 31
    {
        question_id: 11,
        chapter_id: 31,
        question_text: "What ingredient gives ramen noodles their yellow color and chewy texture?",
        question_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        question_id: 12,
        chapter_id: 31,
        question_text: "Which of these is NOT a standard Ramen broth base type?",
        question_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

/**
 * 初始测验答案数据 (INITIAL_ANSWERS)
 */
export const INITIAL_ANSWERS: Answer[] = [
    // Q1
    { answer_id: 1, question_id: 1, answer_text: "Soy sauce heavy color", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 2, question_id: 1, answer_text: "Gold wrapped silver", is_correct: false, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 3, question_id: 1, answer_text: "Perfectly separated grains with distinct ingredients", is_correct: true, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 4, question_id: 1, answer_text: "Sticky and clumpy texture", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q2
    { answer_id: 5, question_id: 2, answer_text: "Shrimp", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 6, question_id: 2, answer_text: "Sea Cucumber", is_correct: false, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 7, question_id: 2, answer_text: "Chili Paste", is_correct: true, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 8, question_id: 2, answer_text: "Ham", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q3
    { answer_id: 9, question_id: 3, answer_text: "Bacon", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 10, question_id: 3, answer_text: "Pancetta", is_correct: false, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 11, question_id: 3, answer_text: "Guanciale", is_correct: true, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 12, question_id: 3, answer_text: "Prosciutto", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q4
    { answer_id: 13, question_id: 4, answer_text: "Pecorino Romano", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 14, question_id: 4, answer_text: "Cream", is_correct: true, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 15, question_id: 4, answer_text: "Black Pepper", is_correct: false, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 16, question_id: 4, answer_text: "Egg Yolks", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q5
    { answer_id: 17, question_id: 5, answer_text: "Cornstarch slurry", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 18, question_id: 5, answer_text: "A roux made of flavor and oil", is_correct: true, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 19, question_id: 5, answer_text: "Heavy cream", is_correct: false, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 20, question_id: 5, answer_text: "Mashed potatoes", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q6
    { answer_id: 21, question_id: 6, answer_text: "Onions, Carrots, Potatoes", is_correct: true, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 22, question_id: 6, answer_text: "Peppers, Onions, Celery", is_correct: false, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 23, question_id: 6, answer_text: "Spinach, Broccoli, Peas", is_correct: false, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 24, question_id: 6, answer_text: "Corn, Beans, Tomatoes", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q7
    { answer_id: 25, question_id: 7, answer_text: "Mixed Rice", is_correct: true, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 26, question_id: 7, answer_text: "Fried Rice", is_correct: false, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 27, question_id: 7, answer_text: "Stone Bowl", is_correct: false, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 28, question_id: 7, answer_text: "Spicy Rice", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q8
    { answer_id: 29, question_id: 8, answer_text: "Soy Sauce", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 30, question_id: 8, answer_text: "Gochujang", is_correct: true, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 31, question_id: 8, answer_text: "Doenjang", is_correct: false, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 32, question_id: 8, answer_text: "Fish Sauce", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q9
    { answer_id: 33, question_id: 9, answer_text: "Wheat Flour", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 34, question_id: 9, answer_text: "Wheat Starch", is_correct: true, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 35, question_id: 9, answer_text: "Rice Flour", is_correct: false, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 36, question_id: 9, answer_text: "Corn Starch", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q10
    { answer_id: 37, question_id: 10, answer_text: "Eat until full", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 38, question_id: 10, answer_text: "Touch the heart", is_correct: true, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 39, question_id: 10, answer_text: "Small plates", is_correct: false, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 40, question_id: 10, answer_text: "Morning tea", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q11
    { answer_id: 41, question_id: 11, answer_text: "Eggs only", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 42, question_id: 11, answer_text: "Kansui (Alkaline salts)", is_correct: true, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 43, question_id: 11, answer_text: "Turmeric", is_correct: false, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 44, question_id: 11, answer_text: "Saffron", is_correct: false, answer_order: 4, created_at: new Date().toISOString() },

    // Q12
    { answer_id: 45, question_id: 12, answer_text: "Shio (Salt)", is_correct: false, answer_order: 1, created_at: new Date().toISOString() },
    { answer_id: 46, question_id: 12, answer_text: "Shoyu (Soy Sauce)", is_correct: false, answer_order: 2, created_at: new Date().toISOString() },
    { answer_id: 47, question_id: 12, answer_text: "Miso", is_correct: false, answer_order: 3, created_at: new Date().toISOString() },
    { answer_id: 48, question_id: 12, answer_text: "Wasabi", is_correct: true, answer_order: 4, created_at: new Date().toISOString() }
];
