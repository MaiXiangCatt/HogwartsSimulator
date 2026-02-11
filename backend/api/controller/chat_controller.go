package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	_ "embed"

	"github.com/MaiXiangCatt/HogwartsSimulator/backend/config"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/internal/model"
	"github.com/gin-gonic/gin"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}
type Profile struct {
	Name        string `json:"name"`
	Gender      string `json:"gender"`
	House       string `json:"house"`
	BloodStatus string `json:"blood_status"`
	Wand        string `json:"wand"`
	Patronus    string `json:"patronus"`
}
type GameState struct {
	Status        model.CharacterStatus `json:"status"`
	Profile       Profile               `json:"profile"`
	Inventory     model.InventoryMap    `json:"inventory"`
	Spells        model.SpellMap        `json:"spells"`
	Relationships model.RelationshipMap `json:"relationships"`
	WorldLog      []string              `json:"world_log"`
}

type FrontedRequest struct {
	Messages      []Message `json:"messages"`
	Summary       []string  `json:"summary"`
	Persona       string    `json:"persona"`
	GameState     GameState `json:"game_state"`
	APIKey        string    `json:"api_key"`
	Model         string    `json:"model"`
	UseMultiAgent bool      `json:"use_multi_agent"`
}

type AgentRequest struct {
	Messages []Message `json:"messages"`
	APIKey   string    `json:"api_key"`
	Model    string    `json:"model"`
}

type MultiAgentRequest struct {
	Messages  []Message `json:"messages"`
	APIKey    string    `json:"api_key"`
	Model     string    `json:"model"`
	GameState GameState `json:"game_state"`
}

func ChatHandler(c *gin.Context) {
	var req FrontedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "参数格式错误"})
		return
	}
	if req.APIKey == "" {
		c.JSON(400, gin.H{"error": "API Key 不能为空"})
		return
	}
	isPrologue := req.GameState.Status.GameMode == "prologue"
	if !isPrologue {
		isPrologue = req.GameState.Status.CurrentYear == 1991 && req.GameState.Status.CurrentMonth <= 9
	}

	var targetURL string
	var jsonData []byte
	var jsonErr error

	if req.UseMultiAgent {
		// Multi-Agent 模式
		// 1. 构建 System Prompt (只包含 Persona 和 Summary, 不包含 GameState)
		fullSystemPrompt := buildMultiAgentSystemPrompt(req.Summary, req.Persona)
		agentMessages := []Message{
			{Role: "system", Content: fullSystemPrompt},
		}
		if isPrologue {
			agentMessages = append(agentMessages, Message{Role: "system", Content: config.MultiAgentSystemPrologueRules})
		}
		agentMessages = append(agentMessages, req.Messages...)

		// 2. 构建 MultiAgentRequest
		pyReq := MultiAgentRequest{
			Messages:  agentMessages,
			APIKey:    req.APIKey,
			Model:     req.Model,
			GameState: req.GameState,
		}
		jsonData, jsonErr = json.Marshal(pyReq)
		targetURL = "http://localhost:8000/multiagent/chat"
	} else {
		// 原始单 Agent 模式
		// 2. 准备发给 Python 的数据
		gameStateBytes, err := json.MarshalIndent(req.GameState, "", "  ") // Indent 是为了好看，调试方便
		if err != nil {
			c.JSON(500, gin.H{"error": "无法序列化状态"})
			return
		}
		fullSystemPrompt := buildSystemPrompt(req.Summary, req.Persona, string(gameStateBytes))

		agentMessages := []Message{
			{Role: "system", Content: fullSystemPrompt},
		}
		if isPrologue {
			fmt.Println(">>> 成功注入序章 Prompt <<<")
			agentMessages = append(agentMessages, Message{Role: "system", Content: config.SystemPrologueRules})
		}
		fmt.Printf("=========== DEBUG SYSTEM PROMPT ===========\n%s\n===========================================\n", agentMessages)
		agentMessages = append(agentMessages, req.Messages...)
		pyReq := AgentRequest{
			Messages: agentMessages,
			APIKey:   req.APIKey,
			Model:    req.Model,
		}
		jsonData, jsonErr = json.Marshal(pyReq)
		targetURL = "http://localhost:8000/chat"
	}

	if jsonErr != nil {
		c.JSON(500, gin.H{"error": "无法序列化请求"})
		return
	}

	// 3. 创建发往 Python 服务的 HTTP 请求
	// 注意：这里要确保你的 Python 服务已经启动在 8000 端口
	proxyReq, err := http.NewRequestWithContext(c.Request.Context(), "POST", targetURL, bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(500, gin.H{"error": "无法创建请求"})
		return
	}
	proxyReq.Header.Set("Content-Type", "application/json")

	// 4. 发起请求 (关键：使用 http.Client)
	client := &http.Client{Timeout: 3000 * time.Second}
	resp, err := client.Do(proxyReq)
	if err != nil {
		c.JSON(500, gin.H{"error": "连接 AI 服务失败"})
		return
	}
	// 只有在函数结束时才关闭 Body，但在流式传输中，我们需要一直读
	defer resp.Body.Close()

	// 5. 设置 SSE (Server-Sent Events) 响应头
	// 这告诉浏览器：我发的是流，不要缓存，保持连接
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")

	// 6. 直接从resp.Body读，往c.Writer写，因为python已经保证了格式正确
	buf := make([]byte, 4096)
	for {
		select {
		case <-c.Request.Context().Done():
			// 前端关闭了连接
			fmt.Println("前端链接已断开")
			return
		default:
			n, err := resp.Body.Read(buf)
			if n > 0 {
				c.Writer.Write(buf[:n])
				c.Writer.Flush()
			}
			if err != nil {
				if err != io.EOF {
					fmt.Println("Error reading response body:", err)
				}
				return
			}
		}
	}
}

func buildMultiAgentSystemPrompt(summary []string, persona string) string {
	summaryStr := strings.Join(summary, "\n")
	return fmt.Sprintf(`%s

---
[PLAYER PERSONA]
(The following describes the protagonist's inner world and behavior logic. YOU MUST ADHERE TO THIS CHARACTERIZATION.)
%s

---
[STORY SUMMARY]
%s
`, config.MultiAgentSystemCoreRules, persona, summaryStr)
}

func buildSystemPrompt(summary []string, persona string, gameStateJSON string) string {
	summaryStr := strings.Join(summary, "\n")
	return fmt.Sprintf(`%s

---
[PLAYER PERSONA]
(The following describes the protagonist's inner world and behavior logic. YOU MUST ADHERE TO THIS CHARACTERIZATION.)
%s

---
[FULL GAME STATE (Database Truth)]
(This JSON contains the absolute truth of the player's current status, inventory, skills, and relationships. You MUST base your logic and narration on this data.)
%s

---
[STORY SUMMARY]
%s
`, config.SystemCoreRules, persona, gameStateJSON, summaryStr)
}
