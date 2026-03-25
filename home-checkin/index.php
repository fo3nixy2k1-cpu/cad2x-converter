<?php
// 数据库配置
$db_file = __DIR__ . '/data/records.db';

// 创建数据目录
if (!is_dir(__DIR__ . '/data')) {
    mkdir(__DIR__ . '/data', 0777, true);
}

// 初始化数据库
function initDB() {
    global $db_file;
    $pdo = new PDO('sqlite:' . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL UNIQUE,
        time TIME NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    return $pdo;
}

$pdo = initDB();

// 处理各种请求
$message = '';
$activeTab = $_GET['tab'] ?? 'checkin';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'checkin') {
        $now = new DateTime();
        $date = $now->format('Y-m-d');
        $time = $now->format('H:i:s');
        $note = $_POST['note'] ?? '';
        
        // 检查今天是否已打卡
        $stmt = $pdo->prepare("SELECT * FROM records WHERE date = ?");
        $stmt->execute([$date]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // 只更新备注，保留原时间
            $stmt = $pdo->prepare("UPDATE records SET note = ? WHERE date = ?");
            $stmt->execute([$note, $date]);
            $message = "备注更新成功！回家时间仍为 " . $existing['time'];
        } else {
            // 新增打卡
            $stmt = $pdo->prepare("INSERT INTO records (date, time, note) VALUES (?, ?, ?)");
            $stmt->execute([$date, $time, $note]);
            $message = "打卡成功！今天 $time 回家";
        }
    } elseif ($action === 'delete_record') {
        $id = $_POST['id'] ?? 0;
        $stmt = $pdo->prepare("DELETE FROM records WHERE id = ?");
        $stmt->execute([$id]);
        $message = "记录已删除";
    } elseif ($action === 'clear_note') {
        $id = $_POST['id'] ?? 0;
        $stmt = $pdo->prepare("UPDATE records SET note = '' WHERE id = ?");
        $stmt->execute([$id]);
        $message = "备注已清空";
    }
}

// 获取统计数据
function getStats($pdo) {
    $stats = [];
    
    // 本周数据
    $weekStart = date('Y-m-d', strtotime('monday this week'));
    $weekEnd = date('Y-m-d', strtotime('sunday this week'));
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM records WHERE date BETWEEN ? AND ?");
    $stmt->execute([$weekStart, $weekEnd]);
    $stats['this_week'] = $stmt->fetchColumn();
    $stats['week_range'] = "$weekStart ~ $weekEnd";
    
    // 本月数据
    $monthStart = date('Y-m-01');
    $monthEnd = date('Y-m-t');
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM records WHERE date BETWEEN ? AND ?");
    $stmt->execute([$monthStart, $monthEnd]);
    $stats['this_month'] = $stmt->fetchColumn();
    $stats['month_range'] = "$monthStart ~ $monthEnd";
    
    // 上周数据
    $lastWeekStart = date('Y-m-d', strtotime('monday last week'));
    $lastWeekEnd = date('Y-m-d', strtotime('sunday last week'));
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM records WHERE date BETWEEN ? AND ?");
    $stmt->execute([$lastWeekStart, $lastWeekEnd]);
    $stats['last_week'] = $stmt->fetchColumn();
    
    // 上月数据
    $lastMonthStart = date('Y-m-01', strtotime('last month'));
    $lastMonthEnd = date('Y-m-t', strtotime('last month'));
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM records WHERE date BETWEEN ? AND ?");
    $stmt->execute([$lastMonthStart, $lastMonthEnd]);
    $stats['last_month'] = $stmt->fetchColumn();
    
    return $stats;
}

