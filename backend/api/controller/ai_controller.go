package controller

import (
	"bufio"
	"bytes"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/config"
)

type SummarizeRequest struct {
	Messages []Message `json:"messages"`
	APIKey   string    `json:"api_key"`
	Model    string    `json:"model"`
}
type AIStreamResponse struct {
	Type string `json:"type"`
	Content string `json:"content"`
}

func SummarizeHandler(c *gin.Context) {
	var req SummarizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "参数格式错误"})
		return
	}
	if req.APIKey == "" {
		c.JSON(400, gin.H{"error": "API Key 不能为空"})
		return
	}

	// 1. 构建 Prompt
	agentMessages := []Message{
		{
			Role:    "system",
			Content: config.SystemSummaryRules,
		},
	}
	agentMessages = append(agentMessages, req.Messages...)

	pyReq := AgentRequest{
		Messages: agentMessages,
		APIKey:   req.APIKey,
		Model:    req.Model,
	}
	jsonData, _ := json.Marshal(pyReq)

	// 2. 请求 Python 服务
	proxyReq, err := http.NewRequestWithContext(c.Request.Context(), "POST", "http://localhost:8000/chat", bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(500, gin.H{"error": "无法创建请求"})
		return
	}
	proxyReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(proxyReq)
	if err != nil {
		c.JSON(500, gin.H{"error": "连接 AI 服务失败"})
		return
	}
	defer resp.Body.Close()

	// 3. 解析 SSE 流并聚合结果
	scanner := bufio.NewScanner(resp.Body)
	var fullSummary strings.Builder

	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			dataStr := strings.TrimPrefix(line, "data: ")
			if dataStr == "[DONE]" {
				continue
			}
			var streamResp AIStreamResponse
			if err := json.Unmarshal([]byte(dataStr), &streamResp); err == nil {
				if streamResp.Type == "text" {
					fullSummary.WriteString(streamResp.Content)
				}
			}
		}
	}

	if err := scanner.Err(); err != nil {
		c.JSON(500, gin.H{"error": "读取 AI 响应失败"})
		return
	}

	c.JSON(200, gin.H{
		"summary": fullSummary.String(),
	})
}
