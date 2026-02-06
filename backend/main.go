package main

import (
	"time"

	"github.com/MaiXiangCatt/HogwartsSimulator/backend/api/controller"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/api/middleware"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Init()
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge: 12 * time.Hour,
	}))
	r.POST("/api/auth/register", controller.Register)
	r.POST("/api/auth/login", controller.Login)
	authGroup := r.Group("/api")
	authGroup.Use(middleware.JWTAUth())
	{
		authGroup.POST("/chat", controller.ChatHandler)
		authGroup.GET("/auth/user", controller.GetUserInfo)
		authGroup.POST("/character", controller.CreateCharacter)
		authGroup.GET("/character", controller.GetCharacterList)
		authGroup.DELETE("/character/:id", controller.DeleteCharacter)
	}
	r.Run(":8080")
}