// 获取详细统计数据
function getDetailedStats($pdo) {
    $detailed = [
        'monthly' => [],
        'weekly' => [],
        'weekday' => [],
        'total' => 0
    ];
    
    // 检查是否有记录
    $checkStmt = $pdo->query("SELECT COUNT(*) FROM records");
    $totalCount = $checkStmt->fetchColumn();
    
    if ($totalCount == 0) {
        return $detailed;
    }
    
    // 最近12个月每月统计
    for ($i = 0; $i < 12; $i++) {
        $month = date('Y-m', strtotime("-$i month"));
        $start = $month . '-01';
        $end = date('Y-m-t', strtotime($start));
        
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM records WHERE date BETWEEN ? AND ?");
        $stmt->execute([$start, $end]);
        $count = $stmt->fetchColumn();
        
        $detailed['monthly'][] = [
            'month' => $month,
            'count' => $count,
            'label' => date('Y年m月', strtotime($start))
        ];
    }
    
    // 每周统计（最近8周）
    for ($i = 0; $i < 8; $i++) {
        $weekStart = date('Y-m-d', strtotime("monday -$i week"));
        $weekEnd = date('Y-m-d', strtotime("sunday -$i week"));
        
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM records WHERE date BETWEEN ? AND ?");
        $stmt->execute([$weekStart, $weekEnd]);
        $count = $stmt->fetchColumn();
        
        $detailed['weekly'][] = [
            'week' => "$weekStart ~ $weekEnd",
            'count' => $count,
            'label' => '第' . (date('W') - $i) . '周'
        ];
    }
    
    // 按星期几统计
    $stmt = $pdo->query("
        SELECT strftime('%w', date) as weekday, COUNT(*) as count 
        FROM records 
        GROUP BY strftime('%w', date)
    ");
    $weekdayStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    foreach ($weekdayStats as $row) {
        $detailed['weekday'][] = [
            'name' => $weekdayNames[intval($row['weekday'])],
            'count' => $row['count']
        ];
    }
    
    // 总记录数
    $detailed['total'] = $totalCount;
    
    return $detailed;
}

// 获取最近记录
function getRecentRecords($pdo, $limit = 20) {
    $stmt = $pdo->query("SELECT * FROM records ORDER BY date DESC, time DESC LIMIT $limit");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// 获取所有记录（用于统计页面）
function getAllRecords($pdo) {
    $stmt = $pdo->query("SELECT * FROM records ORDER BY date DESC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

$stats = getStats($pdo);
$detailedStats = getDetailedStats($pdo);
$records = getRecentRecords($pdo);
$allRecords = getAllRecords($pdo);

// 获取今天的记录
$today = date('Y-m-d');
$stmt = $pdo->prepare("SELECT * FROM records WHERE date = ?");
$stmt->execute([$today]);
$todayRecord = $stmt->fetch();
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>回家打卡</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }
        h2 {
            color: #555;
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .tab {
            flex: 1;
            padding: 12px;
            text-align: center;
            background: #f0f0f0;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            color: #666;
            transition: all 0.2s;
        }
        .tab:hover {
            background: #e0e0e0;
        }
        .tab.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .checkin-btn {
            width: 100%;
            padding: 20px;
            font-size: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .checkin-btn:hover {
            transform: scale(1.02);
        }
        .note-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            margin-top: 15px;
            resize: vertical;
            min-height: 80px;
        }
        .note-input:focus {
            outline: none;
            border-color: #667eea;
        }
        .message {
            background: #d4edda;
            color: #155724;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .stat-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        .stat-period {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
        .records-table {
            width: 100%;
            border-collapse: collapse;
        }
        .records-table th, .records-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #f0f0f0;
        }
        .records-table th {
            color: #666;
            font-weight: 600;
        }
        .records-table tr:hover {
            background: #f8f9fa;
        }
        .no-data {
            text-align: center;
            color: #999;
            padding: 20px;
        }
        .today-tag {
            background: #667eea;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 8px;
        }
        .delete-btn {
            background: #ff4757;
            color: white;
            border: none;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        .chart-container {
            margin-top: 20px;
        }
        .chart-bar {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .chart-label {
            width: 80px;
            font-size: 14px;
            color: #666;
        }
        .chart-value {
            flex: 1;
            height: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 4px;
            min-width: 20px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 8px;
            color: white;
            font-size: 12px;
        }
        .chart-count {
            width: 40px;
            text-align: right;
            font-size: 14px;
            color: #666;
        }
        .weekday-stats {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 10px;
        }
        .weekday-item {
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            min-width: 60px;
        }
        .weekday-count {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }
        .weekday-name {
            font-size: 12px;
            color: #666;
        }
        .total-records {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .total-value {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
        }
        .home-info {
            text-align: center;
            padding: 15px;
            background: #e8f5e9;
            border-radius: 8px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>🏠 回家打卡</h1>
            
            <div class="tabs">
                <a href="?tab=checkin" class="tab <?= $activeTab === 'checkin' ? 'active' : '' ?>">📍 打卡</a>
                <a href="?tab=stats" class="tab <?= $activeTab === 'stats' ? 'active' : '' ?>">📊 统计</a>
                <a href="?tab=records" class="tab <?= $activeTab === 'records' ? 'active' : '' ?>">📋 记录</a>
            </div>
            
            <?php if ($message): ?>
                <div class="message"><?= htmlspecialchars($message) ?></div>
            <?php endif; ?>
            
            <?php if ($activeTab === 'checkin'): ?>
                <?php if ($todayRecord): ?>
                    <div class="home-info">
                        <strong>✅ 今日已回家</strong><br>
                        回家时间：<?= htmlspecialchars($todayRecord['time']) ?>
                    </div>
                <?php endif; ?>
                
                <form method="POST">
                    <input type="hidden" name="action" value="checkin">
                    <button type="submit" class="checkin-btn">📍 打卡回家</button>
                    <textarea 
                        name="note" 
                        class="note-input" 
                        placeholder="今天回家后做了什么？（选填，修改备注不会改变回家时间）"
                    ><?= $todayRecord ? htmlspecialchars($todayRecord['note']) : '' ?></textarea>
                </form>
                
                <div style="margin-top: 20px;">
                    <h2>📊 本期统计</h2>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value"><?= $stats['this_week'] ?></div>
                            <div class="stat-label">本周回家</div>
                            <div class="stat-period"><?= $stats['week_range'] ?></div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value"><?= $stats['this_month'] ?></div>
                            <div class="stat-label">本月回家</div>
                            <div class="stat-period"><?= $stats['month_range'] ?></div>
                        </div>
                    </div>
                </div>
                
            <?php elseif ($activeTab === 'stats'): ?>
                <div class="total-records">
                    <div>累计回家</div>
                    <div class="total-value"><?= $detailedStats['total'] ?> 天</div>
                </div>
                
                <h2>📅 最近12个月</h2>
                <div class="chart-container">
                    <?php if (!empty($detailedStats['monthly'])): ?>
                        <?php foreach ($detailedStats['monthly'] as $item): ?>
                            <div class="chart-bar">
                                <div class="chart-label"><?= $item['label'] ?></div>
                                <div class="chart-value" style="width: <?= min($item['count'] * 20, 400) ?>px;"><?= $item['count'] ?></div>
                                <div class="chart-count"><?= $item['count'] ?>天</div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="no-data">暂无数据</div>
                    <?php endif; ?>
                </div>
                
                <h2 style="margin-top: 30px;">📆 按星期统计</h2>
                <?php if (!empty($detailedStats['weekday'])): ?>
                    <div class="weekday-stats">
                        <?php 
                        $weekdayMap = [];
                        foreach ($detailedStats['weekday'] as $w) {
                            $weekdayMap[$w['name']] = $w['count'];
                        }
                        foreach (['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as $day): 
                        ?>
                            <div class="weekday-item">
                                <div class="weekday-count"><?= $weekdayMap[$day] ?? 0 ?></div>
                                <div class="weekday-name"><?= $day ?></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="no-data">暂无数据</div>
                <?php endif; ?>
                
            <?php elseif ($activeTab === 'records'): ?>
                <h2>📋 全部记录</h2>
                <?php if (empty($allRecords)): ?>
                    <div class="no-data">暂无打卡记录</div>
                <?php else: ?>
                    <table class="records-table">
                        <thead>
                            <tr>
                                <th>日期</th>
                                <th>时间</th>
                                <th>备注</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($allRecords as $record): ?>
                                <tr>
                                    <td>
                                        <?= htmlspecialchars($record['date']) ?>
                                        <?php if ($record['date'] === $today): ?>
                                            <span class="today-tag">今天</span>
                                        <?php endif; ?>
                                    </td>
                                    <td><?= htmlspecialchars($record['time']) ?></td>
                                    <td><?= htmlspecialchars($record['note'] ?: '-') ?></td>
                                    <td>
                                        <?php if ($record['note']): ?>
                                            <form method="POST" style="display:inline; margin-right: 5px;" onsubmit="return confirm('确定清空这条备注吗？')">
                                                <input type="hidden" name="action" value="clear_note">
                                                <input type="hidden" name="id" value="<?= $record['id'] ?>">
                                                <button type="submit" class="delete-btn" style="background: #ffa502;">清空备注</button>
                                            </form>
                                        <?php endif; ?>
                                        <form method="POST" style="display:inline;" onsubmit="return confirm('确定删除这条打卡记录吗？')">
                                            <input type="hidden" name="action" value="delete_record">
                                            <input type="hidden" name="id" value="<?= $record['id'] ?>">
                                            <button type="submit" class="delete-btn">删除记录</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
