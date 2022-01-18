.PHONY: up down wipe testkey
up:
	docker-compose up --build -d

down:
	docker-compose down

wipe:
	docker-compose down -v

testkey:
	docker exec rides-matcher-app python3 server/mongo_helpers.py
