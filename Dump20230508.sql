-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: arius-insight
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `currencyrate`
--

DROP TABLE IF EXISTS `currencyrate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currencyrate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency` enum('VND','JPY','USD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'JPY',
  `rate` double NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currencyrate`
--

LOCK TABLES `currencyrate` WRITE;
/*!40000 ALTER TABLE `currencyrate` DISABLE KEYS */;
/*!40000 ALTER TABLE `currencyrate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bookmark` tinyint(1) NOT NULL DEFAULT '0',
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Customer_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Culture Convenience Club Co.,Ltd.','CCC','〒150-0036　東京都渋谷区南平台町16-17　渋谷ガーデンタワー9階',0,0,0,'2023-04-25 11:07:33.737',0,'2023-04-28 15:17:15.998','JP'),(2,'ChoQi Co., Ltd.','ChoQi','〒532-0003　大阪府大阪市淀川区宮原1-6-1　新大阪ブリックビル',0,0,0,'2023-04-25 11:16:11.151',0,'2023-04-28 15:25:28.122','JP'),(3,'PERSOL Holdings Co., LTD.','PERSOL','〒107-0062　東京都港区南青山1-15-5',0,0,0,'2023-04-25 23:36:37.679',0,'2023-04-25 23:36:37.679','JP'),(4,'SES Smart Grid Solutions Co., Ltd','SES','83 Xuan Quynh, Trung Hoa, Cau Giay, Hanoi',0,0,0,'2023-04-28 14:51:16.048',0,'2023-05-01 01:43:44.096','VN'),(5,'株式会社PortX（PortX,Inc.）','PORTX','〒105-6923 東京都港区虎ノ門4-1-1 神谷町トラストタワー 23F',0,0,0,'2023-04-28 15:06:12.879',0,'2023-04-28 15:22:19.449','JP'),(6,'A','A','A',0,0,0,'2023-04-28 15:10:34.639',0,'2023-04-29 00:28:03.644','OT'),(7,'B','B','B',0,0,0,'2023-04-28 15:12:23.585',0,'2023-04-28 15:13:10.934','VN'),(8,'C','C','C',0,0,0,'2023-04-28 15:12:59.621',0,'2023-04-28 15:13:15.524','EU'),(12,'D','D','D',0,0,0,'2023-04-29 05:52:56.389',0,'2023-04-29 05:52:56.389','JP'),(13,'E','E','E',0,0,0,'2023-04-29 05:53:07.011',0,'2023-04-29 05:53:13.614','VN'),(14,'F','F','F',0,0,0,'2023-04-29 06:02:08.828',0,'2023-05-01 01:47:36.418','EU'),(15,'G','G','G',0,0,0,'2023-04-29 06:02:13.511',0,'2023-04-29 06:02:13.511','JP'),(16,'H','H','H',0,0,0,'2023-04-29 06:02:18.509',0,'2023-05-01 01:47:42.654','VN'),(17,'I','I','I',0,0,0,'2023-04-29 06:02:23.245',0,'2023-05-01 01:47:46.352','OT'),(18,'J','J','J',0,0,0,'2023-04-29 06:02:27.585',0,'2023-04-29 06:02:27.585','JP'),(19,'K','K','K',0,0,0,'2023-04-29 06:02:32.324',0,'2023-05-01 01:49:04.328','US'),(20,'L','L','L',0,0,0,'2023-04-29 06:02:37.795',0,'2023-04-29 06:02:37.795','JP'),(21,'M','M','M',0,0,0,'2023-04-29 06:02:46.070',0,'2023-04-29 06:02:46.070','JP'),(22,'N','N','N',0,0,0,'2023-04-29 06:02:52.634',0,'2023-04-29 06:02:52.634','JP'),(23,'O','O','O',0,0,0,'2023-04-29 06:02:58.287',0,'2023-04-29 06:02:58.287','JP'),(24,'P','P','P',0,0,0,'2023-04-29 06:03:04.661',0,'2023-04-29 06:20:18.018','VN'),(25,'Q','Q','Q',0,0,0,'2023-04-29 06:03:09.859',0,'2023-04-29 06:03:09.859','JP'),(26,'S','S','S',0,0,0,'2023-04-29 06:03:17.827',0,'2023-04-29 06:03:17.827','JP'),(27,'R','R','R',0,0,0,'2023-04-29 06:03:28.488',0,'2023-04-29 06:03:28.488','JP'),(28,'T','T','T',0,0,0,'2023-04-29 06:04:04.545',0,'2023-04-29 06:04:04.545','JP'),(29,'U','U','U',0,0,0,'2023-04-29 06:04:12.204',0,'2023-04-29 06:04:12.204','JP'),(30,'V','V','V',0,0,0,'2023-04-29 06:04:17.147',0,'2023-04-29 06:04:17.147','JP'),(31,'W','W','W',0,0,0,'2023-04-29 06:04:21.898',0,'2023-04-29 06:04:21.898','JP'),(32,'Z','Z','Z',0,0,0,'2023-05-01 01:25:55.960',0,'2023-05-01 01:30:43.618','VN');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manager` int NOT NULL,
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Department_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'D1',1,0,'2023-05-03 19:04:36.785',0,'2023-05-03 19:04:36.785',0);
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` enum('INTERN','DESIGNER','DEVELOPER','TESTER','TEST_LEADER','QA','QA_LEAD','COMTOR','TEAM_LEADER','PROJECT_TECHNICAL_LEADER','BRSE','PROJECT_MANAGER','RECEPTION','SALES','FREELANCER','HR','HR_LEADER','ACCOUNTANT','DEPARTMENT_MANAGER','COO','CTO','CEO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `birthday` date DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ON','OFF') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OFF',
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Employee_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'Nguyễn Đức Phong','PhongND','DEPARTMENT_MANAGER','1983-10-30','0857444074','Số 5 Ngõ Bà Triệu, Phố Bà Triệu, Phường Lê Đại Hành, Quận Hai Bà Trưng, Hà Nội','ON','',0,0,'2023-05-01 16:06:38.455',0,'2023-05-02 01:17:41.859'),(2,'Nguyễn Thu My','MyNT','DESIGNER','1988-10-04','0979081221','Số 5 Ngõ Bà Triệu, Phố Bà Triệu, Phường Lê Đại Hành, Quận Hai Bà Trưng, Hà Nội','OFF','',0,0,'2023-05-01 19:20:51.599',0,'2023-05-02 03:49:04.015'),(3,'Nguyễn Anh Minh','MinhNA','INTERN','2018-06-06','0857444074','Số 5 Ngõ Bà Triệu, Phố Bà Triệu, Phường Lê Đại Hành, Quận Hai Bà Trưng, Hà Nội','ON','',0,0,'2023-05-02 04:19:04.450',0,'2023-05-03 09:48:05.752'),(5,'Nguyễn Hạ Vy','NyNH','INTERN','2021-01-07','0857444074','Số 5 Ngõ Bà Triệu, Phố Bà Triệu, Phường Lê Đại Hành, Quận Hai Bà Trưng, Hà Nội','ON','',0,0,'2023-05-03 09:48:35.789',0,'2023-05-03 09:48:35.789');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeebonus`
--

