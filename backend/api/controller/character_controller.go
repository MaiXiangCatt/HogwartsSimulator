package controller

import (
	"net/http"
	"strconv"

	"github.com/MaiXiangCatt/HogwartsSimulator/backend/internal/service"
	"github.com/gin-gonic/gin"
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
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	newChar, err := charService.Create(userID.(uint), req.Name, req.Gender, req.BloodStatus, req.Wand, req.Patronus)
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

func GetCharacterList(c *gin.Context) {
	userID, exist := c.Get("userID")
	if !exist {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未登录"})
		return
	}
	characterList, err := charService.GetList(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取角色列表失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"message": "角色列表获取成功",
		"data": gin.H{
			"characterList": characterList,
		},
	})
}

func DeleteCharacter(c *gin.Context) {
	userID, exist := c.Get("userID")
	if !exist {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未登录"})
		return
	}
	characterID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效角色ID"})
		return
	}
	if err := charService.Delete(userID.(uint), uint(characterID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除角色失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"message": "角色删除成功",
	})
}