package service

import (
	"math/rand"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/database"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/internal/model"
)

type CharacterService struct { 
}

func (s *CharacterService) CreateCharacter(userID uint, name, gender, blood, wand, patronus string) (*model.Character, error) {
	initialMP := 15 + rand.Intn(10)
	newChar := model.Character{
		UserID:      userID,
		Name:        name,
		Gender:      gender,
		BloodStatus: blood,
		Wand:        wand,
		Patronus:    patronus,
		Status: model.CharacterStatus{
			HP:          100,
			MP:          initialMP,
			MaxMP:       initialMP,
			AP:          7,
			MaxAP:       7,
			Gold:        0,
			Knowledge:   15,
			Athletics:   40,
			Charm:       50,
			Morality:    50,
			Mental:      45,
			CurrentYear: 1991,
			CurrentMonth: 8,
			CurrentWeek: 3,
			CurrentWeekday: 1,
			GameMode:    "weekly",
		},
		Spells:        make(model.SpellMap),
		Relationships: make(model.RelationshipMap),
	}
	if err := database.DB.Create(&newChar).Error; err != nil {
		return nil, err
	}
	return &newChar, nil
}