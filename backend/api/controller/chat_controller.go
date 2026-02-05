package controller

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message string `json:"message"`
}

func ChatHandler(c *gin.Context) {

	// 1.前端参数暂时模拟，实际应该从 PostForm 或 JSON Body 获取
	userMsg := c.Query("message") 
	if userMsg == "" {
		userMsg = "Hello World"
	}

	// 2. 准备发给 Python 的数据
	pyReq := ChatRequest{Message: userMsg}
	jsonData, _ := json.Marshal(pyReq)

	// 3. 创建发往 Python 服务的 HTTP 请求
	// 注意：这里要确保你的 Python 服务已经启动在 8000 端口
	req, err := http.NewRequest("POST", "http://localhost:8000/chat", bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(500, gin.H{"error": "无法创建请求"})
		return
	}
	req.Header.Set("Content-Type", "application/json")

	// 4. 发起请求 (关键：使用 http.Client)
	client := &http.Client{}
	resp, err := client.Do(req)
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
		// 每次从 Python 读取一个字节或一行
		// 为了演示效果，我们按字节读取，或者按块读取
		
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