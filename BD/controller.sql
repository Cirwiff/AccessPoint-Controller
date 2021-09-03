-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 03-Set-2021 às 03:29
-- Versão do servidor: 10.4.19-MariaDB
-- versão do PHP: 8.0.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `controller`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `accesspoint`
--

CREATE TABLE `accesspoint` (
  `id` int(11) NOT NULL,
  `mac` varchar(18) DEFAULT NULL,
  `same_network` varchar(30) DEFAULT '',
  `ipv6` varchar(42) DEFAULT '',
  `ipv4` varchar(16) DEFAULT '',
  `description` varchar(255) DEFAULT '',
  `n_connected_clients` int(11) DEFAULT 0,
  `ssid` varchar(30) DEFAULT NULL,
  `type_password` varchar(30) NOT NULL DEFAULT 'default',
  `password` varchar(30) DEFAULT NULL,
  `wpa2_server` varchar(150) NOT NULL DEFAULT '',
  `channel_mode` varchar(30) NOT NULL DEFAULT 'auto',
  `channel` int(11) DEFAULT NULL,
  `status` varchar(8) DEFAULT 'offline',
  `last_update` datetime DEFAULT NULL,
  `reboot` tinyint(1) NOT NULL DEFAULT 0,
  `fk_group_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `apgroups`
--

CREATE TABLE `apgroups` (
  `id` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `ssid` varchar(30) DEFAULT NULL,
  `type_password` varchar(30) NOT NULL DEFAULT '',
  `password` varchar(30) DEFAULT NULL,
  `wpa2_server` varchar(150) NOT NULL DEFAULT '',
  `channel_mode` varchar(30) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `connectedclients`
--

CREATE TABLE `connectedclients` (
  `id` int(11) NOT NULL,
  `mac` varchar(18) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `fk_ap_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `sysadmins`
--

CREATE TABLE `sysadmins` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `password` varchar(30) DEFAULT NULL,
  `login` varchar(50) DEFAULT NULL,
  `permission` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `sysadmins`
--

INSERT INTO `sysadmins` (`id`, `name`, `password`, `login`, `permission`) VALUES
(24, 'SysAdmin', '[object Promise]', 'admin', 0);

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `accesspoint`
--
ALTER TABLE `accesspoint`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mac` (`mac`),
  ADD KEY `fk_group_id` (`fk_group_id`);

--
-- Índices para tabela `apgroups`
--
ALTER TABLE `apgroups`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `connectedclients`
--
ALTER TABLE `connectedclients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mac` (`mac`),
  ADD KEY `FK_ConnectedClients_3` (`fk_ap_id`);

--
-- Índices para tabela `sysadmins`
--
ALTER TABLE `sysadmins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login` (`login`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `accesspoint`
--
ALTER TABLE `accesspoint`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT de tabela `apgroups`
--
ALTER TABLE `apgroups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `connectedclients`
--
ALTER TABLE `connectedclients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de tabela `sysadmins`
--
ALTER TABLE `sysadmins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `accesspoint`
--
ALTER TABLE `accesspoint`
  ADD CONSTRAINT `FK-GROUP` FOREIGN KEY (`fk_group_id`) REFERENCES `apgroups` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `connectedclients`
--
ALTER TABLE `connectedclients`
  ADD CONSTRAINT `FK_ConnectedClients_3` FOREIGN KEY (`fk_ap_id`) REFERENCES `accesspoint` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
