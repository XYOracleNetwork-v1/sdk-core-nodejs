-- -----------------------------------------------------
-- Table `OriginBlocks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OriginBlocks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `signedHash` VARCHAR(128) NOT NULL,
  `signedBytes` BLOB NOT NULL,
  `bytes` BLOB NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `bridgedFromBlock` VARCHAR(128) NULL,
  `meta` BLOB NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `signedHash_UNIQUE` (`signedHash`(128)),
  INDEX `bridgedFromBlock_INDEX` (`bridgedFromBlock`(128))
)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `PublicKeyGroups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `PublicKeyGroups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `PublicKeys`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `PublicKeys` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `publicKeyGroupId` INT NOT NULL,
  `key` VARCHAR(1024) NOT NULL,
  PRIMARY KEY (`id`),
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `key_UNIQUE` (`key`(128)),
  CONSTRAINT `fk_PublicKeys_PublicKeyGroups`
    FOREIGN KEY (`publicKeyGroupId`)
    REFERENCES `PublicKeyGroups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OriginBlockParties`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OriginBlockParties` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `originBlockId` INT NOT NULL,
  `nextPublicKeyId` INT NULL,
  `positionalIndex` INT UNSIGNED NOT NULL,
  `blockIndex` INT UNSIGNED NOT NULL,
  `bridgeHashSet` BLOB NULL,
  `previousOriginBlockPartyId` INT NULL,
  `previousOriginBlockHash` VARCHAR(128) NULL,
  `payloadBytes` BLOB NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_OriginBlockParties_OriginBlocks1_idx` (`originBlockId` ASC),
  INDEX `fk_OriginBlockParties_PublicKeys1_idx` (`nextPublicKeyId` ASC),
  INDEX `fk_OriginBlockParties_OriginBlockParties1_idx` (`previousOriginBlockPartyId` ASC),
  INDEX `previousOriginBlockHash_UNIQUE` (`previousOriginBlockHash`(128)),
  INDEX `OriginBlockParties_index` (`blockIndex` ASC),
  CONSTRAINT `fk_OriginBlockParties_OriginBlocks1`
    FOREIGN KEY (`originBlockId`)
    REFERENCES `OriginBlocks` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_OriginBlockParties_PublicKeys1`
    FOREIGN KEY (`nextPublicKeyId`)
    REFERENCES `PublicKeys` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_OriginBlockParties_OriginBlockParties1`
    FOREIGN KEY (`previousOriginBlockPartyId`)
    REFERENCES `OriginBlockParties` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `OriginBlockAttributions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OriginBlockAttributions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sourceSignedHash` VARCHAR(128) NOT NULL,
  `originBlockPartyIndex` INT NOT NULL,
  `providesAttributionForSignedHash` VARCHAR(128) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `sourceSignedHash_INDEX` (`sourceSignedHash`(128)),
  INDEX `providesAttributionForSignedHash_INDEX` (`providesAttributionForSignedHash`(128))
)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `KeySignatures`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `KeySignatures` (
  `originBlockPartyId` INT NOT NULL,
  `publicKeyId` INT NOT NULL,
  `signature` VARCHAR(1024) NOT NULL,
  `positionalIndex` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`originBlockPartyId`, `publicKeyId`),
  INDEX `fk_OriginBlockParties_has_PublicKeys_PublicKeys1_idx` (`publicKeyId` ASC),
  INDEX `fk_OriginBlockParties_has_PublicKeys_OriginBlockParties1_idx` (`originBlockPartyId` ASC),
  CONSTRAINT `fk_OriginBlockParties_has_PublicKeys_OriginBlockParties1`
    FOREIGN KEY (`originBlockPartyId`)
    REFERENCES `OriginBlockParties` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_OriginBlockParties_has_PublicKeys_PublicKeys1`
    FOREIGN KEY (`publicKeyId`)
    REFERENCES `PublicKeys` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `PayloadItems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `PayloadItems` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `originBlockPartyId` INT NOT NULL,
  `isSigned` TINYINT(1) NOT NULL,
  `schemaObjectId` TINYINT(3) NOT NULL,
  `bytes` VARCHAR(8192) NOT NULL,
  `positionalIndex` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_PayloadItems_OriginBlockParties1_idx` (`originBlockPartyId` ASC),
  CONSTRAINT `fk_PayloadItems_OriginBlockParties1`
    FOREIGN KEY (`originBlockPartyId`)
    REFERENCES `OriginBlockParties` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
