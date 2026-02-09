package model

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username   string      `gorm:"uniqueIndex;size:100;not null" json:"username"`
	Password   string      `gorm:"not null" json:"-"`
	Email      string      `gorm:"size:100" json:"email"`
	Characters []Character `gorm:"foreignKey:UserID;references:ID" json:"characters"`
}

type Character struct {
	gorm.Model
	UserID      uint   `gorm:"index;not null" json:"user_id"`
	Name        string `gorm:"size:100;not null" json:"name"`
	Gender      string `gorm:"size:20" json:"gender"`
	House       string `gorm:"size:20" json:"house"`
	BloodStatus string `gorm:"size:50" json:"blood_status"`
	Wand        string `gorm:"size:255" json:"wand"`
	Patronus    string `gorm:"size:100" json:"patronus"`

	Status CharacterStatus `gorm:"type:json;serializer:json" json:"status"`

	Spells        SpellMap        `gorm:"type:json;serializer:json" json:"spells"`        // 咒语
	Relationships RelationshipMap `gorm:"type:json;serializer:json" json:"relationships"` // 羁绊
	Inventory     InventoryMap        `gorm:"type:json;serializer:json" json:"inventory"`     // 物品栏
	WorldLog      []string        `gorm:"type:json;serializer:json" json:"world_log"`     // 世界线变动

	Summary  string    `gorm:"type:text" json:"summary"`
	Messages []Message `gorm:"foreignKey:CharacterID;references:ID" json:"messages"`
}

type CharacterStatus struct {
	HP    int `json:"hp"`     // 生命值
	MP    int `json:"mp"`     // 魔力值
	MaxMP int `json:"max_mp"` // 最大魔力
	Gold  int `json:"gold"`   // 金加隆
	AP    int `json:"ap"`     // 行动力
	MaxAP int `json:"max_ap"`

	Knowledge int `json:"knowledge"` // 知识值
	Athletics int `json:"athletics"` // 体质值
	Charm     int `json:"charm"`     // 魅力值
	Morality  int `json:"morality"`  // 道德值
	Mental    int `json:"mental"`    // 精神力

	CurrentYear    int    `json:"current_year"`
	CurrentMonth   int    `json:"current_month"`
	CurrentWeek    int    `json:"current_week"`
	CurrentWeekday int    `json:"current_weekday"`
	Location       string `json:"location"`
	GameMode       string `json:"game_mode"` // "weekly" | "event"
}

// Spells key=咒语名
type (
	SpellMap  map[string]SpellInfo
	SpellInfo struct {
		Level float64 `json:"level"`
		Desc  string  `json:"desc"` // 熟练度描述
	}
)

// RelationshipMap key=人名
type (
	RelationshipMap map[string]RelationInfo
	RelationInfo    struct {
		Level float64 `json:"level"`
		Tag   string  `json:"tag"`
		Desc  string  `json:"desc"` // 关系描述?
	}
)

type (
	InventoryMap map[string]InventoryInfo
	InventoryInfo struct {
		Desc string `json:"desc"` // 物品描述
	}
)

type Message struct {
	gorm.Model
	CharacterID uint   `gorm:"index;not null" json:"character_id"`
	Role        string `gorm:"size:20;not null" json:"role"`
	Content     string `gorm:"type:text;not null" json:"content"`
}
