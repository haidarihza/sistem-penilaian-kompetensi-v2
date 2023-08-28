package database

import (
	"database/sql"
	"fmt"
	"interview/summarization/config"
	"net/url"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
)

func Open(cfg config.Config) (*sql.DB, error) {
	connString := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s",
		url.QueryEscape(cfg.DBUsername),
		url.QueryEscape(cfg.DBPassword),
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	conCfg, err := pgx.ParseConfig(connString)

	if err != nil {
		return nil, fmt.Errorf("Parse config failed: %w", err)
	}

	db := stdlib.OpenDB(*conCfg)

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("Ping failed: %w", err)
	}

	return db, nil
}
