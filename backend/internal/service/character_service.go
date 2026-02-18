package service

import (
	"errors"
	"math/rand"

	"github.com/MaiXiangCatt/HogwartsSimulator/backend/database"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/internal/model"
)

type CharacterService struct{}

func (s *CharacterService) Create(userID uint, name, gender, blood, wand, patronus string) (*model.Character, error) {
	initialMP := 15 + rand.Intn(10)
	newChar := model.Character{
		UserID:      userID,
		Name:        name,
		Gender:      gender,
		BloodStatus: blood,
		Wand:        wand,
		Patronus:    patronus,
		Status: model.CharacterStatus{
			HP:             100,
			MP:             initialMP,
			MaxMP:          initialMP,
			AP:             7,
			MaxAP:          7,
			Gold:           0,
			Knowledge:      15,
			Athletics:      40,
			Charm:          50,
			Morality:       50,
			Mental:         45,
			CurrentYear:    1991,
			CurrentMonth:   8,
			CurrentWeek:    3,
			CurrentWeekday: 1,
			GameMode:       "weekly",
		},
		Spells:        make(model.SpellMap),
		Relationships: make(model.RelationshipMap),
	}
	if err := database.DB.Create(&newChar).Error; err != nil {
		return nil, err
	}
	return &newChar, nil
}

func (s *CharacterService) GetList(userID uint) ([]model.Character, error) {
	var characterList []model.Character
	if err := database.DB.
		Select("id", "user_id", "name", "gender", "blood_status", "wand", "patronus", "status", "updated_at").
		Where("user_id = ?", userID).
		Order("updated_at desc").
		Find(&characterList).Error; err != nil {
		return nil, err
	}
	return characterList, nil
}

func (s *CharacterService) Delete(userID uint, characterID uint) error {
	result := database.DB.Where("id = ? AND user_id = ?", characterID, userID).Delete(&model.Character{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("角色未找到或权限不足")
	}
	return nil
}
