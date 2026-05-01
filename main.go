package main

import (
	"full-stack-engineer-intern-test-case-bagas-mustoffa-althaf/backend/controller"
	"full-stack-engineer-intern-test-case-bagas-mustoffa-althaf/backend/model"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	model.ConnectDatabase()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("/api/login", controller.Login)

	customerRoutes := r.Group("/api/customers")
	{
		customerRoutes.POST("", controller.CreateCustomer)
		customerRoutes.GET("", controller.GetAllCustomers)
		customerRoutes.GET("/:idCustomer", controller.GetCustomer)
		customerRoutes.PUT("/:idCustomer", controller.UpdateCustomer)
		customerRoutes.DELETE("/:idCustomer", controller.DeleteCustomer)
	}

	depositoRoutes := r.Group("/api/depositos")
	{
		depositoRoutes.POST("", controller.CreateDepositoType)
		depositoRoutes.GET("", controller.GetDepositoTypes)
		depositoRoutes.PUT("/:idDeposito", controller.UpdateDepositoType)
		depositoRoutes.DELETE("/:idDeposito", controller.DeleteDepositoType)
	}

	accountRoutes := r.Group("/api/accounts")
	{
		accountRoutes.POST("", controller.CreateAccount)
		accountRoutes.GET("/:idCustomer", controller.GetAccounts)
		accountRoutes.PUT("/:idAccount", controller.UpdateAccount)
		accountRoutes.DELETE("/:idAccount", controller.DeleteAccount)
	}

	transactionRoutes := r.Group("/api/transactions")
	{
		transactionRoutes.POST("/deposit", controller.Deposit)
		transactionRoutes.POST("/withdraw", controller.Withdraw)
	}

	r.Run(":8080")
}
