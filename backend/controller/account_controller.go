package controller

import (
	"net/http"

	"full-stack-engineer-intern-test-case-bagas-mustoffa-althaf/backend/model"

	"github.com/gin-gonic/gin"
)

func CreateAccount(c *gin.Context) {
	var input model.Account
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := model.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membuat akun."})
		return
	}

	model.DB.Preload("Customer").Preload("DepositoType").First(&input, input.ID)

	c.JSON(http.StatusOK, gin.H{"data": input})
}

func GetAccounts(c *gin.Context) {
	var accounts []model.Account
	model.DB.Preload("Customer").Preload("DepositoType").Find(&accounts)

	c.JSON(http.StatusOK, gin.H{"data": accounts})
}

func UpdateAccount(c *gin.Context) {
	var account model.Account
	if err := model.DB.Where("id = ?", c.Param("id")).First(&account).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account tidak ditemukan!"})
		return
	}

	var input model.Account
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	model.DB.Model(&account).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": account})
}

func DeleteAccount(c *gin.Context) {
	var account model.Account
	if err := model.DB.Where("id = ?", c.Param("id")).First(&account).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account tidak ditemukan!"})
		return
	}

	model.DB.Delete(&account)
	c.JSON(http.StatusOK, gin.H{"data": true})
}
