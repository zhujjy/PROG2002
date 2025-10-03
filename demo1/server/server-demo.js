// 演示模式服务器 - 使用模拟数据运行
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 模拟数据
// mockOrganizations数据已删除

const mockCategories = [
    { id: 1, name: '慈善晚宴', description: '正式的筹款晚宴活动，通常包含表演和拍卖' },
    { id: 2, name: '趣味跑', description: '以跑步为主题的慈善募捐活动' },
    { id: 3, name: '无声拍卖', description: '静默竞拍形式的慈善拍卖活动' },
    { id: 4, name: '音乐会', description: '以音乐表演为主的慈善募捐活动' },
    { id: 5, name: '义卖活动', description: '通过销售商品进行慈善募捐' },
    { id: 6, name: '公益讲座', description: '教育性质的慈善宣传活动' },
    { id: 7, name: '志愿服务', description: '直接参与的志愿者服务活动' },
    { id: 8, name: '户外徒步', description: '户外徒步结合慈善募捐的活动' }
];

const mockEvents = [
    {
        id: 1,
        name: '爱心慈善晚宴2024',
        description: '为贫困儿童筹集教育资金的慈善晚宴',
        full_description: '这是一场盛大的慈善晚宴，旨在为山区贫困儿童筹集教育资金。晚宴将包括精美的晚餐、慈善拍卖、明星表演等环节。所筹资金将用于建设希望小学、购买教学设备、资助优秀贫困学生等。让我们一起为孩子们的未来点亮希望之灯！',
        event_date: '2024-12-15T18:30:00.000Z',
        location: '北京国际会议中心',
        target_amount: 500000.00,
        current_amount: 285000.00,
        ticket_price: 1000.00,
        is_free: false,
        max_participants: 200,
        current_participants: 142,
        status: 'upcoming',
        image_url: 'https://picsum.photos/400/250?random=1',
        registration_deadline: '2024-12-10T23:59:59.000Z',
        category_name: '慈善晚宴',
        organization_name: 'World Charity United Foundation',
        organization_description: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        organization_address: ''
    },
    {
        id: 2,
        name: '绿色城市公益跑',
        description: '倡导环保理念的城市马拉松活动',
        full_description: '加入我们的绿色公益跑，为环境保护贡献力量！这次活动不仅是一场健康的跑步比赛，更是一次环保意识的传播。参赛者将途经城市最美的绿色景点，同时为植树造林项目筹集资金。每一步都是为地球的未来而跑！',
        event_date: '2024-11-20T07:00:00.000Z',
        location: '上海世纪公园',
        target_amount: 300000.00,
        current_amount: 156000.00,
        ticket_price: 80.00,
        is_free: false,
        max_participants: 1000,
        current_participants: 520,
        status: 'upcoming',
        image_url: 'https://picsum.photos/400/250?random=2',
        registration_deadline: '2024-11-15T23:59:59.000Z',
        category_name: '趣味跑',
        organization_name: 'World Charity United Foundation',
        organization_description: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        organization_address: ''
    },
    {
        id: 3,
        name: '关爱老人音乐会',
        description: '为独居老人送去温暖的音乐盛会',
        full_description: '一场专为关爱老人举办的温馨音乐会。我们邀请了知名音乐家演奏经典老歌，现场还将有志愿者与老人互动。筹集的资金将用于为独居老人提供日常照料服务、购买生活必需品，让他们感受到社会的温暖。',
        event_date: '2024-11-30T14:30:00.000Z',
        location: '广州大剧院',
        target_amount: 150000.00,
        current_amount: 89000.00,
        ticket_price: 50.00,
        is_free: false,
        max_participants: 800,
        current_participants: 356,
        status: 'upcoming',
        image_url: 'https://picsum.photos/400/250?random=3',
        registration_deadline: '2024-11-25T23:59:59.000Z',
        category_name: '音乐会',
        organization_name: 'World Charity United Foundation',
        organization_description: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        organization_address: ''
    },
    {
        id: 4,
        name: '希望之光医疗援助拍卖',
        description: '为重病患者筹集医疗费用的拍卖活动',
        full_description: '这是一场特别的无声拍卖活动，所有拍品均由爱心人士和艺术家捐赠。拍卖所得将全部用于帮助需要医疗援助的重病患者，特别是那些家庭困难的儿童患者。每一次出价都是在为生命点亮希望！',
        event_date: '2024-12-05T19:00:00.000Z',
        location: '深圳会展中心',
        target_amount: 800000.00,
        current_amount: 420000.00,
        ticket_price: 200.00,
        is_free: false,
        max_participants: 300,
        current_participants: 178,
        status: 'upcoming',
        image_url: 'https://picsum.photos/400/250?random=4',
        registration_deadline: '2024-12-01T23:59:59.000Z',
        category_name: '无声拍卖',
        organization_name: 'World Charity United Foundation',
        organization_description: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        organization_address: ''
    },
    {
        id: 5,
        name: '爱心义卖嘉年华',
        description: '为山区儿童筹集冬衣的义卖活动',
        full_description: '温暖的义卖嘉年华即将开始！我们收集了各种精美的手工艺品、图书、玩具等物品进行义卖。所有收入将用于为山区儿童购买过冬衣物。现场还有亲子互动游戏、美食摊位等，是全家参与慈善的好机会！',
        event_date: '2024-11-25T10:00:00.000Z',
        location: '北京朝阳公园',
        target_amount: 100000.00,
        current_amount: 67000.00,
        ticket_price: 0.00,
        is_free: true,
        max_participants: 500,
        current_participants: 234,
        status: 'upcoming',
        image_url: 'https://picsum.photos/400/250?random=5',
        registration_deadline: '2024-11-23T23:59:59.000Z',
        category_name: '义卖活动',
        organization_name: 'World Charity United Foundation',
        organization_description: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        organization_address: ''
    }
];

