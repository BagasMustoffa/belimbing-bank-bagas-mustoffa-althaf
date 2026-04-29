package controller

import (
	"net/http"
	"time"

	"full-stack-engineer-intern-test-case-bagas-mustoffa-althaf/backend/model"

	"github.com/gin-gonic/gin"
)

type DepositInput struct {
	AccountID   uint      `json:"account_id"`
	Amount      float64   `json:"amount"`
	DepositDate time.Time `json:"deposit_date"`
}

type WithdrawInput struct {
	AccountID    uint      `json:"account_id"`
	Amount       float64   `json:"amount"`
	WithdrawDate time.Time `json:"withdraw_date"`
}

func Deposit(c *gin.Context) {
	var input DepositInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah."})
		return
	}

	var account model.Account
	if err := model.DB.First(&account, input.AccountID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account tidak ditemukan!"})
		return
	}

	account.Balance += input.Amount
	account.LastDepositDate = &input.DepositDate
	model.DB.Save(&account)

	model.DB.Preload("Customer").Preload("DepositoType").First(&account, account.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Deposit berhasil",
		"data":    account,
	})
}

func Withdraw(c *gin.Context) {
	var input WithdrawInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah."})
		return
	}

	var account model.Account
	if err := model.DB.Preload("Customer").Preload("DepositoType").First(&account, input.AccountID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account tidak ditemukan!"})
		return
	}

	if account.LastDepositDate == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Belum ada deposit pada akun ini."})
		return
	}

	depositDate := *account.LastDepositDate
	withdrawDate := input.WithdrawDate

	if withdrawDate.Before(depositDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tanggal penarikan tidak boleh sebelum tanggal deposit terakhir."})
		return
	}

	months := (withdrawDate.Year()-depositDate.Year())*12 + int(withdrawDate.Month()) - int(depositDate.Month())
	if withdrawDate.Day() < depositDate.Day() {
		months--
	}
	if months < 0 {
		months = 0
	}

	originalBalance := account.Balance

	yearlyReturnPercent := account.DepositoType.YearlyReturn / 100
	monthlyReturn := yearlyReturnPercent / 12

	interestAmount := account.Balance * float64(months) * monthlyReturn
	realEndingBalance := account.Balance + interestAmount - input.Amount

	if realEndingBalance < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Saldo tidak mencukupi.",
			"balance": account.Balance + interestAmount,
		})
		return
	}

	account.Balance = realEndingBalance
	account.LastDepositDate = &withdrawDate
	model.DB.Save(&account)

	c.JSON(http.StatusOK, gin.H{
		"message":               "Penarikan berhasil",
		"starting_balance":      originalBalance,
		"months_elapsed":        months,
		"interest_earned":       interestAmount,
		"amount_withdrawn":      input.Amount,
		"current_final_balance": realEndingBalance,
		"account_data":          account,
	})
}
