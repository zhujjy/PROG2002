/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306_1
 Source Server Type    : MySQL
 Source Server Version : 50726 (5.7.26)
 Source Host           : localhost:3306
 Source Schema         : charityevents

 Target Server Type    : MySQL
 Target Server Version : 50726 (5.7.26)
 File Encoding         : 65001

 Date: 03/10/2025 14:55:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for fa_active_article
-- ----------------------------
DROP TABLE IF EXISTS `fa_active_article`;
CREATE TABLE `fa_active_article`  (
  `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `Tag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'Tag',
  `Tickets` int(11) NOT NULL DEFAULT 0 COMMENT 'Tally',
  `Articlecontent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Article_content',
  `updatetime` bigint(20) NULL DEFAULT NULL COMMENT 'Update time',
  PRIMARY KEY (`Id`) USING BTREE,
  INDEX `idx_tag`(`Tag`) USING BTREE,
  INDEX `idx_tickets`(`Tickets`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'fa_active_article' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of fa_active_article
-- ----------------------------
INSERT INTO `fa_active_article` VALUES (1, 'fund', 0, '<p>fund</p>', 1759390584);
INSERT INTO `fa_active_article` VALUES (2, 'sport', 1, '<p>123</p>', 1759397744);
INSERT INTO `fa_active_article` VALUES (3, 'charitable donations', 3, '<p><span style=\"color: rgb(90, 117, 224); font-family: PingFangSC-Regular, &quot;Microsoft YaHei&quot;, Segoe&nbsp;UI&nbsp;Variable&nbsp;Static&nbsp;Display; font-size: 16px;\">charitable donations</span></p>', 1759401673);

-- ----------------------------
-- Table structure for fa_activity
-- ----------------------------
DROP TABLE IF EXISTS `fa_activity`;
CREATE TABLE `fa_activity`  (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `background_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '' COMMENT 'Bsackground image',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '' COMMENT 'Title',
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '' COMMENT 'Subtitle',
  `article_detail_id` int(11) UNSIGNED NULL DEFAULT 0 COMMENT 'Article detail ID',
  `status` enum('normal','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'normal' COMMENT 'Status: normal=Normal,hidden=Hidden',
  `createtime` bigint(30) UNSIGNED NULL DEFAULT 0 COMMENT 'Create time',
  `updatetime` bigint(30) UNSIGNED NULL DEFAULT 0 COMMENT 'Update time',
  `expirationtime` datetime NULL DEFAULT NULL COMMENT 'Expiration time',
  `deletetime` bigint(30) UNSIGNED NULL DEFAULT NULL COMMENT 'Delete time',
  `currency_type` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'CNY' COMMENT 'currency type',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'Event location',
  `target_amount` bigint(100) NULL DEFAULT NULL COMMENT 'Target amount',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `article_detail_id`(`article_detail_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'Activity table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of fa_activity
-- ----------------------------
INSERT INTO `fa_activity` VALUES (1, '/uploads/20251001/f826f2ebc5f951e1eb7127de28337ecd.jpg', 'Charity marathon', 'Charity cross-country marathon helps poor children improve their lives ', 1, 'normal', 1759328138, 1759397014, '2025-10-10 09:45:19', NULL, 'USD', 'TokyoJapan', 32156);
INSERT INTO `fa_activity` VALUES (2, '/uploads/20251001/f6a6acb77603ffaf98f76598b363eee6.jpg', 'Vegetarian buffet restaurant', 'All the profits obtained from this restaurant will be used entirely for the construction of poor areas', 2, 'normal', 1759328348, 1759387748, '2025-10-01 22:15:57', NULL, 'USD', 'chinashanghai', 6000);
INSERT INTO `fa_activity` VALUES (3, '/uploads/20251001/4f0959c4fa2b43fb1446015245f53cf6.jpg', 'Charity art and culture evening', 'Showcase different cultures to backward areas and teach them to use more tools to bridge the information gap', 3, 'normal', 1759330751, 1759464228, '2025-10-10 22:58:38', NULL, 'USD', 'SeoulSouthKorea', 700);
INSERT INTO `fa_activity` VALUES (4, '/uploads/20251003/50c95a03112f839ddbd146a22eda95db.gif', '111', '111', 4, 'normal', 1759464799, 1759464799, '2025-10-03 12:09:01', NULL, 'USD', 'Canberra', 8000);
INSERT INTO `fa_activity` VALUES (5, '/uploads/20251003/3671de2e544518b78a14df4aeca2d644.gif', '222', '222', 5, 'normal', 1759466462, 1759466462, '2025-10-03 12:40:08', NULL, 'USD', 'Sydney', 500);
INSERT INTO `fa_activity` VALUES (11, '/uploads/20251003/284998a43ea3854702d464bc336f8e96.gif', '333', '333', 6, 'normal', 1759467095, 1759467095, '2025-10-03 12:50:38', NULL, 'USD', 'Albury', 0);
INSERT INTO `fa_activity` VALUES (12, '/uploads/20251003/4de144d8abf75ee225cfd6ca033b8cbc.gif', '777', '777', 7, 'normal', 1759467253, 1759467253, '2025-10-03 12:53:14', NULL, 'USD', 'Melbourne', 700);
INSERT INTO `fa_activity` VALUES (13, '/uploads/20251003/e778b2f373702f4afe44282a70598451.gif', '888', '888', 8, 'normal', 1759467348, 1759467348, '2025-10-03 12:54:45', NULL, 'USD', 'Ararat', 1000);

-- ----------------------------
-- Table structure for fa_activity_reward
-- ----------------------------
DROP TABLE IF EXISTS `fa_activity_reward`;
CREATE TABLE `fa_activity_reward`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `registration_fee` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Registration Fee',
  `participant_count` int(100) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of Participants',
  `activity_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Activity ID (Foreign Key)',
  `status` enum('normal','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal' COMMENT 'Status',
  `havemoney` bigint(100) NULL DEFAULT NULL COMMENT 'Have Money',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Activity Reward Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of fa_activity_reward
-- ----------------------------
INSERT INTO `fa_activity_reward` VALUES (1, 30.00, 28, 1, 'normal', 2850);
INSERT INTO `fa_activity_reward` VALUES (2, 50.00, 5, 2, 'normal', 250);
INSERT INTO `fa_activity_reward` VALUES (3, 0.00, 1, 3, 'normal', 0);

SET FOREIGN_KEY_CHECKS = 1;
