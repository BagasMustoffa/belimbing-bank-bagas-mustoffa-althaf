package main

import (
	"full-stack-engineer-intern-test-case-bagas-mustoffa-althaf/backend/controller"
	"full-stack-engineer-intern-test-case-bagas-mustoffa-althaf/backend/model"
	"time" // Tambahkan ini untuk konfigurasi waktu CORS

	"github.com/gin-contrib/cors" // Import library CORS
	"github.com/gin-gonic/gin"
)

func main() {
	// Inisialisasi Database
	model.ConnectDatabase()

	// Inisialisasi Router Gin
	r := gin.Default()

	// --- TAMBAHKAN KONFIGURASI CORS DI SINI ---
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Port default Vite React
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	// ------------------------------------------

	// Rute Auth
	r.POST("/api/login", controller.Login)

	// Grouping Route untuk Customer (Tambahkan GET /:id)
	customerRoutes := r.Group("/api/customers")
	{
		customerRoutes.POST("", controller.CreateCustomer)
		customerRoutes.GET("", controller.GetCustomer)
		customerRoutes.GET("/:id", controller.GetCustomer)
		customerRoutes.PUT("/:id", controller.UpdateCustomer)
		customerRoutes.DELETE("/:id", controller.DeleteCustomer)
	}

	// Grouping Route untuk Deposito Type
	depositoRoutes := r.Group("/api/depositos")
	{
		depositoRoutes.POST("", controller.CreateDepositoType)
		depositoRoutes.GET("", controller.GetDepositoTypes)
		depositoRoutes.PUT("/:id", controller.UpdateDepositoType)
		depositoRoutes.DELETE("/:id", controller.DeleteDepositoType)
	}

	// Grouping Route untuk Account
	accountRoutes := r.Group("/api/accounts")
	{
		accountRoutes.POST("", controller.CreateAccount)
		accountRoutes.GET("", controller.GetAccounts)
		accountRoutes.PUT("/:id", controller.UpdateAccount)
		accountRoutes.DELETE("/:id", controller.DeleteAccount)
	}

	// Grouping Route untuk Transactions
	transactionRoutes := r.Group("/api/transactions")
	{
		transactionRoutes.POST("/deposit", controller.Deposit)
		transactionRoutes.POST("/withdraw", controller.Withdraw)
	}

	// Jalankan server
	r.Run(":8080")
}
