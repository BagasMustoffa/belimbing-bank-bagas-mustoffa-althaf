package model

import (
	"time"
)

type Customer struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name"`
	Password  string    `gorm:"type:varchar(255);not null" json:"password"`
	Accounts  []Account `gorm:"foreignKey:CustomerID" json:"accounts,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type DepositoType struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"type:varchar(50);not null" json:"name"`
	YearlyReturn float64   `gorm:"type:decimal(5,2);not null" json:"yearly_return"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Account struct {
	ID      uint    `gorm:"primaryKey" json:"id"`
	Packet  string  `gorm:"type:varchar(50)" json:"packet"`
	Balance float64 `gorm:"type:decimal(15,2);default:0" json:"balance"`

	CustomerID uint     `gorm:"not null" json:"customer_id"`
	Customer   Customer `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`

	DepositoTypeID uint         `gorm:"not null" json:"deposito_type_id"`
	DepositoType   DepositoType `gorm:"foreignKey:DepositoTypeID" json:"deposito_type,omitempty"`

	LastDepositDate *time.Time `json:"last_deposit_date"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
