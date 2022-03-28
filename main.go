package main

import (
	"context"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"math"
	"os"
	"strconv"
	"time"
)

type Flag struct {
	Flag_image_url string `json:"flag_image_url,omitempty" bson:"flag_image_url,omitempty"`
}

type Product struct {
	Id                            primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	AverageTemperature            float64            `json:"averagetemperature,omitempty" bson:"averagetemperature,omitempty"`
	AverageTemperatureUncertainty float64            `json:"averagetemperatureuncertainty,omitempty" bson:"averagetemperatureuncertainty,omitempty"`
	City                          string             `json:"city,omitempty" bson:"city,omitempty"`
	Country                       string             `json:"country,omitempty" bson:"country,omitempty"`
	Latitude                      string             `json:"latitude,omitempty" bson:"latitude,omitempty"`
	Longitude                     string             `json:"longitude,omitempty" bson:"longitude,omitempty"`
	Dt                            string             `json:"dt,omitempty" bson:"dt,omitempty"`
	Comment                       string             `json:"comment,omitempty" bson:"comment,omitempty"`
	Flag                          Flag               `json:"flag,omitempty" bson:"flag,omitempty"`
}

type Comment struct {
	Id      string `json:"id,omitempty"`
	Comment string `json:"comment,omitempty"`
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()
	user := os.Getenv("USER")
	pass := os.Getenv("PASS")
	credential := options.Credential{
		AuthSource: "Project",
		Username:   user,
		Password:   pass,
	}
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://159.65.220.66:27017").SetAuth(credential))
	defer func() {
		if err = client.Disconnect(ctx); err != nil {
			panic(err)
		}
	}()
	db := client.Database("Project")
	app := fiber.New()

	app.Use(cors.New())

	app.Post("/api/temps/comment", func(c *fiber.Ctx) error {
		collection := db.Collection("CityTemps")
		ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)

		comment := new(Comment)

		if err := c.BodyParser(comment); err != nil {
			return err
		}

		log.Println(comment.Id)
		log.Println(comment.Comment)
		objId, _ := primitive.ObjectIDFromHex(comment.Id)
		result, err := collection.UpdateOne(
			ctx,
			bson.M{"_id": objId},
			bson.D{
				{"$set", bson.D{{"comment", comment.Comment}}},
			},
		)
		if err != nil {
			return fiber.ErrServiceUnavailable
		}
		fmt.Printf("Updated %v Documents!\n", result.ModifiedCount)

		return c.JSON(fiber.Map{
			"message": "Comment successfully inserted",
		})
	})
	app.Get("/api/temps/show", func(c *fiber.Ctx) error {
		collection := db.Collection("CityTemps")
		ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)

		var products []Product

		opts := options.Find().SetProjection(bson.D{{"City", 1}, {"Country", 1}, {"dt", 1}})
		filter := bson.M{}

		if s := c.Query("s"); s != "" {
			filter = bson.M{
				"$or": []bson.M{
					{
						"City": bson.M{
							"$regex": primitive.Regex{
								Pattern: s,
								Options: "i",
							},
						},
					},
					{
						"Country": bson.M{
							"$regex": primitive.Regex{
								Pattern: s,
								Options: "i",
							},
						},
					},
				},
			}
		}

		if sort := c.Query("sort"); sort != "" {
			if sort == "asc" {
				opts.SetSort(bson.D{{"dt", 1}})
			} else if sort == "desc" {
				opts.SetSort(bson.D{{"dt", -1}})
			}
		}

		page, _ := strconv.Atoi(c.Query("page", "1"))
		var perPage int64 = 9

		total, _ := collection.CountDocuments(ctx, filter)

		opts.SetSkip((int64(page) - 1) * perPage)
		opts.SetLimit(perPage)

		cursor, _ := collection.Find(ctx, filter, opts)
		defer cursor.Close(ctx)

		for cursor.Next(ctx) {
			var product Product
			cursor.Decode(&product)
			products = append(products, product)
		}

		return c.JSON(fiber.Map{
			"data":      products,
			"total":     total,
			"page":      page,
			"last_page": math.Ceil(float64(total / perPage)),
		})
	})

	app.Get("/api/temps/showAll", func(c *fiber.Ctx) error {
		collection := db.Collection("CityTemps")
		ctx, _ := context.WithTimeout(context.Background(), 500*time.Second)

		var products []Product

		filter := bson.M{}
		findOptions := options.Find()

		if s := c.Query("s"); s != "" {
			filter = bson.M{
				"$or": []bson.M{
					{
						"City": bson.M{
							"$regex": primitive.Regex{
								Pattern: s,
								Options: "i",
							},
						},
					},
					{
						"Country": bson.M{
							"$regex": primitive.Regex{
								Pattern: s,
								Options: "i",
							},
						},
					},
				},
			}
		}

		if lat := c.Query("lat"); lat != "" {
			filter = bson.M{
				"Latitude": bson.M{
					"$regex": primitive.Regex{
						Pattern: lat,
						Options: "i",
					},
				},
			}
		}
		if long := c.Query("long"); long != "" {
			filter = bson.M{
				"Longitude": bson.M{
					"$regex": primitive.Regex{
						Pattern: long,
						Options: "i",
					},
				},
			}
		}

		if sort := c.Query("sort"); sort != "" {
			if sort == "asc" {
				findOptions.SetSort(bson.D{{"AverageTemperature", 1}})
			} else if sort == "desc" {
				findOptions.SetSort(bson.D{{"AverageTemperature", -1}})
			}
		}

		page, _ := strconv.Atoi(c.Query("page", "1"))
		var perPage int64 = 5

		total, _ := collection.CountDocuments(ctx, filter)

		findOptions.SetSkip((int64(page) - 1) * perPage)
		findOptions.SetLimit(perPage)

		cursor, _ := collection.Find(ctx, filter, findOptions)
		defer cursor.Close(ctx)

		for cursor.Next(ctx) {
			var product Product
			cursor.Decode(&product)
			products = append(products, product)
		}

		return c.JSON(fiber.Map{
			"data":        products,
			"total_pages": total,
			"page":        page,
			"last_page":   math.Ceil(float64(total / perPage)),
		})
	})
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	app.Listen(":" + port)
}
