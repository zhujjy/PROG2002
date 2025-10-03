const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './server/.env' });

const db = require('./event_db');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 测试数据库连接
app.get('/api/health', async (req, res) => {
    try {
        const isConnected = await db.testConnection();
        res.json({ 
            status: 'OK', 
            database: isConnected ? 'Connected' : 'Disconnected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'Error', 
            message: error.message 
        });
    }
});

// API路由

// 1. 获取主页数据 - 当前和即将举行的活动
app.get('/api/events', async (req, res) => {
    try {
        const sql = `
            SELECT 
                e.id,
                e.name,
                e.description,
                e.event_date,
                e.location,
                e.target_amount,
                e.current_amount,
                e.ticket_price,
                e.is_free,
                e.max_participants,
                e.current_participants,
                e.status,
                e.image_url,
                c.name as category_name,
                o.name as organization_name
            FROM events e
            JOIN categories c ON e.category_id = c.id
            JOIN organizations o ON e.organization_id = o.id
            WHERE e.status IN ('upcoming', 'ongoing')
            ORDER BY e.event_date ASC
        `;
        
        const events = await db.query(sql);
        
        // 根据日期更新活动状态
        const currentDate = new Date();
        for (let event of events) {
            const eventDate = new Date(event.event_date);
            if (eventDate < currentDate && event.status === 'upcoming') {
                // 如果活动日期已过但状态还是upcoming，更新为ended
                await db.query('UPDATE events SET status = ? WHERE id = ?', ['ended', event.id]);
                event.status = 'ended';
            }
        }
        
        res.json({
            success: true,
            data: events,
            total: events.length
        });
    } catch (error) {
        console.error('获取活动列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取活动列表失败',
            error: error.message
        });
    }
});

// 2. 获取活动类别列表
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.query('SELECT * FROM categories ORDER BY name');
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('获取类别列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取类别列表失败',
            error: error.message
        });
    }
});

// 3. 搜索活动
app.get('/api/events/search', async (req, res) => {
    try {
        const { date, location, category, status } = req.query;
        
        let sql = `
            SELECT 
                e.id,
                e.name,
                e.description,
                e.event_date,
                e.location,
                e.target_amount,
                e.current_amount,
                e.ticket_price,
                e.is_free,
                e.max_participants,
                e.current_participants,
                e.status,
                e.image_url,
                c.name as category_name,
                o.name as organization_name
            FROM events e
            JOIN categories c ON e.category_id = c.id
            JOIN organizations o ON e.organization_id = o.id
            WHERE e.status IN ('upcoming', 'ongoing')
        `;
        
        const params = [];
        
        // 根据条件添加WHERE子句
        if (date) {
            sql += ' AND DATE(e.event_date) = ?';
            params.push(date);
        }
        
        if (location && location.trim() !== '') {
            sql += ' AND e.location LIKE ?';
            params.push(`%${location.trim()}%`);
        }
        
        if (category && category !== 'all') {
            sql += ' AND e.category_id = ?';
            params.push(parseInt(category));
        }
        
        if (status && status !== 'all') {
            sql += ' AND e.status = ?';
            params.push(status);
        }
        
        sql += ' ORDER BY e.event_date ASC';
        
        const events = await db.query(sql, params);
        
        res.json({
            success: true,
            data: events,
            total: events.length,
            query: req.query
        });
    } catch (error) {
        console.error('搜索活动错误:', error);
        res.status(500).json({
            success: false,
            message: '搜索活动失败',
            error: error.message
        });
    }
});

// 4. 获取特定活动的详细信息
app.get('/api/events/:id', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        
        if (isNaN(eventId)) {
            return res.status(400).json({
                success: false,
                message: '无效的活动ID'
            });
        }
        
        const sql = `
            SELECT 
                e.*,
                c.name as category_name,
                c.description as category_description,
                o.name as organization_name,
                o.description as organization_description,
                o.contact_email,
                o.contact_phone,
                o.website,
                o.address as organization_address
            FROM events e
            JOIN categories c ON e.category_id = c.id
            JOIN organizations o ON e.organization_id = o.id
            WHERE e.id = ?
        `;
        
        const event = await db.queryOne(sql, [eventId]);
        
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
        console.error('获取活动详情错误:', error);
        res.status(500).json({
            success: false,
            message: '获取活动详情失败',
            error: error.message
        });
    }
});

// 5. 获取所有地点列表（用于搜索下拉框）
app.get('/api/locations', async (req, res) => {
    try {
        const sql = 'SELECT DISTINCT location FROM events WHERE status IN ("upcoming", "ongoing") ORDER BY location';
        const locations = await db.query(sql);
        
        res.json({
            success: true,
            data: locations.map(item => item.location)
        });
    } catch (error) {
        console.error('获取地点列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取地点列表失败',
            error: error.message
        });
    }
});

// 6. 获取慈善机构信息 - 已删除
// app.get('/api/organizations', async (req, res) => {
//     try {
//         const organizations = await db.query('SELECT * FROM organizations ORDER BY name');
//         res.json({
//             success: true,
//             data: organizations
//         });
//     } catch (error) {
//         console.error('获取机构列表错误:', error);
//         res.status(500).json({
//             success: false,
//             message: '获取机构列表失败',
//             error: error.message
//         });
//     }
// });

// 7. 模拟注册功能（为当前评估预留）
app.post('/api/events/:id/register', async (req, res) => {
    try {
        // 这里只是模拟响应，实际功能将在评估3中实现
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
        error: process.env.NODE_ENV === 'development' ? err.message : '服务器错误'
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
async function startServer() {
    try {
        // 测试数据库连接
        const isDbConnected = await db.testConnection();
        if (!isDbConnected) {
            console.error('❌ 无法连接到数据库，请检查配置');
            process.exit(1);
        }
        
        app.listen(PORT, () => {
            console.log(`🚀 慈善活动服务器已启动`);
            console.log(`📍 地址: http://localhost:${PORT}`);
            console.log(`🔗 API健康检查: http://localhost:${PORT}/api/health`);
            console.log(`📊 获取活动列表: http://localhost:${PORT}/api/events`);
        });
    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 正在关闭服务器...');
    process.exit(0);
});

startServer();