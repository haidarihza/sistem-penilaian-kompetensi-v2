package main

import (
	"fmt"
	authhandler "interview/summarization/app/handler/auth"
	competencyhandler "interview/summarization/app/handler/competency"
	questionhandler "interview/summarization/app/handler/question"
	roomhandler "interview/summarization/app/handler/room"
	"interview/summarization/app/middleware"
	"interview/summarization/config"
	"interview/summarization/database"
	"interview/summarization/repository"
	"interview/summarization/repository/pgsql"
	"interview/summarization/token/jwt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func main() {
	cfg, err := config.LoadConfig(".")
	if err != nil {
		log.Fatalln("cannot load config:", err)
	}

	db, err := database.Open(cfg)
	if db == nil && err != nil {
		log.Fatalln("cannot connect db:", err)
	}

	jwtImpl := jwt.NewJWT(cfg)

	userRepository, err := pgsql.NewUserRepository(db)
	if err != nil {
		log.Fatalln("user repository:", err)
	}

	questionRepository, err := pgsql.NewQuestionRepository(db)
	if err != nil {
		log.Fatalln("question repository:", err)
	}

	competencyRepository, err := pgsql.NewCompetencyRepository(db)
	if err != nil {
		log.Fatalln("competency repository:", err)
	}

	roomRepository, err := pgsql.NewRoomRepository(db)
	if err != nil {
		log.Fatalln("room repository:", err)
	}

	authMiddleware := middleware.Auth(jwtImpl)
	roleInterviewerMiddleware := middleware.RBAC(repository.Interviewer)
	corsMiddleware := cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	r := chi.NewRouter()

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hiremif backend"))
	})

	fs := http.FileServer(http.Dir("data"))
	r.Handle("/files/*", http.StripPrefix("/files/", fs))

	r.With(corsMiddleware).Route("/auth", func(r chi.Router) {
		r.Get("/verify", authhandler.Verify(userRepository, jwtImpl))
		r.Post("/register", authhandler.Register(userRepository, jwtImpl, cfg))
		r.Post("/login", authhandler.Login(userRepository, jwtImpl))
		r.Get("/verify-email", authhandler.VerifyEmail(userRepository, jwtImpl))
		r.With(authMiddleware, roleInterviewerMiddleware).Get("/check/{email}", authhandler.EmailCheck(userRepository))
		r.With(authMiddleware).Get("/me", authhandler.Profile(userRepository))
		r.With(authMiddleware).Put("/me", authhandler.UpdateProfile(userRepository))
		r.With(authMiddleware).Put("/me/password", authhandler.UpdatePassword(userRepository))
	})

	r.With(corsMiddleware, authMiddleware, roleInterviewerMiddleware).
		Route("/question", func(r chi.Router) {
			r.Post("/", questionhandler.Create(questionRepository))
			r.Get("/", questionhandler.GetAll(questionRepository))
			r.Get("/{id}", questionhandler.GetOne(questionRepository))
			r.Put("/{id}", questionhandler.Update(questionRepository))
			r.Delete("/{id}", questionhandler.Delete(questionRepository))
		})

	r.With(corsMiddleware, authMiddleware, roleInterviewerMiddleware).
		Route("/competency", func(r chi.Router) {
			r.Post("/", competencyhandler.Create(competencyRepository))
			r.Get("/", competencyhandler.GetAll(competencyRepository))
			r.Get("/only", competencyhandler.GetAllCompetencyOnly(competencyRepository))
			r.Get("/{id}", competencyhandler.GetOne(competencyRepository))
			r.Put("/{id}", competencyhandler.Update(competencyRepository))
			r.Delete("/{id}", competencyhandler.Delete(competencyRepository))
		})

	r.With(corsMiddleware, authMiddleware).Route("/room", func(r chi.Router) {
		r.Get("/", roomhandler.GetAll(roomRepository))
		r.Get("/{id}", roomhandler.GetOne(roomRepository, questionRepository, competencyRepository))
		r.Post("/{roomId}/{questionId}", roomhandler.Answer(roomRepository, competencyRepository, cfg.APIHost, cfg.SpeechToTextHost, cfg.SummarizationHost))
		r.With(roleInterviewerMiddleware).Post("/", roomhandler.Create(roomRepository, userRepository))
		r.With(roleInterviewerMiddleware).Post("/{id}/review", roomhandler.Review(roomRepository))
	})

	log.Printf("Server is listening on port %s", cfg.APIPort)
	http.ListenAndServe(fmt.Sprintf(":%s", cfg.APIPort), r)
}
