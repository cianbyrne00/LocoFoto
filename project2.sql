CREATE SCHEMA IF NOT EXISTS `project2`;

CREATE TABLE IF NOT EXISTS `comments` (
  `imageID` varchar(100) DEFAULT NULL,
  `username` varchar(30) DEFAULT NULL,
  `comments` varchar(120) DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS `images` (
  `imageLink` varchar(100) DEFAULT NULL,
  `username` varchar(30) DEFAULT NULL,
  `date` varchar(30) DEFAULT NULL,
  `caption` varchar(120) DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS `users` (
  `username` varchar(30) DEFAULT NULL,
  `firstname` varchar(30) DEFAULT NULL,
  `lastname` varchar(30) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS `likes` (
  `imageID` varchar(100) DEFAULT NULL,
  `username` varchar(30) DEFAULT NULL
);

SET SQL_SAFE_UPDATES = 0;