DROP TABLE IF EXISTS `employeebonus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeebonus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `bonus_date` date NOT NULL,
  `bonus` double NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeebonus`
--

LOCK TABLES `employeebonus` WRITE;
/*!40000 ALTER TABLE `employeebonus` DISABLE KEYS */;
/*!40000 ALTER TABLE `employeebonus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeesalary`
--

DROP TABLE IF EXISTS `employeesalary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeesalary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` bigint NOT NULL,
  `salary` double NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeesalary`
--

LOCK TABLES `employeesalary` WRITE;
/*!40000 ALTER TABLE `employeesalary` DISABLE KEYS */;
INSERT INTO `employeesalary` VALUES (1,2,5500000,NULL,0,0,'2023-05-02 01:15:49.457',0,'2023-05-02 03:49:04.032'),(2,1,8300000,NULL,0,0,'2023-05-02 01:17:41.867',0,'2023-05-02 01:17:41.867'),(3,3,100000,NULL,0,0,'2023-05-02 04:20:17.491',0,'2023-05-03 09:48:05.926'),(4,5,800000,NULL,0,0,'2023-05-03 09:48:35.812',0,'2023-05-03 09:48:35.812');
/*!40000 ALTER TABLE `employeesalary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeesalaryhistory`
--

DROP TABLE IF EXISTS `employeesalaryhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeesalaryhistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `salary` double NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeesalaryhistory`
--

LOCK TABLES `employeesalaryhistory` WRITE;
/*!40000 ALTER TABLE `employeesalaryhistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `employeesalaryhistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense`
--

DROP TABLE IF EXISTS `expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_date` date NOT NULL,
  `deadline` date NOT NULL,
  `type` enum('LAW_FEE','OFFICE_RENT','OFFICE_EQUIPMENT','BANK_FEE','SALARY','BONUS','BUSINESS','TRAINING','TRAVEL','TEAM_BUILDING','OUT_SOURCE','INVESTMENT','OTHERS') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTHERS',
  `amount` double NOT NULL,
  `currency` enum('VND','JPY','USD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'JPY',
  `status` enum('WAITING','APPROVED','REJECTED','PENDING','CANCEL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `detail` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  `file` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense`
--

LOCK TABLES `expense` WRITE;
/*!40000 ALTER TABLE `expense` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `income`
--

DROP TABLE IF EXISTS `income`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `income` (
  `id` int NOT NULL AUTO_INCREMENT,
  `income_date` date NOT NULL,
  `amount` double NOT NULL,
  `currency` enum('VND','JPY','USD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'JPY',
  `category` enum('PROJECT_CHARGE','RESOUCE_TRANSFER','BANK_INTEREST','INVESTMENT','OTHERS') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTHERS',
  `reference_id` int DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `income`
--

LOCK TABLES `income` WRITE;
/*!40000 ALTER TABLE `income` DISABLE KEYS */;
/*!40000 ALTER TABLE `income` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insightmaster`
--

DROP TABLE IF EXISTS `insightmaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insightmaster` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `InsightMaster_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insightmaster`
--

LOCK TABLES `insightmaster` WRITE;
/*!40000 ALTER TABLE `insightmaster` DISABLE KEYS */;
/*!40000 ALTER TABLE `insightmaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bookmark` tinyint(1) NOT NULL DEFAULT '0',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `rank` enum('A','B','C','D','E','F') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('OPEN','PENDING','CANCEL','CLOSE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_effort` double DEFAULT NULL,
  `cost` double DEFAULT NULL,
  `cost_budget` double DEFAULT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  `customer_id` int NOT NULL,
  `department_id` int NOT NULL,
  `project_manager_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Project_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (1,'S3M','S3M','',0,'2023-01-01','2023-12-31',NULL,'PENDING',NULL,4000000,NULL,0,0,'2023-05-03 13:08:38.683',0,'2023-05-03 13:25:08.220',4,1,1);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resourceallocation`
--

DROP TABLE IF EXISTS `resourceallocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resourceallocation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `position` enum('INTERN','DESIGNER','DEVELOPER','TESTER','TEST_LEADER','QA','QA_LEAD','COMTOR','TEAM_LEADER','PROJECT_TECHNICAL_LEADER','BRSE','PROJECT_MANAGER','RECEPTION','SALES','FREELANCER','HR','HR_LEADER','ACCOUNTANT','DEPARTMENT_MANAGER','COO','CTO','CEO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_effort` double NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `mm` int NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resourceallocation`
--

LOCK TABLES `resourceallocation` WRITE;
/*!40000 ALTER TABLE `resourceallocation` DISABLE KEYS */;
/*!40000 ALTER TABLE `resourceallocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resourceextra`
--

DROP TABLE IF EXISTS `resourceextra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resourceextra` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `effort` double NOT NULL,
  `extra_date` date NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resourceextra`
--

LOCK TABLES `resourceextra` WRITE;
/*!40000 ALTER TABLE `resourceextra` DISABLE KEYS */;
/*!40000 ALTER TABLE `resourceextra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('USER','MANAGER','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `avatar` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lock_flag` tinyint(1) NOT NULL DEFAULT '0',
  `create_by` int NOT NULL DEFAULT '0',
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_by` int NOT NULL DEFAULT '0',
  `update_at` datetime(3) NOT NULL,
  `delete_flag` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'phongnd','phongnd6593@gmail.com','$2b$10$LufcerjoFahGiaCCB7lREeG9TWnJSoSHJh4.vwQadIKrgEo2iWbue','USER',NULL,0,0,'2023-04-20 05:15:57.682',0,'2023-04-20 05:15:57.682',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-08  8:08:15
