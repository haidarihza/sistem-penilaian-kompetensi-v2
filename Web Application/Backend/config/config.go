package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	DBHost     string `mapstructure:"DB_HOST"`
	DBPort     string `mapstructure:"DB_PORT"`
	DBUsername string `mapstructure:"DB_USERNAME"`
	DBPassword string `mapstructure:"DB_PASSWORD"`
	DBName     string `mapstructure:"DB_NAME"`

	APIHost           	string `mapstructure:"API_HOST"`
	APIPort           	string `mapstructure:"API_PORT"`
	SpeechToTextHostEN 	string `mapstructure:"SPEECH_TO_TEXT_HOST_EN"`
	SummarizationHostEN string `mapstructure:"SUMMARIZATION_HOST_EN"`
	SpeechToTextHostID 	string `mapstructure:"SPEECH_TO_TEXT_HOST_ID"`
	SummarizationHostID string `mapstructure:"SUMMARIZATION_HOST_ID"`
	FEHost							string `mapstructure:"FE_HOST"`
	FEPort							string `mapstructure:"FE_PORT"`

	TokenSecret        string `mapstructure:"TOKEN_SECRET"`
	AccessTokenExpire  int    `mapstructure:"ACCESS_TOKEN_EXPIRE"`
	RefreshTokenExpire int    `mapstructure:"REFRESH_TOKEN_EXPIRE"`

	SenderIdentity string `mapstructure:"SENDER_IDENTITY"`
	SenderEmail    string `mapstructure:"SENDER_EMAIL"`
	SenderPassword string `mapstructure:"SENDER_PASSWORD"`
	AddressHost    string `mapstructure:"ADDRESS_HOST"`
	AddressPort    int    `mapstructure:"ADDRESS_PORT"`
}

func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigName("app")
	viper.SetConfigType("env")

	viper.AutomaticEnv()

	err = viper.ReadInConfig()
	if err != nil {
		return
	}

	err = viper.Unmarshal(&config)
	return
}
