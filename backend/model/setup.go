package model

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := "root:@tcp(127.0.0.1:3306)/belimbing_bank_db?charset=utf8mb4&parseTime=True&loc=Local"
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Gagal terhubung ke database:", err)
	}

	err = database.AutoMigrate(&Customer{}, &DepositoType{}, &Account{})
	if err != nil {
		log.Fatal("Gagal melakukan auto migrate:", err)
	}

	DB = database
	log.Println("Koneksi database berhasil!")
}
