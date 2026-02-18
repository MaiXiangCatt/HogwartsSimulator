package database

import (
	"fmt"
	"log"

	"github.com/MaiXiangCatt/HogwartsSimulator/backend/internal/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	dsn := "root:root@tcp(127.0.0.1:3306)/hogwarts?charset=utf8mb4&parseTime=True&loc=Local"

	var err error

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("无法连接数据库:", err)
	}
	fmt.Println("数据库连接成功")

	err = DB.AutoMigrate(&model.User{}, &model.Character{}, &model.Message{})
	if err != nil {
		log.Fatal("数据库迁移失败:", err)
	}
	fmt.Println("数据库迁移成功")
}