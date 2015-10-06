CREATE TABLE `sn`.`note` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `note_id` int(11) DEFAULT NULL,
  `note_position_a` varchar(128) DEFAULT NULL,
  `note_position_b` varchar(128) DEFAULT NULL,
  `note_name` varchar(128) DEFAULT NULL,
  `note_content` varchar(1024) DEFAULT NULL,
  `note_create_time` varchar(128) DEFAULT NULL,
  `last_modification_time` varchar(128) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;