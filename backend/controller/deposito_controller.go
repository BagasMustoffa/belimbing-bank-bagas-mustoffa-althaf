package controller

import (
	"net/http"

	"full-stack-engineer-intern-test-case-bagas-mustoffa-althaf/backend/model"

	"github.com/gin-gonic/gin"
)

func CreateDepositoType(c *gin.Context) {
	var input model.DepositoType
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	model.DB.Create(&input)
	c.JSON(http.StatusOK, gin.H{"data": input})
}

func GetDepositoTypes(c *gin.Context) {
	var depositos []model.DepositoType
	model.DB.Find(&depositos)
	c.JSON(http.StatusOK, gin.H{"data": depositos})
}

func UpdateDepositoType(c *gin.Context) {
	var deposito model.DepositoType
	if err := model.DB.Where("id = ?", c.Param("id")).First(&deposito).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Deposito Type tidak ditemukan!"})
		return
	}

	var input model.DepositoType
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	model.DB.Model(&deposito).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": deposito})
}

func DeleteDepositoType(c *gin.Context) {
	var deposito model.DepositoType
	if err := model.DB.Where("id = ?", c.Param("id")).First(&deposito).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Deposito Type tidak ditemukan!"})
		return
	}

	model.DB.Delete(&deposito)
	c.JSON(http.StatusOK, gin.H{"data": true})
}
