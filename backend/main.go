package main

import (
	"time"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/api/controller"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	api := r.Group("/api")
	{
		api.POST("/chat", controller.ChatHandler)
		api.POST("/ai/summarize", controller.SummarizeHandler)
	}
	r.Run(":8080")
}