// API路由

// 测试数据库连接
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: 'Demo Mode - Using Mock Data',
        timestamp: new Date().toISOString()
    });
});

// 1. 获取主页数据 - 当前和即将举行的活动
app.get('/api/events', (req, res) => {
    try {
        const events = mockEvents.filter(event => 
            event.status === 'upcoming' || event.status === 'ongoing'
        );
        
        res.json({
            success: true,
            data: events,
            total: events.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取活动列表失败',
            error: error.message
        });
    }
});

// 2. 获取活动类别列表
app.get('/api/categories', (req, res) => {
    try {
        res.json({
            success: true,
            data: mockCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取类别列表失败',
            error: error.message
        });
    }
});

// 3. 搜索活动
app.get('/api/events/search', (req, res) => {
    try {
        const { date, location, category, status } = req.query;
        
        let events = mockEvents.filter(event => 
            event.status === 'upcoming' || event.status === 'ongoing'
        );
        
        // 根据条件过滤
        if (date) {
            events = events.filter(event => {
                const eventDate = new Date(event.event_date).toISOString().split('T')[0];
                return eventDate === date;
            });
        }
        
        if (location && location.trim() !== '') {
            events = events.filter(event => 
                event.location.includes(location.trim())
            );
        }
        
        if (category && category !== 'all') {
            const categoryName = mockCategories.find(c => c.id == category)?.name;
            if (categoryName) {
                events = events.filter(event => event.category_name === categoryName);
            }
        }
        
        if (status && status !== 'all') {
            events = events.filter(event => event.status === status);
        }
        
        res.json({
            success: true,
            data: events,
            total: events.length,
            query: req.query
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '搜索活动失败',
            error: error.message
        });
    }
});

// 4. 获取特定活动的详细信息
app.get('/api/events/:id', (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        
        if (isNaN(eventId)) {
            return res.status(400).json({
                success: false,
                message: '无效的活动ID'
            });
        }
        
        const event = mockEvents.find(e => e.id === eventId);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: '活动不存在'
            });
        }
        
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取活动详情失败',
            error: error.message
        });
    }
});

// 5. 获取所有地点列表（用于搜索下拉框）
app.get('/api/locations', (req, res) => {
    try {
        const locations = [...new Set(mockEvents.map(event => event.location))];
        
        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取地点列表失败',
            error: error.message
        });
    }
});

// 6. 获取慈善机构信息 - 已删除
// app.get('/api/organizations', (req, res) => {
//     try {
//         res.json({
//             success: true,
//             data: []
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: '获取机构列表失败',
//             error: error.message
//         });
//     }
// });

// 7. 模拟注册功能
app.post('/api/events/:id/register', (req, res) => {
    try {
        res.json({
            success: true,
            message: '此功能当前正在构建中，将在下一个版本中提供完整的注册功能。',
            registration_id: `mock_${Date.now()}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '注册功能暂未开放',
            error: error.message
        });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: err.message
    });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 慈善活动演示服务器已启动`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`🔗 API健康检查: http://localhost:${PORT}/api/health`);
    console.log(`📊 获取活动列表: http://localhost:${PORT}/api/events`);
    console.log(`⚠️  演示模式：使用模拟数据，无需数据库连接`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 正在关闭服务器...');
    process.exit(0);
});