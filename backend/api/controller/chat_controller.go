package controller

import (
	"bufio"
	"bytes"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/MaiXiangCatt/HogwartsSimulator/backend/config"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/internal/model"
	"github.com/gin-gonic/gin"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type FrontedRequest struct {
	Messages []Message             `json:"messages"`
	Summary  string                `json:"summary"`
	Status   model.CharacterStatus `json:"status"`
	APIKey   string                `json:"api_key"`
	Model    string                `json:"model"`
}

type AgentRequest struct {
	Messages []Message `json:"messages"`
	APIKey   string    `json:"api_key"`
	Model    string    `json:"model"`
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

	// 2. 准备发给 Python 的数据
	statusBytes, err := json.Marshal(req.Status)
	if err != nil {
		c.JSON(500, gin.H{"error": "无法序列化状态"})
		return
	}
	fullSystemPrompt := buildSystemPrompt(req.Summary, string(statusBytes))

	fmt.Printf("=========== DEBUG SYSTEM PROMPT ===========\n%s\n===========================================\n", fullSystemPrompt)

	agentMessages := []Message{
		{Role: "system", Content: fullSystemPrompt},
	}
	agentMessages = append(agentMessages, req.Messages...)
	pyReq := AgentRequest{
		Messages: agentMessages,
		APIKey:   req.APIKey,
		Model:    req.Model,
	}
	jsonData, _ := json.Marshal(pyReq)

	// 3. 创建发往 Python 服务的 HTTP 请求
	// 注意：这里要确保你的 Python 服务已经启动在 8000 端口
	proxyReq, err := http.NewRequestWithContext(c.Request.Context(), "POST", "http://localhost:8000/chat", bytes.NewBuffer(jsonData))
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

	// 6. 建立管道：从 Python 读，往前端写
	reader := bufio.NewReader(resp.Body)

	for {
		select {
		case <-c.Request.Context().Done():
			// 前端关闭了连接
			fmt.Println("前端链接已断开")
			return
		default:
		}

		// 定义一个缓冲
		buf := make([]byte, 1024)
		n, err := reader.Read(buf)

		if err == io.EOF {
			// Python 说完了
			break
		}
		if err != nil {
			// 出错了
			fmt.Println("读取错误:", err)
			break
		}

		// 拿到 Python 的数据 chunk
		chunk := buf[:n]

		// 7. 格式化为 SSE 格式并写入前端
		// SSE 标准格式为: "data: <内容>\n\n"
		// 这样前端 EventSource 才能识别
		fmt.Fprintf(c.Writer, "data: %s\n\n", string(chunk))

		// 8. 必须 Flush！否则数据会积压在缓冲区，等全部完了才一次性发过去，就没有打字机效果了
		c.Writer.Flush()
	}
}

func buildSystemPrompt(summary string, statusJSON string) string {
	return fmt.Sprintf(`%s

---
[REAL-TIME GAME DATA]
The following data represents the current truth of the world.
Summary: %s
Status: %s
`, config.SystemPromptMVP, summary, statusJSON)
}
