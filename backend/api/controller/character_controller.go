package controller

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/internal/service"
)
type CreateCharacterRequest struct {
	// 玩家填写的档案
	Name        string `json:"name" binding:"required"`
	Gender      string `json:"gender"`
	BloodStatus string `json:"blood_status"`
	Wand        string `json:"wand"`
	Patronus    string `json:"patronus"`
}

var charService = service.CharacterService{}

func CreateCharacter(c *gin.Context) {
	var req CreateCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效参数"})
		return
	}
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	newChar, err := charService.CreateCharacter(userID.(uint), req.Name, req.Gender, req.BloodStatus, req.Wand, req.Patronus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建角色失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"message": "角色创建成功",
		"data": gin.H{
			"character_id": newChar.ID,
		},
	})
}