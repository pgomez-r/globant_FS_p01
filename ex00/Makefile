IMAGE_NAME=app_gallery
CONTAINER_NAME=app_gallery_container
PORT=5500

# Build the Docker container
build:
	docker-compose build

# Run the Docker container
run:
	docker-compose up

# Full build and run
full: build run

# Stop and remove the Docker container
clean:
	docker-compose down

.PHONY: build run stop full clean all