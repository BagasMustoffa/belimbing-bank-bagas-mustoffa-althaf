package controller

import (
	"net/http"

	"full-stack-engineer-intern-test-case-bagas-mustoffa-althaf/backend/model"

	"github.com/gin-gonic/gin"
)

type LoginInput struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var customer model.Customer
	if err := model.DB.Preload("Accounts.DepositoType").
		Where("name = ? AND password = ?", input.Name, input.Password).
		First(&customer).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Nama Atau Password Tidak Sesuai"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customer})
}

func GetCustomer(c *gin.Context) {
	var customer model.Customer
	if err := model.DB.Preload("Accounts.DepositoType").Where("id = ?", c.Param("id")).First(&customer).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": customer})
}

type RegisterInput struct {
	Name           string `json:"name"`
	Password       string `json:"password"`
	DepositoTypeID uint   `json:"deposito_type_id"`
	Packet         string `json:"packet"`
}

func CreateCustomer(c *gin.Context) {
	var input RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah: " + err.Error()})
		return
	}

	newCustomer := model.Customer{
		Name:     input.Name,
		Password: input.Password,
	}
	if err := model.DB.Create(&newCustomer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan nasabah"})
		return
	}

	newAccount := model.Account{
		CustomerID:     newCustomer.ID,
		DepositoTypeID: input.DepositoTypeID,
		Packet:         input.Packet,
		Balance:        0,
	}
	if err := model.DB.Create(&newAccount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat akun tabungan"})
		return
	}

	model.DB.Preload("Accounts.DepositoType").First(&newCustomer, newCustomer.ID)
	c.JSON(http.StatusOK, gin.H{"data": newCustomer})
}

func UpdateCustomer(c *gin.Context) {
	var customer model.Customer
	if err := model.DB.Where("id = ?", c.Param("id")).First(&customer).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Customer tidak ditemukan!"})
		return
	}

	var input model.Customer
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	model.DB.Model(&customer).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": customer})
}

func DeleteCustomer(c *gin.Context) {
	var customer model.Customer
	if err := model.DB.Where("id = ?", c.Param("id")).First(&customer).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Customer tidak ditemukan!"})
		return
	}

	model.DB.Delete(&customer)
	c.JSON(http.StatusOK, gin.H{"data": true})
}
