package service
import (
	"errors"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/database"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/internal/model"
	"github.com/MaiXiangCatt/HogwartsSimulator/backend/internal/utils"
)

type UserService struct {}

func (s *UserService) CreateUser(username, password, email string) (*model.User, error) { 
	var existingUser model.User
	result := database.DB.Where("username = ?", username).First(&existingUser)
	if result.RowsAffected > 0 { 
		return nil, errors.New("用户名已存在")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}
	newUser := model.User{
		Username: username,
		Password: hashedPassword,
		Email: email,
	}
	if err := database.DB.Create(&newUser).Error; err != nil {
		return nil, err
	}
	return &newUser, nil
}

func(s *UserService) Login(username, password string) (string, *model.User, error) {
	var user model.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return "", nil, errors.New("用户名错误")
	}
	if !utils.CheckPasswordHash(password, user.Password) {
		return "", nil, errors.New("密码错误")
	}
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return "", nil, err
	}
	return token, &user, nil
}