package main


import (
	"fmt"
	authhandler "interview/summarization/app/handler/auth"
	competencyhandler "interview/summarization/app/handler/competency"
	questionhandler "interview/summarization/app/handler/question"
	roomhandler "interview/summarization/app/handler/room"
	feedbackhandler "interview/summarization/app/handler/feedback"
	"interview/summarization/app/middleware"
	"interview/summarization/config"
	"interview/summarization/database"
	"interview/summarization/repository"
	"interview/summarization/repository/pgsql"
	"interview/summarization/token/jwt"
	"interview/summarization/cron_job"
	"log"
	"net/http"
	// "time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/robfig/cron/v3"
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

	feedbackRepository, err := pgsql.NewFeedbackRepository(db)
	if err != nil {
		log.Fatalln("feedback repository:", err)
	}

	c := cron.New()

	// Schedule the cron job to run every two week
	_, err = c.AddFunc("0 2 1 * *", func() {
		err := cron_job.TrainModel(feedbackRepository, cfg.SummarizationHostID)
		if err != nil {
			log.Println("failed to run training_model.go:", err)
		}
	})
	if err != nil {
		log.Fatalln("failed to schedule cron job:", err)
	}

	c.Start()

	authMiddleware := middleware.Auth(jwtImpl)

	roleInterviewerMiddleware := middleware.RBAC(repository.Interviewer)

	logMiddleware := middleware.LogMiddleware
	corsMiddleware := cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	r := chi.NewRouter()
	r.Use(logMiddleware)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hiremif backend"))
	})
	fs := http.FileServer(http.Dir("data"))
	r.Handle("/files/*", http.StripPrefix("/files/", fs))
	r.With(corsMiddleware).Route("/auth", func(r chi.Router) {
		r.Get("/verify", authhandler.Verify(userRepository, jwtImpl))
		r.With(authMiddleware, roleInterviewerMiddleware).Get("/all-emails", authhandler.GetAllEmails(userRepository))
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
		// r.Get("/", roomhandler.GetAll(roomRepository))
		r.With(roleInterviewerMiddleware).Post("/group", roomhandler.CreateRoom(roomRepository, userRepository, cfg))
		r.Get("/group", roomhandler.GetAllRoomGroup(roomRepository))
		r.Get("/group/{id}", roomhandler.GetOneRoomGroup(roomRepository))
		r.Get("/{id}", roomhandler.GetOneRoom(roomRepository, questionRepository, competencyRepository))
		r.Post("/{roomId}/{questionId}", roomhandler.Answer(roomRepository, competencyRepository, questionRepository, feedbackRepository, cfg))
		r.Get("/get-question/{roomId}/{questionId}", roomhandler.GetOneQuestionRoom(roomRepository))
		r.Put("/update-current-question/{roomId}/{questionId}", roomhandler.UpdateQuestionCond(roomRepository))
		r.Post("/{roomId}/finish-answer", roomhandler.FinishAnswer(roomRepository))
		r.With(roleInterviewerMiddleware).Post("/", roomhandler.CreateRoom(roomRepository, userRepository, cfg))
		r.With(roleInterviewerMiddleware).Post("/group", roomhandler.CreateRoomGroup(roomRepository, userRepository, cfg))
		r.With(roleInterviewerMiddleware).Post("/{id}/review", roomhandler.Review(roomRepository))
		r.With(roleInterviewerMiddleware).Delete("/{id}", roomhandler.Delete(roomRepository))
	})

	r.With(corsMiddleware, authMiddleware, roleInterviewerMiddleware).Route("/feedback", func(r chi.Router) {
		r.Get("/", feedbackhandler.GetAllNeedFeedback(feedbackRepository, cfg.SummarizationHostEN))
		r.Put("/{id}", feedbackhandler.UpdateFeedback(feedbackRepository, cfg.SummarizationHostEN))
	})

	log.Printf("Server is listening on port %s", cfg.APIPort)
	http.ListenAndServe(fmt.Sprintf(":%s", cfg.APIPort), r)
}
